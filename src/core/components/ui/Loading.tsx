"use client";
import React from "react";
import ImageComponent from "../imageComponent";
import { APIURLS } from "@/core/utils/config";
import { useAuthStore } from "@/core/store/authStore";

export default function Loading({
  hFull = false,
  label = "Dynamics 365 Lab",
}: {
  hFull?: boolean;
  label?: string;
}) {
  const { Settings } = useAuthStore((state) => state);
  return (
    <div
      className={
        (hFull ? "h-screen" : "lg:pt-36 md:pt-28 pt-10 pb-10") +
        " flex items-center justify-center flex-col "
      }
    >
      <div className="flex gap-2 items-center">
        <h1 className="text-xl font-semibold bg-gradient-to-r from-[#49C5FD] to-[#993DEC] text-transparent bg-clip-text ">
          {label}
        </h1>
      </div>
      <span className=" inline-flex gap-1  items-center">
        <ImageComponent
          src={
            Settings?.logo
              ? APIURLS?.authImg + Settings?.logo
              : "/assets/logo.png"
          }
          alt="Rotating Image"
          width={50}
          height={50}
          className="animate-spin duration-[10s]"
        />
      </span>
    </div>
  );
}
