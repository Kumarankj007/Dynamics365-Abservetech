// src/services/global.ts
import axios from "./axiosInstance";
import axiosLib from "axios";
import { APIURLS } from "./config";
import { QueryFunctionContext } from "@tanstack/react-query";

export const getApiMethos = async <T>({
  queryKey,
  signal,
}: QueryFunctionContext<readonly unknown[]>): Promise<T> => {
  const [, apiConstant, query_string] = queryKey as [string, string, string];

  const api = `${APIURLS.baseUrl}${apiConstant}${query_string || ""}`;
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No auth token found");

  const config = {
    signal,
    headers: { Authorization: token },
  };

  const response = await axios.get(api, config);
  return response.data as T;
};

export const fetchApi = async <T>(
  apiConstant: string,
  query_string = "",
): Promise<T> => {
  const api = `${APIURLS.baseUrl}${apiConstant}${query_string}`;
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No auth token found");

  const config = {
    headers: { Authorization: token },
  };

  const response = await axios.get(api, config);
  return response.data as T;
};

// POST API Method (non-generic)
export const postApiMethod = async (
  apiUrl: string,
  body: Record<string, unknown> | FormData | URLSearchParams,
) => {
  try {
    const url = `${APIURLS.baseUrl}${apiUrl}`;
    const response = await axios.post(url, body);
    return response.data;
  } catch (error) {
    console.error("POST error:", error);
    throw error;
  }
};

// PUT API Method (non-generic)
export const putApiMethod = async (
  apiUrl: string,
  body: Record<string, unknown> | FormData,
) => {
  try {
    const url = `${APIURLS.baseUrl}${apiUrl}`;
    const response = await axios.put(url, body);
    return response.data;
  } catch (error) {
    console.error("PUT error:", error);
    throw error;
  }
};

// PATCH API Method (non-generic)
export const patchApiMethod = async (
  apiUrl: string,
  body: Record<string, unknown> | FormData,
) => {
  try {
    const url = `${APIURLS.baseUrl}${apiUrl}`;
    const response = await axios.patch(url, body);
    return response.data;
  } catch (error) {
    console.error("PATCH error:", error);
    throw error;
  }
};

// DELETE API Method (non-generic)
// export const deleteApiMethod = async (
//   apiUrl: string,
//   body?: Record<string, unknown>
// ) => {
//   try {
//     const url = `${APIURLS.baseUrl}${apiUrl}`;
//     const config = body ? { data: body } : undefined;
//     const response = await axios.delete(url, config);
//     return response.data;
//   } catch (error) {
//     console.error("DELETE error:", error);
//     throw error;
//   }
// };

// Generic Method for POST, PUT, PATCH, DELETE
export const apiMethod = async (
  method: "post" | "put" | "patch" | "delete" | "get",
  apiUrl: string,
  body?: Record<string, unknown> | FormData,
) => {
  try {
    const response = await axios({
      method,
      url: `${APIURLS.baseUrl}${apiUrl}`,
      data: body,
    });

    return response.data;
  } catch (error) {
    console.error(`${method.toUpperCase()} error at ${apiUrl}:`, error);
    throw error;
  }
};

export const postVideoMethod = async (
  apiUrl: string,
  file: File,
  onUploadProgress?: (progress: number) => void,
  controller?: AbortController,
) => {
  const url = `${APIURLS.baseUrl}${apiUrl}`;
  const formData = new FormData();
  const param = new URL(url).searchParams.get("type");
  formData.append(
    param == "course-attachments" ? "attachment" : "lectureFiles",
    file,
  );

  try {
    const config = {
      signal: controller?.signal, // supports cancel
      onUploadProgress: (event: ProgressEvent) => {
        if (event.total) {
          const progress = Math.round((event.loaded * 100) / event.total);
          onUploadProgress?.(progress);
        }
      },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    const response = await axios.post(url, formData, config);
    return response.data;
  } catch (error: any) {
    if ((axiosLib as any).isCancel && (axiosLib as any).isCancel(error)) {
      console.warn("Upload canceled by user");
    } else {
      console.error("Video upload failed:", error);
    }
    throw error;
  }
};
