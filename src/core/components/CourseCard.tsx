import React from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/core/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { Star, Clock } from "lucide-react";
import UseLoadingRouter from "../hooks/useLoadRoute";

export default function CourseCard({
  course,
  index,
}: {
  course: any;
  index: number;
}) {
  const router = UseLoadingRouter();
  const utcDate = new Date(course?.updatedAt);

  const localDateTime = utcDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <Card
      className="group cursor-pointer hover:shadow-card transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-0 animate-fade-in-scale"
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={() => router.push(`/courses/detail?id=${course?.id}`)}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start mb-3">
          {course?.totalReviews > 0 && (
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-foreground">
                {course?.averageRating || 0} ({course?.totalReviews || 0})
              </span>
            </div>
          )}
          {localDateTime && (
            <div className="flex  ml-auto items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {localDateTime}
            </div>
          )}
        </div>
        {course.title && course.title != "" && (
          <CardTitle className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
            {course.title}
          </CardTitle>
        )}
        <p className="text-sm text-muted-foreground font-medium">
          by {course?.user?.fullname || course?.user?.name || "Unknown"}
        </p>
      </CardHeader>

      <CardContent>
        {course.description && course.description != "" && (
          <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
            {course.description}
          </p>
        )}

        <div className="space-y-2">
          {(course.customTags?.length > 0 ||
            course?.suggestedTags?.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {[
                ...course.customTags,
                ...course.suggestedTags?.map((it: any) => it?.tag),
              ].map((tag: any) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs bg-primary/10 text-primary hover:bg-primary/20"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {/* <div className="flex flex-wrap gap-2">
                        {course.tags.slice(3).map((tag: any) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs bg-primary/10 text-primary hover:bg-primary/20"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div> */}
        </div>
      </CardContent>
    </Card>
  );
}
