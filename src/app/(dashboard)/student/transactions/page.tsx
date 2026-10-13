/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/core/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { Receipt, Download, Calendar, Filter, CreditCard } from "lucide-react";
import { Request } from "@/core/utils/apiTools";
import APICONSTANT from "@/core/utils/ApiConstant";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import Loading from "@/core/components/ui/Loading";
import { getCookie, priceFormat } from "@/core/utils/helperFunction";
import PaginationFooter from "@/core/components/PaginationFooter";
import { APIURLS } from "@/core/utils/config";
import axios from "axios";
import { Badge } from "@/core/components/ui/badge";

interface Transaction {
  date: string;
  item: string;
  pricingOption: string;
  amount: number;
  paymentStatus: "Pending" | "Paid" | "Failed" | "Cancelled" | "Declined";
  paymentMethod: string;
  instructorName: string;
  receiptUrl: string;
}

const Transactions = () => {
  const [dateFilter, setDateFilter] = useState("All Time");
  // const [typeFilter, setTypeFilter] = useState("all");
  const [apiData, setApiData] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;
  const totalPages = Math.ceil(total / limit);
  const token = getCookie("appToken");

  const apiCall = async (data: any) => {
    return await Request(`${APICONSTANT.transaction}`, "GET", data);
  };

  const { trigger, isPending } = useCustomMutation(
    apiCall,
    {
      onSuccessCallback: (data: any) => {
        // console.log(data?.data, "onSuccessCallback");
        if (data?.status && data?.data) {
          setApiData(data?.data);
          setTotal(data?.total || 0);
        }
      },
    },
    false,
  );

  useEffect(() => {
    trigger({ limit: limit, page: page, dateRange: dateFilter });
  }, [page, dateFilter]);

  const handleExport = async (endpoint: string, title: string) => {
    try {
      const url = `${APIURLS.baseUrl}${endpoint}`;

      // Request PDF as binary
      const response = await axios({
        url,
        method: "GET",
        responseType: "blob", // VERY IMPORTANT
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/pdf",
        },
      });

      // Extract filename from headers
      let fileName = (title || "export") + ".pdf";
      const cd = response.headers["content-disposition"];

      if (cd) {
        const match = cd.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          fileName = match[1];
        }
      }

      // Create PDF Blob (with correct type)
      const blob = new Blob([response.data], { type: "application/pdf" });

      // Create download link
      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlBlob;
      a.download = fileName;
      a.style.display = "none";
      document.body.appendChild(a);

      a.click();

      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(urlBlob);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  const apiCallDownlod = async (data: any) => {
    return handleExport(data.url, data?.obj?.item);
    // return { res: await Request(`${data?.url}`, "GET"), obj: data?.obj };
  };

  const { trigger: downloadTrigger, isPending: downloadIsPending } =
    useCustomMutation(apiCallDownlod, {}, false);

  // const download = (response: any) => {
  //   try {
  //     // Download
  //     const blob = new Blob([response?.res]);
  //     const downloadUrl = window.URL.createObjectURL(blob);
  //     const fileName = response?.obj?.item
  //       ? response?.obj?.item + ".pdf"
  //       : "Transaction_Export.pdf";
  //     const a = document.createElement("a");
  //     a.href = downloadUrl;
  //     a.download = fileName;
  //     a.click();
  //     URL.revokeObjectURL(downloadUrl);
  //   } catch (error) {
  //     console.error("Export error:", error);
  //   }
  // };

  const statusColors: Record<string, any> = {
    Pending: "secondary",
    Paid: "outline",
    Failed: "destructive",
    Cancelled: "destructive",
    Declined: "destructive",
  };

  const filteredTransactions = apiData;

  const handleDownloadReceipt = (transaction: Transaction) => {
    downloadTrigger({
      url: "users" + transaction?.receiptUrl,
      obj: transaction,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
        <p className="text-muted-foreground mt-2">
          View your purchase history and download receipts
        </p>
      </div>

      {isPending && filteredTransactions.length == 0 ? (
        <Loading hFull />
      ) : (
        <>
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <Select
                    value={dateFilter}
                    onValueChange={(val) => {
                      setDateFilter(val);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Time">All Time</SelectItem>
                      <SelectItem value="This Month">This Month</SelectItem>
                      <SelectItem value="Last Month">Last Month</SelectItem>
                      <SelectItem value="Last 3 Months">
                        Last 3 Months
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* <div className="space-y-2">
                  <label className="text-sm font-medium">Item Type</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="course">Courses</SelectItem>
                      <SelectItem value="subscription">
                        Subscriptions
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead className="text-right">Receipt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map(
                        (transaction: Transaction, ind: number) => (
                          <TableRow key={ind}>
                            <TableCell>
                              <Badge
                                color={
                                  statusColors[transaction.paymentStatus] ||
                                  "default"
                                }
                                className="py-2"
                              >
                                {transaction.paymentStatus || "---"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {transaction.date
                                  ? new Date(
                                      transaction.date,
                                    ).toLocaleDateString()
                                  : "--"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[300px]">
                                <div className="font-medium">
                                  {transaction.item || "--"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {transaction.pricingOption
                                    ? transaction.pricingOption
                                    : "--"}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {transaction.instructorName || "--"}
                            </TableCell>
                            <TableCell className="font-medium">
                              {priceFormat(Number(transaction.amount || 0), 2)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                {transaction.paymentMethod || "--"}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {transaction.paymentStatus == "Paid" ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={downloadIsPending}
                                  onClick={() => {
                                    if (transaction?.receiptUrl)
                                      handleDownloadReceipt(transaction);
                                  }}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download PDF
                                </Button>
                              ) : (
                                "---"
                              )}
                            </TableCell>
                          </TableRow>
                        ),
                      )}
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
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No transactions found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or make your first purchase.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Transactions;
