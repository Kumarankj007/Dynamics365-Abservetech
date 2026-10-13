"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import useReactQuery from "@/hooks/useReactQuery";
import { toast } from "sonner";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { APICONSTANT } from "@/services/config";
import TagsModalForm from "./TagsModalForm";
import DeleteConfirmModal from "@/components/DeleteModal/DeleteConfirmModal";

interface Tags {
  id: string;
  label: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
interface TagsApiResponse {
  error: boolean;
  data?: {
    data?: Tags[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

function SuggestedTagsList() {
  const [page] = useState(1);
  const [limit] = useState(10);
  const queryString = `?page=${page}&limit=${limit}`;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string } | null>(null);

  const {
    data: tagsData,
    isLoading: tagsLoading,
    isError,
    refetch: refetchTags,
  } = useReactQuery<TagsApiResponse>("GET_TAGS_BANDS", queryString);

  const tagsList = tagsData?.data?.data || [];

  const handleOpenModal = (item?: any) => {
    setEditingItem(item || null);
    setModalOpen(true);
  };

  const deleteMutation = useApiMutation("delete");

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { id } = deleteTarget;
      await deleteMutation.mutateAsync({
        url: { apiUrl: `${APICONSTANT?.DELETE_TAGS_BANDS}/${id}` },
      });
      refetchTags();
      toast.success(`Suggested Tag deleted successfully`);
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteModalOpen(false);
      setDeleteTarget(null);
    }
  };

  if (isError)
    return <p className="p-4 text-red-500">Error loading tags bands.</p>;

  return (
    <div className="p-12 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Suggested Tags</h3>
        <Button className="gap-2" onClick={() => handleOpenModal()}>
          <Plus size={16} /> Add Tags
        </Button>
      </div>
      {tagsLoading ? (
        <p>Loading...</p>
      ) : tagsList.length === 0 ? (
        <p className="text-sm text-gray-500">No Suggested tags found</p>
      ) : (
        tagsList.map((item: any) => (
          <div
            key={item?.id}
            className="flex justify-between w-full p-4 items-center bg-default-100 text-default-900 font-medium transition-all duration-200 [&[data-state=open]>svg]:rotate-180 data-[state=open]:rounded-b-none border border-default-200 dark:border-default-300 rounded-md"
          >
            <span>{item?.tag}</span>
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
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget({id: item?.id})
                  setDeleteModalOpen(true);
                }}
              >
                <Trash2 size={16} className="text-red-500" />
              </Button>
            </div>
          </div>
        ))
      )}

      <TagsModalForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingItem={editingItem}
        refetchCategories={refetchTags}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default SuggestedTagsList;
