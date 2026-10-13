/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Search, Edit, Star, Calendar } from "lucide-react";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import APICONSTANT from "@/core/utils/ApiConstant";
import { Request } from "@/core/utils/apiTools";
import Loading from "@/core/components/ui/Loading";
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
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/core/components/ui/avatar";
import PaginationFooter from "@/core/components/PaginationFooter";

export interface ReviewReply {
  userId: string;
  response: string;
  userType: "Instructor" | "Student" | string;
  dateOfReview: string; // ISO date string
}

export interface Review {
  id: string;
  title: string;
  review: string;
  rating: number;
  replies: ReviewReply[];
  createdat: string; // ISO date string
  courseid: string;
  coursetitle: string;
  userid: string;
  username: string;
  useremail: string;
  userprofile: string;
}

export interface ReviewResponse {
  reviews: Review[];
}
const Reviews = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [reply, setReply] = useState("");
  const [sortBy] = useState("updated");
  const [reviews, setReviews] = useState<Review[]>();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  const apiCallReply = async (data: any) => {
    const payload = { response: data?.response };
    return await Request(
      `${APICONSTANT.reviewReplyInstructor}/${data?.id}`,
      "POST",
      payload
    );
  };
  const { trigger: replyTrigger, isPending: replyIsPending } =
    useCustomMutation(
      apiCallReply,
      {
        onSuccessCallback(data) {
          if (data?.success) {
            if (page == 1) {
              trigger({ limit: limit, page: page });
            } else {
              setPage(1);
            }
            // console.log(data, "data?.data?.data");
          }
        },
      },
      false
    );

  const apiCall = async (data: any) => {
    return await Request(APICONSTANT.reviewInstructor, "GET", data);
  };
  const { trigger, isPending } = useCustomMutation(
    apiCall,
    {
      onSuccessCallback(data) {
        // console.log(data?.reviews, "data?.data?.data");
        if (data?.success && data?.reviews) {
          setReviews(data?.reviews);
          setTotal(data?.totalReviews || 0);
        }
      },
    },
    false
  );
  useEffect(() => {
    trigger({ limit: limit, page: page });
  }, [page]);

  const filteredReviews =
    reviews?.filter((review) => {
      const matchesSearch = review?.coursetitle
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesSearch;
    }) || [];

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      // case "enrollments":
      //   return b.enrollments - a.enrollments;
      case "rating":
        return b?.rating - a?.rating;
      case "updated":
      default:
        return (
          new Date(b?.createdat).getTime() - new Date(a.createdat).getTime()
        );
    }
  });

  const handleReply = (id: string) => {
    setReply("");
    const payload = { id: id, response: reply };
    replyTrigger(payload);
  };

  return (
    <div className="space-y-8 bg-background">
      {/* Header */}
      <div className="flex-1 flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-foreground mb-2">Reviews</h2>
      </div>

      {/* Filters */}
      <Card className="bg-card border border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* reviews List */}
      {isPending && sortedReviews.length === 0 ? (
        <Loading />
      ) : sortedReviews.length === 0 ? (
        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                There are no reviews yet.
              </h3>
              <p className="text-muted-foreground mb-6">
                Once students leave reviews, they will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-wrap gap-3">
          {sortedReviews?.length > 0 &&
            sortedReviews?.map((reviews) => (
              <Card
                key={reviews.id}
                className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6 ">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        {reviews.coursetitle && (
                          <h3 className="text-lg font-semibold text-foreground">
                            {reviews.coursetitle}
                          </h3>
                        )}
                        <div className=" flex items-center space-x-1">
                          {[...Array(reviews?.rating || 0)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                        {/* review reply modal */}
                        {reviews?.replies?.length == 0 && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-auto text-foreground hover:bg-muted"
                                onClick={() => {}}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Reply
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader className="gap-3">
                                <AlertDialogTitle>
                                  Reply Review
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {reviews.review && (
                                    <span className="block break-all text-sm text-slate-700">
                                      {reviews.review}
                                    </span>
                                  )}
                                </AlertDialogDescription>
                                <div className="relative flex-1">
                                  <Edit className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                  <Input
                                    placeholder="Reply reviews..."
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    className="pl-10 bg-background border-border"
                                  />
                                </div>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setReply("")}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleReply(reviews?.id)}
                                  disabled={replyIsPending || reply == ""}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Submit
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                      {reviews.title && (
                        <h4 className="text-sm font-semibold text-foreground">
                          {reviews.title}
                        </h4>
                      )}
                      <div className="flex items-center space-x-3 mb-3"></div>
                      <div className="space-x-3 mb-3">
                        {reviews.review && (
                          <p className="text-sm text-muted-foreground">
                            {reviews.review}
                          </p>
                        )}
                        {reviews?.replies &&
                          reviews?.replies?.map(
                            (itm: ReviewReply, ind: number) => (
                              <p
                                key={ind}
                                className="text-sm font-bold text-right text-card-foreground"
                              >
                                - {itm.response}
                              </p>
                            )
                          )}
                      </div>

                      <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={reviews?.userprofile}
                            alt={reviews?.userprofile}
                          />
                          <AvatarFallback className="uppercase">
                            {(reviews?.userprofile ?? "P")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm">{reviews.username}</p>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Updated{" "}
                            {new Date(reviews?.createdat).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          <PaginationFooter
            page={page}
            setPage={setPage}
            totalPages={totalPages}
          />
        </div>
      )}
    </div>
  );
};

export default Reviews;
