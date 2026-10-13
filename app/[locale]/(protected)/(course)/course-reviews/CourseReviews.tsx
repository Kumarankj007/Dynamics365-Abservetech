"use client";
import React, { Dispatch, useEffect, useMemo, useState } from "react";
import useReactQuery from "@/hooks/useReactQuery";
import { DataTable } from "@/components/ui/tablereusable";
import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { APICONSTANT } from "@/services/config";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { SetStateAction } from "jotai";
import { CourseType } from "./ClientCourse";
import DeleteConfirmModal from "@/components/DeleteModal/DeleteConfirmModal";
import { Toggle } from "@/components/ui/toggle";
import StatusConfirmModal from "@/components/StatusModal/StatusConfirmModal";

interface PriceOption {
  price: string;
  option: string;
  description: string;
}

interface UserProfile {
  id: string;
  fullname: string;
  email: string;
  profile: string | null;
  professionalTitle: string | null;
  location: string | null;
  website: string | null;
  bio: string | null;
  yearsOfExperience: number | null;
  areasOfExpertise: string[] | null;
}

interface CourseReviews {
  id: string;
  title: string;
  email: string;
  status: string;
  editStatus: string;
  pricingOptions: PriceOption[];
  draftData: any;
  profileStatus: boolean;
  courseAvailability: boolean;
  isActive: boolean;
  createdAt: string;
  enrollmentsCount: string;
  creator: UserProfile;
}

interface StatusCounts {
  published: number;
  inReview: number;
  changesRequested: number;
  draft: number;
}

interface CourseApiResponse {
  error: boolean;
  data?: {
    data?: CourseReviews[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    statusCounts: StatusCounts;
  };
}

function CourseReviews({
  setCoursesOverview,
}: {
  setCoursesOverview: Dispatch<SetStateAction<CourseType[]>>;
}) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const queryString = `?page=${page}&limit=${limit}`;
  const router = useRouter();
  const [changesId, setChangesId] = useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [statusStudents, setStatusStudents] = useState<CourseReviews | null>(
    null,
  );
  const {
    data: previewReviews,
    isLoading,
    isError,
    refetch,
  } = useReactQuery<CourseApiResponse>("GET_COURSE_ALL", queryString);
  const reviews: CourseReviews[] = previewReviews?.data?.data || [];
  const statusCounts: StatusCounts = previewReviews?.data?.statusCounts || {
    published: 0,
    inReview: 0,
    changesRequested: 0,
    draft: 0,
  };
  const totalCount = previewReviews?.data?.total || 0;
  const totalPages =
    previewReviews?.data?.totalPages || Math.ceil(totalCount / limit);

  useEffect(() => {
    if (!setCoursesOverview) return;
    setCoursesOverview([
      { title: "Published", count: statusCounts?.published },
      { title: "In Review", count: statusCounts?.inReview },
      { title: "Changes Needed", count: statusCounts?.changesRequested },
      { title: "Drafts", count: statusCounts?.draft },
    ]);
  }, [reviews]);

  const [filterValue, setFilterValue] = useState("");
  const putMutation = useApiMutation("put");
  const patchMutation = useApiMutation("patch");
  const filteredData = Array.isArray(reviews)
    ? reviews.filter((revw) =>
        filterValue
          ? revw?.title?.toLowerCase().includes(filterValue.toLowerCase())
          : true,
      )
    : [];

  const statusList = [
    { id: "Draft", label: "Draft" },
    { id: "In Review", label: "In Review" },
    { id: "Published", label: "Published" },
    { id: "Rejected", label: "Rejected" },
    { id: "Changes Requested", label: "Changes Requested" },
  ];

