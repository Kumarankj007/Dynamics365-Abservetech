/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation"; // usePathname to read current route
import { getCookie, strValid } from "../utils/helperFunction";
import UseLoadingRouter from "./useLoadRoute";
import { useCustomMutation } from "./useCustomMutation";
import { useAuthStore } from "../store/authStore";
// import useSnackbarStore from "../store/toaster";

export default function Authguard({ children }: { children: React.ReactNode }) {
  const router = UseLoadingRouter();
  const pathname = usePathname(); // e.g. "/login" (no trailing slash)
  const { setToken, getProfile, SettingsApi, userData } = useAuthStore((state) => state);
  // const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  // Routes everyone can visit
  const guest_routes = [
    "/",
    "/login/",
    "/signup/",
    "/forgot_password/",
    "/reset_password/",
    "/about/",
    // "/blog/",
    "/courses/",
    "/courses/detail/",
  ];

  // Routes a logged-in user should NOT access
  const token_no_accept = [
    "/login/",
    "/signup/",
    "/forgot_password/",
    "/reset_password/",
  ];

  const instructor_root = "/instructor/";

  const mutationSettings = async () => {
    return SettingsApi();
  };
  const { trigger: SettingsTrigger } = useCustomMutation(mutationSettings, {}, false);

  const mutationFn = async () => {
    return getProfile({});
  };
  const { trigger: GetTrigger } = useCustomMutation(mutationFn, {}, false);

  const handleVisibilityChange = () => {
    if (!document.hidden) {
      // Tab is hidden (user switched away)
      // console.log("Tab is hidden, trigger API call for tab switch away");
      // setCookie(
      //   "appToken",
      //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NGM0MGFjMC03ZDU4LTRmODYtYWQ4Yy1iMWMxMmFjMWViYzIiLCJlbWFpbCI6ImFic2t1bWFyYW5rakBnbWFpbC5jb20iLCJyb2xlIjoiVXNlciIsImlhdCI6MTc2MDYwODU2MCwiZXhwIjoxNzYxMjEzMzYwfQ.zDtgp6NCn_0VyRTJGtr4dF215CEMPauYRVlXpTkcyCI",
      //   7
      // );
      SettingsTrigger({});
      const token = strValid(getCookie("appToken"));
      if (token) {
        setToken(true);
        GetTrigger({});
      }
    }
  };
  // when tab switch trigger
  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => handleVisibilityChange(), []);

  useEffect(() => {
    const token = strValid(getCookie("appToken"));
    // console.log(token, "token");
    if (token) {
      // User is logged in
      if (token_no_accept.includes(pathname)) {
        // visiting a page that should be blocked for logged-in users
        if (userData?.currentRole) {
          router.replace(
            userData?.currentRole == "User" ? "/" : "/instructor/dashboard"
          );
        }
      } else {
        // when instructor not access the user routes
        if (userData?.currentRole == "Instructor") {
          if (!pathname?.startsWith(instructor_root)) {
            router.replace(instructor_root + "dashboard");
            // showSnackbar("Kindly switch to sturdent", "warning")
          }
        }
        // when user not access the instructor routes
        else if (userData?.currentRole == "User") {
          if (pathname?.startsWith(instructor_root)) {
            router.replace("/");
            // showSnackbar("Kindly switch to instructor", "warning")
          }
        }
      }
      // else allow, maybe show user-specific UI
    } else {
      // User is NOT logged in
      if (!guest_routes.includes(pathname)) {
        // trying to open a protected page → send to login
        router.replace("/signup");
      }
    }
  }, [pathname, router]);

  return <>{children}</>;
}
