/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Plus,
  DollarSign,
  Users,
  HelpCircle,
  Home,
  User,
  UserStar,
  LogOut,
} from "lucide-react";
import { cn } from "@/core/lib/utils";
import React from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/core/store/authStore";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import UseLoadingRouter from "@/core/hooks/useLoadRoute";
import { setCookie } from "@/core/utils/helperFunction";

const sidebarItems = [
  { title: "Overview", href: "/instructor/dashboard/", icon: BarChart3 },
  { title: "Create Course", href: "/instructor/create-course/", icon: Plus },
  { title: "Manage Courses", href: "/instructor/courses/", icon: BookOpen },
  { title: "My Students", href: "/instructor/my-students/", icon: Users },
  { title: "Reviews", href: "/instructor/reviews/", icon: UserStar },
  { title: "Payouts", href: "/instructor/payouts/", icon: DollarSign },
  { title: "Profile", href: "/instructor/profile/", icon: User },
  { title: "Help", href: "/instructor/help/", icon: HelpCircle },
];

const InstructorSidebar = ({
  isSidebarOpen = true,
  setIsSidebarOpen = () => {},
}: {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const pathname = usePathname();
  const router = UseLoadingRouter();
  const { userData, switchRole, setToken } = useAuthStore((state) => state);

  const apiCall = async (data: any) => {
    return switchRole(data);
  };
  const { trigger } = useCustomMutation(apiCall, {
    onSuccessCallback() {
      // console.log(data, "data");
      router?.push("/");
    },
  });

  // when logout:
  const handleLogout = () => {
    setCookie("appToken", "", 0);
    window.localStorage.clear();
    setToken(false);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-20 bottom-0 z-20 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        "lg:relative lg:transform-none lg:top-0"
      )}
    >
      {/* Back to Site Section */}
      {userData?.role?.includes("User") && (
        <div className="p-6 border-b border-border">
          <div
            onClick={() => trigger({ newRole: "User" })}
            className="flex items-center space-x-3 group cursor-pointer"
          >
            <Home className="w-6 h-6 text-primary" />
            <span className="text-foreground font-bold">Back to Site</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-4">
        <div className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.title}</span>
              </Link>
            );
          })}
          <Link
            href={"/"}
            onClick={handleLogout}
            className={cn(
              "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
};

export default InstructorSidebar;
