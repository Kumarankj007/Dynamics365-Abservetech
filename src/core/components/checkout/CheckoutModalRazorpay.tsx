"use client";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import UseLoadingRouter from "@/core/hooks/useLoadRoute";
import { useAuthStore } from "@/core/store/authStore";
import APICONSTANT from "@/core/utils/ApiConstant";
import { Request } from "@/core/utils/apiTools";
import React, { useEffect, useRef, useState } from "react";
import Loading from "../ui/Loading";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from "@/core/components/ui/dialog";
import { subscriptionOption } from "@/core/utils/constants";
import useSnackbarStore from "@/core/store/toaster";

// Move outside component — no need to recreate on every render
const loadScript = (src: string): Promise<boolean> =>
  new Promise((resolve) => {
    // Don't inject if already loaded
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function Payment({
  currency,
  amount,
  orderId,
  subscriptionId,
  enrollmentId,
  selectedPlan = "LIFETIME",
  onClose = () => {},
}: any) {
  const navigate = UseLoadingRouter();
  const { userData, Settings } = useAuthStore((state) => state);
  const rzpInstanceRef = useRef<any>(null);
  const { showSnackbar } = useSnackbarStore();
  const hasOpenedRef = useRef(false); // prevent double open

  const restoreScroll = () => {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
    document.body.removeAttribute("data-scroll-locked");
  };

  const apiCall = async (data: any) => {
    return await Request(
      `${APICONSTANT.checkRazorpayPaymentStatus}`,
      "POST",
      data,
    );
  };

  const { trigger, isPending } = useCustomMutation(
    apiCall,
    {
      onSuccessCallback: (data: any) => {
        if (data?.status) {
          navigate?.push("/student/dashboard/");
        } else {
          showSnackbar(data?.message || "Something went wrong", "error");
        }
      },
    },
    false,
  );

  const openRazorpay = async () => {
    // Already opened — do nothing
    if (hasOpenedRef.current || !enrollmentId) return;

    const loaded = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js",
    );
    if (!loaded) {
      console.error("Failed to load Razorpay SDK");
      onClose();
      return;
    }

    if (typeof window === "undefined" || !window.Razorpay) {
      onClose();
      return;
    }

    // Close any existing instance before creating a new one
    rzpInstanceRef.current?.close();
    let modeOptions: Record<string, any>;
    if (selectedPlan === "LIFETIME") {
      modeOptions = {
        order_id: orderId,
        amount,
        currency,
      };
    } else {
      modeOptions = {
        subscription_id: subscriptionId,
      };
    }

    const options = {
      key: Settings?.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY,
      ...modeOptions,
      name: userData?.fullname,
      description:
        subscriptionOption?.find((it: any) => it?.id == selectedPlan)?.label ||
        selectedPlan,
      image: userData?.profile || "",
      handler: (response: any) => {
        restoreScroll();
        if (selectedPlan == "LIFETIME") {
          trigger({
            razorpayOrderId: response?.razorpay_order_id, // || response?.razorpay_subscription_id,
            razorpayPaymentId: response?.razorpay_payment_id,
            razorpaySignature: response?.razorpay_signature,
            enrollmentId,
          });
        } else {
          navigate?.push("/student/dashboard/");
        }
      },
      modal: {
        ondismiss: () => {
          hasOpenedRef.current = false;
          rzpInstanceRef.current = null;
          restoreScroll();
          onClose();
        },
      },
      method: {
        card: true,
        netbanking: false,
        wallet: false,
        upi: false,
        emi: false,
        paylater: false,
      },
      prefill: {
        name: userData?.fullname || "",
        email: userData?.email || "",
        contact: userData?.phoneNumber || "",
      },
      theme: {
        color: "#0080FF",
      },
    };

    rzpInstanceRef.current = new window.Razorpay(options);
    rzpInstanceRef.current.open();
    rzpInstanceRef.current.on("payment.failed", (res: any) => {
      alert(res.error.description);
      restoreScroll();
      onClose();
    });
    hasOpenedRef.current = true;
  };

  useEffect(() => {
    openRazorpay();

    // Cleanup on unmount
    return () => {
      rzpInstanceRef.current?.close();
      rzpInstanceRef.current = null;
      hasOpenedRef.current = false;
      restoreScroll();
    };
  }, []); // empty deps — run once only

  return isPending ? (
    <Dialog open={isPending}>
      <DialogOverlay className="bg-black/10 backdrop-blur-sm" />
      <DialogContent
        className="w-full bg-transparent border-none text-text-light p-0"
        hideClose
      >
        <Loading hFull label="Processing Payment..." />
      </DialogContent>
    </Dialog>
  ) : (
    <></>
  );
}
