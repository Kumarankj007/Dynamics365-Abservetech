"use client";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import useReactQuery from "@/hooks/useReactQuery";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/tablereusable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical } from "lucide-react";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { APICONSTANT } from "@/services/config";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { priceFormat } from "@/lib/utils";

interface PayoutItem {
  id: string;
  requestId: string;
  userId: string;
  amount: string;
  status: string;
  availableToPay: string | null;
  requestedAt: string;
  instructor: {fullname: string}
  paidAt: string | null;
  description: string;
}

interface PayoutApiResponse {
  status: boolean;
  statusCode: number;
  message: string;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: PayoutItem[];
}

// interface PayoutApiResponse {
//     error: boolean;
//     data?: {
//         data?: PayoutRequest[];
//         total: number;
//         page: number;
//         limit: number;
//         totalPages: number;
//     };
// }

const PayoutRequest = ({
  setPayoutOverview,
}: {
  setPayoutOverview?: Dispatch<SetStateAction<any>>;
}) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const queryString = `?page=${page}&limit=${limit}`;
  const [isPending, startTransition] = React.useTransition();
  const postMutation = useApiMutation("post");
  const queryClient = useQueryClient();
  const {
    data: previewPayouts,
    isLoading,
    isError,
  } = useReactQuery<PayoutApiResponse>("GET_PAYOUT_REQUESTS", queryString);
  const payouts: PayoutItem[] = Array.isArray(previewPayouts?.data)
    ? previewPayouts.data
    : [];

  useEffect(() => {
    if (!setPayoutOverview || payouts.length === 0) return;

    const totalAvailableToPay = payouts.reduce(
      (sum, item) => sum + Number(item.availableToPay),
      0
    );
    const processingCount = payouts.filter(
      (item) => item.status === "PROCESSING"
    ).length;

    setPayoutOverview((prev: any) => {
      const updated = [...prev];

      // compare old vs new — if same, do nothing to avoid infinite loop
      const same =
        updated[0].count === `${priceFormat(totalAvailableToPay, 2)}` &&
        updated[2].count === `${payouts.length}` &&
        updated[3].count === `${processingCount}`;

      if (same) return prev;

      updated[0] = {
        ...updated[0],
        count: `${priceFormat(totalAvailableToPay, 2)}`,
      };
      updated[2] = { ...updated[2], count: `${payouts.length}` };
      updated[3] = { ...updated[3], count: `${processingCount}` };

      return updated;
    });
  }, [payouts]);

  const totalCount = previewPayouts?.total || 0;
  const totalPages =
    previewPayouts?.totalPages || Math.ceil(totalCount / limit);

  const [filterValue, setFilterValue] = useState("");
  const filteredData = Array.isArray(payouts)
    ? payouts.filter((revw) =>
        filterValue
          ? revw?.requestId?.toLowerCase().includes(filterValue.toLowerCase())
          : true
      )
    : [];

  const actionList = [
    // { id: "Mark Processing", label: "Mark Processing" },
    // { id: "Reject", label: "Reject" },
    { id: "APPROVED", label: "Approve" },
    { id: "REJECTED", label: "Reject" },
    // { id: "Approve", label: "Approve" },
  ];

  const handleStatus = (status: any) => {
    startTransition(async () => {
      try {
        const response = await postMutation.mutateAsync({
          url: {
            apiUrl: `${APICONSTANT.UPDATE_PAYOUT_STATUS}`,
          },
          body: {
            payoutId: status?.id,
            status: status?.label,
          },
        });
        if (!response?.error) {
          await queryClient.invalidateQueries({
            queryKey: ["GET_PAYOUT_REQUESTS"],
          });
        }
      } catch (error) {
        console.error(error);
      }
    });
  };

  const columns = useMemo<ColumnDef<PayoutItem>[]>(
    () => [
      {
        accessorKey: "requestId",
        header: "Request ID",
        cell: ({ row }) => <div className="py-2">{row.original.requestId}</div>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge color="secondary" className="py-2">
            {row.original.status =="APPROVED" ? "PAID" : row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "userId",
        header: "Instructor",
        cell: ({ row }) => <div className="py-2">{row.original.instructor?.fullname}</div>,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <div className="py-2">
            {priceFormat(Number(row.original.amount || 0), 2)}
          </div>
        ),
      },
      {
        accessorKey: "requestedAt",
        header: "Requested On",
        cell: ({ row }) => (
          <div className="py-2">
            {new Date(row.original.requestedAt).toLocaleDateString()}
          </div>
        ),
      },
      {
        accessorKey: "description",
        header: "Notes",
        cell: ({ row }) => (
          <div className="py-2">{row.original.description || "---"}</div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const id = row.original.id;
          const status = row.original.status;
          if (status === "APPROVED" || status === "REJECTED") {
            return <span className="text-gray-400 text-sm">No Actions</span>;
          }
          return (
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 rounded cursor-pointer">
                <MoreVertical className="w-5 h-5" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                {actionList.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    disabled={item.label === status}
                    onClick={() =>
                      item?.id !== status &&
                      handleStatus({ id, label: item.id })
                    }
                  >
                    <span>
                      {item.label == "Approve" ? "Paid" : item?.label}
                    </span>
                    {item.label === status && (
                      <span className="text-blue-500 text-xs">●</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  if (isError)
    return <p className="p-4 text-red-500">Error loading payouts.</p>;
  return (
    <>
      <div className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 px-5 gap-3 sm:gap-4">
          <div className="flex-1 text-xl font-medium text-default-900">
            Payout Requests ({payouts?.length})
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <Input
              placeholder="Filter by request ID"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="w-full sm:max-w-sm"
            />
          </div>
        </div>
        <div className="p-4">
          <DataTable
            columns={columns}
            data={filteredData}
            isLoading={isLoading}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
    </>
  );
};

export default PayoutRequest;
