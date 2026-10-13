import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { postVideoMethod } from "@/services/global";
import { showToast } from "@/lib/toastSonner";
import { APICONSTANT } from "@/services/config";

interface UploadParams {
    file: File;
    apiUrl?: string;
    onUploadProgress?: (progress: number) => void;
    controller?: AbortController;
}

interface UploadResponse {
    data?: {
        fileUrl: string;
        name?: string;
        fileType?: string;
        size?: number;
        uploadedAt?: string;
    };
    message?: string;
    success?: boolean;
}

interface UploadError {
    response?: {
        data?: {
            message?: string;
        };
    };
}

export const useLectureAttachmentUploadMutation =
    (): UseMutationResult<UploadResponse, UploadError, UploadParams> => {
        return useMutation<UploadResponse, UploadError, UploadParams>({
            mutationFn: async ({
                file,
                apiUrl = APICONSTANT.UPLOAD_LECTURES_ATTACHMENTS,
                onUploadProgress,
                controller,
            }) => {
                return (await postVideoMethod(
                    apiUrl,
                    file,
                    onUploadProgress,
                    controller
                )) as UploadResponse;
            },

            onSuccess: (response) => {
                showToast.success(
                    response.message || "Attachment uploaded successfully!"
                );
            },

            onError: (error) => {
                showToast.error(
                    error.response?.data?.message || "Attachment upload failed!"
                );
                console.error("Attachment upload error:", error);
            },
        });
    };