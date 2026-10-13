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
import ReviewModal from "./InstructorsModal";
import { StarRating } from "@/components/ui/StarRating";

// interface Review {
//     id: string;
//     fullname: string;
//     email: string;
//     profileStatus: boolean;
//     status: boolean;
//     createdAt: string;
//     enrollmentsCount: string;
//     courses: string;
//     totalRevenue: string;
//     pendingPayout: string;
// }
export interface ReviewReply {
  userId: string;
  response: string;
  userType: "Instructor" | "Admin" | "User";
  dateOfReview: string; // ISO date string
}

export interface Review {
  id: string;
  title: string;
  review: string;
  status: "Published" | "Unpublished";
  rating: number; // 1–5
  replies: ReviewReply[];
  createdat: string; // ISO date string
  courseid: string;
  coursetitle: string;
  userid: string;
  username: string;
  useremail: string;
  userprofile: string | null;
}

interface ReviewApiResponse {
  error: boolean;
  reviews?: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function ReviewList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const queryString = `?page=${page}&limit=${limit}`;
  const queryClient = useQueryClient();
  const [isPending, startTransition] = React.useTransition();
  const {
    data: previewReview,
    isLoading,
    isError,
    refetch,
  } = useReactQuery<ReviewApiResponse>("GET_COURSE_REVIEW", queryString);
  const instructors: Review[] = previewReview?.reviews || [];
  const totalCount = previewReview?.total || 0;
  const totalPages =
    previewReview?.totalPages || Math.ceil(totalCount / limit);
  // console.log(previewReview, "instructors");
  const [filterValue, setFilterValue] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<
    "add" | "edit" | "view" | "resetPassword"
  >("edit");
  const [selectedReview, setSelectedReview] =
    useState<Review | null>(null);
  const [statusReview, setStatusReview] =
    useState<Review | null>(null);
  const [statusField, setStatusField] = useState<"status" | null>(null);
  const [pendingToggle, setPendingToggle] = useState(false);

  const deletemutation = useApiMutation("delete");
  const putMutation = useApiMutation("put");

  const filteredData = Array.isArray(instructors)
    ? instructors.filter(
        (usr) =>
          usr?.coursetitle?.toLowerCase().includes(filterValue.toLowerCase()) ||
          usr?.username?.toLowerCase().includes(filterValue.toLowerCase()),
      )
    : [];

  const handleEdit = (instructor: Review) => {
    setModalMode("edit");
    setSelectedReview(instructor);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id); // open modal
  };

  const confirmDelete = () => {
    startTransition(async () => {
      try {
        if (deleteId) {
          const response = await deletemutation.mutateAsync({
            url: { apiUrl: `${APICONSTANT.UPDATE_COURSE_DELETE}/${deleteId}` },
          });

          if (!response?.error) {
            await queryClient.invalidateQueries({
              queryKey: ["GET_COURSE_REVIEW"],
            });
          }

          setDeleteId(null);
        }
      } catch (error) {
        console.error(error);
      }
    });
  };

  const confirmToggleStatus = () => {
    if (!statusReview || !statusField) return;

    startTransition(async () => {
      // const newStatus = !statusUser[statusField];
      try {
        const response = await putMutation.mutateAsync({
          url: {
            apiUrl: `${APICONSTANT.UPDATE_COURSE_REVIEW}/${statusReview.id}`,
          },
          body: {
            [statusField]: pendingToggle ? "Published" : "Unpublished",
          },
        });

        if (!response?.error) {
          await queryClient.invalidateQueries({
            queryKey: ["GET_COURSE_REVIEW"],
          });
        }
        setStatusReview(null);
        setStatusField(null);
      } catch (error) {
        console.error(error);
      }
    });
  };

  const columns = useMemo<ColumnDef<Review>[]>(
    () => [
      {
        accessorKey: "courseTitle",
        header: "Course Title",
        cell: ({ row }) => {
          const name = row?.original?.coursetitle;
          return (
            <div>
              {name || "---"}
              {/* <p>{row?.original?.userprofile == null && "(Admin Course)"}</p> */}
            </div>
          );
        },
      },
      {
        accessorKey: "title",
        header: "Reviews",
        cell: ({ row }) => {
          const name = row?.original?.title;
          const review = row?.original?.review;
          const rating = row?.original?.rating;
          return (
            <section className="py-3">
              <h4 className="font-semibold mb-2">{name || "---"}</h4>
              <StarRating value={rating} readonly size="sm" />
              <p className="mt-2">{review || "---"}</p>
            </section>
          );
        },
      },
      {
        accessorKey: "reply",
        header: "Replies",
        cell: ({ row }) => {
          const replies = row?.original?.replies[0]?.response || "";
          return (
            <>
              <p>{replies || "---"}</p>
            </>
          );
        },
      },
      {
        accessorKey: "student",
        header: "Student",
        cell: ({ row }) => {
          const name = row?.original?.username;
          const email = row?.original?.useremail;
          return (
            <>
              <h4>{name || "---"}</h4>
              {/* <p className="lowercase">{email || "---"}</p> */}
            </>
          );
        },
      },
      {
        accessorKey: "createdat",
        header: "Posted On",
        cell: ({ getValue }) => {
          // console.log(formattedDate);
          const formattedDate = new Date(
            getValue() as string,
          ).toLocaleDateString();
          return formattedDate !== "Invalid Date" ? formattedDate : "---";
        },
      },
      {
        accessorKey: "isActive",
        header: "Account Status",
        cell: ({ row }) => {
          const students = row.original;
          const status = students.status == "Published";

          return (
            <Toggle
              pressed={status}
              variant="outline"
              size="sm"
              onPressedChange={() => {
                setStatusReview(students);
                setStatusField("status");
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
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const query = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 rounded cursor-pointer">
                <MoreVertical className="w-5 h-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleEdit(query)}
                  className="cursor-pointer"
                >
                  <svg
                    className="fill-current"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                    />
                  </svg>
                  <p className="px-2">Edit</p>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleDelete(query.id)}
                  className="text-red-500 cursor-pointer"
                >
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
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m5 0V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                  <p className="px-2">Delete</p>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            Reviews List
          </div>

          {/* Right side controls */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <Input
              placeholder="Filter by title, name"
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
        <DeleteConfirmModal
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={confirmDelete}
          title="Delete Instructor"
          description="Are you sure you want to delete this Instructor? This action cannot be undone."
        />

        <StatusConfirmModal
          open={!!statusReview}
          onClose={() => {
            setStatusReview(null);
            setStatusField(null);
          }}
          onConfirm={confirmToggleStatus}
          title={
            statusReview &&
            statusField &&
            statusReview[statusField] == "Published"
              ? "Set Inactive"
              : "Set Active"
          }
          description={
            statusReview &&
            statusField &&
            statusReview[statusField] == "Published"
              ? "Are you sure you want to set this as Inactive?"
              : "Are you sure you want to set this as Active?"
          }
        />
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          {isModalOpen && (
            <ReviewModal
              mode={modalMode}
              review={
                selectedReview
                  ? {
                      id: selectedReview?.id,
                      reviewTitle: selectedReview?.title || "",
                      review: selectedReview?.review || "",
                      rating: selectedReview?.rating || 0,
                      status:
                        selectedReview?.status == "Published"
                          ? "Published"
                          : "Unpublished",
                    }
                  : undefined
              }
              onClose={() => setIsModalOpen(false)}
              refetch={refetch}
            />
          )}
        </Dialog>
      </div>
    </>
  );
}

export default ReviewList;
