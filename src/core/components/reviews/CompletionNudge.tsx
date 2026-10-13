import { useState, useEffect } from "react";
import { X, Star } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent } from "@/core/components/ui/card";

interface CompletionNudgeProps {
  courseProgress: number;
  onWriteReview: () => void;
  onDismiss: () => void;
  onRemindLater: () => void;
}

export const CompletionNudge = ({
  courseProgress,
  onWriteReview,
  onDismiss,
  onRemindLater
}: CompletionNudgeProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show nudge if course progress >= 80% and user hasn't dismissed it
    const hasBeenDismissed = localStorage.getItem('review-nudge-dismissed');
    const hasBeenReminded = localStorage.getItem('review-nudge-reminded');
    
    if (courseProgress >= 80 && !hasBeenDismissed) {
      // If user clicked "remind later", show again after 3 days
      if (hasBeenReminded) {
        const remindDate = new Date(hasBeenReminded);
        const now = new Date();
        const daysDiff = (now.getTime() - remindDate.getTime()) / (1000 * 3600 * 24);
        
        if (daysDiff >= 3) {
          setIsVisible(true);
          localStorage.removeItem('review-nudge-reminded');
        }
      } else {
        setIsVisible(true);
      }
    }
  }, [courseProgress]);

  const handleWriteReview = () => {
    setIsVisible(false);
    localStorage.setItem('review-nudge-dismissed', 'true');
    onWriteReview();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('review-nudge-dismissed', 'true');
    onDismiss();
  };

  const handleRemindLater = () => {
    setIsVisible(false);
    localStorage.setItem('review-nudge-reminded', new Date().toISOString());
    onRemindLater();
  };

  if (!isVisible) return null;

  return (
    <Card className="border-primary/20 bg-primary/5 mb-6">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 rounded-full p-2">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                Enjoying this course? Leave a review to help others.
              </p>
              <p className="text-sm text-muted-foreground">
                You&apos;re {courseProgress}% through - share your experience!
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleWriteReview}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Write a Review
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemindLater}
              className="text-muted-foreground hover:text-foreground"
            >
              Remind me later
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};