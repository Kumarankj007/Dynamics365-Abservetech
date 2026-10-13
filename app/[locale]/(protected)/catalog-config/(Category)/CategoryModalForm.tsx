"use client";
import React, { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { APICONSTANT } from "@/services/config";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const categorySchema = z.object({
  category: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
});

const subCategorySchema = z.object({
  subcategory: z.string().min(1, "Subcategory name is required"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category ID is required"),
});

interface Props {
  open: boolean;
  onClose: () => void;
  type: "category" | "subcategory";
  editingItem: any;
  categoryId?: string;
  refetchCategories: () => void;
  refetchSubCategories: () => void;
}

const CategoryModalForm: React.FC<Props> = ({
  open,
  onClose,
  type,
  editingItem,
  categoryId,
  refetchCategories,
  refetchSubCategories,
}) => {
  const isEdit = !!editingItem;
  const mutation = useApiMutation(isEdit ? "put" : "post");

  const schema = type === "category" ? categorySchema : subCategorySchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues:
      type === "category"
        ? {
            category: "",
            description: "",
          }
        : {
            subcategory: "",
            description: "",
            categoryId: categoryId || "",
          },
  });

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (type === "category" && editingItem) {
      reset({
        category: editingItem.category || "",
        description: editingItem.description || "",
      });
    } else if (type === "subcategory" && editingItem) {
      reset({
        subcategory: editingItem.subcategory || "",
        description: editingItem.description || "",
        categoryId: editingItem.categoryId || categoryId || "",
      });
    } else {
      reset(
        type === "category"
          ? { category: "", description: "" }
          : { subcategory: "", description: "", categoryId: categoryId || "" }
      );
    }
  }, [editingItem, categoryId, type, reset]);

  const onSubmit = async (data: any) => {
    try {
      const apiUrl =
        type === "category"
          ? isEdit
            ? `${APICONSTANT.UPDATE_CATEGORY}/${editingItem.id}`
            : APICONSTANT.CREATE_CATEGORY
          : isEdit
          ? `${APICONSTANT.UPDATE_SUBCATEGORY}/${editingItem.id}`
          : APICONSTANT.CREATE_SUBCATEGORY;

      await mutation.mutateAsync({ url: { apiUrl }, body: data });
      toast.success(
        `${isEdit ? "Updated" : "Added"} ${type === "category" ? "category" : "subcategory"} successfully`
      );
      onClose();
      refetchCategories();
      refetchSubCategories();
    } catch {
      toast.error("Failed to save");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Edit ${type}` : `Add ${type}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {type === "category" ? (
            <>
              <div>
                <Label>Category Name</Label>
                <Input {...register("category")} placeholder="Enter category name" />
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <Label>Subcategory Name</Label>
                <Input {...register("subcategory")} placeholder="Enter subcategory name" />
                {errors.subcategory && (
                  <p className="text-red-500 text-xs mt-1">{errors.subcategory.message}</p>
                )}
              </div>
              <input type="hidden" {...register("categoryId")} />
            </>
          )}

          <div className="pt-2 border-t border-gray-200">
            <Label>Description</Label>
            <Input {...register("description")} placeholder="Enter description" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting
                ? isEdit
                  ? "Updating..."
                  : "Saving..."
                : isEdit
                ? "Update"
                : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryModalForm;