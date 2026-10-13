"use client";
import React from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  courseMediaSchema,
  CourseMediaSchemaType,
} from "./validation/courseCurriculum.schema";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import ModuleItem from "./ModuleItem";
import CourseButtons from "../CourseButtons/CourseButtons";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { APICONSTANT } from "@/services/config";
import { useEditCourseStore } from "@/app/store/useEditCourseStore";

interface Props {
  courseId?: string | null;
  editCourseId?: string | null;
  onNext: () => void;
  onNextOnly: () => void;
  onBack: () => void;
}

const defaultValues: CourseMediaSchemaType = {
  modules: [
    {
      title: "",
      description: "",
      lectures: [
        {
          title: "",
          videoType: "upload",
          videoUrl: "",
          fileUrl: "",
          attachments: [],
        },
      ],
    },
  ],
};

type UploadItem = {
  uploading: boolean;
  progress: number;
  controller: AbortController | null;
};

const CourseCurriculumTab: React.FC<Props> = ({
  courseId,
  editCourseId,
  onNext,
  onNextOnly,
  onBack,
}) => {
  const [uploadState, setUploadState] = React.useState<{
    [mIndex: number]: {
      [lIndex: number]: {
        uploading: boolean;
        progress: number;
        controller: AbortController | null;
      };
    };
  }>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const mutation = useApiMutation("post");

  const methods = useForm<CourseMediaSchemaType>({
    resolver: zodResolver(courseMediaSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const { editCourse, setEditCourse, fetchEditCourse } = useEditCourseStore();

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "modules",
  });

  React.useEffect(() => {
    // Auto-create 1 module if none exist
    if (fields.length === 0) {
      append(defaultValues.modules[0]);
    }
  }, [fields, append]);

  React.useEffect(() => {
    const isSameCourse =
      editCourseId && editCourse?.id && editCourseId === editCourse.id;
    if (isSameCourse && editCourse?.curriculum?.length) {
      // Clear existing fields first
      remove();

      // Map curriculum to match form structure
      if (editCourse?.draftData?.curriculum?.length > 0) {
        editCourse.draftData.curriculum.forEach((module: any) => {
          append({
            title: module.title || "",
            description: module.description || "",
            lectures:
              module.lectures?.map((lecture: any) => ({
                title: lecture.title || "",
                videoType:
                  lecture?.contentType === "UPLOAD_VIDEO" ? "upload" : "embed",
                fileUrl: lecture?.fileUrl || "",
                videoUrl: lecture?.videoUrl || "",
                duration: lecture?.duration,
                attachments: lecture?.attachments || [],
              })) || [],
          });
        });
      } else {
        editCourse.curriculum.forEach((module: any) => {
          append({
            title: module.title || "",
            description: module.description || "",
            lectures:
              module.lectures?.map((lecture: any) => ({
                title: lecture.title || "",
                videoType:
                  lecture?.contentType === "UPLOAD_VIDEO" ? "upload" : "embed",
                fileUrl: lecture?.fileUrl || "",
                videoUrl: lecture?.videoUrl || "",
                duration: lecture?.duration,
                attachments: lecture?.attachments || [],
              })) || [],
          });
        });
      }
    }
  }, [editCourseId, editCourse, append, remove]);

  // Utility function: fetch embed video duration (basic fallback)
  const getEmbedVideoDuration = async (
    url: string,
  ): Promise<number | undefined> => {
    try {
      // Example: if Vimeo, extract video ID and fetch duration
      if (url.includes("vimeo.com")) {
        const match = url.match(/vimeo\.com\/(\d+)/);
        if (match) {
          const videoId = match[1];
          const res = await fetch(
            `https://vimeo.com/api/v2/video/${videoId}.json`,
          );
          const data = await res.json();
          return data?.[0]?.duration; // duration in seconds
        }
      }

      // YouTube duration requires YouTube Data API, skip for now
      return undefined;
    } catch (error) {
      console.warn("Failed to get embed video duration", error);
      return undefined;
    }
  };

  const onSubmit = async (data: CourseMediaSchemaType) => {
    try {
      setIsLoading(true);

      // Transform RHF data -> backend payload
      const payload = {
        modules: await Promise.all(
          data.modules.map(async (module) => ({
            title: module.title,
            description: module.description,
            lectures: await Promise.all(
              module.lectures.map(async (lecture) => {
                let duration = lecture.duration;

                // If embed video and duration not set, try to fetch it
                if (
                  lecture.videoType === "embed" &&
                  !duration &&
                  lecture.videoUrl
                ) {
                  duration = await getEmbedVideoDuration(lecture.videoUrl);
                }

                return {
                  title: lecture.title,
                  contentType:
                    lecture.videoType === "upload"
                      ? "UPLOAD_VIDEO"
                      : "EMBED_LINK",
                  fileUrl: lecture.fileUrl || "",
                  videoUrl: lecture.videoUrl || "",
                  duration,
                  attachments: lecture.attachments || [],
                };
              }),
            ),
          })),
        ),
      };

      // console.log("Final Curriculum Payload:", payload);

      const res = await mutation.mutateAsync({
        url: { apiUrl: APICONSTANT.CREATE_COURSE_CURRICULUM + `/${courseId}` },
        body: payload,
      });
      if (courseId) fetchEditCourse(courseId);
      onNext();
    } catch (error) {
      console.error("Error submitting curriculum:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => append(defaultValues.modules[0])}
          >
            + Add Module
          </Button>
        </div>

        <Accordion type="multiple" className="space-y-3">
          {fields.map((module, mIndex) => (
            <ModuleItem
              key={module.id}
              fieldsLength={fields.length > 1}
              mIndex={mIndex}
              removeModule={remove}
              control={control}
              register={register}
              watch={watch}
              errors={errors}
              setValue={setValue}
              uploadState={uploadState}
              setUploadState={setUploadState}
            />
          ))}
        </Accordion>
      </form>

      <div className="pt-4">
        <CourseButtons
          onNext={handleSubmit(onSubmit)}
          onNextOnly={onNextOnly}
          onBack={onBack}
          nextLabel={isLoading ? "Publishing..." : "Save Curriculum"}
          isLoading={isLoading}
        />
      </div>
    </FormProvider>
  );
};

export default CourseCurriculumTab;
