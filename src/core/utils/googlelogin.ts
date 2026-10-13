/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { getAccessTokenFromCode } from "../lib/utils";
import { useEffect, useState } from "react";
import { Request } from "./apiTools";
import APICONSTANT from "./ApiConstant";
import { useCustomMutation } from "../hooks/useCustomMutation";
import { useAuthStore } from "../store/authStore";
import { setCookie } from "./helperFunction";

export default function GoogleLogin() {
  const { setToken, setUser, Settings } = useAuthStore((state) => state);
  const [code, setCode] = useState<string | null>(null);
  const apiCall = async (data: Record<string, unknown> | FormData) => {
    return await Request(APICONSTANT.googleLogin, "POST", data);
  };
  const { trigger } = useCustomMutation(apiCall, {
    onSuccessCallback: (data: any) => {
      // console.log(data, "data");
      if (data?.success) {
        setUser(data?.user);
        setCookie("appToken", data?.accessToken, 7);
        setToken(true);
      }
    },
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setCode(params.get("code"));
    }
  }, []);

  useEffect(() => {
    if (code) {
      const fetchData = async () => {
        try {
          const accessToken = await getAccessTokenFromCode(
            code,
            Settings?.googleClientId,
            Settings?.googleClientSecret,
            Settings?.baseUrl,
          );
          // console.log(accessToken, "accessToken");
          if (accessToken) {
            trigger({ accessToken: accessToken });
          }
        } catch (error) {
          console.error("Error fetching access token:", error);
        }
      };
      fetchData();
    }
  }, [code]);

  return null;
}
