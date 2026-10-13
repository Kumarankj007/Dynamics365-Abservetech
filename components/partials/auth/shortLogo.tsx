"use client";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useSettings } from "@/providers/settings-provider";
import { buildImageUrl } from "@/lib/utils";
import ImageComponent from "@/components/imageComponent";

const ShortLogo = () => {
  const { theme: mode } = useTheme();
  const { settingsData } = useSettings();
  return (
    <div>
      <ImageComponent
        src={settingsData?.logo ? buildImageUrl(settingsData?.logo) : "/logo.png"}
        alt="short-logo"
        width={300}
        height={300}
        className=" w-10 "
      />
    </div>
  );
};

export default ShortLogo;
