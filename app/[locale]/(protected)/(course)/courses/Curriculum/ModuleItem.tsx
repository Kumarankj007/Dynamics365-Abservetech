'use client';
import React, { useRef, useState } from "react";
import { useFieldArray, Controller, UseFormReturn } from "react-hook-form";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Accordion,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus, Trash2, Upload } from "lucide-react";
import { CourseMediaSchemaType } from "./validation/courseCurriculum.schema";
import VideoPlayer from "./VideoPlayer";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { APICONSTANT } from "@/services/config";
import { useVideoUploadMutation } from "@/hooks/Mutations/useVideoUploadMutation";
import { getEmbedUrl, getEmbedVideoDuration, getVideoDuration } from "./ModuleItemFunction";
import LectureAttachments from "./LectureAttachments";
import { useFormContext } from "react-hook-form";

interface UploadState {
  [mIndex: number]: {
    [lIndex: number]: {
      uploading: boolean;
      progress: number;
      controller: AbortController | null;
    };
  };
}

interface ModuleItemProps {
  mIndex: number;
  fieldsLength?: boolean;
  removeModule: (index: number) => void;
  control: UseFormReturn<CourseMediaSchemaType>["control"];
  register: UseFormReturn<CourseMediaSchemaType>["register"];
  watch: UseFormReturn<CourseMediaSchemaType>["watch"];
  errors: UseFormReturn<CourseMediaSchemaType>["formState"]["errors"];
  setValue: UseFormReturn<CourseMediaSchemaType>["setValue"];
  uploadState: UploadState;
  setUploadState: React.Dispatch<React.SetStateAction<UploadState>>;
}

