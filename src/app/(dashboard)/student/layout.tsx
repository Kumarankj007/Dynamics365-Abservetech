"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CreditCard,
  Receipt,
  User,
  HelpCircle,
  Menu,
  X,
  Home,
} from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { cn } from "@/core/lib/utils";
import ImageComponent from "@/core/components/imageComponent";
import { useAuthStore } from "@/core/store/authStore";
import { APIURLS } from "@/core/utils/config";

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { Settings } = useAuthStore((state) => state);
  const pathname = usePathname();

  const sidebarItems = [
    {
      id: "courses",
      label: "My Courses",
      icon: BookOpen,
      path: "/student/dashboard/",
    },
    {
      id: "subscriptions",
      label: "Subscriptions",
      icon: CreditCard,
      path: "/student/subscriptions/",
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: Receipt,
      path: "/student/transactions/",
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      path: "/student/profile/",
    },
    {
      id: "help",
      label: "Help",
      icon: HelpCircle,
      path: "/student/help/",
    },
  ];

  const isActive = (path: string) => {
    if (path === "/student/dashboard/") {
      return pathname === "/student/dashboard/" || pathname === "/student/";
    }
    return pathname === path;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
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
              Student Dashboard
            </span>
            <Link href="/" className="text-sm text-primary hover:underline">
              ← Back to Site
            </Link>
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
          </div>
        </div>
      </header>

      <div className="flex w-full pt-16">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed left-0 top-16 bottom-0 z-20 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out",
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0",
            "lg:relative lg:transform-none lg:top-0",
          )}
        >
          {/* Back to Site link */}
          <div className="p-6 border-b border-border">
            <Link href="/" className="flex items-center space-x-3 group">
              <Home className="w-6 h-6 text-primary" />
              <span className="text-foreground font-bold">Back to Site</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="p-4">
            <div className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 pt-0 lg:pt-6">
          <div className="p-6">{children}</div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
