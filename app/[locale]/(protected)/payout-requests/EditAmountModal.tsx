"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { APICONSTANT } from "@/services/config";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface EditAmountProps {
  mode: "add" | "edit" | "view" | "resetPassword";
  instructors?: {
    id?: string;
    amount?: string;
  };
  onClose: () => void;
  refetch: () => void;
}

const baseSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
});

type InstructorsFormValues = z.infer<typeof baseSchema>;

const EditAmount: React.FC<EditAmountProps> = ({
  mode,
  instructors,
  onClose,
  refetch,
}) => {
  const [isPending, startTransition] = React.useTransition();
  const queryClient = useQueryClient();
  const mutation = useApiMutation("post");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InstructorsFormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      amount: instructors?.amount || "",
    },
  });

  const onSubmit = async (data: InstructorsFormValues) => {
    let payload: any = {};

    let url = APICONSTANT.EDIT_AMT_APPROVAL_LIST;

    payload = {
      queueId: instructors?.id,
      instructorAmount: data.amount,
    };

    startTransition(async () => {
      try {
        const response = await mutation.mutateAsync({
          url: { apiUrl: url },
          body: payload,
        });
        if (!response?.error) {
          await queryClient.invalidateQueries({
            queryKey: ["EDIT_AMT_APPROVAL_LIST"],
          });
        }
        onClose();
        refetch();
      } catch (error) {
        console.error(error);
      }
    });
  };
  return (
    <DialogContent size="sm">
      <DialogHeader>
        <DialogTitle>{mode === "edit" && "Edit Instructor Amount"}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {mode === "edit" && (
          <>
            <div>
              <Input {...register("amount")} type="number" />
              {errors.amount && (
                <p className="text-red-500 text-xs">{errors.amount.message}</p>
              )}
            </div>
          </>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default EditAmount;
