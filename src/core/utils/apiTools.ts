/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import axios, { AxiosRequestConfig, Method } from "axios";
import { APIURLS } from "./config";
import { GlobalStore } from "../store/GlobalStore";
import { getCookie, setCookie } from "./helperFunction";

export interface Response<T> {
  reviews?: any;
  success: boolean;
  data?: T;
  total?: number;
  totalReviews?: number;
  error?: string;
  message?: string;
}

const API_BASE_URL = APIURLS?.baseUrl
  ? APIURLS?.baseUrl
  : process.env.NEXT_PUBLIC_BASE_URL;

const token_no_accept = [
  "/login/",
  "/signup/",
  "/forgot_password/",
  "/reset_password/",
];

export async function Request<T = any>(
  endpoint: string,
  method: Method = "GET",
  body?: Record<string, any> | FormData,
  headers: Record<string, string> = {},
  loader: "true" | "false" = "true",
  onUploadProgress?: (progress: number) => void, // ✅ added for upload tracking
  signal?: AbortSignal
): Promise<Response<T>> {
  try {
    loader === "true" && GlobalStore.getState().setLoading(true);

    const token = getCookie("appToken");

    const config: AxiosRequestConfig = {
      url: `${API_BASE_URL}${endpoint}`,
      method,
      headers: {
        ...headers,
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            }
          : {}),
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(percent);
        }
      },
      signal, // ✅ attach AbortSignal
    };

    // Handle GET query params
    if (method === "GET" && body && !(body instanceof FormData)) {
      config.params = body;
    } else if (body instanceof FormData) {
      config.data = body;
    } else if (body) {
      config.headers = {
        ...config.headers,
        "Content-Type": "application/json",
      };
      config.data = JSON.stringify(body);
    }

    const response = await axios(config);
    const data = response.data;

    if (data.status) {
      loader === "true" && GlobalStore.getState().setLoading(false);
      return { success: true, ...data };
    } else if (
      response.status === 401 &&
      !token_no_accept.includes(window.location?.pathname)
    ) {
      localStorage.clear();
      window.location.href = "/";
      setCookie("appToken", "", 0);
      loader === "true" && GlobalStore.getState().setLoading(false);
      return { success: false, message: "Unauthorized", ...data };
    } else {
      loader === "true" && GlobalStore.getState().setLoading(false);
      return { success: false, message: "An error occurred", ...data };
    }
  } catch (error: any) {
    loader === "true" && GlobalStore.getState().setLoading(false);

    const errorMsg =
      error.response?.data?.message ||
      error.message ||
      "An unknown error occurred";

    return { success: false, message: errorMsg };
  }
}

// When uploading a video using the fetch method, we couldn’t get the upload percentage, so we moved to Axios.

// import { APIURLS } from "./config";
// import { GlobalStore } from "../store/GlobalStore";
// import { getCookie, setCookie } from "./helperFunction";

// export interface Response<T> {
//   success: boolean;
//   data?: T;
//   error?: string;
// }

// const API_BASE_URL = APIURLS?.baseUrl
//   ? APIURLS?.baseUrl
//   : process.env.NEXT_PUBLIC_BASE_URL;

// const token_no_accept = [
//   "/login/",
//   "/signup/",
//   "/forgot_password/",
//   "/reset_password/",
// ];

// export async function Request(
//   endpoint: string,
//   method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" = "GET",
//   body?: Record<string, unknown> | FormData,
//   headers: Record<string, string> = {},
//   loader: "true" | "false" = "true"
// ) {
//   try {
//     loader === "true" && GlobalStore.getState().setLoading(true);
//     const token: any | null = getCookie("appToken");

//     // Initialize fetch options with headers
//     const fetchOptions: RequestInit = {
//       method,
//       headers: {
//         ...headers,
//         ...(token
//           ? {
//               Authorization: `Bearer ${token}`,
//               // "Content-Type": "application/json",
//               "ngrok-skip-browser-warning": "true",
//             }
//           : {}),
//       },
//     };

//     let url = `${API_BASE_URL}${endpoint}`;
//     // Handle request body
//     if (method === "GET" && body && !(body instanceof FormData)) {
//       const queryParams = new URLSearchParams(
//         body as Record<string, string>
//       ).toString();
//       url += `?${queryParams}`;
//     } else if (body instanceof FormData) {
//       fetchOptions.body = body;
//     } else if (body) {
//       (fetchOptions.headers as Record<string, string>)["Content-Type"] =
//         "application/json";
//       fetchOptions.body = JSON.stringify(body);
//     }
//     // console.log(body, "fetchOption");
//     const response = await fetch(url, fetchOptions);
//     const data = await response.json();

//     if (data.status) {
//       loader === "true" && GlobalStore.getState().setLoading(false);
//       return { success: true, ...data };
//     } else if (
//       response.status == 401 &&
//       !token_no_accept.includes(window.location?.pathname)
//     ) {
//       // handle unauthorized
//       localStorage.clear();
//       window.location.href = "/";
//       setCookie("appToken", "", 0);
//       loader === "true" && GlobalStore.getState().setLoading(false);
//       return { success: false, ...data, message: "An error occurred" };
//     } else {
//       loader === "true" && GlobalStore.getState().setLoading(false);
//       return { success: false, message: "An error occurred", ...data };
//     }
//   } catch (error: unknown) {
//     loader === "true" && GlobalStore.getState().setLoading(false);
//     return {
//       success: false,
//       message:
//         error instanceof Error ? error.message : "An unknown error occurred",
//     };
//   }
// }
