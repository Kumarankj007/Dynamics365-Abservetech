"use client";
import React, {
  startTransition,
  useCallback,
  useEffect,
  useState,
  useTransition,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useReactQuery from "@/hooks/useReactQuery";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { APICONSTANT } from "@/services/config";
import { queryClient } from "@/services/queryClient";
import DeleteConfirmModal from "@/components/DeleteModal/DeleteConfirmModal";
import { Toggle } from "@/components/ui/toggle";
import StatusConfirmModal from "@/components/StatusModal/StatusConfirmModal";

interface ManageCourse {
  id: string;
  title: string;
  status: string;
  draftData: any;
  editStatus: string;
  courseAvailability: boolean;
  createdAt: string;
}

interface ManageCourseApiResponse {
  error: boolean;
  data?: {
    data?: ManageCourse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

function ManageCourseList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [changesId, setChangesId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [statusStudents, setStatusStudents] = useState<ManageCourse | null>(
    null,
  );
  const pageFromUrl = Number(searchParams?.get("page") ?? "1") || 1;

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(pageFromUrl);
  const [filterValue, setFilterValue] = useState("");
  const limit = 5;

  const queryString = `?page=${page}&limit=${limit}`;

  const {
    data: previewManageCourses,
    isLoading,
    isError,
    refetch,
  } = useReactQuery<ManageCourseApiResponse>(
    "GET_ALL_MANAGE_COURSES",
    queryString,
  );

  const deletemutation = useApiMutation("delete");
  const putMutation = useApiMutation("put");
  const patchMutation = useApiMutation("patch");
  const manageCourse: ManageCourse[] = previewManageCourses?.data?.data || [];
  const totalCount = previewManageCourses?.data?.total || 0;
  const totalPages =
    previewManageCourses?.data?.totalPages || Math.ceil(totalCount / limit);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    router.replace(`?${params.toString()}`);
  }, [page, router]);

  const statusList = [
    { id: "Draft", label: "Draft" },
    { id: "In Review", label: "In Review" },
    { id: "Published", label: "Published" },
    { id: "Rejected", label: "Rejected" },
    { id: "Changes Requested", label: "Changes Requested" },
  ];

  const getBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "published":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "draft":
        return "bg-gray-800 text-white border-gray-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const statusColors: Record<string, any> = {
    Draft: "secondary",
    "In Review": "info",
    Published: "success",
    Rejected: "destructive",
    "Changes Requested": "warning",
  };

  if (isError)
    return <p className="p-4 text-red-500">Error loading courses.</p>;

  const filteredCourses = manageCourse.filter((course) =>
    course.title.toLowerCase().includes(filterValue.toLowerCase()),
  );

  const handleEditCourse = (courseId: string) => () => {
    router.push(`courses?id=${courseId}`);
  };
  const handleDelete = (id: string) => {
    setDeleteId(id); // open modal
  };

  const handleChanges = useCallback((id: string) => {
    setChangesId(id); // open modal
  }, []);

  const confirmDelete = async () => {
    try {
      if (deleteId) {
        const response = await deletemutation.mutateAsync({
          url: { apiUrl: `${APICONSTANT.DELETE_COURSE}/${deleteId}` },
        });

        if (response.status) {
          refetch();
        }

        if (!response?.error) {
          await queryClient.invalidateQueries({
            queryKey: ["GET_ALL_MANAGE_COURSES"],
          });
        }
        setDeleteId(null);
      }
    } catch (error) {
      console.error(error);
    }
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
      if (response.status) {
        refetch();
      }
      if (!response?.error) {
        await queryClient.invalidateQueries({
          queryKey: ["GET_ALL_MANAGE_COURSES"],
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full p-6 space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 text-xl font-semibold text-default-900">
          Manage Courses ({totalCount})
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <Input
            placeholder="Search courses..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="w-full sm:max-w-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="overflow-hidden relative">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative">
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <Skeleton className="h-5 w-40 rounded-md" />
                  <Skeleton className="h-4 w-32 rounded-md" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-16 rounded-md" />
                  <Skeleton className="h-8 w-16 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.8s_infinite]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => {
                const color = statusColors[course.status] || "default";
                return (
                  <Card
                    key={course.id}
                    className="hover:shadow-md border transition-all"
                  >
                    <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex flex-col gap-2">
                        <h3 className="flex items-center gap-3 font-semibold text-lg">
                          {course.title}
                          <Badge
                            rounded="md"
                            color={color}
                            className={`capitalize text-center`}
                          >
                            {course.status}
                          </Badge>
                        </h3>
                        <div className="flex items-center gap-2 text-sm">
                          <span>
                            Updated{" "}
                            {format(new Date(course.createdAt), "dd/MM/yyyy")}
                          </span>
                        </div>
                      </div>

                      {course.status == "Rejected" ? (
                        <div className="flex items-center gap-3">
                          <Button
                            variant="shadow"
                            size="sm"
                            onClick={() => handleDelete(course?.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-4">
                          <Toggle
                            pressed={course?.courseAvailability}
                            variant="outline"
                            size="sm"
                            onPressedChange={() => {
                              setStatusStudents(course);
                            }}
                            className="w-10 h-6 rounded-full bg-gray-300 data-[state=on]:bg-green-500 relative 
                        before:absolute before:top-0.5 before:left-0.5 before:w-5 before:h-5 
                        before:rounded-full before:bg-white before:shadow-md before:transition-transform 
                        data-[state=on]:before:translate-x-full"
                          />
                          {course?.editStatus == "Completed" && course?.draftData && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleChanges(course?.id)}
                            >
                              {isPending ? "Accepting..." : "Accept Changes"}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEditCourse(course?.id)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="shadow"
                            size="sm"
                            onClick={() => handleDelete(course?.id)}
                          >
                            Delete
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="p-2 ml-auto rounded cursor-pointer">
                              <MoreVertical className="w-5 h-5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {statusList.map((item) => (
                                <DropdownMenuItem
                                  key={item.id}
                                  disabled={item.label === course?.status}
                                  onClick={() =>
                                    item.label !== course?.status &&
                                    handleStatus({
                                      id: course?.id,
                                      label: item.label,
                                    })
                                  }
                                  className={`flex items-center justify-between cursor-pointer ${
                                    item.label === course?.status
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                >
                                  <span>{item.label}</span>
                                  {item.label === course?.status && (
                                    <span className="text-blue-500 text-xs">
                                      ●
                                    </span>
                                  )}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-6">
                No courses found.
              </p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 py-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

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
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Course"
        description="Are you sure you want to delete this Course? This action cannot be undone."
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
  );
}

export default ManageCourseList;

/* 
Add shimmer keyframes globally:
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
*/
