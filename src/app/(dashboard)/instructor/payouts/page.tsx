/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { DollarSign, Plus, Clock, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/core/components/ui/dialog";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Textarea } from "@/core/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table";
import { Request } from "@/core/utils/apiTools";
import APICONSTANT from "@/core/utils/ApiConstant";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import { useAuthStore } from "@/core/store/authStore";
import { priceFormat } from "@/core/utils/helperFunction";
import { useForm } from "react-hook-form";
import Loading from "@/core/components/ui/Loading";
import useSnackbarStore from "@/core/store/toaster";
interface Payout {
  id: string;
  userId?: string;
  requestId?: string;
  amount: number | string;
  requestedAt: string; // or Date if you parse it
  status: "PAID" | "PROCESSING" | "REQUESTED";
  description: string;
  paidAt?: string | null;
  availableToPay?: string | null;
}

const Payouts = () => {
  const [open, setOpen] = useState<boolean>(false);
  const { userData, getProfile } = useAuthStore();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const [payoutList, setPayoutList] = useState<Payout[]>([]);
  // const [page, setPage] = useState(1);
  // const [total, setTotal] = useState(0);
  // const limit = 10;
  // const totalPages = Math.ceil(total / limit);

  const { handleSubmit, register, setValue } = useForm();
  register("amount", {
    required: "Please select a amount",
    // validate: (value) =>
    //   Number(value) < (userData?.walletBalance || 0) ||
    //   "Amount must be less than " + priceFormat(userData?.walletBalance || 0),
  });
  register("notes");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 border-yellow-200"
          >
            <Clock className="w-3 h-3 mr-1" />
            Requested
          </Badge>
        );
      case "PROCESSING":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 border-blue-200"
          >
            <Clock className="w-3 h-3 mr-1" />
            Processing
          </Badge>
        );
      case "PAID":
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 border-green-200"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // initial api
  const apiCall = async (data: any) => {
    return await Request(APICONSTANT.payoutList, "GET", data);
  };

  const { trigger, isPending } = useCustomMutation(
    apiCall,
    {
      onSuccessCallback(data) {
        // console.log(data, "data");
        if (data?.success && data?.data) {
          setPayoutList(data?.data);
        }
      },
    },
    false
  );
  
  useEffect(() => {
    trigger({ limit: 100, page: 1 });
  }, []);
  
  // when request api
  const apiCallRequest = async (data: any) => {
    return await Request(APICONSTANT.payoutRequest, "POST", data);
  };

  const { trigger: requestTrigger, isPending: requestIsPending } =
    useCustomMutation(
      apiCallRequest,
      {
        onSuccessCallback(data) {
          // console.log(data, "data");
          if (data?.success && data?.data) {
            setPayoutList([data?.data, ...payoutList,]);
            setOpen(false)
            getProfile({})
          }
        },
      }
    );

  const onSubmit = (e: any) => {
    const payload = {
      amount: Number(e?.amount),
      description: e?.notes || "",
    };
    // console.log(payload, "payload");
    requestTrigger(payload);
  };

  const onError = (errors: any) => {
    // show the first error message via toast
    const firstError: any = Object.values(errors)[0];
    if (firstError && typeof firstError?.message === "string") {
      showSnackbar(firstError?.message, "error");
    } else {
      showSnackbar("Please fill all required fields correctly.", "error");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payouts</h1>
          <p className="text-muted-foreground">
            Manage your earnings and payout requests
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="default">
              <Plus className="w-4 h-4 mr-2" />
              Request Payout
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Request Payout
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Request a payout from your available balance.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit, onError)}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount" className="text-foreground">
                    Amount (USD)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="any"
                    placeholder="0.00"
                    onChange={(e) => setValue("amount", e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-muted-foreground text-xs mt-1">
                    Maximum available: {priceFormat(Number(50), 2)}
                  </p>
                </div>
                <div>
                  <Label htmlFor="notes" className="text-foreground">
                    Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information..."
                    onChange={(e) => setValue("notes", e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    variant="default"
                    disabled={requestIsPending}
                    type="submit"
                  >
                    Request Payout
                  </Button>
                </DialogFooter>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Available Balance */}
      <Card className="bg-card border border-border shadow-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-lg">Available Balance</p>
              <p className="text-4xl font-bold text-foreground mt-2">
                {priceFormat(userData?.walletBalance || 0)}
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Payment requests can be raised once you have at least $50 in
                available balance.
              </p>
            </div>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payout Requests */}
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">
            Payout Request History
          </CardTitle>
        </CardHeader>
        {isPending ? (
          <>
            <Loading />
          </>
        ) : (
          <CardContent className="p-0">
            <div className="overflow-hidden">
              {payoutList?.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    No payout requests yet
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border">
                      <TableHead className="text-muted-foreground px-6 py-4">
                        Request ID
                      </TableHead>
                      <TableHead className="text-muted-foreground px-6 py-4">
                        Date
                      </TableHead>
                      <TableHead className="text-muted-foreground px-6 py-4">
                        Amount
                      </TableHead>
                      <TableHead className="text-muted-foreground px-6 py-4">
                        Status
                      </TableHead>
                      <TableHead className="text-muted-foreground px-6 py-4">
                        Notes
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payoutList?.map((request, index) => (
                      <TableRow
                        key={request.id}
                        className={`border-b border-border last:border-b-0 ${
                          index % 2 === 0 ? "bg-muted/30" : "bg-background"
                        }`}
                      >
                        <TableCell className="text-foreground font-medium px-6 py-4">
                          {request?.requestId || request.id}
                        </TableCell>
                        <TableCell className="text-foreground px-6 py-4">
                          {new Date(request.requestedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-foreground font-medium px-6 py-4">
                          {priceFormat(Number(request.amount), 2)}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {getStatusBadge(request.status)}
                        </TableCell>
                        <TableCell className="text-muted-foreground px-6 py-4">
                          {request.description || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default Payouts;
