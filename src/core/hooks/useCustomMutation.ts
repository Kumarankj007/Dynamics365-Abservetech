/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useCustomMutation.ts
import { useMutation } from "@tanstack/react-query";
import useSnackbarStore from "../store/toaster";

type MutationFn<TVariables, TData> = (body: TVariables) => Promise<TData>;
interface UseCustomMutationOptions<TData> {
  onSuccessCallback?: (data: TData) => void;
}

export const useCustomMutation = <TVariables = any, TData = any>(
  mutationFn: MutationFn<TVariables, TData>,
  options?: UseCustomMutationOptions<TData>,
  toast: boolean = true
): {
  trigger: (body: TVariables) => void;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: any;
  data: TData | undefined;
} => {
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const mutation = useMutation({
    mutationFn,
    onSuccess: (data: any) => {
      if (toast) {
        showSnackbar(
          data?.message == "canceled"
            ? "Uploading Canceled"
            : data?.message || "An error occurred",
          data?.success ? "success" : "error"
        );
      }
      options?.onSuccessCallback?.(data);
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      if (toast) {
        showSnackbar(error?.message || "An error occurred", "error");
      }
    },
  });

  const trigger = (body: TVariables) => {
    mutation.mutate(body);
  };

  return {
    trigger,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
  };
};
