"use client";

import React, { useEffect, useMemo, useState } from "react";
import useReactQuery from "@/hooks/useReactQuery";
import { DataTable } from "@/components/ui/tablereusable";
import { ColumnDef } from "@tanstack/react-table";
import { priceFormat } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface TransactionItem {
  id: string;
  studentName: string;
  studentEmail: string;
  instructorName: string;
  courseTitle: string;
  createdAt: string;
  paymentSource: string;
  netAmount: string;
  nextRenewal: string;
  status: string;
}

export interface TransactionApiResponse {
  status: boolean;
  message: string;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totalNetAmount: number;
  paidCount: number;
  failedCount: number;
  data: TransactionItem[];
}

const TransactionTable = ({ filterQuery, setCounts }: any) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const queryString = `?page=${page}&limit=${limit}${filterQuery}`;
  const {
    data: previewTransaction,
    isLoading,
    isError,
  } = useReactQuery<TransactionApiResponse>("GET_TRANSACTIONS", queryString);
  const transaction: TransactionItem[] = Array.isArray(previewTransaction?.data)
    ? previewTransaction.data
    : [];

  const totalCount = previewTransaction?.total || transaction.length || 0;
  const totalPages = Math.ceil(totalCount / limit);
  const failedCount = previewTransaction?.failedCount || 0;
  const paidCount = previewTransaction?.paidCount || 0;
  const netAmount = previewTransaction?.totalNetAmount || 0;

  useEffect(() => {
    setCounts({
      paidCount: paidCount,
      netAmount: netAmount,
      failedCount: failedCount,
    });
  }, [paidCount, netAmount, failedCount]);

  const statusColors: Record<string, any> = {
    Pending: "secondary",
    Paid: "success",
    Failed: "destructive",
    Cancelled: "destructive",
    Declined: "warning",
  };

  const columns = useMemo<ColumnDef<TransactionItem>[]>(
    () => [
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const title = row?.original?.status;
          const color = statusColors[title] || "default";
          return (
            <Badge color={color} className="py-2">
              {title || "---"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "studentName",
        header: "Student Name",
        cell: ({ row }) => {
          const title = row?.original?.studentName;
          const email = row?.original?.studentEmail;
          return (
            <div className="w-[200px] py-2">
              <p>{title || "---"}</p>{" "}
              <p className="lowercase text-xs text-muted-foreground">
                {email || "---"}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "instructorName",
        header: "Instructor Name",
        cell: ({ row }) => {
          const title =
            row?.original?.instructorName == ""
              ? "Admin Course"
              : row?.original?.instructorName;
          return <div className="w-[200px] py-2">{title || "---"}</div>;
        },
      },
      {
        accessorKey: "courseTitle",
        header: "Course Title",
        cell: ({ row }) => {
          const title = row?.original?.courseTitle;
          return <div className="w-[200px] py-2">{title || "---"}</div>;
        },
      },
      {
        accessorKey: "createdAt",
        header: "Transaction Date",
        cell: ({ row }) => {
          const title = row?.original?.createdAt;
          const val = new Date(title).toLocaleDateString();
          return <div className="w-[200px] py-2">{val || "---"}</div>;
        },
      },
      {
        accessorKey: "paymentSource",
        header: "Payment Source",
        cell: ({ row }) => {
          const title = row?.original?.paymentSource;
          return <div className="w-[200px] py-2">{title || "---"}</div>;
        },
      },
      {
        accessorKey: "netAmount	",
        header: "Net Amount	",
        cell: ({ row }) => {
          const title = priceFormat(Number(row?.original?.netAmount || 0));
          return <div className="w-[200px] py-2">{title || "---"}</div>;
        },
      },
      {
        accessorKey: "nextRenewal	",
        header: "Next Renewal	",
        cell: ({ row }) => {
          const title = row?.original?.nextRenewal;
          const val =
            title ? new Date(title).toLocaleDateString() : "---";
          return <div className="w-[200px] py-2">{val || "---"}</div>;
        },
      },
    ],
    [],
  );
  if (isError)
    return (
      <p className="p-4 text-red-500">Error loading transaction history.</p>
    );

  return (
    <div>
      <DataTable
        columns={columns}
        data={transaction}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};

export default TransactionTable;
