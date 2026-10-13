"use client";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useSettings } from "@/providers/settings-provider";
import { buildImageUrl } from "@/lib/utils";
import ImageComponent from "@/components/imageComponent";

const Logo = () => {
  const { theme: mode } = useTheme();
  const { settingsData } = useSettings();
  return (
    <div>
      <ImageComponent
        src={settingsData?.logo ? buildImageUrl(settingsData?.logo) : "/logo.png"}
        alt="logo"
        width={100}
        height={100}
        className="object-contain"
      />
    </div>
  );
};

export default Logo;
