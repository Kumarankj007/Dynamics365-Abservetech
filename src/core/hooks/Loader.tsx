"use client";
import React from "react";
import { useMounted } from "@/core/hooks/useMounted";
import Loading from "../components/ui/Loading";

const Loader = () => {
  const mounted = useMounted();
  return mounted ? null : <Loading hFull={true} />;
};

export default Loader;
