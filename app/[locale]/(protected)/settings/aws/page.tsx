"use client";
import React from "react";
import SiteBreadcrumb from "@/components/site-breadcrumb";
import { useSettings } from "@/providers/settings-provider";
import AwsForm from "./Aws";

export default function Page() {
  const { settingsData, isLoading } = useSettings();

  if (isLoading) return null;

  return (
    <>
      <SiteBreadcrumb />
      <AwsForm
        defaultValues={{
          awsAccessKeyId: settingsData?.awsAccessKeyId ?? "",
          awsSecretAccessKey: settingsData?.awsSecretAccessKey ?? "",
          awsBucketName: settingsData?.awsBucketName ?? "",
          awsRegion: settingsData?.awsRegion ?? "",
          useAws: settingsData?.useAws ?? true,
        }}
      />
    </>
  );
}
