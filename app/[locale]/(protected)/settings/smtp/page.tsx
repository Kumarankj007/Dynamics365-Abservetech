"use client";
import React from "react";
import SiteBreadcrumb from "@/components/site-breadcrumb";
import { useSettings } from "@/providers/settings-provider";
import SmtpForm from "./Smtp";

export default function Page() {
  const { settingsData, isLoading } = useSettings();

  if (isLoading) return null;

  const smtp = settingsData?.smtp;

  return (
    <>
      <SiteBreadcrumb />
      <SmtpForm
        defaultValues={{
          host: smtp?.host ?? "",
          port: smtp?.port ?? 0,
          user: smtp?.user ?? "",
          pass: smtp?.pass ?? "",
          secure: smtp?.secure ?? true,
        }}
      />
    </>
  );
}