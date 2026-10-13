/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import {
  BookOpen,
  Users,
  DollarSign,
  Star,
  FileText,
  Plus,
} from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table";
import { useEffect, useState } from "react";
import APICONSTANT from "@/core/utils/ApiConstant";
import { Request } from "@/core/utils/apiTools";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import Loading from "@/core/components/ui/Loading";
import { priceFormat } from "@/core/utils/helperFunction";
import PaginationFooter from "@/core/components/PaginationFooter";

export interface DashboardResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: DashboardData;
}

export interface DashboardData {
  publishedCourses: number;
  draftCourses: number;
  totalRevenue: number;
  platformCommission: number;
  totalSales: number;
  totalStudents: number;
  averageRating: number;
  monthWiseRevenue: MonthWiseRevenue;
}

export interface MonthWiseRevenue {
  total: number;
  page: number;
  limit: number;
  data: MonthRevenueItem[];
}

export interface MonthRevenueItem {
  month: string;
  instructorRevenue: number;
  platformCommission: number;
  totalSales: number;
  approvedAmount: number;
  pendingAmount: number;
}

const InstructorDashboard = () => {
  // Sample revenue data for past 6 months

  const [dashboard, setDashboard] = useState<DashboardData>();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  const apiCall = async (data: any) => {
    return await Request(`${APICONSTANT.dashboard}`, "GET", data);
  };

  const { trigger, isPending } = useCustomMutation(
    apiCall,
    {
      onSuccessCallback: (data: any) => {
        // console.log(data?.data, "onSuccessCallback");
        if (data?.status && data?.data) {
          setDashboard(data?.data);
          setTotal(data?.data?.monthWiseRevenue?.total || 0);
        }
      },
    },
    false
  );

  useEffect(() => {
    trigger({ limit: limit, page: page });
  }, [page]);

  return isPending ? (
    <Loading hFull />
  ) : (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Overview</h1>
          <p className="text-muted-foreground">
            Manage your courses, students, and revenue
          </p>
        </div>
        <Button variant="default" size="lg" asChild>
          <Link href="/instructor/create-course">
            <Plus className="w-5 h-5 mr-2" />
            Create Course
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Published Courses
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {dashboard?.publishedCourses || 0}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Draft Courses
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {dashboard?.draftCourses || 0}
                </p>
              </div>
              <FileText className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {priceFormat(dashboard?.totalRevenue || 0, 2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {dashboard?.totalStudents || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Average Rating
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {Number(dashboard?.averageRating).toFixed(1) || 0}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Month-Wise Revenue Table */}
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Month-Wise Revenue</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border">
                  <TableHead className="text-muted-foreground px-6 py-4">
                    Month
                  </TableHead>
                  <TableHead className="text-muted-foreground text-right px-6 py-4">
                    Revenue
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboard?.monthWiseRevenue?.data?.map((row, index) => (
                  <TableRow
                    key={index}
                    className={`border-b border-border last:border-b-0 ${
                      index % 2 === 0 ? "bg-muted/30" : "bg-background"
                    }`}
                  >
                    <TableCell className="text-foreground font-medium px-6 py-4">
                      {row.month}
                    </TableCell>
                    <TableCell className="text-foreground text-right font-medium px-6 py-4">
                      {priceFormat(row.instructorRevenue || 0, 2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <PaginationFooter
              page={page}
              setPage={setPage}
              totalPages={totalPages}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorDashboard;
