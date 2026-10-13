/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
// import { useState } from "react";
import Link from "next/link";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/core/components/ui/button";
// import { Badge } from "@/core/components/ui/badge";
// import { Progress } from "@/core/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/core/components/ui/accordion";
import {
  Play,
  // Clock,
  CheckCircle,
  Circle,
  PlayCircle,
  BookOpen,
  Star,
  // Users,
  AlertCircle,
  ArrowLeft,
  Clock,
} from "lucide-react";
import UseLoadingRouter from "@/core/hooks/useLoadRoute";
import { useEffect, useState } from "react";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import { Request } from "@/core/utils/apiTools";
import APICONSTANT from "@/core/utils/ApiConstant";
import Loading from "@/core/components/ui/Loading";
import { toHoursDecimal, toMinutesDecimal } from "@/core/utils/helperFunction";
import { Lecture } from "@/core/utils/interface";

// Mock course data - in real app, would fetch based on ID
// const courseDatas = {
//   id: "id",
//   title: "Advanced Power BI Dashboard Design",
//   subtitle:
//     "Master the art of creating stunning, interactive Power BI dashboards that deliver actionable insights",
//   instructor: "John Smith",
//   rating: 4.8,
//   totalStudents: 12459,
//   // totalDuration: "15.5 hours",
//   progress: 0, // Student hasn't started yet (preview mode)
//   modules: [
//     {
//       id: 1,
//       title: "Getting Started with Advanced Power BI",
//       duration: "2.5 hours",
//       lessons: [
//         {
//           id: 1,
//           title: "Course Introduction and Overview",
//           duration: "15 min",
//           status: "not_started",
//           isPreview: true,
//         },
//         {
//           id: 2,
//           title: "Setting Up Your Power BI Environment",
//           duration: "20 min",
//           status: "not_started",
//           isPreview: false,
//         },
//         {
//           id: 3,
//           title: "Understanding Dashboard Design Principles",
//           duration: "25 min",
//           status: "not_started",
//           isPreview: false,
//         },
//         {
//           id: 4,
//           title: "Power BI Interface Deep Dive",
//           duration: "30 min",
//           status: "not_started",
//           isPreview: false,
//         },
//       ],
//     },
//     {
//       id: 2,
//       title: "Advanced Visualization Techniques",
//       duration: "3.2 hours",
//       lessons: [
//         {
//           id: 5,
//           title: "Custom Visuals and Marketplace",
//           duration: "35 min",
//           status: "not_started",
//           isPreview: false,
//         },
//         {
//           id: 6,
//           title: "Advanced Chart Types",
//           duration: "40 min",
//           status: "not_started",
//           isPreview: false,
//         },
//         {
//           id: 7,
//           title: "Interactive Elements and Drill-Through",
//           duration: "45 min",
//           status: "not_started",
//           isPreview: false,
//         },
//         {
//           id: 8,
//           title: "Conditional Formatting Mastery",
//           duration: "30 min",
//           status: "not_started",
//           isPreview: false,
//         },
//       ],
//     },
//     {
//       id: 3,
//       title: "DAX Mastery for Dashboard Creators",
//       duration: "4.1 hours",
//       lessons: [
//         {
//           id: 9,
//           title: "DAX Fundamentals Review",
//           duration: "25 min",
//           status: "not_started",
//           isPreview: false,
//         },
//         {
//           id: 10,
//           title: "Advanced DAX Functions",
//           duration: "50 min",
//           status: "not_started",
//           isPreview: false,
//         },
//         {
//           id: 11,
//           title: "Time Intelligence Functions",
//           duration: "45 min",
//           status: "not_started",
//           isPreview: false,
//         },
//         {
//           id: 12,
//           title: "Complex Calculations and Measures",
//           duration: "40 min",
//           status: "not_started",
//           isPreview: false,
//         },
//       ],
//     },
//   ],
// };

