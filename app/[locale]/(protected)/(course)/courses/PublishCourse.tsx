"use client";
import React, { useState, useEffect } from "react";
import { useEditCourseStore } from "@/app/store/useEditCourseStore";
import CourseButtons from "./CourseButtons/CourseButtons";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { APICONSTANT } from "@/services/config";
import VideoPlayer from "./Curriculum/VideoPlayer";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { FileText, FileSpreadsheet, File } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEmbedUrl } from "./Curriculum/ModuleItemFunction";

// Types
interface Props {
  courseId?: string | null;
  editCourseId?: string | null;
  onNext: () => void;
  onBack: () => void;
}

interface CourseAttachment {
  name: string;
  fileUrl: string;
  fileType: "docx" | "pdf" | "xls" | string;
}

interface Lecture {
  title: string;
  fileUrl?: string;
  videoUrl?: string;
  duration?: number;
  contentType?: string;
  attachments?: CourseAttachment[];
}

interface Module {
  title: string;
  description?: string;
  lectures?: Lecture[];
}

interface PricingOption {
  option: string;
  price: number;
  description: string;
}

interface Tag {
  id: string;
  tag: string;
}

interface CourseData {
  id: string;
  title: string;
  description?: string;
  category?: { id: string; category: string };
  subCategory?: { id: string; subcategory: string };
  approximateDurationEntity?: { label: string };
  introVideoUrl?: string;
  curriculum?: Module[];
  pricingOptions?: PricingOption[];
  suggestedTags?: Tag[];
  customTags?: string[];
  isPublished?: boolean;
  learningOutcomes?: [];
}

