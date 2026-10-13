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
import { priceFormat } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import EditAmountModal from "./EditAmountModal";

// interface PriceOption {
//     price: string;
//     option: string;
//     description: string;
// }
// interface PayoutRequest {
//     id: string;
//     title: string;
//     email: string;
//     status: string;
//     pricingOptions: PriceOption[];
//     profileStatus: boolean;
//     isActive: boolean;
//     createdAt: string;
//     enrollmentsCount: string;
// }
export interface TransactionResponse {
  data: Transaction[];
}

export interface Transaction {
  id: string;
  instructorId: string;
  courseId: string;
  buyerId: string;
  instructorAmount: string;
  soldOn: string;
  status: "PENDING" | "APPROVED" | "REJECTED";

  instructor: Instructor;
  course: Course;
  buyer: Buyer;
  commission: Commission;
}

export interface Instructor {
  id: string;
  fullname: string;
  email: string;
  password: string;
  profile: string | null;
  phoneCode: string | null;
  phoneNumber: string | null;
  role: string[];
  currentRole: string;
  stripeCustomerId: string | null;
  walletBalance: number;
  professionalTitle: string | null;
  location: string | null;
  website: string | null;
  bio: string | null;
  yearsOfExperience: number | null;
  areasOfExpertise: string[] | null;
  isActive: boolean;
  softDel: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  approximateDuration: string;
  categoryId: string;
  subCategoryId: string;
  suggestedTags: string[];
  customTags: string[];
  introVideoUrl: string;
  introDuration: number;

  pricingOptions: PricingOption[];
  learningOutcomes: string[];
  curriculum: Curriculum[];

  timeSpentId: string | null;
  creatorId: string;
  totalReviews: number;
  averageRating: number;
  status: string;
  softDel: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PricingOption {
  price: number;
  option: string;
  description: string;
  stripePriceId: string;
}

export interface Curriculum {
  order: number;
  title: string;
  lectures: Lecture[];
  description: string;
}

export interface Lecture {
  id: string;
  order: number;
  title: string;
  fileUrl: string;
  duration: number;
  contentType: string;
}

export interface Buyer {
  id: string;
  fullname: string;
  email: string;
  password: string;
  profile: string | null;
  phoneCode: string | null;
  phoneNumber: string | null;
  role: string[];
  currentRole: string;
  stripeCustomerId: string | null;
  walletBalance: number;
  professionalTitle: string | null;
  location: string | null;
  website: string | null;
  bio: string | null;
  yearsOfExperience: number | null;
  areasOfExpertise: string[] | null;
  isActive: boolean;
  softDel: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Commission {
  platformShare: number;
  instructorShare: number;
}

interface PayoutApiResponse {
  status: boolean;
  statusCode: number;
  message: string;
  total?: number;
  totalPages?: number;
  data?: Transaction[];
}

const AdminApproval = ({
  setPayoutOverview,
}: {
  setPayoutOverview?: Dispatch<SetStateAction<any>>;
}) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [edit, setEdit] = useState(false);
  const [selectedtObj, setSelectedObj] = useState({ id: "", amount: "0" });
  const queryString = `?page=${page}&limit=${limit}`;
  const [isPending, startTransition] = React.useTransition();
  const postMutation = useApiMutation("post");
  const queryClient = useQueryClient();
  const {
    data: previewPayouts,
    isLoading,
    isError,
    refetch,
  } = useReactQuery<PayoutApiResponse>("GET_APPROVAL_LIST", queryString);
  const payouts: Transaction[] = previewPayouts?.data || [];

  useEffect(() => {
    if (!setPayoutOverview) return;

    setPayoutOverview((prev: any) => {
      const updated = [...prev];
      const newCount = `${payouts.length}`;

      // prevent unnecessary state update (stops infinite loop)
      if (updated[1].count === newCount) return prev;

      updated[1] = { ...updated[1], count: newCount };
      return updated;
    });
  }, [payouts]);

  const totalCount = previewPayouts?.total || payouts.length || 0;
  const totalPages =
    previewPayouts?.totalPages || Math.ceil(totalCount / limit);

