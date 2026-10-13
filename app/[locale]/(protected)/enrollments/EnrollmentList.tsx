"use client";
import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import useReactQuery from "@/hooks/useReactQuery";
import { DataTable } from "@/components/ui/tablereusable";
import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical, CheckCircle, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import DeleteConfirmModal from "@/components/DeleteModal/DeleteConfirmModal";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { APICONSTANT } from "@/services/config";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog } from "@/components/ui/dialog";
import StatusConfirmModal from "@/components/StatusModal/StatusConfirmModal";
import Image from "next/image";
import { Toggle } from "@/components/ui/toggle";
import { useRouter } from "@/components/navigation";
import { Eye } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";
import { priceFormat } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import EnrollementsModal from "./EnrollmentModal";

export interface EnrollmentResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: EnrollmentPagination;
}

export interface EnrollmentPagination {
  total: number;
  page: number;
  limit: number;
  data: Enrollment[];
}

export interface Enrollment {
  id: string;
  courseTitle: string;
  studentName: string;
  instructorName: string;
  studentEmail: string;
  instructorEmail: string;
  planType: "1_MONTH" | "6_MONTHS" | "3_MONTHS" | "12_MONTHS";
  basePrice: number;
  taxPercentage: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: "Stripe" | "Razorpay" | "Paypal";
  paymentStatus: "Paid" | "Pending" | "Failed";
  subscriptionStatus: "Active" | "Expired" | "Cancelled";
  nextBillingDate: string; // ISO date
  accessStartDate: string; // ISO date
  accessEndDate: string; // ISO date
  isRenewal: boolean;
  progressPercentage: number;
  enrolledOn: string; // ISO date
}

