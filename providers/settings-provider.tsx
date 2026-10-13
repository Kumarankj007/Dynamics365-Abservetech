"use client";

import {
  SettingsData,
  SettingsResponse,
} from "@/app/[locale]/(protected)/settings/interface";
import useReactQuery from "@/hooks/useReactQuery";
import React, { createContext, useContext } from "react";

type SettingsContextType = {
  settingsData: SettingsData | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useReactQuery<SettingsResponse>("GET_SETTINGS");

  const settingsData = data?.data ?? null;

  return (
    <SettingsContext.Provider
      value={{ settingsData, isLoading, isError, refetch }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }

  return context;
};