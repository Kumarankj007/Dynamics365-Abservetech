"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { APICONSTANT } from "@/services/config";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { StarRating } from "@/components/ui/StarRating";

interface ReviewModalProps {
  mode: "add" | "edit" | "view" | "resetPassword";
  review?: {
    id: string;
    reviewTitle: string;
    review: string;
    rating: number;
    status?: "Published" | "Unpublished";
  };
  onClose: () => void;
  refetch: () => void;
}

const baseSchema = z.object({
  reviewTitle: z.string().optional(),
  review: z.string().optional(),
  rating: z.number().min(1, "Rating is required"),
  status: z.string().min(1, "Status is required"),
});

type ReviewFormValues = z.infer<typeof baseSchema>;

const ReviewModal: React.FC<ReviewModalProps> = ({
  mode,
  review,
  onClose,
  refetch,
}) => {
  const [isPending, startTransition] = React.useTransition();
  const queryClient = useQueryClient();
  //   const mutation = useApiMutation(mode === "add" ? "post" : "put", "");
  const mutation = useApiMutation(
    mode === "add" ? "post" : mode === "resetPassword" ? "patch" : "put",
    ""
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
    setValue,
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      reviewTitle: review?.reviewTitle || "",
      review: review?.review || "",
      rating: review?.rating || 0,
      status: review?.status ?? "Unpublished",
    },
  });

  const sendInvitation = watch("status");

  const onSubmit = async (data: ReviewFormValues) => {
    let payload: any = {};
    console.log(data, "data")
    let url =
      mode === "resetPassword"
        ? `${APICONSTANT.RESET_PASSWORD_STUDENTS}/${review?.id}`
        : mode === "add"
        ? APICONSTANT.CREATE_INSTRUCTORS
        : `${APICONSTANT.UPDATE_COURSE_REVIEW}/${review?.id}`;

    if (mode === "resetPassword") {
    } else {
      payload = {
        title: `${data.reviewTitle}`,
        review:  data.review,
        rating: data.rating,
        status: data.status,
      };
    }

    startTransition(async () => {
      try {
        const response = await mutation.mutateAsync({
          url: { apiUrl: url },
          body: payload,
        });
        if (!response?.error) {
          await queryClient.invalidateQueries({
            queryKey: ["GET_COURSE_REVIEW"],
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
          {mode === "add" && "Add Review"}
          {mode === "edit" && "Edit Review"}
          {mode === "view" && "Review Details"}
          {mode === "resetPassword" && "Reset Password"}
        </DialogTitle>
        <DialogDescription>
          {mode === "add" && "Fill in details to create a new review."}
          {mode === "edit" && "Update review details below."}
          {mode === "view" && "View review details."}
          {mode === "resetPassword" &&
            "Set a new password for this review."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {mode === "view" && (
          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <p className="text-default-900">
                {review?.reviewTitle} {review?.review}
              </p>
            </div>
            <div>
              <Label>Email</Label>
              <p className="text-default-900 lowercase">
                {review?.rating}
              </p>
            </div>
            <div>
              <Label>Send Invitation Email</Label>
              <p>{review?.status ? "Yes" : "No"}</p>
            </div>

            <DialogFooter>
              <Button onClick={onClose}>Close</Button>
            </DialogFooter>
          </div>
        )}
        {(mode === "add" || mode === "edit") && (
          <>
            <div>
              <Label>Review Title</Label>
              <Input {...register("reviewTitle")} />
              {errors.reviewTitle && (
                <p className="text-red-500 text-xs">
                  {errors.reviewTitle.message}
                </p>
              )}
            </div>

            <div>
              <Label>Review</Label>
              <Input {...register("review")} />
              {errors.review && (
                <p className="text-red-500 text-xs">{errors.review.message}</p>
              )}
            </div>

            <div>
              <Label>Rating</Label>
              <Controller
                name="rating"
                control={control}
                rules={{ required: "Rating is required" }}
                render={({ field }) => (
                  <StarRating
                    value={field.value}
                    onChange={field.onChange}
                    showValue
                  />
                )}
              />
              {errors.rating && (
                <p className="text-red-500 text-xs">{errors.rating.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label>Publish</Label>
              <Toggle
                pressed={sendInvitation == "Published"}
                onPressedChange={(val) =>
                  setValue("status", val ? "Published" : "Unpublished")
                }
                variant="outline"
                size="sm"
                className="w-10 h-6 rounded-full bg-gray-300 data-[state=on]:bg-green-500 relative 
                                    before:absolute before:top-0.5 before:left-0.5 before:w-5 before:h-5 
                                    before:rounded-full before:bg-white before:shadow-md before:transition-transform 
                                    data-[state=on]:before:translate-x-full"
              />
            </div>
          </>
        )}

        {mode !== "view" && (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "add"
                ? "Create"
                : mode === "edit"
                ? "Update"
                : mode === "resetPassword"
                ? "Reset Password"
                : ""}
            </Button>
          </DialogFooter>
        )}
      </form>
    </DialogContent>
  );
};

export default ReviewModal;
