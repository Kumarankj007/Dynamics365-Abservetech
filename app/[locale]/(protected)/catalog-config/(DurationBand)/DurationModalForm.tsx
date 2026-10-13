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

const durationSchema = z.object({
  duration: z.string().min(1, "Duration is required"),
});

interface Props {
  open: boolean;
  onClose: () => void;
  editingItem: any;
  refetchDuration: () => void;
}

const DurationModalForm: React.FC<Props> = ({
  open,
  onClose,
  editingItem,
  refetchDuration,
}) => {
  const isEdit = !!editingItem;
  const mutation = useApiMutation(isEdit ? "put" : "post");

  const schema = durationSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      duration: "",
    },
  });

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (isEdit) {
      reset({
        duration: editingItem?.label || "",
      });
    } else {
      reset({
        duration: "",
      });
    }
  }, [editingItem, reset]);

  const onSubmit = async (data: any) => {
    try {
      const apiUrl = isEdit
        ? `${APICONSTANT.UPDATE_DURATION_BANDS}/${editingItem.id}`
        : APICONSTANT.CREATE_DURATION_BANDS;

      await mutation.mutateAsync({
        url: { apiUrl },
        body: { label: data.duration },
      });
      toast.success(
        `${isEdit ? "Updated" : "Added"} ${"duration"} successfully`
      );
      onClose();
      refetchDuration();
    } catch {
      toast.error("Failed to save");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit` : `Add` + "Duration Band"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label>Duration Band</Label>
            <Input {...register("duration")} placeholder="Enter duration" />
            {errors.duration && (
              <p className="text-red-500 text-xs mt-1">
                {errors.duration.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
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

export default DurationModalForm;
