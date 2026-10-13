/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { Play, Lock, Clock, BookOpen } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { Progress } from "@/core/components/ui/progress";
import Link from "next/link";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/core/components/ui/select";
import { Request } from "@/core/utils/apiTools";
import APICONSTANT from "@/core/utils/ApiConstant";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import { timeAgo } from "@/core/utils/helperFunction";
import Loading from "@/core/components/ui/Loading";
import { subscriptionOption } from "@/core/utils/constants";
import PaginationFooter from "@/core/components/PaginationFooter";
import UseLoadingRouter from "@/core/hooks/useLoadRoute";

const MyCourses = () => {
  const router = UseLoadingRouter();
  const [activeFilter, setActiveFilter] = useState("All");
  // const [sortBy, setSortBy] = useState("recent");
  const [courseData, setCourseData] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 9;
  const totalPages = Math.ceil(total / limit);

  const apiCall = async (data: any) => {
    return await Request(`${APICONSTANT.studentCourse}`, "GET", data);
  };

  const { trigger, isPending } = useCustomMutation(
    apiCall,
    {
      onSuccessCallback: (data: any) => {
        // console.log(data?.data, "data");
        if (data?.data) {
          setCourseData(data?.data?.length > 0 ? data?.data : []);
          setTotal(data?.total || 0);
        }
      },
    },
    false,
  );

  useEffect(() => {
    trigger({ limit: limit, page: page, filter: activeFilter });
  }, [page, activeFilter]);

  const filters = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "inactive", label: "Inactive" },
    { id: "lifetime", label: "Lifetime" },
    // { id: "subscription", label: "Subscription" },
  ];

  const filteredCourses = courseData?.length > 0 ? courseData : [];

  const getAccessBadge = (course: any) => {
    if (course.planType === "LIFETIME") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Lifetime
        </Badge>
      );
    }
    const subscription =
      subscriptionOption?.find((itm) => itm.id == course?.planType)?.name ||
      course?.planType;
    return course.subscriptionStatus === "Active" ? (
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
        {subscription} — Active
      </Badge>
    ) : (
      <Badge variant="secondary">
        {subscription} — {course.subscriptionStatus}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
        <p className="text-muted-foreground mt-2">
          Access your enrolled courses
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Lifetime courses never expire.
        </p>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.label ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setActiveFilter(filter.label);
                setPage(1);
              }}
              className="rounded-full"
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently Accessed</SelectItem>
            <SelectItem value="progress">Progress</SelectItem>
            <SelectItem value="title">Title A–Z</SelectItem>
          </SelectContent>
        </Select> */}
      </div>
      {isPending && filteredCourses?.length == 0 ? (
        <>
          <Loading />
        </>
      ) : (
        <>
          {/* Course Grid */}
          {filteredCourses?.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course: any) => {
                  const isInactive =
                    !(course?.subscriptionStatus === "Active" ||
                    (course?.subscriptionStatus === "PastDue" &&
                      new Date() < new Date(course?.accessEndDate)));

                  return (
                    <Card
                      key={course?.enrollmentId}
                      className={cn(
                        "group relative overflow-hidden transition-all hover:shadow-lg flex flex-col justify-between",
                        isInactive ? "opacity-60" : "",
                      )}
                    >
                      {/* Lock overlay for inactive subscriptions */}
                      {isInactive && (
                        <div className="absolute top-4 right-4 z-10 bg-background/90 rounded-full p-1">
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}

                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-3">
                          {getAccessBadge(course)}
                        </div>
                        <CardTitle className="text-xl font-bold leading-tight text-foreground">
                          {course.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Progress
                            </span>
                            <span className="font-medium">
                              {course.progressPercentage || "0"}%
                            </span>
                          </div>
                          <Progress
                            value={course.progressPercentage || 0}
                            className="h-2"
                          />
                        </div>

                        {/* Meta info */}
                        <div className="flex items-center text-sm text-muted-foreground space-x-4">
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-1" />
                            {course.modules} modules
                          </div>
                          {course.accessEndDate && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {timeAgo(course.accessEndDate)}
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 pt-2">
                          {!isInactive ? (
                            <Button asChild className="flex-1">
                              <Link
                                // href={"#"}
                                href={`/course/outline?id=${
                                  course.enrollmentId
                                }&resume=${
                                  course?.progressPercentage > 0
                                    ? "true"
                                    : "false"
                                }`}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                {course?.progressPercentage > 0
                                  ? "Resume Course"
                                  : "Start Course"}
                              </Link>
                            </Button>
                          ) : (
                            <>
                              <Button
                                className="flex-1"
                                disabled={course.planType == "LIFETIME"}
                                onClick={() =>
                                  course?.courseId &&
                                  course.planType != "LIFETIME" &&
                                  router.push(
                                    "/courses/detail?id=" + course?.courseId,
                                  )
                                }
                              >
                                {course.planType == "LIFETIME"
                                  ? course?.progressPercentage > 0
                                    ? "Resume Course"
                                    : "Start Course"
                                  : "Renew"}
                              </Button>
                              {/* <Button variant="outline" asChild>
                                <Link href="/student/subscriptions">
                                  View Details
                                </Link>
                              </Button> */}
                            </>
                          )}
                        </div>

                        {/* Review Link */}
                        {!isInactive && (
                          <div className="pt-2 text-center">
                            <Link
                              // href={"#"}
                              href={`/course/outline?id=${course.enrollmentId}#reviews`}
                              className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                            >
                              {course?.hasReview
                                ? "Edit review"
                                : "Write review"}
                            </Link>
                          </div>
                        )}

                        {/* Inactive tooltip text */}
                        {isInactive && (
                          <p className="text-xs text-muted-foreground text-center">
                            Your subscription is inactive. Renew to continue.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <PaginationFooter
                page={page}
                setPage={setPage}
                totalPages={totalPages}
              />
            </>
          )}

          {/* Empty state */}
          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No courses found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or browse our course catalog.
              </p>
              <Button asChild className="mt-4">
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default MyCourses;
