"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import useReactQuery from "@/hooks/useReactQuery";
import { Toggle } from "@/components/ui/toggle";
import { toast } from "sonner";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { APICONSTANT } from "@/services/config";
import DurationModalForm from "./DurationModalForm";

interface Duration {
  id: string;
  label: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
interface DurationApiResponse {
  error: boolean;
  data?: {
    data?: Duration[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

function DurationBandsList() {
  const [page] = useState(1);
  const [limit] = useState(10);
  const queryString = `?page=${page}&limit=${limit}`;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const {
    data: durationData,
    isLoading: durationLoading,
    isError,
    refetch: refetchDuration,
  } = useReactQuery<DurationApiResponse>("GET_DURATION_BANDS", queryString);

  const durationList = durationData?.data?.data || [];

  const handleOpenModal = (item?: any) => {
    setEditingItem(item || null);
    setModalOpen(true);
  };

  const changeStatusMutation = useApiMutation("patch");
  const handleActiveChange = async (id: string) => {
    if (!id) return;
    try {
      await changeStatusMutation.mutateAsync({
        url: { apiUrl: `${APICONSTANT.ACTIVE_DURATION_BANDS}/${id}` },
      });
      refetchDuration();
      toast.success(`Duration band action changed successfully`);
    } catch {
      toast.error("Delete failed");
    }
  };

  if (isError)
    return <p className="p-4 text-red-500">Error loading duration bands.</p>;

  return (
    <div className="p-12 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Duration Bands</h3>
        <Button className="gap-2" onClick={() => handleOpenModal()}>
          <Plus size={16} /> Add Duration
        </Button>
      </div>
      {durationLoading ? (
        <p>Loading...</p>
      ) : durationList.length === 0 ? (
        <p className="text-sm text-gray-500">No Duration found</p>
      ) : (
        durationList.map((item: any) => (
          <div
            key={item?.id}
            className="flex justify-between w-full p-4 items-center bg-default-100 text-default-900 font-medium transition-all duration-200 [&[data-state=open]>svg]:rotate-180 data-[state=open]:rounded-b-none border border-default-200 dark:border-default-300 rounded-md"
          >
            <div className="flex items-center gap-7">
              <Toggle
                pressed={item?.isActive}
                variant="outline"
                size="sm"
                onPressedChange={() => {
                  handleActiveChange(item.id);
                }}
                className="w-10 h-6 rounded-full bg-gray-300 data-[state=on]:bg-green-500 relative before:absolute before:top-0.5 before:left-0.5 before:w-5 before:h-5 before:rounded-full before:bg-white before:shadow-md before:transition-transform data-[state=on]:before:translate-x-full"
              />
              <span>{item?.label}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  handleOpenModal(item);
                }}
              >
                <Pencil size={16} />
              </Button>
            </div>
          </div>
        ))
      )}

      <DurationModalForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingItem={editingItem}
        refetchDuration={refetchDuration}
      />
    </div>
  );
}

export default DurationBandsList;
