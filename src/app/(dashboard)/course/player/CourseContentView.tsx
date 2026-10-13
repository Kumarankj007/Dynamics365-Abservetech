/* eslint-disable react-hooks/exhaustive-deps */
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronDown,
  Play,
  CheckCircle2,
  Circle,
  ChevronLeft,
  Lock,
  ExpandIcon,
  Minimize2,
  Home,
  Download,
  Search,
} from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Progress } from "@/core/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/core/components/ui/collapsible";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/core/components/ui/breadcrumb";
import { cn } from "@/core/lib/utils";
import VideoPlayer from "@/core/components/VideoPlayer";
import { Request } from "@/core/utils/apiTools";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import APICONSTANT from "@/core/utils/ApiConstant";
import Loading from "@/core/components/ui/Loading";
import { CourseData, CurriculumItem, Lecture } from "../../interface";
import {
  findLecturePosition,
  formatDuration,
  getEmbedUrl,
  iframeSrc,
} from "@/core/utils/helperFunction";
import useSnackbarStore from "@/core/store/toaster";
import UseLoadingRouter from "@/core/hooks/useLoadRoute";
import { Attachment } from "@/core/utils/interface";
import { Input } from "@/core/components/ui/input";

// Mock course data
const courseData = {
  id: 1,
  title: "Dynamics 365 Sales Fundamentals",
  accessType: "lifetime",
  status: "active",
  overallProgress: 35,
  modules: [
    {
      id: 1,
      title: "Introduction to Dynamics 365 Sales",
      lessons: [
        {
          id: 1,
          title: "What is Dynamics 365 Sales?",
          duration: "8:30",
          type: "video",
          src: "/videos/dreamhnf.mp4",
        },
        {
          id: 2,
          title: "Setting up your environment",
          duration: "12:45",
          type: "video",
          src: "/videos/dreamhnf.mp4",
        },
        {
          id: 3,
          title: "Navigation basics",
          duration: "6:20",
          type: "video",
          src: "/videos/dreamhnf.mp4",
        },
      ],
    },
    {
      id: 2,
      title: "Lead Management",
      lessons: [
        {
          id: 1,
          title: "Creating and qualifying leads",
          duration: "15:30",
          type: "video",
          src: "/videos/dreamhnf.mp4",
        },
        {
          id: 2,
          title: "Lead scoring strategies",
          duration: "10:15",
          type: "video",
          src: "/videos/dreamhnf.mp4",
        },
        {
          id: 3,
          title: "Converting leads to opportunities",
          duration: "12:00",
          type: "video",
          src: "/videos/dreamhnf.mp4",
        },
      ],
    },
    {
      id: 3,
      title: "Opportunity Management",
      lessons: [
        {
          id: 1,
          title: "Creating opportunities",
          duration: "14:20",
          type: "video",
          src: "/videos/dreamhnf.mp4",
        },
        {
          id: 2,
          title: "Sales process workflows",
          duration: "18:45",
          type: "video",
          src: "/videos/dreamhnf.mp4",
        },
        {
          id: 3,
          title: "Forecasting and analytics",
          duration: "22:10",
          type: "video",
          src: "/videos/dreamhnf.mp4",
        },
      ],
    },
  ],
};
const CourseContentView = ({ courseId }: any) => {
  // const { id } = useParams();
  const router = UseLoadingRouter();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const [courseDetail, setCourseDetail] = useState<CourseData>();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedModules, setExpandedModules] = useState<Set<number>>(
    new Set([1]),
  );
  const [currentLesson, setCurrentLesson] = useState({
    moduleId: 1,
    lessonId: 1,
  });

  const apiCall = async (id: string) => {
    return await Request(
      `${APICONSTANT.studentCourseDetail}/${id}?lastDate=${new Date()}`,
      // `${APICONSTANT.studentCourseDetail}/${id}}`,
      "GET",
    );
  };

  const { trigger, isPending } = useCustomMutation(
    apiCall,
    {
      onSuccessCallback: (data: any) => {
        // console.log(data?.data, "data");
        if (data?.status && data?.data) {
          setCourseDetail(data?.data);
          const query = new URLSearchParams(window.location.search);
          const queryId = query.get("lessonId");
          if (queryId) {
            const currState = findLecturePosition(data?.data, queryId);
            if (currState) {
              setCurrentLesson(currState);
              setExpandedModules(() => new Set([currState?.moduleId]));
            }
          }
        }
      },
    },
    false,
  );

  // Filter lessons based on search query
  const filteredModules = courseDetail?.curriculum
    .map((module) => ({
      ...module,
      lectures: module.lectures.filter((lesson) =>
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((module) => module.lectures.length > 0);

  // mark as completed api call:
  const completedApiCall = async (path: string) => {
    return await Request(`${APICONSTANT.markAsComplete}/${path}`, "PUT");
  };

  useEffect(() => {
    if (!searchQuery || !courseDetail?.curriculum) return;

    const moduleIdsToExpand = courseDetail.curriculum
      .filter((module) =>
        module.lectures.some((lesson) =>
          lesson.title.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
      .map((module) => module.order);

    setExpandedModules(new Set(moduleIdsToExpand));
  }, [searchQuery, courseDetail]);

  const { trigger: completedTrigger, isPending: completedIsPending } =
    useCustomMutation(
      completedApiCall,
      {
        onSuccessCallback: (data: any) => {
          // console.log(data, "data");
          if (data?.status && data?.data) {
            const lectureIdToUpdate = data?.data?.lectureId;
            const progressPercentage =
              data?.data?.progressPercentage ||
              courseDetail?.progressPercentage;
            if (
              courseDetail &&
              courseDetail?.curriculum &&
              courseDetail?.curriculum?.length > 0
            ) {
              setCourseDetail({
                ...courseDetail,
                progressPercentage: progressPercentage,
                curriculum: courseDetail.curriculum.map((module) => ({
                  ...module,
                  lectures: module.lectures.map((lecture) =>
                    lecture.id === lectureIdToUpdate
                      ? { ...lecture, isCompleted: true }
                      : lecture,
                  ),
                })),
              });
            }
          }
        },
      },
      false,
    );

  // Check URL hash for direct navigation to reviews
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const queryId = query.get("id");
    if (queryId) {
      trigger(queryId);
    }
  }, []);

  const currentLessonData = courseDetail?.curriculum
    .find((m) => m.order === currentLesson.moduleId)
    ?.lectures.find((l) => l.order === currentLesson.lessonId);

  const isInactive = !(
    courseDetail?.subscriptionStatus === "Active" ||
    (courseDetail?.subscriptionStatus === "PastDue" &&
      new Date() < new Date(courseDetail?.accessEndDate))
  );

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const toggleExpandAll = () => {
    if (expandedModules.size === courseDetail?.curriculum?.length) {
      setExpandedModules(new Set());
    } else {
      setExpandedModules(
        new Set(courseDetail?.curriculum?.map((m) => m.order)),
      );
    }
  };

  const markComplete = (lessonId: string | null) => {
    const query = new URLSearchParams(window.location.search);
    const queryId = query.get("id");
    if (queryId && lessonId) {
      const lessonKey = `${queryId}/${lessonId}`;
      completedTrigger(lessonKey);
    } else {
      showSnackbar("Something went wrong", "error");
    }
  };

  const navigateToNext = () => {
    const currentModule = courseDetail?.curriculum.find(
      (m) => m.order === currentLesson.moduleId,
    );
    const currentLessonIndex =
      currentModule?.lectures.findIndex(
        (l) => l.order === currentLesson.lessonId,
      ) ?? -1;

    if (currentLessonIndex < (currentModule?.lectures.length ?? 0) - 1) {
      // Next lesson in current module
      setCurrentLesson((prev) => ({ ...prev, lessonId: prev.lessonId + 1 }));
    } else {
      // First lesson of next module
      const nextModuleId = currentLesson.moduleId + 1;
      if (
        courseDetail?.curriculum &&
        nextModuleId <= courseDetail?.curriculum?.length
      ) {
        setCurrentLesson({ moduleId: nextModuleId, lessonId: 1 });
        setExpandedModules((prev) => new Set([...prev, nextModuleId]));
      }
    }
  };

  const navigateToPrevious = () => {
    if (currentLesson.lessonId > 1) {
      // Previous lesson in current module
      setCurrentLesson((prev) => ({ ...prev, lessonId: prev.lessonId - 1 }));
    } else {
      // Last lesson of previous module
      const prevModuleId = currentLesson.moduleId - 1;
      if (prevModuleId >= 1) {
        const prevModule = courseDetail?.curriculum?.find(
          (m) => m?.order === prevModuleId,
        );
        if (prevModule) {
          setCurrentLesson({
            moduleId: prevModuleId,
            lessonId: prevModule?.lectures?.length,
          });
          setExpandedModules((prev) => new Set([...prev, prevModuleId]));
        }
      }
    }
  };

  return isPending ? (
    <Loading hFull />
  ) : (
    <div className="min-h-screen bg-background">
      {/* Navigation and Progress bar */}
      <div className="sticky top-0 left-0 right-0 z-40 bg-background backdrop-blur-sm border-b border-border">
        <div className="px-6 py-3 space-y-3">
          {/* Breadcrumb Navigation */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/student/dashboard"
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Home className="h-4 w-4" />
                    Dashboard
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/student/dashboard"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    My Courses
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {courseDetail?.title && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-foreground font-medium">
                      {courseDetail?.title}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>

          {/* Course Progress */}
          <div className="flex items-center justify-between">
            {courseDetail?.title && (
              <h1 className="text-lg font-semibold text-foreground">
                {courseDetail?.title}
              </h1>
            )}
            <span className="text-sm text-muted-foreground">
              {courseDetail?.progressPercentage || 0}% Complete
            </span>
          </div>
          <Progress
            value={courseDetail?.progressPercentage || 0}
            className="h-2"
          />
        </div>
      </div>
      {courseDetail?.curriculum && courseDetail?.curriculum?.length > 0 && (
        <div className="flex">
          {/* Sidebar - Course Navigation */}
          <aside className="w-80 bg-background border-r border-border overflow-y-auto max-h-[calc(100vh-105px)] fixed left-0">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground">
                  Course Content
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleExpandAll}
                  className="text-xs"
                >
                  {expandedModules.size === courseDetail?.curriculum?.length ? (
                    <>
                      <Minimize2 className="h-3 w-3 mr-1" />
                      Collapse All
                    </>
                  ) : (
                    <>
                      <ExpandIcon className="h-3 w-3 mr-1" />
                      Expand All
                    </>
                  )}
                </Button>
              </div>
              <div className="relative w-full mt-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search lessons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="p-4 space-y-2">
              {filteredModules?.map((module) => (
                <Collapsible
                  key={module?.order}
                  open={expandedModules.has(module?.order)}
                  onOpenChange={() => toggleModule(module?.order)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between h-auto p-3 text-left whitespace-normal"
                    >
                      {module?.title && (
                        <span className="font-medium text-sm">
                          {module?.title}
                        </span>
                      )}
                      {expandedModules.has(module?.order) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  {module?.lectures?.length > 0 && (
                    <CollapsibleContent className="pl-4 space-y-1">
                      {module?.lectures?.map((lesson) => {
                        const isCurrentLesson =
                          currentLesson.moduleId === module?.order &&
                          currentLesson.lessonId === lesson?.order;
                        const isCompleted = lesson?.isCompleted;

                        return (
                          <Button
                            key={lesson?.order}
                            variant={isCurrentLesson ? "secondary" : "ghost"}
                            className={cn(
                              "w-full justify-start h-auto p-3 text-left",
                              isCurrentLesson &&
                                "bg-primary text-primary-foreground hover:bg-primary/90",
                            )}
                            onClick={() => {
                              if (!isInactive) {
                                setCurrentLesson({
                                  moduleId: module?.order,
                                  lessonId: lesson?.order,
                                });
                              }
                            }}
                            disabled={isInactive}
                          >
                            <div className="flex items-center space-x-3 w-full">
                              {isInactive ? (
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              ) : isCompleted ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <Circle className="h-4 w-4" />
                              )}
                              <div className="flex-1 min-w-0">
                                {lesson?.title && (
                                  <div className="text-sm font-medium truncate">
                                    {lesson?.title}
                                  </div>
                                )}
                                {lesson?.duration && lesson?.duration != 0 && (
                                  <div
                                    className={
                                      (!isCurrentLesson
                                        ? "text-muted-foreground"
                                        : "text-background/75") + " text-xs"
                                    }
                                  >
                                    {formatDuration(lesson?.duration)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Button>
                        );
                      })}
                    </CollapsibleContent>
                  )}
                </Collapsible>
              ))}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 ml-80 p-6">
            {isInactive ? (
              <Card className="max-w-2xl mx-auto">
                <CardContent className="text-center py-12">
                  <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Lock className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">
                    Subscription Inactive
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Your subscription is inactive. Renew to continue accessing
                    this course.
                  </p>
                  <div className="space-x-3">
                    <Button
                      onClick={() =>
                        courseDetail?.courseId &&
                        router.push(
                          "/courses/detail?id=" + courseDetail?.courseId,
                        )
                      }
                    >
                      Renew Subscription
                    </Button>
                    {/* <Button variant="outline">View Subscription Details</Button> */}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Video Player */}
                <Card>
                  <CardContent className="p-0">
                    {currentLessonData?.contentType == "UPLOAD_VIDEO" &&
                      currentLessonData?.fileUrl != "" && (
                        <VideoPlayer
                          src={currentLessonData?.fileUrl || ""}
                          title={currentLessonData?.title}
                          skipSeconds={5}
                          className="aspect-video bg-black rounded-t-lg flex items-center justify-center"
                          // onNext={navigateToNext}
                          // onPrevious={navigateToPrevious}
                        />
                      )}

                    {currentLessonData?.contentType == "EMBED_LINK" &&
                      getEmbedUrl(currentLessonData?.videoUrl || "") !=
                        undefined && (
                        <iframe
                          src={
                            currentLessonData?.videoUrl
                              ? getEmbedUrl(currentLessonData?.videoUrl || "") +
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
                    <div className="p-6 space-y-4">
                      <div>
                        {currentLessonData?.title && (
                          <h1 className="text-2xl font-bold mb-2">
                            {currentLessonData?.title}
                          </h1>
                        )}
                        {/* document block */}
                        <div className="flex gap-3 items-center flex-wrap">
                          {currentLessonData?.attachments &&
                            currentLessonData?.attachments?.map(
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
                        {currentLessonData?.duration &&
                          currentLessonData?.duration != 0 && (
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>
                                Duration:{" "}
                                {formatDuration(currentLessonData?.duration)}
                              </span>
                              <Badge variant="outline">Video</Badge>
                            </div>
                          )}
                      </div>

                      {/* Description */}
                      {/* <Collapsible
                        open={expandedDescription}
                        onOpenChange={setExpandedDescription}
                      >
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            className="p-0 h-auto text-left justify-start"
                          >
                            <span className="font-medium">Description</span>
                            {expandedDescription ? (
                              <ChevronDown className="h-4 w-4 ml-2" />
                            ) : (
                              <ChevronRight className="h-4 w-4 ml-2" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <p className="text-muted-foreground">
                            In this lesson, you&apos;ll learn the fundamentals
                            of {currentLessonData?.title.toLowerCase()}.
                            We&apos;ll cover best practices, practical examples,
                            and real-world scenarios to help you master this
                            important concept in Dynamics 365 Sales.
                          </p>
                        </CollapsibleContent>
                      </Collapsible> */}

                      {/* Controls */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <Button
                          variant="outline"
                          onClick={navigateToPrevious}
                          disabled={
                            currentLesson.moduleId === 1 &&
                            currentLesson.lessonId === 1
                          }
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>

                        {!currentLessonData?.isCompleted && (
                          <Button
                            onClick={() =>
                              markComplete(currentLessonData?.id || null)
                            }
                            disabled={completedIsPending}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Mark Complete
                          </Button>
                        )}

                        <Button
                          onClick={navigateToNext}
                          disabled={
                            courseDetail?.curriculum?.length ==
                              currentLesson.moduleId &&
                            courseDetail?.curriculum?.[
                              currentLesson.moduleId - 1
                            ]?.lectures?.length == currentLesson?.lessonId
                          }
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default CourseContentView;
