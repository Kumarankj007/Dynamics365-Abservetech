/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Badge } from "@/core/components/ui/badge";
import { Search, Calendar, Users, Mail } from "lucide-react";
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
import Loading from "@/core/components/ui/Loading";
import { priceFormat } from "@/core/utils/helperFunction";
import PaginationFooter from "@/core/components/PaginationFooter";

interface EnrollmentItem {
  courseTitle: string;
  studentName: string;
  studentEmail: string;
  planType: "1_MONTH" | "6_MONTHS" | "1_YEAR" | "LIFETIME";
  totalAmount: string; // price as string from backend
  paymentStatus: "Paid" | "Pending";
  enrolledAt: string; // ISO Date string
  accessEndDate: string | null; // null = lifetime / pending
}
const ManageCourses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courses, setCourses] = useState<EnrollmentItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  const apiCall = async (data: any) => {
    return await Request(APICONSTANT.studentList, "GET", data);
  };
  const { trigger, isPending } = useCustomMutation(
    apiCall,
    {
      onSuccessCallback(data) {
        // console.log(data?.data);
        if (data?.success && data?.data) {
          setCourses(data?.data);
          setTotal(data?.total || 0)
        }
      },
    },
    false
  );

  useEffect(() => {
    trigger({ limit: limit, page: page });
  }, [page]);

  const getPlanType = (status: string) => {
    const planType =
      subscriptionOption?.find((it: any) => it?.id == status)?.name || status;
    switch (status) {
      case "LIFETIME":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            {planType}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            {planType}
          </Badge>
        );
    }
  };

  const getPaymentStatus = (status: string) => {
    switch (status) {
      case "Paid":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            {status}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            {status}
          </Badge>
        );
    }
  };

  const filteredCourses =
    courses?.filter((course) => {
      const matchesSearch = course.courseTitle
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || course.planType === statusFilter;
      return matchesSearch && matchesStatus;
    }) || [];

  const sortedCourses = [...filteredCourses];
  return (
    <div className="space-y-8 bg-background">
      {/* Header */}
      <div className="flex-1 flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            My Students
          </h2>
          {/* <p className="text-muted-foreground">
            Create, edit, and manage your course library
          </p> */}
        </div>
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
                <SelectItem value="all">All Plan</SelectItem>
                <SelectItem value="LIFETIME">Life-Time</SelectItem>
                <SelectItem value="1_YEAR">1 Year</SelectItem>
                <SelectItem value="6_MONTHS">6 Months</SelectItem>
                <SelectItem value="1_MONTH">1 Month</SelectItem>
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
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No students enrolled yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Once students purchase your courses, they will appear here.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedCourses?.length > 0 &&
            sortedCourses?.map((course, ind) => (
              <Card
                key={ind}
                className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-6">
                      <div className="flex items-center justify-between space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-foreground truncate">
                          {course.courseTitle}
                        </h3>
                        {course.paymentStatus &&
                          getPaymentStatus(course.paymentStatus)}
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <span className="font-medium text-primary">
                          {priceFormat(Number(course?.totalAmount))}
                        </span>
                        {course.planType && getPlanType(course.planType)}

                        {course.studentName && (
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{course.studentName}</span>
                          </div>
                        )}

                        {course?.studentEmail && (
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{course?.studentEmail}</span>
                          </div>
                        )}

                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(course?.enrolledAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )}{" "}
                            {course?.accessEndDate &&
                              "-" +
                                new Date(
                                  course?.accessEndDate
                                ).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })}
                          </span>
                        </div>
                      </div>
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
