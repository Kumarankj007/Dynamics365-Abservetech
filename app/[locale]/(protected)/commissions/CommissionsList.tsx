'use client'
import React, { useMemo, useState } from 'react'
import { Input } from "@/components/ui/input";
import useReactQuery from "@/hooks/useReactQuery";
import { DataTable } from "@/components/ui/tablereusable";
import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog";
import CommissionsModal from './CommissionsModal';
import useApiMutation from '@/hooks/Mutations/useApiMutation';
import { APICONSTANT } from '@/services/config';
import { useQueryClient } from '@tanstack/react-query';
import DeleteConfirmModal from '@/components/DeleteModal/DeleteConfirmModal';
import { Card, CardContent } from '@/components/ui/card';
import GlobalDefaultForm from './GlobalDefaultForm';

interface PremiumInstructorOverride {
  effectiveFrom: string;
  instructor: {
    email: string;
    fullname: string;
    id: string;
    profile?: string | null;
  }
  instructorId: string;
  instructorShare: string;
  platformShare: string;
}

interface Commissions {
  id: string;
  instructorShareDefault: string;
  platformShareDefault: string;
  effectiveFrom: string;
  createdAt: string;
  premiumInstructorOverrides: PremiumInstructorOverride[];
  updatedAt?: string;
}

interface CommissionsApiResponse {
  error: boolean;
  data?: Commissions;
}

function CommissionsList() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const queryString = `?page=${page}&limit=${limit}`
  const queryClient = useQueryClient();
  const { data: previewCommissions, isLoading, isError, refetch } = useReactQuery<CommissionsApiResponse>("GET_COMMISSION", queryString);
  const commission: Commissions | undefined = previewCommissions?.data;
  const [isPending, startTransition] = React.useTransition();
  const [filterValue, setFilterValue] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deletemutation = useApiMutation("delete")

  const filteredData =
    commission?.premiumInstructorOverrides?.filter((item) => {
      const search = filterValue.toLowerCase();
      const instructor = item.instructor;

      return (
        instructor?.fullname?.toLowerCase().includes(search) ||
        instructor?.email?.toLowerCase().includes(search)
      );
    }) || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedCommission, setSelectedCommission] = useState<
    PremiumInstructorOverride | null
  >(null);
  const mapOverrideToModalData = (override: PremiumInstructorOverride) => ({
    instructorId: override.instructorId,
    platformShare: Number(override.platformShare),
    instructorShare: Number(override.instructorShare),
    effectiveFrom: override.effectiveFrom,
  });

  const handleAdd = () => {
    setModalMode("add");
    setSelectedCommission(null);
    setIsModalOpen(true);
  };

  const handleEdit = (override: PremiumInstructorOverride) => {
    setModalMode("edit");
    setSelectedCommission(override);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id)
  };

  const confirmDelete = () => {
    startTransition(async () => {
      try {
        if (deleteId) {

          const response = await deletemutation.mutateAsync({
            url: { apiUrl: `${APICONSTANT.UPDATE_COMMISSION_OVERRIDE}/${deleteId}` }
          });

          if (!response?.error) {
            await queryClient.invalidateQueries({ queryKey: ["GET_COMMISSION"] })
          }

          setDeleteId(null)
        }
      } catch (error) {
        console.error(error)
      }
    })
  }

  const columns = useMemo<ColumnDef<PremiumInstructorOverride>[]>(() => [
    {
      header: "Instructor",
      cell: ({ row }) => row.original.instructor.fullname || "-",
    },
    {
      header: "Platform %",
      cell: ({ row }) => row.original.platformShare,
    },
    {
      header: "Instructor %",
      cell: ({ row }) => row.original.instructorShare,
    },
    {
      header: "Effective From",
      cell: ({ row }) =>
        new Date(row.original.effectiveFrom).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="p-2 rounded cursor-pointer">
              <MoreVertical className="w-5 h-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(item)}>
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-red-500"
                onClick={() => handleDelete(item.instructorId)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], []);

  if (isError)
    return <p className="p-4 text-red-500">Error loading commissions.</p>;

  return (
    <div className="w-full space-y-12">
      <Card>
        <CardContent className="p-0">
          <GlobalDefaultForm commission={commission} refetch={refetch} />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 px-5 gap-3 sm:gap-4">

            <div className="flex-1 text-lg font-semibold">
              Existing Overrides
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Input
                placeholder="Filter by instructor"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="w-full sm:max-w-sm"
              />

              <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={handleAdd}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                  viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add
              </Button>
            </div>
          </div>

          <div className="p-4">
            <DataTable columns={columns} data={filteredData} isLoading={isLoading} />
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            {isModalOpen && (
              <CommissionsModal
                mode={modalMode}
                commission={
                  selectedCommission ? mapOverrideToModalData(selectedCommission) : undefined
                }
                onClose={() => setIsModalOpen(false)}
                refetch={refetch}
              />
            )}
          </Dialog>

          <DeleteConfirmModal
            open={!!deleteId}
            onClose={() => setDeleteId(null)}
            onConfirm={confirmDelete}
            title="Delete Override"
            description="Are you sure you want to delete this details? This action cannot be undone."
          />

        </CardContent>
      </Card>
    </div>
  );
}

export default CommissionsList;