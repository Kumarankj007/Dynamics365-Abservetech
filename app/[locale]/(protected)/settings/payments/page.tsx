"use client";
import React from "react";
import SiteBreadcrumb from "@/components/site-breadcrumb";
import PaymentForm from "./Payments";
import { useSettings } from "@/providers/settings-provider";

function page() {
  const { settingsData, isLoading } = useSettings();

  if (isLoading) return null;

  return (
    <>
      <SiteBreadcrumb />
      <PaymentForm
        defaultValues={{
          stripePublishableKey: settingsData?.stripePublishableKey ?? "",
          stripeSecretKey: settingsData?.stripeSecretKey ?? "",
          // razorpayKeyId: settingsData?.razorpayKeyId ?? "",
          // razorpayKeySecret: settingsData?.razorpayKeySecret ?? "",
          // razorpayWebhookSecret: settingsData?.razorpayWebhookSecret ?? "",
        }}
      />
    </>
  );
}

export default page;
