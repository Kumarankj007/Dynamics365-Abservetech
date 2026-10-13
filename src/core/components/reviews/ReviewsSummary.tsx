import { StarRating } from "./StarRating";
import { Card, CardContent } from "@/core/components/ui/card";
import { Progress } from "@/core/components/ui/progress";

interface ReviewsSummaryProps {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export const ReviewsSummary = ({
  averageRating,
  totalReviews,
  ratingDistribution
}: ReviewsSummaryProps) => {
  const getRatingPercentage = (count: number) => {
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0;
  };

  return (
    <Card>
      <CardContent className="py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="mb-2">
              <span className="text-4xl font-bold text-foreground">
                {averageRating.toFixed(1)}
              </span>
            </div>
            <StarRating value={averageRating} readonly size="lg" />
            <p className="text-sm text-muted-foreground mt-2">
              {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating as keyof typeof ratingDistribution];
              const percentage = getRatingPercentage(count);

              return (
                <div key={rating} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-12">
                    <span className="text-sm text-foreground">{rating}</span>
                    <span className="text-sm text-muted-foreground">★</span>
                  </div>
                  
                  <div className="flex-1">
                    <Progress value={percentage} className="h-2" />
                  </div>
                  
                  <div className="w-12 text-right">
                    <span className="text-sm text-muted-foreground">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};