/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/core/components/ui/tooltip";
import CustomSnackbar from "./toast";
import GoogleLogin from "../utils/googlelogin";
import Authguard from "../hooks/Authguard";
import { Suspense, useEffect } from "react";
import Loading from "./ui/Loading";
import Link from "next/link";

const GlobalProvider = ({ children }: any) => {
  const queryClient = new QueryClient();

  // For Whatsapp Redirection:
  useEffect(() => {
    // 👉 1. Inject styles FIRST
    const style = document.createElement("style");
    style.innerHTML = `
    /* Target widget button */
    .whatsapp-btn {
      background-color: hsl(var(--primary)) !important;
      animation: custom-breathe 2s ease-in-out infinite !important;
    }

    /* Custom animation */
    @keyframes custom-breathe {
      0% {
        box-shadow: 0 0 0 0 rgba(0, 128, 255, 0.3);
      }
      75% {
        box-shadow: 0 0 0 20px rgba(0, 128, 255, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(0, 128, 255, 0);
      }
    }
  `;
    document.head.appendChild(style);

    // 👉 2. Then load script
    const script = document.createElement("script");
    script.src = "https://w.app/widget-v1/Mi4YUA.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.head.removeChild(style);
      document.body.removeChild(script);
    };
  }, []);

    const openWhatsApp = () => {
    const phone = "919876543210"; // replace
    const message = "Hi, I need help!";
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };
  return (
    <Suspense
      fallback={
        // <div className="flex items-center justify-center h-screen">
        //   <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        // </div>
        <Loading hFull />
      }
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Authguard>
            {children}
            <div className="fixed bottom-8 right-[6.5rem] flex items-center gap-3 z-[9999]">
              {/* Label */}
                <div className="bg-white text-sm px-3 py-2 group rounded outline outline-1 hover:outline-2 outline-gray-200 animate-fade-in">
                  Need Help? <Link className="text-textLight font-semibold group-hover:underline" href={"#"} onClick={openWhatsApp}>Chat with us</Link>
                </div>
            </div>
            <CustomSnackbar />
            <GoogleLogin />
          </Authguard>
        </TooltipProvider>
      </QueryClientProvider>
    </Suspense>
  );
};
export default GlobalProvider;
