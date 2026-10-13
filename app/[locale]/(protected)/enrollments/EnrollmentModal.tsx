"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { APICONSTANT } from "@/services/config";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/ui/passwordInput";
import CountryCode from "@/utils/CountryCode";
import PhoneLengthByCountry from "@/utils/PhoneLengthByCountry";
import useReactQuery from "@/hooks/useReactQuery";
import { Students } from "../students/StudentsList";
import { Course, User, UsersWithCoursesResponse } from "./interface";

interface EnrollementsModalProps {
  mode: "add" | "edit";
  enrollements?: {
    _id?: string;
    courseId: string;
    userId: string;
  };
  onClose: () => void;
  refetch: () => void;
}

const baseSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  userId: z.string().min(1, "Student is required"),
});

type EnrollementsFormValues = z.infer<typeof baseSchema>;

const EnrollementsModal: React.FC<EnrollementsModalProps> = ({
  mode,
  enrollements,
  onClose,
  refetch,
}) => {
  const [isPending, startTransition] = React.useTransition();
  const [search, setSearch] = useState("");
  const [searchCourse, setSearchCourse] = useState("");

  const { data: dropDown } = useReactQuery<UsersWithCoursesResponse>(
    "GET_DROPDOWN_STUDENT_LIST",
  );

  const usersList: User[] = dropDown?.data?.users || [];
  const coursesList: Course[] = dropDown?.data?.courses || [];

  const filteredUser = Array.isArray(usersList)
    ? usersList.filter(
        (usr) =>
          usr?.fullname?.toLowerCase().includes(search.toLowerCase()) ||
          usr?.email?.toLowerCase().includes(search.toLowerCase()),
      )
    : [];

  const filteredCourse = Array.isArray(coursesList)
    ? coursesList.filter((usr) =>
        usr?.title?.toLowerCase().includes(searchCourse.toLowerCase()),
      )
    : [];

  const queryClient = useQueryClient();

  const mutation = useApiMutation(mode === "add" ? "post" : "put", "");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<EnrollementsFormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      userId: enrollements?.userId || "",
      courseId: enrollements?.courseId || "",
    },
  });

  const onSubmit = async (data: EnrollementsFormValues) => {
    startTransition(async () => {
      try {
        const payload = {
          courseId: data?.courseId,
          userId: data?.userId,
        };

        const response = await mutation.mutateAsync({
          url: {
            apiUrl:
              mode === "add"
                ? APICONSTANT.CREATE_ENROLLMENT
                : `${APICONSTANT.UPDATE_ADMIN}`,
          },
          body: payload,
        });

        if (!response?.error) {
          await queryClient.invalidateQueries({
            queryKey: ["GET_ENROLLMENTS"],
          });
        }
        onClose();
        refetch();
      } catch (error) {
        console.error(error);
      }
    });
  };

  return (
    <DialogContent size="sm">
      <DialogHeader>
        <DialogTitle>
          {mode === "add" ? "Add Enrollements" : "Edit Enrollements"}
        </DialogTitle>
        <DialogDescription>
          {mode === "add"
            ? "Fill in details to create a new enrollements."
            : "Update enrollements details below."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>Student</Label>
          <div className="flex gap-2">
            <Select
              onOpenChange={() => setSearch("")}
              onValueChange={(value) => {
                const userId = value;
                setValue("userId", userId);
              }}
            >
              <SelectTrigger size="md" className="w-full">
                <SelectValue placeholder="select student" />
              </SelectTrigger>

              <SelectContent>
                <div className="p-2 sticky top-0 z-10">
                  <Input
                    type="text"
                    placeholder="Search..."
                    className="w-full border px-2 py-1 rounded"
                    value={search}
                    onKeyDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {filteredUser.length === 0 ? (
                  <p className="p-2 text-sm text-gray-400">No results</p>
                ) : (
                  filteredUser.map((c) => (
                    <SelectItem
                      key={c.id}
                      value={c.id}
                      className="w-full flex flex-wrap text-left text-wrap flex-1"
                    >
                      <span className="break-all mr-2 font-medium">
                        {c.fullname}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({c.email})
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {errors.userId && (
            <p className="text-red-500 text-xs mt-1">{errors.userId.message}</p>
          )}
        </div>
        <div>
          <Label>Course</Label>
          <div className="flex gap-2">
            <Select
              onOpenChange={() => setSearch("")}
              onValueChange={(value) => {
                const courseId = value;
                setValue("courseId", courseId);
              }}
            >
              <SelectTrigger size="md" className="w-full">
                <SelectValue placeholder="select course" />
              </SelectTrigger>

              <SelectContent>
                <div className="p-2 sticky top-0 z-10">
                  <Input
                    type="text"
                    placeholder="Search..."
                    className="w-full border px-2 py-1 rounded"
                    value={searchCourse}
                    onKeyDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setSearchCourse(e.target.value)}
                  />
                </div>

                {filteredCourse.length === 0 ? (
                  <p className="p-2 text-sm text-gray-400">No results</p>
                ) : (
                  filteredCourse.map((c) => {
                    const date = c.updatedAt
                      ? new Date(c.updatedAt).toLocaleDateString()
                      : "";
                    return (
                      <SelectItem
                        key={c.id}
                        value={c.id}
                        className="w-full flex flex-wrap"
                      >
                        <span className="wrap-break-word font-medium mr-2">{c.title}</span>
                        <span className="text-xs wrap-break-word  text-muted-foreground">
                          ({date})
                        </span>
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>

          {errors.userId && (
            <p className="text-red-500 text-xs mt-1">{errors.userId.message}</p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending
              ? mode === "add"
                ? "Creating..."
                : "Updating..."
              : mode === "add"
                ? "Create"
                : "Update"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default EnrollementsModal;