const CoursePreview = () => {
  const router = UseLoadingRouter();
  const [courseData, setCourseData] = useState<any>({});

  const apiCall = async (id: string) => {
    return await Request(APICONSTANT.courseDetails + "/" + id, "GET");
  };
  const { trigger, isPending } = useCustomMutation(
    apiCall,
    {
      onSuccessCallback: (data: any) => {
        if (data?.status && data?.data) {
          setCourseData(data?.data);
        }
      },
    },
    false,
  );

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const queryId = query.get("id");
    if (queryId) {
      trigger(queryId);
    }
  }, []);

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

  const getTotalLessons = () => {
    return courseData?.curriculum?.reduce(
      (total: any, module: any) => total + module?.lectures?.length,
      0,
    );
  };
  // const getTotalDuration = () => {
  //   return courseData?.curriculum?.reduce(
  //     (acc: number, it: Module) =>
  //       acc +
  //         it?.lectures?.reduce(
  //           (accLec: number, itLec: Lecture) => accLec + (itLec?.duration || 0),
  //           0,
  //         ) || 0,
  //     0,
  //   );
  // };

  return (
    <div className="min-h-screen bg-background">
      {/* Preview Banner */}
      <div className="bg-primary/10 border-b border-primary/20">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-primary" />
              <span className="text-primary font-medium">Preview Mode</span>
              <span className="text-muted-foreground">
                - This is how the course appears to enrolled students
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router?.push("/instructor/courses")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Manage Courses
            </Button>
          </div>
        </div>
      </div>

      {/* Course Header */}
      {!isPending ? (
        <>
          {Object.keys(courseData)?.length > 0 && (
            <>
              <div className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-6 py-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      {courseData.title && (
                        <h1 className="text-3xl font-bold text-foreground mb-2 first-letter:uppercase">
                          {courseData.title}
                        </h1>
                      )}
                      {courseData?.description && (
                        <p className="text-lg text-muted-foreground mb-4">
                          {courseData?.description}
                        </p>
                      )}
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        {courseData?.averageRating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">
                              {typeof courseData?.averageRating == "number"
                                ? courseData?.averageRating
                                : courseData?.averageRating?.overall || 0}{" "}
                              ({courseData?.totalReviews || 0})
                            </span>
                          </div>
                        )}
                        {/* <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{courseData.totalStudents} students</span>
          </div> */}
                        {courseData?.approximateDurationEntity?.label && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {/* <span>{toHoursDecimal(getTotalDuration())}</span> */}
                            <span>
                              {courseData?.approximateDurationEntity?.label}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{getTotalLessons()} lessons</span>
                        </div>
                      </div>
                    </div>
                    <Button asChild className="bg-primary hover:bg-primary/90">
                      <Link href={`/instructor/player?id=${courseData?.id}`}>
                        {/* href={`/instructor/preview/${id}/player/1/`}> */}
                        <Play className="w-4 h-4 mr-2" />
                        Open Course Player
                      </Link>
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  {/* <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">
          Course Progress
        </span>
        <span className="text-sm text-muted-foreground">
          {courseData.progress}% Complete
        </span>
      </div>
      <Progress value={courseData.progress} className="h-2" />
    </div> */}
                </div>
              </div>

              {/* Course Content */}
              {courseData?.curriculum?.length > 0 && (
                <div className="max-w-4xl mx-auto px-6 py-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      Course Content
                    </h2>
                    <p className="text-muted-foreground">
                      {courseData.curriculum.length} modules •{" "}
                      {getTotalLessons()} lessons •{" "}
                      {/* {toHoursDecimal(getTotalDuration())} hours */}
                      {courseData?.approximateDurationEntity?.label
                        ? courseData?.approximateDurationEntity?.label +
                          "total length"
                        : ""}
                    </p>
                  </div>

                  <Accordion type="single" collapsible className="space-y-4">
                    {courseData.curriculum.map((module: any) => {
                      const moduleDuration =
                        module?.lectures?.length > 0
                          ? module?.lectures?.reduce(
                              (acc: number, it: Lecture) =>
                                acc + (it?.duration || 0),
                              0,
                            )
                          : 0;
                      return (
                        <AccordionItem
                          key={module?.order}
                          value={`module-${module?.order}`}
                          className="border rounded-lg bg-white shadow-sm"
                        >
                          <AccordionTrigger className="px-6 py-4 hover:no-underline">
                            <div className="flex items-center justify-between w-full text-left">
                              <div className="flex-1">
                                {module?.title && (
                                  <h3 className="font-semibold text-foreground">
                                    {module?.title}
                                  </h3>
                                )}
                                <p className="text-sm text-muted-foreground mt-1">
                                  {module?.lectures.length} lessons
                                  {moduleDuration != 0 &&
                                    " • " +
                                      toHoursDecimal(moduleDuration) +
                                      " hours"}
                                </p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-4">
                            <div className="space-y-2">
                              {module.lectures.map((lesson: any) => (
                                <Link
                                  key={lesson.order}
                                  href={`/instructor/player?id=${courseData?.id}&module=${module?.order}&lesson=${lesson?.order}`}
                                  // href={`/instructor/preview/${id}/player/${lesson.id}/`}
                                  className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors group"
                                >
                                  <div className="flex-shrink-0">
                                    {getStatusIcon("in_progress", false)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                                      {lesson.title}
                                    </h4>
                                    <div className="flex items-center gap-4 mt-1">
                                      {lesson?.duration !== 0 &&
                                        lesson?.contentType != "EMBED_LINK" && (
                                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {toMinutesDecimal(
                                              lesson.duration || 0,
                                            )}{" "}
                                            min
                                          </span>
                                        )}
                                      {/* {lesson.isPreview && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        Free Preview
                                      </Badge>
                                    )} */}
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <Loading hFull />
      )}
    </div>
  );
};
export default CoursePreview;
