"use client";
import React from "react";
import SiteBreadcrumb from "@/components/site-breadcrumb";
import GoogleForm from "./Google";
import { useSettings } from "@/providers/settings-provider";

function page() {
  const { settingsData, isLoading } = useSettings();

  if (isLoading) return null;

  return (
    <>
      <SiteBreadcrumb />
      <GoogleForm
        defaultValues={{
          googleClientId: settingsData?.googleClientId ?? "",
          googleClientSecret: settingsData?.googleClientSecret ?? "",
        }}
      />
    </>
  );
}

export default page;
