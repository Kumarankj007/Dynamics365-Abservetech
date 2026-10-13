"use client";
import React from "react";
import SiteBreadcrumb from "@/components/site-breadcrumb";
import { useSettings } from "@/providers/settings-provider";
import ApplicationSettingsForm from "./Application";

function App() {
  const { settingsData, isLoading } = useSettings();
  // console.log(settingsData, "settings");
  return !isLoading && (
    <>
      <SiteBreadcrumb />
      <ApplicationSettingsForm
        defaultValues={{
          appName: settingsData?.appName || "",
          baseUrl: settingsData?.baseUrl || "",
          port: settingsData?.port || "",
          logo: settingsData?.logo || "",
          favicon: settingsData?.favicon || "",
        }}
      />
    </>
  );
}

export default App;
