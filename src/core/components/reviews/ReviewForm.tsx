/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "@/core/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Textarea } from "@/core/components/ui/textarea";
import { Label } from "@/core/components/ui/label";
import { StarRating } from "./StarRating";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/core/components/ui/alert-dialog";
import Loading from "../ui/Loading";
import { Request } from "@/core/utils/apiTools";
import APICONSTANT from "@/core/utils/ApiConstant";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
// import { useToast } from "@/core/hooks/use-toast";

interface CourseReview {
  courseId: string;
  userId: string;
  enrollmentId: string;
  title: string;
  review: string;
  rating: number;
  isReviewed: boolean;
  replies: any[]; // If you want, I can type this too
  id: string;
}

interface ReviewFormProps {
  courseId?: string;
  existingReview?: CourseReview | null;
  setExistingReview?: Dispatch<SetStateAction<CourseReview | null>>;
  isPendingReview?: boolean;
}

const defaults = {
  courseId: "",
  id: "",
  userId: "",
  rating: 0,
  enrollmentId: "",
  isReviewed: false,
  replies: [],
  title: "",
  review: "",
};

export const ReviewForm = ({
  existingReview,
  courseId,
  setExistingReview = () => {},
  isPendingReview = false,
}: ReviewFormProps) => {
  // const { toast } = useToast();
  const minDesc = 0;
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || "");
  const [comment, setComment] = useState(existingReview?.review || "");

  const apiCallCreate = async (data: any) => {
    return await Request(`${APICONSTANT.createReview}`, "POST", data);
  };

  const { trigger: triggerReview, isPending: isPendingCreate } =
    useCustomMutation(apiCallCreate, {
      onSuccessCallback: (data: any) => {
        // console.log(data, "data");
        if (data?.status && data?.data) {
          setExistingReview(data?.data);
        }
      },
    });

  const apiCallDelete = async (id: string) => {
    return await Request(`${APICONSTANT.deleteReview}/${id}`, "DELETE");
  };

  const { trigger: triggerDelete, isPending: isPendingDelete } =
    useCustomMutation(apiCallDelete, {
      onSuccessCallback: (data: any) => {
        // console.log(data, "data");
        if (data?.status) {
          setExistingReview(defaults);
          setComment("");
          setRating(0);
          setTitle("");
        }
      },
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const query = new URLSearchParams(window.location.search);
    const queryId = query.get("id");
    if (queryId) {
      const payload = {
        courseId: courseId || existingReview?.courseId || "",
        enrollmentId: queryId || existingReview?.enrollmentId || "",
        title: title || "",
        review: comment || "",
        rating: rating || 0,
      };
      triggerReview(payload);
    }
  };

  const handleDelete = async () => {
    if (existingReview?.id) triggerDelete(existingReview?.id);
  };

  if (existingReview == null) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center">
            <p className="text-muted-foreground">Enroll to leave a review</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return isPendingReview ? (
    <Loading hFull />
  ) : (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {existingReview ? "Your Review" : "Write a Review"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Rating *</Label>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="review-title">Title (optional)</Label>
            <Input
              id="review-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your review a title"
              maxLength={100}
            />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="review-comment">
              Comment
              {minDesc >0 && (
              <span className="text-sm text-muted-foreground ml-1">
                (minimum {minDesc} characters)
              </span>
              )}
            </Label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this course..."
              rows={4}
              maxLength={1000}
              className="resize-none"
            />
            <div className="text-right text-sm text-muted-foreground">
              {comment.length}/1000 characters
              {comment.length < minDesc && (
                <span className="text-destructive ml-2">
                  ({minDesc - comment.length} more needed)
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <div>
              {existingReview?.id && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={isPendingCreate || isPendingDelete}
                    >
                      Delete Review
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Review</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete your review? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {existingReview?.id == "" && (
              <Button
                type="submit"
                disabled={
                  isPendingCreate ||
                  isPendingDelete ||
                  rating === 0 ||
                  comment.trim().length < minDesc
                }
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isPendingCreate
                  ? "Submitting..."
                  : existingReview
                  ? "Save Changes"
                  : "Submit Review"}
              </Button>
            )}
          </div>

          {/* Helper text */}
          <p className="text-xs text-muted-foreground">
            One review per course. You can edit or delete it anytime.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