const PublishCourse: React.FC<Props> = ({
  courseId,
  editCourseId,
  onNext,
  onBack,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { editCourse } = useEditCourseStore();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const mutation = useApiMutation("put");

  const courseIDToUse = editCourseId || courseId;

  useEffect(() => {
    // const isSameCourse = editCourseId && editCourse?.id && editCourseId === editCourse.id;
    if (editCourse != null) setCourseData(editCourse as CourseData);
    // else setCourseData(null);
  }, [editCourse]);

  // console.log(courseData, "courseData");

  const handlePublishCourse = async () => {
    if (!courseIDToUse) return;
    try {
      setIsLoading(true);
      await mutation.mutateAsync({
        url: { apiUrl: APICONSTANT.PUBLISH_COURSE + `/${courseIDToUse}` },
      });
      onNext();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert YouTube URL to embed
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      // youtu.be short link
      const short = url.match(/youtu\.be\/([^?]+)/);
      if (short) return `https://www.youtube.com/embed/${short[1]}`;

      // youtube.com/watch?v=
      const long = url.match(/[?&]v=([^&]+)/);
      if (long) return `https://www.youtube.com/embed/${long[1]}`;

      // youtube.com/embed/<id>
      if (url.includes("/embed/")) return url;

      return "";
    } catch {
      return "";
    }
  };

  const getFileIcon = (type: string) => {
    // console.log(type);

    if (type.includes("pdf")) return <FileText size={16} className="text-red-500" />;
    if (type.includes("docx")) return <File size={16} className="text-blue-600" />;
    if (type.includes("xls"))
      return <FileSpreadsheet size={16} className="text-green-600" />;
    return <FileText size={16} />;
  };

  // Convert Vimeo URL to embed
  const getVimeoEmbedUrl = (url: string) => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}` : "";
  };

  if (!courseData) return null;

  return (
    <div className="space-y-6">
      {/* Course Basic Info */}
      <>
        <Label className="text-black font-bold">Course Title</Label>
        <div className="p-4 border border-default-200 dark:border-default-300 rounded-md space-y-2">
          <h2 className="text-xl font-bold">{courseData.title}</h2>
        </div>
      </>

      {/* Course Learning Tab */}
      {courseData.learningOutcomes &&
        courseData.learningOutcomes.length > 0 && (
          <>
            <Label className="text-black font-bold">Learning Outcomes</Label>
            {/* <div className="p-4 border border-default-200 dark:border-default-300 rounded-md">
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {courseData.learningOutcomes.map((learning, idx) => (
                <li key={idx} className="p-2 border border-default-200 dark:border-default-300 rounded-md">
                  {learning}
                </li>
              ))}
            </ul>
          </div> */}
            <Accordion
              type="single"
              defaultValue="learning-outcomes"
              collapsible
              className="space-y-2"
            >
              <AccordionItem value="learning-outcomes">
                <AccordionTrigger>
                  Learning Outcomes ({courseData.learningOutcomes.length})
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {courseData.learningOutcomes.map((learning, idx) => (
                      <li
                        key={idx}
                        className="p-2 border border-default-200 dark:border-default-300 rounded-md"
                      >
                        {learning}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}

      {/* Curriculum Accordion */}
      {courseData.curriculum && courseData.curriculum.length > 0 && (
        <>
          <Label className="text-black font-bold">Curriculum</Label>
          <Accordion
            type="multiple"
            defaultValue={courseData.curriculum.map((_, i) => `module-${i}`)}
            className="space-y-3"
          >
            {courseData.curriculum.map((module, mIndex) => (
              <AccordionItem key={mIndex} value={`module-${mIndex}`}>
                <AccordionTrigger className="text-base font-semibold">
                  {mIndex + 1}. {module.title}
                </AccordionTrigger>

                <AccordionContent className="space-y-3">
                  {module.description && (
                    <p className="text-md font-bold">
                      Module Description:{" "}
                      <span className="font-normal">{module.description}</span>
                    </p>
                  )}

                  {(module.lectures?.length ?? 0) > 0 && (
                    <Accordion type="single" collapsible className="space-y-2">
                      {module?.lectures?.map((lecture, lIndex) => {
                        const isEmbed = lecture?.contentType === "EMBED_LINK";
                        const isUpload =
                          lecture?.contentType === "UPLOAD_VIDEO";
                        const isAttachments =
                          lecture?.attachments &&
                          lecture?.attachments?.length > 0;
                        const isYouTube = (url: string) =>
                          url.includes("youtube.com") ||
                          url.includes("youtu.be");
                        return (
                          <AccordionItem
                            key={lIndex}
                            value={`lecture-${mIndex}-${lIndex}`}
                          >
                            <AccordionTrigger className="text-sm">
                              {mIndex + 1}.{lIndex + 1} {lecture.title} (
                              {lecture.duration
                                ? `${Number((lecture.duration/60) || 0).toFixed(1)} mins`
                                : "N/A"}
                              )
                            </AccordionTrigger>

                            <AccordionContent className="pt-2">
                              {/* Uploaded Video Preview */}
                              {isUpload && lecture.fileUrl && (
                                <VideoPlayer
                                  fileUrl={lecture.fileUrl}
                                  videoUrl={lecture.videoUrl}
                                  duration={lecture.duration}
                                  uploading={false}
                                  progress={0}
                                  onReplace={() => {}}
                                  onRemove={() => {}}
                                  onCancelUpload={() => {}}
                                />
                              )}

                              {/* Embedded YouTube Link Preview */}
                              {isEmbed && lecture.videoUrl && (
                                <iframe
                                  src={
                                    getEmbedUrl(lecture.videoUrl)
                                  }
                                  title="Embedded video"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="w-full h-60 md:h-80 rounded"
                                />
                              )}

                              {/* Attachments */}
                              {isAttachments && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                  {lecture?.attachments?.map(
                                    (attachment, ind) => (
                                      <div
                                        key={ind}
                                        className="relative border rounded-lg p-3 space-y-2 bg-muted/30"
                                        onDragOver={(e) => e.preventDefault()}
                                      >
                                        {attachment?.fileType === "pdf" ? (
                                          <Dialog>
                                            <DialogTrigger asChild>
                                              <Button className="w-full flex items-center gap-2">
                                                <FileText
                                                  size={16}
                                                  className="text-red-500"
                                                />
                                                <span className="truncate flex-1">
                                                  {attachment.name}
                                                </span>
                                              </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-3xl max-h-[80vh]">
                                              <DialogHeader>
                                                <DialogTitle>
                                                  {attachment.name}
                                                </DialogTitle>
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
                                          <Badge
                                            color="secondary"
                                            className="text-xs w-fit"
                                          >
                                            {attachment.fileType.toUpperCase()}
                                          </Badge>
                                        )}
                                      </div>
                                    ),
                                  )}
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </>
      )}

      {courseData.description && (
        <>
          <Label className="text-black font-bold">Description</Label>
          <div className="p-4 border border-default-200 dark:border-default-300 rounded-md space-y-6">
            {courseData.description && (
              <p className="text-md font-bold">
                Course Description:{" "}
                <span className="font-normal">{courseData.description}</span>
              </p>
            )}
            <p className="text-md font-bold">
              Category:{" "}
              <span className="font-normal">
                {courseData.category?.category}
              </span>
            </p>
            <p className="text-md font-bold">
              Sub-Category
              <span className="font-normal">
                {courseData.subCategory?.subcategory}
              </span>
            </p>
            <p className="text-md font-bold">
              Duration:{" "}
              <span className="font-normal">
                {courseData.approximateDurationEntity?.label || "N/A"}
              </span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Suggested Tags */}
              {courseData.suggestedTags &&
                courseData.suggestedTags.length > 0 && (
                  <Accordion
                    type="single"
                    defaultValue="suggested-tags"
                    collapsible
                    className="space-y-2"
                  >
                    <AccordionItem value="suggested-tags">
                      <AccordionTrigger>
                        Suggested Tags ({courseData.suggestedTags.length})
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-wrap gap-2">
                          {courseData.suggestedTags.map(
                            (tag: any, ind: number) => (
                              <span
                                key={ind}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                              >
                                {tag.tag || tag}
                              </span>
                            ),
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}

              {/* Custom Tags */}
              {(courseData.customTags?.length ?? 0) > 0 && (
                <Accordion
                  type="single"
                  defaultValue="custom-tags"
                  collapsible
                  className="space-y-2"
                >
                  <AccordionItem value="custom-tags">
                    <AccordionTrigger>
                      Custom Tags ({(courseData.customTags ?? []).length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-wrap gap-2">
                        {(courseData.customTags ?? []).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          </div>
        </>
      )}

      {/* Intro Video */}
      {courseData.introVideoUrl && (
        <>
          <Label className="text-black font-bold">Media&Pricing</Label>
          <div className="p-4 border border-default-200 dark:border-default-300 rounded-md space-y-6">
            <div>
              <h3 className="font-medium mb-2">Intro Video</h3>
              <VideoPlayer
                fileUrl={courseData.introVideoUrl}
                videoUrl=""
                duration={undefined}
                uploading={false}
                progress={0}
                onReplace={() => {}}
                onRemove={() => {}}
                onCancelUpload={() => {}}
              />
            </div>

            {/* Pricing Options Accordion */}
            {courseData.pricingOptions &&
              courseData.pricingOptions.length > 0 && (
                <Accordion
                  type="single"
                  collapsible
                  defaultValue="pricing"
                  className="space-y-2"
                >
                  <AccordionItem value="pricing">
                    <AccordionTrigger>
                      Pricing Options ({courseData.pricingOptions.length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {courseData.pricingOptions.map((option, idx) => (
                          <div
                            key={idx}
                            className="p-2 border border-default-200 dark:border-default-300 rounded-md"
                          >
                            <p>
                              <span className="font-semibold">
                                {option.option}
                              </span>
                              : ${option.price}
                            </p>
                            <p className="text-sm text-gray-600">
                              {option.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
          </div>
        </>
      )}

      {/* Buttons */}
      <CourseButtons
        onNext={handlePublishCourse}
        nextLabel={isLoading ? "Publishing..." : "Publish Course"}
        isLoading={isLoading}
        onBack={onBack}
      />
    </div>
  );
};

export default PublishCourse;
