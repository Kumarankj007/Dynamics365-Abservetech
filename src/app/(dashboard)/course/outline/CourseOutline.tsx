/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
// import { useSearchParams } from "react-router-dom";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Play,
  CheckCircle,
  Circle,
  Lock,
  ArrowLeft,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent } from "@/core/components/ui/card";
// import { Badge } from "@/core/components/ui/badge";
import { Progress } from "@/core/components/ui/progress";
import { Input } from "@/core/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/core/components/ui/breadcrumb";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/core/components/ui/collapsible";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/core/components/ui/tabs";
import { ReviewForm } from "@/core/components/reviews/ReviewForm";
import { CompletionNudge } from "@/core/components/reviews/CompletionNudge";
import { cn } from "@/core/lib/utils";
import UseLoadingRouter from "@/core/hooks/useLoadRoute";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import { Request } from "@/core/utils/apiTools";
import APICONSTANT from "@/core/utils/ApiConstant";
import Loading from "@/core/components/ui/Loading";
import { CourseData, CurriculumItem, Lecture } from "../../interface";
import {
  findLecturePosition,
  formatDuration,
} from "@/core/utils/helperFunction";
import useSnackbarStore from "@/core/store/toaster";
// import { useSearchParams } from "next/navigation";

// Mock user data
const currentUser = {
  id: "user-123",
  isEnrolled: true, // User is enrolled in this course
};
interface CourseReview {
  courseId: string;
  userId: string;
  enrollmentId: string;
  title: string;
  review: string;
  rating: number;
  isReviewed: boolean;
  replies: any[]; // If you want, I can type this too
  id: string;
}

