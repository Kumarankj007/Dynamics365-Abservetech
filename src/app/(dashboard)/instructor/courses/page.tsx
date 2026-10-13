/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Badge } from "@/core/components/ui/badge";
import {
  Search,
  Plus,
  Edit,
  Eye,
  Send,
  // Archive,
  // MoreHorizontal,
  Star,
  // Users,
  Calendar,
  RefreshCw,
} from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/core/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import APICONSTANT from "@/core/utils/ApiConstant";
import { Request } from "@/core/utils/apiTools";
import { subscriptionOption } from "@/core/utils/constants";
import UseLoadingRouter from "@/core/hooks/useLoadRoute";
import Loading from "@/core/components/ui/Loading";
import { priceFormat } from "@/core/utils/helperFunction";
import PaginationFooter from "@/core/components/PaginationFooter";

interface PricingOption {
  price: number | string;
  option: string; // e.g., "ONE_MONTH" | "SIX_MONTHS" | "1_MONTH"
  description: string;
}
interface Course {
  id: string;
  title: string;
  courseAvailability: boolean;
  pricingOptions: PricingOption[];
  timeSpentId: string | null;
  totalReviews: number;
  averageRating: number;
  status:
    | "In Review"
    | "Published"
    | "Rejected"
    | "Changes Requested"
    | "Draft";
  updatedAt: string; // ISO timestamp
}
// interface AverageRating {
//   overall: number;
//   Engagement: number;
//   Practicality: number;
//   ValueForMoney: number;
//   ContentQuality: number;
//   InstructorClarity: number;
// }
const ManageCourses = () => {
  const router = UseLoadingRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updated");
  const [courses, setCourses] = useState<Course[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  const apiCall = async (data: any) => {
    return await Request(APICONSTANT.myCourse, "GET", data);
  };
  const { trigger, isPending } = useCustomMutation(
    apiCall,
    {
      onSuccessCallback(data) {
        if (data?.success && data?.data) {
          setCourses(data?.data?.data);
          setTotal(data?.data?.total);
        }
      },
    },
    false,
  );

  useEffect(() => {
    trigger({ limit: limit, page: page });
  }, [page]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Published":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Published
          </Badge>
        );
      case "Draft":
        return (
          <Badge
            variant="secondary"
            className="bg-gray-100 text-gray-700 border-gray-200"
          >
            Draft
          </Badge>
        );
      case "In Review":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            In Review
          </Badge>
        );
      case "Changes Requested":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Changes Requested
          </Badge>
        );
      case "Rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getActionButton = (course: any) => {
    switch (course.status) {
      case "draft":
        return (
          <Button
            variant="outline"
            size="sm"
            className="border-primary text-primary hover:bg-primary/10"
          >
            <Send className="w-4 h-4 mr-2" />
            Submit for Review
          </Button>
        );
      case "changes-requested":
        return (
          <Button
            variant="outline"
            size="sm"
            className="border-primary text-primary hover:bg-primary/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Resubmit
          </Button>
        );
      default:
        return null;
    }
  };

  const filteredCourses =
    courses?.filter((course) => {
      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || course.status === statusFilter;
      return matchesSearch && matchesStatus;
    }) || [];

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      // case "enrollments":
      //   return b.enrollments - a.enrollments;
      case "rating":
        return b?.averageRating - a?.averageRating;
      case "updated":
      default:
        return (
          new Date(b?.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }
  });

  return (
    <div className="space-y-8 bg-background">
      {/* Header */}
      <div className="flex-1 flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Manage Courses
          </h2>
          <p className="text-muted-foreground">
            Create, edit, and manage your course library
          </p>
        </div>
        <Button
          variant="default"
          onClick={() => router?.push("/instructor/create-course")}
        >
          {/* <Link href="/instructor/create-course"> */}
          <Plus className="w-4 h-4 mr-2" />
          Create New Course
          {/* </Link> */}
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-card border border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-background border-border">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="In Review">In Review</SelectItem>
                <SelectItem value="Changes Requested">
                  Changes Requested
                </SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 bg-background border-border">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Last Updated</SelectItem>
                <SelectItem value="enrollments">Enrollments</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Courses List */}
      {isPending && sortedCourses.length === 0 ? (
        <Loading />
      ) : sortedCourses.length === 0 ? (
        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Create your first course
                </h3>
                <p className="text-muted-foreground mb-6">
                  Start sharing your knowledge and earning money by creating
                  your first course.
                </p>
                <Button
                  variant="default"
                  onClick={() => router?.push("/instructor/create-course")}
                >
                  {/* <Link href="/instructor/create-course"> */}
                  <Plus className="w-4 h-4 mr-2" />
                  Create Course
                  {/* </Link> */}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedCourses?.length > 0 &&
            sortedCourses?.map((course) => (
              <Card
                key={course.id}
                className={`bg-card border border-border shadow-sm hover:shadow-md transition-shadow ${!course?.courseAvailability ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-6">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-foreground">
                          {course.title}
                        </h3>
                        {course.status && getStatusBadge(course.status)}
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        {course?.pricingOptions?.length > 0 &&
                          course?.pricingOptions?.map(
                            (item: PricingOption, ind: number) => (
                              <span
                                key={ind}
                                className="font-medium text-primary"
                              >
                                {priceFormat(Number(item?.price))} (
                                {subscriptionOption?.find(
                                  (it: any) => it?.id == item?.option,
                                )?.name || item?.option}
                                )
                              </span>
                            ),
                          )}

                        {/* {course.enrollments > 0 && (
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{course.enrollments} students</span>
                          </div>
                        )} */}

                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{course?.averageRating}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Updated{" "}
                            {new Date(course?.updatedAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {(course?.status == "Draft" ||
                        course?.status == "Changes Requested" || course?.status == "Published") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-foreground hover:bg-muted"
                          disabled={!course?.courseAvailability}
                          onClick={() =>
                            router?.push(
                              `/instructor/edit-course?id=${course?.id}`,
                            )
                          }
                        >
                          {/* <Link href={`/instructor/edit-course?id=${course.id}`}> */}
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                          {/* </Link> */}
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-foreground hover:bg-muted"
                        disabled={!course?.courseAvailability}
                        onClick={() =>
                          router?.push(`/instructor/preview?id=${course.id}`)
                        }
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>

                      {course && getActionButton(course)}

                      {/* <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-foreground hover:bg-muted"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-card border-border"
                        >
                          <DropdownMenuItem className="text-foreground hover:bg-muted">
                            Duplicate
                          </DropdownMenuItem>
                          {(course.status === "In Review" ||
                            course.status === "Published") && (
                            <DropdownMenuItem className="text-foreground hover:bg-muted">
                              <Archive className="w-4 h-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu> */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          <PaginationFooter
            page={page}
            setPage={setPage}
            totalPages={totalPages}
          />
        </div>
      )}
    </div>
  );
};

export default ManageCourses;
