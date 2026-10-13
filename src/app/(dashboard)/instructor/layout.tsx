/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
// import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import InstructorSidebar from "@/core/components/instructor/InstructorSidebar";
import ImageComponent from "@/core/components/imageComponent";
import { useCatelogStore } from "@/core/store/catelogStore";
import { useAuthStore } from "@/core/store/authStore";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import UseLoadingRouter from "@/core/hooks/useLoadRoute";
import BecomeInstructorModal from "@/core/components/BecomeInstructorModal";
import { Button } from "@/core/components/ui/button";
import { APIURLS } from "@/core/utils/config";
// Update the import path to the correct relative location

export default function InstructorLayout({
  children,
}: {
  children: ReactNode;
}) {
  //   const pathname = usePathname();
  const router = UseLoadingRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { userData, switchRole, Settings } = useAuthStore((state) => state);
  const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);

  const {
    categoryListApi,
    subcategoryListAPI,
    durationBandListAPI,
    suggestedTagsListAPI,
  } = useCatelogStore((state) => state);
  // Extract page title from pathname
  //   const getPageTitle = () => {
  //     const path = pathname?.split("/").pop() || "dashboard";
  //     if (pathname?.includes("/preview/")) {
  //       return "Course Preview";
  //     }
  //     switch (path) {
  //       case "dashboard":
  //         return "Overview";
  //       case "courses":
  //         return "Manage Courses";
  //       case "create-course":
  //         return "Create New Course";
  //       case "payouts":
  //         return "Payouts";
  //       case "messages":
  //         return "Messages";
  //       case "help":
  //         return "Help";
  //       default:
  //         return "Dashboard";
  //     }
  //   };

  const apiCall = async (data: any) => {
    return switchRole(data);
  };
  const { trigger } = useCustomMutation(apiCall, {
    onSuccessCallback() {
      // console.log(data, "data");
      router?.push("/");
    },
  });

  const handleSwitch = () => {
    if (userData?.role?.includes("User")) {
      trigger({
        newRole: "User",
      });
    } else {
      setIsInstructorModalOpen(true);
    }
  };

  useEffect(() => {
    categoryListApi();
    subcategoryListAPI();
    durationBandListAPI();
    suggestedTagsListAPI();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Logo/Brand */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/instructor/dashboard"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <ImageComponent
              src={
                Settings?.logo
                  ? APIURLS?.authImg + Settings?.logo
                  : "/assets/logo.png"
              }
              width={100}
              height={100}
              alt="Dynamics365 Lab Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold text-foreground">
              DYNAMICS365 LAB
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Instructor Dashboard
            </span>
            <div
              onClick={handleSwitch}
              className="text-sm text-primary hover:underline cursor-pointer"
            >
              {userData && !userData?.role?.includes("User")
                ? "Become an Student"
                : "Switch to student"}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            {/* {userData && userData?.role?.includes("User") && (
              <div
                onClick={() => {}}
                className="text-sm text-primary hover:underline"
              >
                
              </div>
            )} */}
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <InstructorSidebar
          setIsSidebarOpen={setIsSidebarOpen}
          isSidebarOpen={isSidebarOpen}
        />

        <div className="flex-1">
          <main className="p-6 pt-8">{children}</main>
        </div>
      </div>

      <BecomeInstructorModal
        isOpen={isInstructorModalOpen}
        onClose={() => setIsInstructorModalOpen(false)}
      />
    </div>
  );
}
