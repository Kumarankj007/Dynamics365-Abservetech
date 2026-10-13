"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/core/components/ui/button";
import { Trash2, Upload, GripVertical, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/core/components/ui/accordion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import React, { useRef } from "react";
import { SortableLectureProps } from "@/core/utils/interface";
import { Box, LinearProgress, Typography } from "@mui/material";
import VideoPlayer from "@/core/components/VideoPlayer";
import { Request } from "@/core/utils/apiTools";
import APICONSTANT from "@/core/utils/ApiConstant";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import { getEmbedUrl, getVideoDuration } from "@/core/utils/helperFunction";
import { Badge } from "@/core/components/ui/badge";

const SortableLecture = ({
  lecture,
  lectureIndex,
  moduleId,
  module,
  isPreview = false,
  progress = 0,
  onProgress = () => {},
  attachmentsProgress = 0,
  setAttachmentsProgress = () => {},
  setModules,
  deleteLecture,
}: SortableLectureProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: lecture.id });
  const controllerRef = useRef<AbortController | null>(null);
  const controllerAttachmentsRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const attachmentsRef = useRef<HTMLInputElement | null>(null);
  // const [progresss, setProgress] = useState(lecture?.videoFile ? 100 : 0);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // console.log(lecture, "lecture");

  const handleUpdateLecture = (field: string, value: any, edit?: boolean) => {
    // console.log(value, "attachments");
    setModules((prevModules: any) =>
      prevModules.map((mod: any) =>
        mod.id === moduleId
          ? {
              ...mod,
              lectures: mod.lectures.map((lec: any, i: number) =>
                i === lectureIndex
                  ? {
                      ...lec,
                      [field]:
                        field == "attachments"
                          ? edit
                            ? value
                            : [...(lec.attachments || []), value]
                          : value,
                    }
                  : lec,
              ),
            }
          : mod,
      ),
    );
  };

  const apiCall = async (data: any) => {
    const controller = new AbortController();
    controllerRef.current = controller;
    return await Request(
      `${APICONSTANT.videoUpload}?type=course-lectures`,
      "POST",
      data,
      {},
      "true",
      onProgress,
      controller.signal, // ✅ pass abort signal
    );
  };
  // cancelled upload
  const cancelUpload = () => {
    controllerRef.current?.abort();
    onProgress(0);
  };

  const { trigger } = useCustomMutation(apiCall, {
    onSuccessCallback(data) {
      if (data?.success && data?.data) {
        handleUpdateLecture("videoFile", data?.data);
      }
      if (inputRef.current) inputRef.current.value = "";
    },
  });

  const apiCallDocument = async (data: any) => {
    const controller = new AbortController();
    controllerAttachmentsRef.current = controller;
    return await Request(
      `${APICONSTANT.attachmentsUpload}`,
      "POST",
      data,
      {},
      "true",
      setAttachmentsProgress,
      controller.signal, // ✅ pass abort signal
    );
  };

  // cancelled upload
  const cancelAttachmentsUpload = () => {
    controllerAttachmentsRef.current?.abort();
    setAttachmentsProgress(0);
  };

  const { trigger: triggerDocument } = useCustomMutation(apiCallDocument, {
    onSuccessCallback(data) {
      if (data?.success && data?.data) {
        handleUpdateLecture("attachments", data?.data);
      }
      setAttachmentsProgress(0);
      if (attachmentsRef.current) attachmentsRef.current.value = "";
    },
  });

  return (
    <AccordionItem
      ref={setNodeRef}
      style={style}
      value={`lecture-${lecture.id}`}
      className="border rounded bg-muted/30"
    >
      <AccordionTrigger className="px-3 py-2 hover:no-underline">
        <div className="flex items-center gap-2 text-left w-full">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-3 h-3 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">
              {lecture.title || `Lecture ${lectureIndex + 1}`}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {module.lectures.length > 1 && !isPreview && (
              <Button
                asChild
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteLecture(moduleId, lecture.id);
                }}
                className="h-4 w-4 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-2 h-2" />
              </Button>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-3 pb-3">
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium">Lecture Title *</Label>
              <Input
                required
                disabled={isPreview}
                placeholder={`Lecture ${lectureIndex + 1}`}
                value={lecture.title}
                onChange={(e) => handleUpdateLecture("title", e.target.value)}
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Content Type *</Label>
              <Select
                defaultValue="UPLOAD_VIDEO"
                disabled={isPreview}
                value={lecture.type}
                onValueChange={(value) => handleUpdateLecture("type", value)}
              >
                <SelectTrigger className="mt-1 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPLOAD_VIDEO">Upload Video</SelectItem>
                  <SelectItem value="EMBED_LINK">Embed Link</SelectItem>
                  {/* <SelectItem value="READING_MATERIAL">
                    Reading Material
                  </SelectItem> */}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            {(lecture.type == "UPLOAD_VIDEO" ||
              lecture.type == "READING_MATERIAL") &&
              lecture?.videoFile == null &&
              !isPreview && (
                <>
                  <div>
                    <Label className="text-xs font-medium">
                      {lecture.type == "UPLOAD_VIDEO"
                        ? "Video Upload *"
                        : "Material Upload *"}
                    </Label>
                    <label
                      htmlFor="avatar"
                      className="block mt-1 border-2 border-dashed border-muted-foreground/25 rounded-lg p-3 text-center hover:border-primary/50 transition-colors"
                    >
                      <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground mb-1">
                        Drag and drop your video file, or click to browse
                      </p>
                      <Input
                        ref={inputRef}
                        type="file"
                        accept={
                          lecture.type == "UPLOAD_VIDEO"
                            ? ".mp4,.mov,.mkv,video/mp4,.webm,video/quicktime,video/x-matroska"
                            : "application/pdf"
                        }
                        onChange={async (e) => {
                          const file = e?.target?.files?.[0];
                          const formData = new FormData();
                          if (file) {
                            formData.append("lectureFiles", file);
                            const duration = await getVideoDuration(file);
                            handleUpdateLecture("duration", duration);
                            trigger(formData);
                          }
                        }}
                        id="avatar"
                        className={
                          (lecture.type == "UPLOAD_VIDEO" &&
                            lecture?.videoFile) ||
                          (lecture.type == "READING_MATERIAL" &&
                            lecture?.resources)
                            ? "hidden"
                            : "w-auto mx-auto"
                        }
                        required
                      />
                    </label>
                  </div>
                </>
              )}
            {lecture.type == "UPLOAD_VIDEO" && lecture?.videoFile == null && (
              <div className="flex items-center gap-2">
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">
                    {`${Math.round(progress) == 100 ? 99 : Math.round(progress)}%`}
                  </Typography>
                </Box>
                <Box sx={{ width: "100%" }}>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 15,
                      borderRadius: 5,
                      transition: "all 0.5s linear", // smooth animation
                      backgroundColor: "#e0e0e0",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 6,
                        backgroundSize: "200% 100%",
                        backgroundPosition: "right",
                        animation: "l3 10s infinite linear",
                        backgroundImage:
                          "repeating-linear-gradient(-35deg,#0080ff 0 15px,#e0e0e0 0 27px)",
                        transition: "all 0.5s linear",
                      },
                    }}
                  />
                </Box>
                {progress > 0 && progress < 81 && !isPreview && (
                  <Button
                    asChild
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={cancelUpload}
                    className="h-5 w-5 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            )}
            {lecture.type == "UPLOAD_VIDEO" &&
              lecture?.videoFile &&
              (lecture?.videoFile instanceof File ||
                lecture?.videoFile != "") && (
                <div className="relative mt-5">
                  {!isPreview && (
                    <Button
                      asChild
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleUpdateLecture(
                          lecture.type == "UPLOAD_VIDEO"
                            ? "videoFile"
                            : "resources",
                          null,
                        );
                        handleUpdateLecture("duration", 0);
                        onProgress(0);
                      }}
                      className="absolute right-3 top-3 z-10 md:h-9 h-6 md:w-9 w-6 p-1 shadow-lg bg-white text-red-500 "
                    >
                      <Trash2 className="w-2 h-2" />
                    </Button>
                  )}
                  <VideoPlayer
                    src={
                      lecture?.videoFile instanceof File
                        ? URL.createObjectURL(lecture?.videoFile)
                        : lecture?.videoFile
                    }
                  />
                </div>
              )}

            {lecture.type == "EMBED_LINK" && (
              <div>
                <Label className="text-xs font-medium">
                  External Video Link *
                </Label>
                <Input
                  required
                  value={lecture.embedUrl}
                  onChange={(e) =>
                    handleUpdateLecture("embedUrl", e.target.value)
                  }
                  placeholder="https://youtube.com/watch?v=..."
                  className="mt-1 h-8 text-sm"
                />
              </div>
            )}
            {lecture.type == "EMBED_LINK" &&
              getEmbedUrl(lecture.embedUrl) != undefined && (
                <iframe
                  id="iframe"
                  src={
                    lecture.embedUrl
                      ? getEmbedUrl(lecture.embedUrl || "") + "?autoplay=false"
                      : ""
                  }
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="w-full aspect-[1.8]"
                ></iframe>
              )}
            <div>
              <Label className="text-xs font-medium">Attachments</Label>
              {attachmentsProgress == 0 && !isPreview && (
                <label
                  htmlFor="attachments"
                  className="block mt-1 border-2 border-dashed border-muted-foreground/25 rounded-lg p-3 text-center hover:border-primary/50 transition-colors"
                >
                  <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground mb-1">
                    Drag and drop your file, or click to browse
                  </p>
                  <Input
                    ref={attachmentsRef}
                    type="file"
                    name="attachmentfile"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={async (e) => {
                      const file = e?.target?.files?.[0];
                      const formData = new FormData();
                      if (file) {
                        formData.append("attachment", file);
                        triggerDocument(formData);
                      }
                    }}
                    id="attachments"
                    className={
                      (lecture.type == "UPLOAD_VIDEO" && lecture?.videoFile) ||
                      (lecture.type == "READING_MATERIAL" && lecture?.resources)
                        ? "hidden"
                        : "w-auto mx-auto"
                    }
                  />
                </label>
              )}
            </div>
            {lecture?.attachments && lecture?.attachments?.length > 0 && (
              <div className="flex gap-3 items-center flex-wrap">
                {lecture?.attachments?.map((it, ind) => (
                  <Badge
                    key={ind}
                    variant="secondary"
                    className="flex items-center justify-between gap-1 my-4"
                  >
                    {it.name}
                    <Button
                      variant="ghost"
                      type="button"
                      size="sm"
                      disabled={isPreview}
                      onClick={() => {
                        const updatedfiles = lecture?.attachments?.filter(
                          (_: any, i: number) => i !== ind,
                        );
                        handleUpdateLecture("attachments", updatedfiles, true);
                      }}
                      className="h-3 w-3 p-0 hover:bg-transparent"
                    >
                      <X className="w-3 h-3" color="red" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            {!isPreview && (
              <div className="flex items-center gap-2">
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">
                    {`${Math.round(attachmentsProgress) == 100 ? 99 : Math.round(attachmentsProgress)}%`}
                  </Typography>
                </Box>
                <Box sx={{ width: "100%" }}>
                  <LinearProgress
                    variant="determinate"
                    value={attachmentsProgress}
                    sx={{
                      height: 15,
                      borderRadius: 5,
                      transition: "all 0.5s linear", // smooth animation
                      backgroundColor: "#e0e0e0",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 6,
                        backgroundSize: "200% 100%",
                        backgroundPosition: "right",
                        animation: "l3 10s infinite linear",
                        backgroundImage:
                          "repeating-linear-gradient(-35deg,#0080ff 0 15px,#e0e0e0 0 27px)",
                        transition: "all 0.5s linear",
                      },
                    }}
                  />
                </Box>
                {attachmentsProgress > 0 && attachmentsProgress < 81 && (
                  <Button
                    asChild
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={cancelAttachmentsUpload}
                    className="h-5 w-5 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default SortableLecture;
