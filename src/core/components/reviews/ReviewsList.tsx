import { useState } from "react";
import { ThumbsUp, Flag } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent } from "@/core/components/ui/card";
import { StarRating } from "./StarRating";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/core/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  title?: string;
  comment: string;
  date: string;
  helpfulVotes: number;
  isHelpfulByUser: boolean;
}

interface ReviewsListProps {
  reviews: Review[];
  onSort?: (sortBy: string) => void;
  onHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string, reason: string) => void;
}

export const ReviewsList = ({
  reviews,
  onSort,
  onHelpful,
  onReport
}: ReviewsListProps) => {
  const [selectedReportReview, setSelectedReportReview] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");

  const handleReport = (reviewId: string) => {
    if (onReport && reportReason) {
      onReport(reviewId, reportReason);
      setSelectedReportReview(null);
      setReportReason("");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">
          Reviews ({reviews.length})
        </h3>
        
        <Select onValueChange={onSort} defaultValue="helpful">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="helpful">Most Helpful</SelectItem>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="highest">Highest Rating</SelectItem>
            <SelectItem value="lowest">Lowest Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="max-w-sm mx-auto">
              <h4 className="text-lg font-medium text-foreground mb-2">
                No reviews yet
              </h4>
              <p className="text-muted-foreground">
                Be the first to share your experience with this course.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="py-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-foreground">
                        {review.reviewerName}
                      </span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(review.date)}
                      </span>
                    </div>
                    <StarRating value={review.rating} readonly size="sm" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  {review.title && (
                    <h4 className="font-medium text-foreground">
                      {review.title}
                    </h4>
                  )}
                  <p className="text-foreground leading-relaxed">
                    {review.comment}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onHelpful?.(review.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ThumbsUp 
                        className={`h-4 w-4 mr-1 ${
                          review.isHelpfulByUser ? "fill-current text-primary" : ""
                        }`} 
                      />
                      Helpful ({review.helpfulVotes})
                    </Button>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedReportReview(review.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Flag className="h-4 w-4 mr-1" />
                        Report
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Report Review</AlertDialogTitle>
                        <AlertDialogDescription>
                          Why are you reporting this review?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      
                      <div className="space-y-2">
                        <Select value={reportReason} onValueChange={setReportReason}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a reason" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="spam">Spam or fake review</SelectItem>
                            <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                            <SelectItem value="offensive">Offensive language</SelectItem>
                            <SelectItem value="irrelevant">Not relevant to course</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                          setSelectedReportReview(null);
                          setReportReason("");
                        }}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleReport(review.id)}
                          disabled={!reportReason}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Report
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Load More */}
          {reviews.length >= 10 && (
            <div className="text-center pt-4">
              <Button variant="outline">
                Load More Reviews
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};