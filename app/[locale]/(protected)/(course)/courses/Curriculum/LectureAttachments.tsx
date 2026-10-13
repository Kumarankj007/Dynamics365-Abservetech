"use client";

import React, { useRef, useState } from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, X, FileText, FileSpreadsheet, File } from "lucide-react";
import { useLectureAttachmentUploadMutation } from "@/hooks/Mutations/useLectureAttachmentUploadMutation";
import { CourseMediaSchemaType } from "./validation/courseCurriculum.schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
  mIndex: number;
  lIndex: number;
  form: UseFormReturn<CourseMediaSchemaType>;
}

const ALLOWED_ATTACHMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const LectureAttachments: React.FC<Props> = ({ mIndex, lIndex, form }) => {
  const { control, setValue, watch } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: `modules.${mIndex}.lectures.${lIndex}.attachments`,
  });

  const { mutate: uploadAttachment } = useLectureAttachmentUploadMutation();

  const [progressMap, setProgressMap] = useState<Record<number, number>>({});
  const abortControllers = useRef<Record<number, AbortController>>({});
  const [previewPdf, setPreviewPdf] = useState<string | null>(null);

  const handleUpload = (file: File, index: number) => {
    const controller = new AbortController();
    abortControllers.current[index] = controller;

    uploadAttachment(
      {
        file,
        controller,
        onUploadProgress: (progress) =>
          setProgressMap((prev) => ({ ...prev, [index]: progress })),
      },
      {
        onSuccess: (res) => {
          if (!res.data?.fileUrl) return;

          setValue(
            `modules.${mIndex}.lectures.${lIndex}.attachments.${index}`,
            {
              name: res?.data?.name ?? "",
              fileUrl: res.data.fileUrl,
              fileType: res.data.fileType ?? "",
              size: res.data.size,
              uploadedAt: res.data.uploadedAt,
            },
          );

          setProgressMap((prev) => {
            const clone = { ...prev };
            delete clone[index];
            return clone;
          });
        },
      },
    );
  };

  const cancelUpload = (index: number) => {
    abortControllers.current[index]?.abort();
    delete abortControllers.current[index];
    remove(index);
  };

  const getFileIcon = (type: string) => {
    // console.log(type);

    if (type.includes("pdf"))
      return <FileText size={16} className="text-red-500" />;
    if (type.includes("docx"))
      return <File size={16} className="text-blue-600" />;
    if (type.includes("xls"))
      return <FileSpreadsheet size={16} className="text-green-600" />;
    return <FileText size={16} />;
  };

  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-medium">Attachments</h5>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => append({ name: "", fileUrl: "", fileType: "" })}
        >
          <Plus size={14} /> Add
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {fields.map((field, index) => {
          const fileInputId = `att-${mIndex}-${lIndex}-${index}`;
          const progress = progressMap[index];

          const attachment = watch(
            `modules.${mIndex}.lectures.${lIndex}.attachments.${index}`,
          );

          return (
            <div
              key={field.id}
              className="relative border rounded-lg p-3 space-y-2 bg-muted/30"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (!file) return;
                if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) return;
                if (file.size > MAX_FILE_SIZE) return;
                handleUpload(file, index);
              }}
            >
              <button
                type="button"
                className="absolute top-2 right-2 w-4 h-4 text-muted-foreground flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600"
                onClick={() => remove(index)}
              >
                <X size={12} />
              </button>

              <input
                id={fileInputId}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
                    alert("Only PDF, Word, and Excel files are allowed.");
                    e.target.value = "";
                    return;
                  }

                  if (file.size > MAX_FILE_SIZE) {
                    alert("File size must be under 10MB.");
                    e.target.value = "";
                    return;
                  }

                  handleUpload(file, index);
                }}
              />

              {!attachment?.fileUrl ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById(fileInputId)?.click()}
                >
                  <Upload size={14} /> Upload
                </Button>
              ) : attachment.fileType === "pdf" ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full flex items-center gap-2">
                      <FileText size={16} className="text-red-500" />
                      <span className="truncate">{attachment.name}</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>{attachment.name}</DialogTitle>
                    </DialogHeader>
                    <iframe
                      src={attachment.fileUrl}
                      className="w-full h-[70vh]"
                    />
                  </DialogContent>
                </Dialog>
              ) : (
                <a
                  href={attachment.fileUrl}
                  target="_blank"
                  download
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium bg-white rounded-md p-3"
                >
                  {getFileIcon(attachment.fileType)}
                  <span className="truncate flex-1 text-black">
                    {attachment.name}
                  </span>
                </a>
              )}

              {attachment?.fileUrl && (
                <Badge color="secondary" className="text-xs w-fit">
                  {attachment.fileType.toUpperCase()}
                </Badge>
              )}

              {typeof progress === "number" && (
                <div className="space-y-1">
                  <Progress value={progress} />
                  <button
                    type="button"
                    className="text-xs text-red-500"
                    onClick={() => cancelUpload(index)}
                  >
                    Cancel upload
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LectureAttachments;