  const handleStatus = async (status: any) => {
    try {
      const response = await putMutation.mutateAsync({
        url: {
          apiUrl: `${APICONSTANT.UPDATE_COURSE_STATUS}/${status?.id}`,
        },
        body: {
          status: status?.label,
        },
      });
      if (!response?.error) {
        refetch();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const statusColors: Record<string, any> = {
    Draft: "secondary",
    "In Review": "info",
    Published: "success",
    Rejected: "destructive",
    "Changes Requested": "warning",
  };

  const handleEditCourse = (courseId: string) => () => {
    router.push(`courses?id=${courseId}&page=${page}`);
  };

  const handleChanges = (id: string) => {
    setChangesId(id); // open modal
  };

  const confirmChanges = () => {
    startTransition(async () => {
      try {
        if (changesId) {
          const response = await patchMutation.mutateAsync({
            url: { apiUrl: `${APICONSTANT.APPROVE_CHANGES}/${changesId}` },
          });

          if (response.status) {
            refetch();
          }

          setChangesId(null);
        }
      } catch (error) {
        console.error(error);
      }
    });
  };

  const confirmToggleStatus = async () => {
    if (!statusStudents) return;
    try {
      const response = await patchMutation.mutateAsync({
        url: {
          apiUrl: `${APICONSTANT.UPDATE_COURSE_AVAILABILITY}/${statusStudents.id}`,
        },
      });

      if (!response?.error) {
        refetch();
      }
      setStatusStudents(null);
    } catch (error) {
      console.error(error);
    }
  };

  const columns = useMemo<ColumnDef<CourseReviews>[]>(
    () => [
      {
        accessorKey: "title",
        header: "title",
        cell: ({ row }) => {
          // console.log(row);

          const title = row?.original?.title;
          return <div className="w-[200px] py-2">{title || "---"}</div>;
        },
      },
      {
        accessorKey: "instructor",
        header: "instructor",
        cell: ({ row }) => {

          const fullname = row?.original?.creator?.fullname;
          return <div className="py-2">{fullname || "---"}</div>;
        },
      },
      // {
      //     accessorKey: "pricingOptions",
      //     header: "one month",
      //     cell: ({ row }) => {
      //         const priceOption = row?.original?.pricingOptions;
      //         const oneMonth = priceOption?.find(
      //             (item) => item.option == "ONE_MONTH"
      //         ) || { price: null };
      //         return <div className="lowercase">{oneMonth?.price || "---"}</div>;
      //     },
      // },
      // {
      //     accessorKey: "pricingOptions",
      //     header: "six months",
      //     cell: ({ row }) => {
      //         const priceOption = row?.original?.pricingOptions;
      //         const sixMonth = priceOption?.find(
      //             (item) => item.option == "SIX_MONTHS"
      //         ) || { price: null };
      //         return <div className="lowercase">{sixMonth?.price || "---"}</div>;
      //     },
      // },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original?.status || "---";
          const color = statusColors[status] || "default";

          return (
            <Badge color={color} rounded="md" className="capitalize text-center">
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "approveChanges",
        header: "Approve Changes",
        cell: ({ row }) => {
          const id = row?.original?.id;
          const editStatus = row.original?.editStatus == "Completed" && row?.original?.draftData

          if (!editStatus) {
            return <span className="text-gray-400 text-sm">No Changes</span>;
          }
          return (
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => handleChanges(id)}
            >
              {isPending ? "Accepting..." : "Accept Changes"}
            </Button>
          );
        },
      },
      {
        accessorKey: "courseAvailability",
        header: "Course Availability",
        cell: ({ row }) => {
          const students = row.original;
          const status = students.courseAvailability;
          return (
            <Toggle
              pressed={status}
              variant="outline"
              size="sm"
              onPressedChange={() => {
                setStatusStudents(students);
              }}
              className="w-10 h-6 rounded-full bg-gray-300 data-[state=on]:bg-green-500 relative 
before:absolute before:top-0.5 before:left-0.5 before:w-5 before:h-5 
before:rounded-full before:bg-white before:shadow-md before:transition-transform 
data-[state=on]:before:translate-x-full"
            />
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Posted On",
        cell: ({ getValue }) =>
          new Date(getValue() as string).toLocaleDateString(),
      },
      {
        accessorKey: "edit",
        header: "Edit",
        cell: ({ row }) => {
          const id = row?.original?.id;
          const status = row.original?.status;

          if (status === "Rejected") {
            return <span className="text-gray-400 text-sm">No Actions</span>;
          }
          return (
            <Button variant="outline" size="sm" onClick={handleEditCourse(id)}>
              Edit
            </Button>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const id = row.original?.id;
          const status = row.original?.status;

          if (status === "Rejected") {
            return <span className="text-gray-400 text-sm">No Actions</span>;
          }

          return (
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 rounded cursor-pointer">
                <MoreVertical className="w-5 h-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {statusList.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    disabled={item.label === status}
                    onClick={() =>
                      item.label !== status &&
                      handleStatus({ id, label: item.label })
                    }
                    className={`flex items-center justify-between cursor-pointer ${
                      item.label === status
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.label === status && (
                      <span className="text-blue-500 text-xs">●</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );
  if (isError)
    return <p className="p-4 text-red-500">Error loading reviews.</p>;
  return (
    <>
      <div className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 px-5 gap-3 sm:gap-4">
          <div className="flex-1 text-xl font-medium text-default-900">
            Courses ({totalCount})
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <Input
              placeholder="Filter by title"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="w-full sm:max-w-sm"
            />
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
          open={!!statusStudents}
          onClose={() => {
            setStatusStudents(null);
          }}
          onConfirm={confirmToggleStatus}
          title={
            statusStudents && !statusStudents?.courseAvailability
              ? "Set Enable"
              : "Set Disable"
          }
          description={
            statusStudents && !statusStudents?.courseAvailability
              ? "Are you sure you want to enable this course? It will be visible to students."
              : "Are you sure you want to disable this course? It will not be visible to students."
          }
        />
        <DeleteConfirmModal
          open={!!changesId}
          onClose={() => setChangesId(null)}
          onConfirm={confirmChanges}
          title="Accept Changes"
          confirmText="Accept"
          description="Are you sure you want to accept changes? This action cannot be undone."
        />
      </div>
    </>
  );
}

export default CourseReviews;