const CourseOutline = ({ courseId }: any) => {
  const query = new URLSearchParams(window.location.search);
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const resume = query.get("resume");
  const isResume = resume == "true";
  const router = UseLoadingRouter();

  const [courseData, setCourseData] = useState<CourseData>();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedModules, setExpandedModules] = useState<number[]>([]);
  const [allExpanded, setAllExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("outline");

  const [existingReview, setExistingReview] = useState<CourseReview | null>({
    courseId: "",
    id: "",
    userId: "",
    rating: 0,
    enrollmentId: "",
    isReviewed: false,
    replies: [],
    title: "",
    review: "",
  });

  const apiCallReview = async (id: string) => {
    return await Request(`${APICONSTANT.getReview}/${id}`, "GET");
  };

  const { trigger: triggerReview, isPending: isPendingReview } =
    useCustomMutation(
      apiCallReview,
      {
        onSuccessCallback: (data: any) => {
          if (data?.status && data?.data) {
            setExistingReview(data?.data);
          }
          if (window.location.hash === "#reviews") {
            scrollToReviews();
          }
        },
      },
      false,
    );

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
        if (data?.status && data?.data) {
          setCourseData(data?.data);
          if (data?.data?.courseId) {
            triggerReview(data?.data?.courseId);
          }
          const lastWatchedLectureId = data?.data?.lastWatchedLectureId;
          const currState = findLecturePosition(
            data?.data,
            lastWatchedLectureId,
          );
          setExpandedModules([currState ? currState?.moduleId : 1]);
        } else {
          showSnackbar(data.message || "course not found", "warning");
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

  const isSubscriptionInactive = !(
    courseData?.subscriptionStatus === "Active" ||
    (courseData?.subscriptionStatus === "PastDue" &&
      new Date() < new Date(courseData?.accessEndDate))
  );
  
  const watchedModule = courseData?.lastWatchedLectureId
    ? findLecturePosition(courseData, courseData?.lastWatchedLectureId)
        ?.moduleId
    : 1;
  const watchedLesson = courseData?.lastWatchedLectureId
    ? findLecturePosition(courseData, courseData?.lastWatchedLectureId)
        ?.lessonId
    : 1;
  // course.accessType === "subscription" && course.status === "inactive";

  // Filter lessons based on search query
  const filteredModules = courseData?.curriculum
    .map((module) => ({
      ...module,
      lectures: module.lectures.filter((lesson) =>
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((module) => module.lectures.length > 0);

  // Handle expand/collapse all
  const toggleAllModules = () => {
    if (allExpanded) {
      setExpandedModules([]);
    } else {
      setExpandedModules(
        filteredModules ? filteredModules.map((m) => m?.order) : [],
      );
    }
    setAllExpanded(!allExpanded);
  };

  // Get status icon for lessons
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in-progress":
        return <Circle className="h-4 w-4 text-blue-600 fill-current" />;
      case "locked":
        return <Lock className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  function getNextLectureId(data: CourseData) {
    const lastId = data.lastWatchedLectureId;

    // If no last watched → return the very first lecture
    if (!lastId) {
      const firstModule = data.curriculum[0];
      return firstModule?.lectures[0]?.id || null;
    }

    const curriculum = data.curriculum;

    for (let m = 0; m < curriculum.length; m++) {
      const currModule = curriculum[m];

      for (let l = 0; l < currModule.lectures.length; l++) {
        const lecture = currModule.lectures[l];

        if (lecture.id === lastId) {
          // 👉 Case 1: next lecture inside same currModule
          if (currModule.lectures[l + 1]) {
            return currModule.lectures[l + 1].id;
          }

          // 👉 Case 2: go to next module (if exists)
          if (curriculum[m + 1]) {
            return curriculum[m + 1].lectures[0].id;
          }

          // 👉 Case 3: no more modules → course finished
          return null;
        }
      }
    }

    return null; // lecture not found
  }

  // Handle lesson click
  const handleLessonClick = (lessonId: string) => {
    if (isSubscriptionInactive) return;
    const query = new URLSearchParams(window.location.search);
    const queryId = query.get("id");
    if (lessonId && lessonId != "" && queryId) {
      router.push(`/course/player?id=${queryId}&lessonId=${lessonId}`);
    } else {
      openPlayer();
    }
  };

  // open Player:
  const openPlayer = () => {
    const query = new URLSearchParams(window.location.search);
    const queryId = query.get("id");
    if (queryId) {
      router.push(`/course/player?id=${queryId}`);
    }
  };

  const scrollToReviews = () => {
    setActiveTab("reviews");
    setTimeout(() => {
      const reviewsElement = document.getElementById("reviews");
      if (reviewsElement) {
        reviewsElement.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return isPending ? (
    <Loading hFull />
  ) : (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-6">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/student/dashboard"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Dashboard
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/student/dashboard"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    My Courses
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {courseData?.title && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{courseData?.title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>

          {/* Title and Progress */}
          <div className="space-y-4">
            <div>
              {courseData?.title && (
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {courseData.title}
                </h1>
              )}
              {courseData?.description && (
                <p className="text-muted-foreground">
                  {courseData?.description}
                </p>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Course Progress</span>
                <span className="font-medium text-foreground">
                  {courseData?.progressPercentage || 0}% Complete
                </span>
              </div>
              <Progress
                value={courseData?.progressPercentage || 0}
                className="h-3 rounded-full"
              />
            </div>

            {/* Resume Banner */}
            {isResume && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <RotateCcw className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">
                          Continue where you left off
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Module {watchedModule} • Lesson {watchedLesson}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {courseData?.lastWatchedLectureId && (
                        <Button
                          onClick={() => {
                            const nextLectureId = getNextLectureId(courseData);
                            handleLessonClick(nextLectureId || "");
                          }}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          Resume Lesson
                        </Button>
                      )}
                      <Button variant="outline" onClick={openPlayer}>
                        Open Player
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Inactive Subscription Banner */}
            {isSubscriptionInactive && (
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="py-4">
                  <div className="flex items-center justify-center">
                    <p className="text-destructive font-medium">
                      Your subscription is inactive
                    </p>
                    {/* <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Renew
                    </Button> */}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Completion Nudge */}
            <CompletionNudge
              courseProgress={courseData?.progressPercentage || 0}
              onWriteReview={scrollToReviews}
              onDismiss={() => {}}
              onRemindLater={() => {}}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      {!isSubscriptionInactive && (
        <main className="max-w-6xl mx-auto px-6 py-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="outline">Course Outline</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            {/* Course Outline Tab */}
            <TabsContent value="outline" className="space-y-6">
              {/* Actions Row */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={toggleAllModules}
                    className="text-sm"
                  >
                    {allExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Collapse All
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Expand All
                      </>
                    )}
                  </Button>
                </div>

                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search lessons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Modules and Lessons */}
              {filteredModules && filteredModules?.length > 0 && (
                <div className="space-y-4">
                  {filteredModules.map((module: CurriculumItem) => {
                    // const stats = getModuleStats(module);
                    const moduleDuration =
                      module?.lectures?.length > 0
                        ? module?.lectures?.reduce(
                            (acc: number, it: Lecture) =>
                              acc + (it?.duration || 0),
                            0,
                          )
                        : 0;
                    const stats = {
                      totalLessons: module?.lectures?.length,
                      duration: formatDuration(moduleDuration),
                    };
                    const isExpanded = expandedModules.includes(module?.order);

                    return (
                      <Card key={module?.order} className="overflow-hidden">
                        <Collapsible
                          open={isExpanded}
                          onOpenChange={(open) => {
                            if (open) {
                              setExpandedModules([
                                ...expandedModules,
                                module?.order,
                              ]);
                            } else {
                              setExpandedModules(
                                expandedModules.filter(
                                  (id) => id !== module?.order,
                                ),
                              );
                            }
                          }}
                        >
                          <CollapsibleTrigger asChild>
                            <div className="w-full p-6 hover:bg-muted/50 transition-colors cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  {module?.title && (
                                    <h3 className="text-lg font-semibold text-foreground mb-1">
                                      {module?.title}
                                    </h3>
                                  )}
                                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                    <span>
                                      {stats.totalLessons || 0} lessons
                                    </span>
                                    {stats?.duration &&
                                      stats?.duration != "0" && (
                                        <span>{stats?.duration || 0}</span>
                                      )}
                                  </div>
                                </div>
                                <ChevronDown
                                  className={cn(
                                    "h-5 w-5 text-muted-foreground transition-transform",
                                    isExpanded && "transform rotate-180",
                                  )}
                                />
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          {module?.lectures?.length > 0 && (
                            <CollapsibleContent>
                              <div className="border-t border-border bg-muted/20">
                                {module?.lectures?.map((lesson: Lecture) => {
                                  const isLocked = false;
                                  // lesson.status === "locked" ||
                                  // isSubscriptionInactive;

                                  return (
                                    <div
                                      key={lesson.order}
                                      className={cn(
                                        "flex items-center justify-between p-4 border-b border-border/50 last:border-b-0 transition-colors",
                                        !isLocked &&
                                          "hover:bg-background cursor-pointer",
                                        isLocked && "opacity-60",
                                      )}
                                      onClick={() =>
                                        !isLocked &&
                                        handleLessonClick(lesson?.id || "")
                                      }
                                    >
                                      <div className="flex items-center space-x-4 flex-1">
                                        {getStatusIcon(
                                          lesson?.isCompleted
                                            ? "completed"
                                            : "default",
                                        )}
                                        {lesson?.title && (
                                          <div className="flex-1">
                                            <h4
                                              className={cn(
                                                "font-medium",
                                                !isLocked
                                                  ? "text-foreground"
                                                  : "text-muted-foreground",
                                              )}
                                            >
                                              {lesson.title}
                                            </h4>
                                          </div>
                                        )}
                                      </div>
                                      {lesson?.duration &&
                                        lesson?.duration != 0 && (
                                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                            <span>
                                              {formatDuration(
                                                lesson?.duration || 0,
                                              ) || 0}
                                            </span>
                                            {!isLocked && (
                                              <ExternalLink className="h-4 w-4" />
                                            )}
                                          </div>
                                        )}
                                    </div>
                                  );
                                })}
                              </div>
                            </CollapsibleContent>
                          )}
                        </Collapsible>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Empty State */}
              {filteredModules?.length === 0 && searchQuery && (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No lessons found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search query.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" id="reviews" className="space-y-6">
              {/* User Review Form */}
              <ReviewForm
                courseId={courseData?.courseId}
                existingReview={existingReview}
                setExistingReview={setExistingReview}
                isPendingReview={isPendingReview || isPending}
              />
            </TabsContent>
          </Tabs>
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button variant="outline" onClick={() => router?.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Courses
            </Button>
            {!isSubscriptionInactive && (
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={openPlayer}
              >
                <Play className="h-4 w-4 mr-2" />
                Open Course Player
              </Button>
            )}
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Footer */}
      {!isSubscriptionInactive && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 sm:hidden">
          <div className="flex space-x-2">
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                if (courseData) {
                  const nextLectureId = getNextLectureId(courseData);
                  handleLessonClick(nextLectureId || "");
                }
              }}
            >
              Resume Lesson
            </Button>
            <Button variant="outline" onClick={toggleAllModules}>
              {allExpanded ? "Collapse" : "Expand"} All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseOutline;