const ModuleItem: React.FC<ModuleItemProps> = ({
  mIndex,
  fieldsLength,
  removeModule,
  control,
  register,
  watch,
  errors,
  setValue,
  uploadState,
  setUploadState,
}) => {
  const form = useFormContext<CourseMediaSchemaType>();
  const { fields: lectureFields, append, remove } = useFieldArray({
    control,
    name: `modules.${mIndex}.lectures`,
  });

  const { mutate: uploadVideo } = useVideoUploadMutation();

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const [confirmDialog, setConfirmDialog] = useState<{
    mIndex: number;
    lIndex: number;
    action: "cancel" | "remove";
    open: boolean;
  } | null>(null);

  const getLectureError = (lIndex: number, field: "videoUrl" | "fileUrl") =>
    errors?.modules?.[mIndex]?.lectures?.[lIndex]?.[field]?.message;


  const uploadLectureVideo = (file: File, mIndex: number, lIndex: number) => {
    const controller = new AbortController();
    const fileUrl = URL.createObjectURL(file);

    setValue(`modules.${mIndex}.lectures.${lIndex}.fileUrl`, fileUrl);

    setUploadState((prev) => ({
      ...prev,
      [mIndex]: {
        ...prev[mIndex],
        [lIndex]: { uploading: true, progress: 0, controller },
      },
    }));

    uploadVideo(
      {
        file,
        apiUrl: APICONSTANT.UPLOAD_LECTURES_VIDEO,
        controller,
        onUploadProgress: (progress: number) => {
          setUploadState((prev) => ({
            ...prev,
            [mIndex]: {
              ...prev[mIndex],
              [lIndex]: { ...prev[mIndex][lIndex], progress },
            },
          }));
        },
      },
      {
        onSuccess: async (res) => {
          const uploadedUrl = res?.data || "";
          setValue(`modules.${mIndex}.lectures.${lIndex}.fileUrl`, uploadedUrl);

          try {
            const duration = await getVideoDuration(file);
            setValue(`modules.${mIndex}.lectures.${lIndex}.duration`, duration);
          } catch (err) {
            console.warn("Failed to get video duration", err);
          }

          setUploadState((prev) => ({
            ...prev,
            [mIndex]: {
              ...prev[mIndex],
              [lIndex]: { uploading: false, progress: 100, controller: null },
            },
          }));
        },
        onError: () => {
          setUploadState((prev) => ({
            ...prev,
            [mIndex]: {
              ...prev[mIndex],
              [lIndex]: { uploading: false, progress: 0, controller: null },
            },
          }));
        },
      }
    );
  };

  const cancelUpload = (mIndex: number, lIndex: number) => {
    uploadState[mIndex]?.[lIndex]?.controller?.abort();
    setUploadState((prev) => ({
      ...prev,
      [mIndex]: {
        ...prev[mIndex],
        [lIndex]: { uploading: false, progress: 0, controller: null },
      },
    }));
    setValue(`modules.${mIndex}.lectures.${lIndex}.fileUrl`, "");
    setConfirmDialog(null);
  };

  const removeVideo = (mIndex: number, lIndex: number) => {
    setValue(`modules.${mIndex}.lectures.${lIndex}.fileUrl`, "");
    setValue(`modules.${mIndex}.lectures.${lIndex}.videoUrl`, "");
    setValue(`modules.${mIndex}.lectures.${lIndex}.duration`, undefined);
    setUploadState((prev) => ({
      ...prev,
      [mIndex]: {
        ...prev[mIndex],
        [lIndex]: { uploading: false, progress: 0, controller: null },
      },
    }));
    setConfirmDialog(null);
  };

  return (
    <AccordionItem value={`module-${mIndex}`}>
      <AccordionTrigger>
        <div className="flex justify-between w-full items-center">
          <span>{watch(`modules.${mIndex}.title`) || `Module ${mIndex + 1}`}</span>
          {fieldsLength && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                  <Trash2 size={16} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete {watch(`modules.${mIndex}.title`) || `Module ${mIndex + 1}`}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => removeModule(mIndex)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent className="space-y-4 p-4">
        <div>
          <Input placeholder="Module Title" {...register(`modules.${mIndex}.title` as const)} />
          {errors?.modules?.[mIndex]?.title && (
            <p className="text-red-500 text-sm">{errors.modules[mIndex]?.title?.message as string}</p>
          )}
        </div>

        <Textarea
          placeholder="Module Description (Optional)"
          {...register(`modules.${mIndex}.description` as const)}
        />

        <div className="flex justify-between items-center mt-2">
          <h4 className="font-medium">Lectures</h4>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              append({ title: "", videoType: "upload", videoUrl: "", fileUrl: "" })
            }
          >
            <Plus size={14} /> Add Lecture
          </Button>
        </div>

        <Accordion type="multiple" className="mt-3 space-y-2">
          {lectureFields.map((lecture, lIndex) => {
            const videoType = watch(`modules.${mIndex}.lectures.${lIndex}.videoType`);
            const fileUrl = watch(`modules.${mIndex}.lectures.${lIndex}.fileUrl`);
            const videoUrl = watch(`modules.${mIndex}.lectures.${lIndex}.videoUrl`);
            const duration = watch(`modules.${mIndex}.lectures.${lIndex}.duration`);
            const isUploading = uploadState[mIndex]?.[lIndex]?.uploading ?? false;
            const progress = uploadState[mIndex]?.[lIndex]?.progress ?? 0;
            const refKey = `module-${mIndex}-lecture-${lIndex}`;

            return (
              <AccordionItem key={lecture.id} value={`lecture-${mIndex}-${lIndex}`}>
                <AccordionTrigger>
                  <div className="flex justify-between w-full items-center">
                    <span>{watch(`modules.${mIndex}.lectures.${lIndex}.title`) || `Lecture ${lIndex + 1}`}</span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                          <Trash2 size={16} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Lecture?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(lIndex)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="space-y-3 p-3 border rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        placeholder="Lecture Title"
                        {...register(`modules.${mIndex}.lectures.${lIndex}.title` as const)}
                      />
                      {errors?.modules?.[mIndex]?.lectures?.[lIndex]?.title && (
                        <p className="text-red-500 text-sm">
                          {errors.modules[mIndex]?.lectures?.[lIndex]?.title?.message as string}
                        </p>
                      )}
                    </div>

                    <Controller
                      control={control}
                      name={`modules.${mIndex}.lectures.${lIndex}.videoType` as const}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select video type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upload">Upload Video</SelectItem>
                            <SelectItem value="embed">Embed Link</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {videoType === "embed" ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Enter video URL"
                        {...register(`modules.${mIndex}.lectures.${lIndex}.videoUrl` as const)}
                        onBlur={async (e) => {
                          const url = e.target.value;
                          if (url) {
                            const duration = await getEmbedVideoDuration(url);
                            setValue(
                              `modules.${mIndex}.lectures.${lIndex}.duration`,
                              duration ?? undefined
                            );
                          } else {
                            setValue(`modules.${mIndex}.lectures.${lIndex}.duration`, undefined);
                          }
                        }}
                      />
                      {watch(`modules.${mIndex}.lectures.${lIndex}.videoUrl`) && (
                        // <div className="mt-2 aspect-video w-full">
                        <div className="mt-2">
                          <iframe
                            src={getEmbedUrl(
                              watch(`modules.${mIndex}.lectures.${lIndex}.videoUrl`) || ""
                            )}
                            title={`Lecture ${lIndex + 1}`}
                            width="100%"
                            // height="50%"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )}
                    </div>
                  ) : fileUrl ? (
                    <VideoPlayer
                      fileUrl={fileUrl}
                      videoUrl={videoUrl}
                      duration={duration}
                      uploading={isUploading}
                      progress={progress}
                      onReplace={() => fileInputRefs.current[refKey]?.click()}
                      onRemove={() =>
                        setConfirmDialog({ mIndex, lIndex, action: "remove", open: true })
                      }
                      onCancelUpload={() =>
                        setConfirmDialog({ mIndex, lIndex, action: "cancel", open: true })
                      }
                    />
                  ) : (
                    <div className="relative border-2 border-dashed rounded-lg px-6 py-8 flex flex-col items-center justify-center cursor-pointer border-gray-300 text-center">
                      <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600 font-medium">Upload Your Course Intro Video</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRefs.current[refKey]?.click()}
                      >
                        Choose Video
                      </Button>
                      <input
                        type="file"
                        accept="video/*"
                        ref={(el) => { fileInputRefs.current[refKey] = el }}
                        className="hidden"
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          uploadLectureVideo(e.target.files[0], mIndex, lIndex)
                        }
                      />
                    </div>
                  )}

                  <LectureAttachments
                    mIndex={mIndex}
                    lIndex={lIndex}
                    form={form}
                  />

                  {confirmDialog?.open &&
                    confirmDialog.mIndex === mIndex &&
                    confirmDialog.lIndex === lIndex && (
                      <AlertDialog open={true} onOpenChange={() => setConfirmDialog(null)}>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {confirmDialog.action === "cancel" ? "Cancel Upload?" : "Remove Video?"}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to{" "}
                              {confirmDialog.action === "cancel"
                                ? "cancel this upload"
                                : "remove this video"}? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                confirmDialog.action === "cancel"
                                  ? cancelUpload(mIndex, lIndex)
                                  : removeVideo(mIndex, lIndex)
                              }
                            >
                              {confirmDialog.action === "cancel" ? "Cancel Upload" : "Remove Video"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                  {(getLectureError(lIndex, "videoUrl") || getLectureError(lIndex, "fileUrl")) && (
                    <p className="text-red-500 text-sm mt-2">
                      {getLectureError(lIndex, "videoUrl") || getLectureError(lIndex, "fileUrl")}
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ModuleItem;