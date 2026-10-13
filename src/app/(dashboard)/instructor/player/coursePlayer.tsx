/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { Progress } from "@/core/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/core/components/ui/accordion";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Maximize,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  Circle,
  PlayCircle,
  BookOpen,
  AlertCircle,
  Settings,
  List,
  ArrowLeft,
  Download,
} from "lucide-react";
import ImageComponent from "@/core/components/imageComponent";
import UseLoadingRouter from "@/core/hooks/useLoadRoute";
import { Request } from "@/core/utils/apiTools";
import APICONSTANT from "@/core/utils/ApiConstant";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import Loading from "@/core/components/ui/Loading";
import VideoPlayer from "@/core/components/VideoPlayer";
import {
  getEmbedUrl,
  handleDownload,
  iframeSrc,
} from "@/core/utils/helperFunction";
import { Attachment } from "@/core/utils/interface";
import Link from "next/link";

// Mock course data
const courseData = {
  // id: id,
  title: "Advanced Power BI Dashboard Design",
  modules: [
    {
      id: 1,
      title: "Getting Started with Advanced Power BI",
      lessons: [
        {
          id: 1,
          title: "Course Introduction and Overview",
          duration: "15 min",
          status: "completed",
          isPreview: true,
        },
        {
          id: 2,
          title: "Setting Up Your Power BI Environment",
          duration: "20 min",
          status: "in_progress",
          isPreview: false,
        },
        {
          id: 3,
          title: "Understanding Dashboard Design Principles",
          duration: "25 min",
          status: "not_started",
          isPreview: false,
        },
        {
          id: 4,
          title: "Power BI Interface Deep Dive",
          duration: "30 min",
          status: "not_started",
          isPreview: false,
        },
      ],
    },
    {
      id: 2,
      title: "Advanced Visualization Techniques",
      lessons: [
        {
          id: 5,
          title: "Custom Visuals and Marketplace",
          duration: "35 min",
          status: "not_started",
          isPreview: false,
        },
        {
          id: 6,
          title: "Advanced Chart Types",
          duration: "40 min",
          status: "not_started",
          isPreview: false,
        },
        {
          id: 7,
          title: "Interactive Elements and Drill-Through",
          duration: "45 min",
          status: "not_started",
          isPreview: false,
        },
        {
          id: 8,
          title: "Conditional Formatting Mastery",
          duration: "30 min",
          status: "not_started",
          isPreview: false,
        },
      ],
    },
    {
      id: 3,
      title: "DAX Mastery for Dashboard Creators",
      lessons: [
        {
          id: 9,
          title: "DAX Fundamentals Review",
          duration: "25 min",
          status: "not_started",
          isPreview: false,
        },
        {
          id: 10,
          title: "Advanced DAX Functions",
          duration: "50 min",
          status: "not_started",
          isPreview: false,
        },
        {
          id: 11,
          title: "Time Intelligence Functions",
          duration: "45 min",
          status: "not_started",
          isPreview: false,
        },
        {
          id: 12,
          title: "Complex Calculations and Measures",
          duration: "40 min",
          status: "not_started",
          isPreview: false,
        },
      ],
    },
  ],
};
export default function CoursePlayer() {
  const router = UseLoadingRouter();
  const [courseDetail, setCourseDetail] = useState<any>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(900); // 15 minutes in seconds
  const [selectedLessonId, setSelectedLessonId] = useState(1);
  const [selectedModuleId, setSelectedModuleId] = useState(1);
  const [showSidebar, setShowSidebar] = useState(true); // Auto-expand the module containing the current lesson
  const [expandedModule, setExpandedModule] = useState(`module-1`);

  const apiCall = async (id: string) => {
    return await Request(APICONSTANT.courseDetails + "/" + id, "GET");
  };
  const { trigger, isPending } = useCustomMutation(
    apiCall,
    {
      onSuccessCallback(data: any) {
        if (data?.status && data?.data) {
          setCourseDetail(data?.data);
        }
      },
    },
    false,
  );

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const courseId = query.get("id");
    const moduleId = query.get("module");
    const lesson = query.get("lesson");
    setExpandedModule("module-" + (moduleId ? moduleId : 1));
    setSelectedLessonId(lesson ? Number(lesson) : 1);
    setSelectedModuleId(moduleId ? Number(moduleId) : 1);
    if (courseId) {
      trigger(courseId);
    }
    // console.log(courseId, moduleId, lesson);
  }, []);

  const getModuleForLesson = (lessonId: number) => {
    const moduleitem = courseDetail?.curriculum?.find(
      (it: any) => it?.order == Number(lessonId),
    );
    return moduleitem;
  };

  const getCurrentLesson = (selectedModuleId: number) => {
    if (courseDetail?.curriculum?.length > 0) {
      const lesson = getModuleForLesson(selectedModuleId)?.lectures.find(
        (l: any) => l.order === selectedLessonId,
      );
      if (lesson) return lesson;
    }
  };

  const currentLesson = getCurrentLesson(selectedModuleId);
  const currentModule = getModuleForLesson(selectedModuleId);

  useEffect(() => {
    const newModule = getModuleForLesson(selectedModuleId);
    if (newModule?.order) {
      setExpandedModule(`module-${newModule?.order}`);
    }
  }, [selectedLessonId]);

  // const getAllLessons = () => {
  //   return courseDetail.curriculum.flatMap((module: any) =>
  //     module.lectures.map((lesson: any) => ({ ...lesson, moduleTitle: module.title }))
  //   );
  // };

  // const getNextLesson = () => {
  //   const allLessons = getAllLessons();
  //   const currentIndex = allLessons.findIndex((l: any) => l.order === selectedLessonId);
  //   return currentIndex < allLessons.length - 1
  //     ? allLessons[currentIndex + 1]
  //     : null;
  // };

  // const getPreviousLesson = () => {
  //   const moduleLength = courseDetail?.curriculum?.length;
  //   const lessonLength = currentModule?.lectures?.length;

  //   // console.log(moduleLength, lessonLength)
  //   const allLessons = getAllLessons();
  //   const currentIndex = allLessons.findIndex((l: any) => l.order === selectedLessonId);
  //   return currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  // };

  // const goToNextLesson = () => {
  //   const nextLesson = getNextLesson();
  //   if (nextLesson) {
  //     setSelectedLessonId(nextLesson.id);
  //     setCurrentTime(0);
  //     setIsPlaying(false);
  //   }
  // };

  // const goToPreviousLesson = () => {
  //   const prevLesson = getPreviousLesson();
  //   if (prevLesson) {
  //     setSelectedLessonId(prevLesson.id);
  //     setCurrentTime(0);
  //     setIsPlaying(false);
  //   }
  // };

  const getAllLessons = () => {
    if (!courseDetail?.curriculum) return [];
    return courseDetail.curriculum.flatMap((mod: any) =>
      mod.lectures.map((l: any) => ({
        ...l,
        moduleOrder: mod.order,
        moduleTitle: mod.title,
      })),
    );
  };

  const getCurrentIndex = () => {
    const allLessons = getAllLessons();
    return allLessons.findIndex(
      (l: any) =>
        l.order === selectedLessonId && l.moduleOrder === selectedModuleId,
    );
  };

  const goToNextLesson = () => {
    const all = getAllLessons();
    const i = getCurrentIndex();
    if (i >= 0 && i < all.length - 1) {
      const next = all[i + 1];
      setSelectedModuleId(next.moduleOrder);
      setSelectedLessonId(next.order);
      setExpandedModule(`module-${next.moduleOrder}`);
    }
  };

  const goToPreviousLesson = () => {
    const all = getAllLessons();
    const i = getCurrentIndex();
    if (i > 0) {
      const prev = all[i - 1];
      setSelectedModuleId(prev.moduleOrder);
      setSelectedLessonId(prev.order);
      setExpandedModule(`module-${prev.moduleOrder}`);
    }
  };

  const hasNextLesson = () => {
    const all = getAllLessons();
    const i = getCurrentIndex();
    return i >= 0 && i < all.length - 1;
  };

  const hasPreviousLesson = () => {
    const all = getAllLessons();
    const i = getCurrentIndex();
    return i > 0;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusIcon = (status: string, isPreview: boolean) => {
    if (isPreview) {
      return <PlayCircle className="w-4 h-4 text-primary" />;
    }

    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "in_progress":
        return <PlayCircle className="w-4 h-4 text-primary" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return !isPending ? (
    <>
      {Object.keys(courseDetail)?.length > 0 ? (
        <div className="min-h-screen bg-background">
          {/* Preview Banner */}
          <div className="bg-primary/10 border-b border-primary/20">
            <div className="px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  <span className="text-primary font-medium">Preview Mode</span>
                  <span className="text-muted-foreground">
                    - Course player preview (no auto-play)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.back()}
                  >
                    {/* <Link href={`/instructor/preview/${id}`}> */}
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Outline
                    {/* </Link> */}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.history.go(-2)}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Manage Courses
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-screen">
            {/* Video Player */}
            <div className="flex-1 flex flex-col bg-black">
              <div className="flex-1 relative">
                {/* Mock video placeholder */}
                <div className="w-full h-full bg-black flex items-center justify-center">
                  {currentLesson?.contentType == "UPLOAD_VIDEO" ? (
                    <>
                      {currentLesson?.fileUrl && (
                        <VideoPlayer
                          src={currentLesson?.fileUrl}
                          title={currentLesson?.title}
                          onNext={goToNextLesson}
                          onPrevious={goToPreviousLesson}
                          hasPreviousLesson={!hasPreviousLesson()}
                          hasNextLesson={!hasNextLesson()}
                        />
                      )}
                    </>
                  ) : (
                    <iframe
                      src={
                        currentLesson?.videoUrl
                          ? getEmbedUrl(currentLesson?.videoUrl || "") +
                            "?autoplay=false"
                          : ""
                      }
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      className="w-full aspect-[1.8]"
                    ></iframe>
                  )}
                </div>
              </div>

              {/* Lesson Info */}
              <div className="bg-background border-t p-6">
                <div className="flex items-start justify-between">
                  <div>
                    {currentLesson?.title && currentLesson?.title != "" && (
                      <h1 className="text-xl font-bold text-foreground mb-2">
                        {currentLesson.title}
                      </h1>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {currentModule?.title && currentModule?.title != "" && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {currentModule.title}
                        </span>
                      )}
                      {/* <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {currentLesson.duration}
                  </span>
                  {currentLesson.isPreview && (
                    <Badge variant="outline">Free Preview</Badge>
                  )} */}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousLesson}
                      disabled={!hasPreviousLesson()}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextLesson}
                      disabled={!hasNextLesson()}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
                {/* document block */}
                <div className="flex gap-3 items-center flex-wrap">
                  {currentLesson?.attachments &&
                    currentLesson?.attachments?.map(
                      (dt: Attachment, ind: number) => (
                        <div key={ind} className="flex">
                          <Badge
                            key={ind}
                            variant="secondary"
                            className="flex items-center justify-between gap-3 my-4"
                          >
                            {dt.name}
                            <Link
                              href={dt?.fileUrl}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="ghost"
                                type="button"
                                size="sm"
                                // onClick={() => handleDownload(dt?.fileUrl, dt?.name)}
                                className="h-3 w-3 p-0 hover:bg-transparent"
                              >
                                <Download className="w-3 h-3 text-primary" />
                              </Button>
                            </Link>
                          </Badge>
                        </div>
                      ),
                    )}
                </div>
              </div>
            </div>

            {/* Course Sidebar */}
            {showSidebar && (
              <div className="w-80 bg-white border-l flex flex-col">
                <div className="p-4 border-b">
                  <h2 className="font-semibold text-foreground">
                    {courseDetail?.title}
                  </h2>
                </div>
                {courseDetail?.curriculum?.length > 0 && (
                  <div className="flex-1 overflow-y-auto p-4">
                    <Accordion
                      type="single"
                      value={expandedModule}
                      onValueChange={setExpandedModule}
                      className="space-y-2"
                    >
                      {courseDetail?.curriculum.map((module: any) => (
                        <AccordionItem
                          key={module?.order}
                          value={`module-${module?.order}`}
                          className="border rounded-lg"
                        >
                          <AccordionTrigger className="px-4 py-3 hover:no-underline">
                            <div className="text-left">
                              <h3 className="font-medium">{module?.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {module?.lectures?.length} lessons
                              </p>
                            </div>
                          </AccordionTrigger>
                          {module?.lectures?.length > 0 && (
                            <AccordionContent className="px-4 pb-3">
                              <div className="space-y-1">
                                {module?.lectures.map((lesson: any) => {
                                  const active =
                                    selectedModuleId == module?.order
                                      ? selectedLessonId == lesson?.order
                                      : false;
                                  return (
                                    <button
                                      key={lesson?.order}
                                      onClick={() => {
                                        setSelectedModuleId(module?.order);
                                        setSelectedLessonId(lesson?.order);
                                      }}
                                      className={`w-full flex items-center gap-3 p-3 text-left rounded-lg transition-colors ${
                                        active
                                          ? "bg-primary/10 border border-primary/20"
                                          : "hover:bg-muted/50"
                                      }`}
                                    >
                                      <div className="flex-shrink-0">
                                        {getStatusIcon("in_progress", false)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4
                                          className={`font-medium text-sm ${
                                            active
                                              ? "text-primary"
                                              : "text-foreground"
                                          }`}
                                        >
                                          {lesson?.title}
                                        </h4>
                                        {/* <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {lesson.duration}
                                </span>
                                {lesson.isPreview && (
                                  <Badge variant="outline" className="text-xs">
                                    Preview
                                  </Badge>
                                )}
                              </div> */}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </AccordionContent>
                          )}
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        "Not Found"
      )}
    </>
  ) : (
    <Loading hFull />
  );
}