function EnrollmentList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const queryString = `?page=${page}&limit=${limit}`;
  const queryClient = useQueryClient();
  const [isPending, startTransition] = React.useTransition();
  const {
    data: PreviewEnrollment,
    isLoading,
    isError,
    refetch,
  } = useReactQuery<EnrollmentResponse>("GET_ENROLLMENTS", queryString);
  const enrollment: Enrollment[] = PreviewEnrollment?.data?.data || [];
  const totalCount = PreviewEnrollment?.data?.total || 0;
  const totalPages = Math.ceil(totalCount / limit);
  // console.log(PreviewEnrollment, "enrollment");
  const [filterValue, setFilterValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<
    "add" | "edit"
  >("add");
  const [selectedEnrollements, setSelectedEnrollements] =
    useState<Enrollment | null>(null);
  const [statusEnrollements, setStatusEnrollements] = useState<Enrollment | null>(
    null,
  );
  const [statusField, setStatusField] = useState<"subscriptionStatus" | null>(
    null,
  );
  const [pendingToggle, setPendingToggle] = useState(false);

  const patchMutation = useApiMutation("patch");

  const filteredData = Array.isArray(enrollment)
    ? enrollment.filter(
        (usr) =>
          usr?.courseTitle?.toLowerCase().includes(filterValue.toLowerCase()) ||
          usr?.studentName?.toLowerCase().includes(filterValue.toLowerCase()),
      )
    : [];

  const confirmToggleStatus = () => {
    if (!statusEnrollements || !statusField) return;

    startTransition(async () => {
      // const newStatus = !statusUser[statusField];
      try {
        const response = await patchMutation.mutateAsync({
          url: {
            apiUrl: `${APICONSTANT.STATUS_ENROLLMENTS}/${statusEnrollements.id}/subscription-status`,
          },
          body: {
            [statusField]: pendingToggle ? "Active" : "Inactive",
          },
        });

        if (!response?.error) {
          refetch();
          // await queryClient.invalidateQueries({
          //   queryKey: ["GET_COURSE_REVIEW"],
          // });
        }
        setStatusEnrollements(null);
        setStatusField(null);
      } catch (error) {
        console.error(error);
      }
    });
  };

  const statusColors: Record<string, any> = {
    Active: "success",
    Expired: "destructive",
    Cancelled: "destructive",
  };

  const handleAdd = () => {
    setModalMode("add");
    setSelectedEnrollements(null);
    setIsModalOpen(true);
  };

  const columns = useMemo<ColumnDef<Enrollment>[]>(
    () => [
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const title = row?.original?.subscriptionStatus;
          const color = statusColors[title] || "default";
          return (
            <Badge color={color} className="py-2">
              {title || "---"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "courseTitle",
        header: "Course Title",
        cell: ({ row }) => {
          const name = row?.original?.courseTitle;
          return (
            <div>
              {name || "---"}
              {/* <p>{row?.original?.userprofile == null && "(Admin Course)"}</p> */}
            </div>
          );
        },
      },
      {
        accessorKey: "studentName",
        header: "Student Name",
        cell: ({ row }) => {
          const name = row?.original?.studentName;
          return (
            <section className="py-3">
              <p>{name || "---"}</p>
            </section>
          );
        },
      },
      {
        accessorKey: "instructorName",
        header: "Instructor Name",
        cell: ({ row }) => {
          const instructorName = row?.original?.instructorName || "";
          return (
            <>
              <p>{instructorName || "---"}</p>
            </>
          );
        },
      },
      {
        accessorKey: "planType",
        header: "Plan Details",
        cell: ({ row }) => {
          const planType = row?.original?.planType;
          const totalAmount = priceFormat(
            Number(row?.original?.totalAmount || 0),
            2,
          );
          return (
            <div className="my-3 flex items-center gap-3">
              <Badge
                rounded="md"
                className={`capitalize border bg-green-100 text-green-700 border-green-200`}
              >
                {planType}
              </Badge>
              <p>{totalAmount || "---"}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "accessEndDate",
        header: "Ended on",
        cell: ({ getValue }) => {
          // console.log(formattedDate);
          const formattedDate = new Date(
            getValue() as string,
          ).toLocaleDateString();
          return getValue() && formattedDate !== "Invalid Date"
            ? formattedDate
            : "---";
        },
      },
      {
        accessorKey: "isActive",
        header: "Enrollment Status",
        cell: ({ row }) => {
          const students = row.original;
          const status = students.subscriptionStatus == "Active";

          return (
            <Toggle
              pressed={status}
              variant="outline"
              size="sm"
              onPressedChange={() => {
                setStatusEnrollements(students);
                setStatusField("subscriptionStatus");
                setPendingToggle(!status);
              }}
              className="w-10 h-6 rounded-full bg-gray-300 data-[state=on]:bg-green-500 relative 
      before:absolute before:top-0.5 before:left-0.5 before:w-5 before:h-5 
      before:rounded-full before:bg-white before:shadow-md before:transition-transform 
      data-[state=on]:before:translate-x-full"
            />
          );
        },
      },
    ],
    [],
  );
  if (isError)
    return <p className="p-4 text-red-500">Error loading instructors.</p>;
  return (
    <>
      <div className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 px-5 gap-3 sm:gap-4">
          {/* Title */}
          <div className="flex-1 text-xl font-medium text-default-900">
            Enrollments List
          </div>

          {/* Right side controls */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <Input
              placeholder="Filter by Title, Name"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="w-full sm:max-w-sm"
            />
            <Button
              variant="outline"
              className="gap-2 w-full sm:w-auto"
              onClick={handleAdd}
            >
              {/* Add Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add
            </Button>
          </div>
        </div>
        <div className="p-4">
          <DataTable
            columns={columns}
            data={filteredData}
            isLoading={isLoading}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
        <StatusConfirmModal
          open={!!statusEnrollements}
          onClose={() => {
            setStatusEnrollements(null);
            setStatusField(null);
          }}
          onConfirm={confirmToggleStatus}
          title={
            statusEnrollements &&
            statusField &&
            statusEnrollements[statusField] == "Active"
              ? "Set Inactive"
              : "Set Active"
          }
          description={
            statusEnrollements &&
            statusField &&
            statusEnrollements[statusField] == "Active"
              ? "Are you sure you want to set this as Inactive?"
              : "Are you sure you want to set this as Active?"
          }
        />
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          {isModalOpen && (
            <EnrollementsModal
              mode={modalMode}
              // enrollements={
              //   selectedEnrollements
              //     ? {
              //         id: selectedEnrollements.id,
              //       }
              //     : undefined
              // }
              onClose={() => setIsModalOpen(false)}
              refetch={refetch}
            />
          )}
        </Dialog>
      </div>
    </>
  );
}

export default EnrollmentList;
