/* eslint-disable @typescript-eslint/no-explicit-any */

import { create } from "zustand";
import { SettingsData, UserData } from "../utils/interface";
import { Request } from "../utils/apiTools";
import APICONSTANT from "../utils/ApiConstant";
import { setCookie } from "../utils/helperFunction";
import { APIURLS } from "../utils/config";

interface AuthState {
  Settings: SettingsData | null;
  userData: UserData | null;
  setUser: (user: any) => void;
  token: boolean;
  setToken: (token: any) => void;
  SettingsApi: () => void;
  LoginApi: (data: any) => void;
  SignupApi: (data: any) => void;
  getProfile: (data: any) => void;
  updateProfile: (data: any) => void;
  switchRole: (data: any) => void;
  changeUserPassword: (data: any) => void;
  DeleteApi: (data: any) => void;
}

const API_BASE_URL = APIURLS?.baseUrl
  ? APIURLS?.baseUrl + "auth"
  : process.env.NEXT_PUBLIC_BASE_URL + "auth";

export const useAuthStore = create<AuthState>((set) => ({
  userData: null,
  Settings: null,
  setUser: (user: any) => {
    set({ userData: user });
  },
  token: false,
  setToken: (newToken: any) => set({ token: newToken }),
  SettingsApi: async () => {
    const apiCall = await Request<SettingsData>(APICONSTANT.settings, "GET");
    const baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || "";
    if (apiCall?.success && apiCall?.data) {
      // ✅ Update Title
      if (apiCall?.data?.appName) {
        document.title = apiCall?.data.appName;
      }

      // ✅ Update Favicon
      if (apiCall?.data?.favicon) {
        const faviconUrl = `${baseUrl}auth/${apiCall?.data.favicon}`;

        let link: HTMLLinkElement | null =
          document.querySelector("link[rel*='icon']");

        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }

        link.type = "image/x-icon";
        link.href = faviconUrl;
      }
      set({
        Settings: apiCall?.data,
      });
    }
    return apiCall;
  },
  SignupApi: async (data: any) => {
    const apiCall = await Request(APICONSTANT.register, "POST", data);
    if (apiCall?.success) {
      if (apiCall?.data?.token) {
        set({ token: true });
        const profileUrl = apiCall?.data?.newUser?.profile || "";
        set({
          userData: {
            ...apiCall?.data?.newUser,
            profile:
              profileUrl.startsWith(API_BASE_URL) && profileUrl != ""
                ? profileUrl
                : API_BASE_URL + profileUrl,
          },
        });
        setCookie("appToken", apiCall?.data?.token, 7);
      }
      if (apiCall?.data?.newUser?.id)
        window.localStorage.setItem("appUserId", apiCall?.data?.newUser?.id);
    }
    return apiCall;
  },
  LoginApi: async (data: any) => {
    const apiCall = await Request(APICONSTANT.login, "POST", data);
    if (apiCall?.success) {
      if (apiCall?.data?.token) {
        set({ token: true });
        const profileUrl = apiCall?.data?.user?.profile || "";
        set({
          userData: {
            ...apiCall?.data?.user,
            profile:
              profileUrl.startsWith(API_BASE_URL) && profileUrl != ""
                ? profileUrl
                : API_BASE_URL + profileUrl,
          },
        });
        setCookie("appToken", apiCall?.data?.token, 7);
      }
      if (apiCall?.data?.user?.id)
        window.localStorage.setItem("appUserId", apiCall?.data?.user?.id);
    }
    return apiCall;
  },
  getProfile: async () => {
    const apiCall = await Request(APICONSTANT.profile, "GET");
    if (apiCall?.success) {
      const profileUrl = apiCall?.data?.profile || "";
      set({
        userData: {
          ...apiCall?.data,
          profile: profileUrl.startsWith(API_BASE_URL)
            ? profileUrl
            : API_BASE_URL + profileUrl,
        },
      });
      if (apiCall?.data?.user?.id)
        window.localStorage.setItem("appUserId", apiCall?.data?.id);
    }
    return apiCall;
  },
  updateProfile: async (data: any) => {
    const apiCall = await Request(APICONSTANT.update, "PUT", data);
    if (apiCall?.success) {
      const profileUrl = apiCall?.data?.profile || "";
      set({
        userData: {
          ...apiCall?.data,
          profile: profileUrl.startsWith(API_BASE_URL)
            ? profileUrl
            : API_BASE_URL + profileUrl,
        },
      });
    }
    return apiCall;
  },
  switchRole: async (data: any) => {
    const apiCall = await Request(APICONSTANT.switchRole, "PATCH", data);
    if (apiCall?.success) {
      const profileUrl = apiCall?.data?.user?.profile || "";
      set({
        userData: {
          ...apiCall?.data?.user,
          profile: profileUrl.startsWith(API_BASE_URL)
            ? profileUrl
            : API_BASE_URL + profileUrl,
        },
      });
      setCookie("appToken", apiCall?.data?.token, 7);
    }
    return apiCall;
  },
  changeUserPassword: async (data: any) => {
    const apiCall = await Request(APICONSTANT.changePassword, "PUT", data);
    return apiCall;
  },
  DeleteApi: async () => {
    const apiCall = await Request(APICONSTANT.delete, "DELETE");
    if (apiCall?.success) {
      set({ token: false });
      set({ userData: null });
      setCookie("appToken", "", 0);
      window.localStorage.clear();
    }
    return apiCall;
  },
}));
