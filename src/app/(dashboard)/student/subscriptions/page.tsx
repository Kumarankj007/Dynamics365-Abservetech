/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/core/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table";
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
import { CreditCard, Calendar, X, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import { Request } from "@/core/utils/apiTools";
import APICONSTANT from "@/core/utils/ApiConstant";
import Loading from "@/core/components/ui/Loading";
import { subscriptionOption } from "@/core/utils/constants";
import PaginationFooter from "@/core/components/PaginationFooter";
import UseLoadingRouter from "@/core/hooks/useLoadRoute";

const Subscriptions = () => {
  const [courseData, setCourseData] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 9;
  const totalPages = Math.ceil(total / limit);

  const apiCall = async (data: any) => {
    return await Request(`${APICONSTANT.studentCourse}`, "GET", data);
  };

  const { trigger, isPending } = useCustomMutation(
    apiCall,
    {
      onSuccessCallback: (data: any) => {
        // console.log(data?.data, "onSuccessCallback");
        if (data?.status && data?.data) {
          setCourseData(data?.data);
          setTotal(data?.total || 0);
        }
      },
    },
    false
  );

  useEffect(() => {
    trigger({ limit, page });
  }, [page]);

  // const activeSubscriptions = subscriptions.filter(sub => sub.status === "active");
  // const inactiveSubscriptions = subscriptions.filter(sub => sub.status === "inactive");

  const getStatusBadge = (status: string) => {
    return status === "Active" ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        Active
      </Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Subscriptions</h1>
        <p className="text-muted-foreground mt-2">
          Manage your course subscriptions
        </p>
      </div>
      {/* Subscriptions Table */}
      {isPending && courseData?.length == 0 ? (
        <Loading />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              All Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {courseData?.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead className="text-center">Plan</TableHead>
                      <TableHead className="text-center">Payment Method</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">
                        Next Billing / Ended
                      </TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courseData?.map((subscription: any) => (
                      <TableRow key={subscription?.enrollmentId}>
                        {subscription?.title && (
                          <TableCell className="font-medium">
                            {subscription?.title}
                          </TableCell>
                        )}
                        {subscription.planType && (
                          <TableCell className="text-center">
                            {subscriptionOption?.find(
                              (itm) => itm.id == subscription?.planType
                            )?.name || subscription?.planType}
                          </TableCell>
                        )}
                        {subscription.paymentMethod && (
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                {subscription.paymentMethod || "--"}
                              </div>
                            </TableCell>
                        )}
                        {subscription.subscriptionStatus && (
                          <TableCell className="text-center">
                            {getStatusBadge(subscription.subscriptionStatus)}
                          </TableCell>
                        )}
                        <TableCell className="flex items-center justify-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {subscription?.planType === "LIFETIME"
                            ? "--"
                            : subscription?.isCancelScheduled
                            ? `Ended on ${new Date(
                                subscription.accessEndDate!
                              ).toLocaleDateString()}`
                            : subscription?.subscriptionStatus === "PastDue"
                            ? "Payment failed – update card"
                            : new Date(
                                subscription?.accessEndDate
                              ).toLocaleDateString()}
                          {/* {subscription?.subscriptionStatus === "Active"
                            ? subscription.planType === "LIFETIME"
                              ? "--"
                              : new Date(
                                  subscription?.accessEndDate
                                ).toLocaleDateString()
                            : `Ended on ${new Date(
                                subscription.accessEndDate!
                              ).toLocaleDateString()}`} */}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Actions
                              subscription={subscription}
                              refetch={() => trigger({ page, limit })}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <PaginationFooter
                  page={page}
                  setPage={setPage}
                  totalPages={totalPages}
                />
              </>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No subscriptions yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  You don&apos;t have any subscriptions yet.
                </p>
                <Button asChild>
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const Actions = ({
  subscription,
  refetch = () => {},
}: {
  subscription: any;
  refetch?: () => void;
}) => {
  const router = UseLoadingRouter();
  const apiCallCancel = async (data: any) => {
    return await Request(`${APICONSTANT.cancelSubscription}/${data}`, "DELETE");
  };

  const { trigger: cancelTrigger, isPending: cancelIsPending } =
    useCustomMutation(apiCallCancel, {
      onSuccessCallback: (data: any) => {
        // console.log(data, "onSuccessCallback");
        if (data?.status) {
          refetch();
        }
      },
    });

  if (subscription?.planType == "LIFETIME") return "---";
  return subscription.subscriptionStatus == "Active" ? (
    <>
      {!subscription?.isCancelScheduled ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={cancelIsPending} variant="destructive" size="sm">
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            {/* <Button variant="outline" disabled={cancelIsPending}>
            Delete Review
          </Button> */}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to Cancel your Subscription?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => cancelTrigger(subscription?.enrollmentId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Yes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Button size="sm" disabled>
          {"Cancellled"}
        </Button>
      )}
    </>
  ) : (
    <Button
      size="sm"
      onClick={() =>
        subscription?.courseId &&
        router.push("/courses/detail?id=" + subscription?.courseId)
      }
    >
      <RefreshCw className="h-4 w-4 mr-1" />
      {subscription?.subscriptionStatus == "PastDue"
        ? "Payment failed – update card"
        : "Renew"}
    </Button>
  );
};

export default Subscriptions;