  const [filterValue, setFilterValue] = useState("");
  const filteredData = Array.isArray(payouts)
    ? payouts.filter((revw) =>
        filterValue
          ? revw?.instructor?.fullname
              ?.toLowerCase()
              .includes(filterValue.toLowerCase())
          : true
      )
    : [];

  const actionList = [
    { id: "EDIT", label: "Edit" },
    { id: "APPROVED", label: "Approve" },
    { id: "REJECTED", label: "Reject" },
  ];

    const statusColors: Record<string, any> = {
    PENDING: "secondary",
    APPROVED: "success",
    REJECTED: "destructive",
  };

  const handleStatus = (status: any) => {
    if (status?.label == "EDIT") {
      setEdit(true);
      setSelectedObj({ id: status?.id, amount: status?.amount });
    } else {
      startTransition(async () => {
        try {
          const response = await postMutation.mutateAsync({
            url: {
              apiUrl: `${APICONSTANT.UPDATE_APPROVAL_LIST}`,
            },
            body: {
              requestId: status?.id,
              status: status?.label,
            },
          });
          if (!response?.error) {
            await queryClient.invalidateQueries({
              queryKey: ["GET_APPROVAL_LIST"],
            });
          }
        } catch (error) {
          console.error(error);
        }
      });
    }
  };

  const columns = useMemo<ColumnDef<Transaction>[]>(
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
        accessorKey: "instructor",
        header: "Instructor",
        cell: ({ row }) => {
          const instructor = row?.original?.instructor;
          const title = instructor?.fullname;
          const email = instructor?.email;
          return (
            <div className="w-[200px] py-2">
              <p>{instructor ? title || "---": "Admin course"}</p>{" "}
              {instructor && (
              <p className="lowercase text-xs text-muted-foreground">
                {email || "---"}
              </p>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "course",
        header: "Course",
        cell: ({ row }) => {
          const title = row?.original?.course?.title;
          return <div className="w-[200px] py-2">{title || "---"}</div>;
        },
      },
      {
        accessorKey: "sold",
        header: "Sold On",
        cell: ({ row }) => {
          const title = row?.original?.soldOn;
          const val = new Date(title).toLocaleDateString();
          return <div className="w-[200px] py-2">{val || "---"}</div>;
        },
      },
      // {
      //     accessorKey: "title",
      //     header: "Source",
      //     cell: ({ row }) => {
      //         const title = row?.original?.title;
      //         return <div className="w-[200px] py-2">{title || "---"}</div>;
      //     },
      // },
      {
        accessorKey: "split",
        header: "split %",
        cell: ({ row }) => {
          const instructorShare = row?.original?.commission?.instructorShare;
          const platformShare = row?.original?.commission?.platformShare;
          const split = instructorShare + "% / " + platformShare + "%";
          return <div className="w-[200px] py-2">{split || "---"}</div>;
        },
      },
      {
        accessorKey: "amount",
        header: "Instructor Amount",
        cell: ({ row }) => {
          const title = priceFormat(
            Number(row?.original?.instructorAmount || 0),
            2
          );
          return <div className="w-[200px] py-2">{title || "---"}</div>;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const id = row.original?.id;
          const status = row.original?.status;
          const amount = row?.original?.instructorAmount || 0;
          // console.log(status, "status", id)

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
                    disabled={item.id === status}
                    onClick={() =>
                      item.id !== status &&
                      handleStatus({ id, label: item.id, amount: amount })
                    }
                    className={`flex items-center justify-between cursor-pointer ${
                      item.label === status
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <span>{item.label}</span>
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
    return <p className="p-4 text-red-500">Error loading admin approval queue.</p>;

  return (
    <>
      <div className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 px-5 gap-3 sm:gap-4">
          <div className="flex-1 text-xl font-medium text-default-900">
            Admin Approval Queue
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <Input
              placeholder="Filter by name"
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
      <Dialog open={edit} onOpenChange={setEdit}>
        {edit && (
          <EditAmountModal
            mode={"edit"}
            onClose={() => setEdit(false)}
            instructors={selectedtObj}
            refetch={refetch}
          />
        )}
      </Dialog>
    </>
  );
};

export default AdminApproval;
