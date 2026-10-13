/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import CountryCode from "../lib/CountryCode";

export function setCookie(
  cname?: any,
  cvalue?: any,
  exdays?: any,
  sec?: boolean,
) {
  if (typeof window !== "undefined") {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = sec ? "; max-age=" + exdays : "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + "; path=/";
  }
}

export function getCookie(cname: any) {
  if (typeof window !== "undefined") {
    let name = cname + "=";
    let ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
}

export const stringToColor = (string: any) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).slice(-2);
  }
  return color;
};

export const dateFormat = (dateStr: string = "") => {
  const date = new Date(dateStr);
  const formatted = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return formatted;
};

export const priceFormat = (amount: number, minDig?: number) => {
  const formattedUSD = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: minDig ? minDig : 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return formattedUSD;
};

export const strValid = (str: string = "") => {
  return str && str.trim() != "";
};

export const arrValid = <T>(arr?: T[]): boolean => {
  return Array.isArray(arr) && arr.length > 0;
};

export const objValid = <T extends object>(obj?: T | null): boolean => {
  return (
    !!obj &&
    typeof obj === "object" &&
    !Array.isArray(obj) &&
    Object.keys(obj).length > 0
  );
};

export const getPhoneCodeStr = (str = "", code = false) => {
  const flagObj = CountryCode.find((item) => item.label == str);
  const codeObj = CountryCode.find((item) => item.dial_code == str);
  if (code) {
    return flagObj?.dial_code;
  }
  return codeObj ? codeObj.label : "🇮🇳 +91";
};

export const consoleFormdata = (formData: any) => {
  for (const [key, value] of formData.entries()) {
    return { key, value };
  }
};

export function isValidUrl(str: string) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

export const iframeSrc = (htmlString: string) => {
  let src = "";
  if (isValidUrl(htmlString)) {
    src = htmlString;
  } else {
    const parts = htmlString?.split('src="');
    src = parts[1]?.split('"')[0];
  }

  return isValidUrl(src) ? src : undefined;
};

export async function getIframeDuration(url: string): Promise<number> {
  const video = document.createElement("video");
  video.src = url;

  return new Promise((resolve, reject) => {
    video.addEventListener("loadedmetadata", () => {
      resolve(video.duration);
    });
    video.addEventListener("error", reject);
  });
}

// export const formatDuration = (seconds: number) => {
//   const h = Math.floor(seconds / 3600);
//   const m = Math.floor((seconds % 3600) / 60);
//   const s = Math.floor(seconds % 60);

//   const hh = h.toString().padStart(2, "0");
//   const mm = m.toString().padStart(2, "0");
//   const ss = s.toString().padStart(2, "0");

//   return { hh, mm, ss };
// };

export const toMinutesDecimal = (seconds: number): number =>
  +(seconds / 60).toFixed(2);
export const toHoursDecimal = (seconds: number): number =>
  +(seconds / 3600).toFixed(2);

export function timeAgo(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);

  if (isNaN(past.getTime())) return "Invalid date";

  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const intervals = {
    year: 365 * 24 * 60 * 60,
    month: 30 * 24 * 60 * 60,
    week: 7 * 24 * 60 * 60,
    day: 24 * 60 * 60,
    hour: 60 * 60,
    minute: 60,
    second: 1,
  } as const;

  for (const unit in intervals) {
    const value = Math.floor(
      seconds / intervals[unit as keyof typeof intervals],
    );
    if (value >= 1) {
      return `${value} ${unit}${value > 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")} hours`;
  }

  return `${m}:${s.toString().padStart(2, "0")} minutes`;
}

export function findLecturePosition(data: any, lectureId: string) {
  for (const currModule of data?.curriculum) {
    for (const lecture of currModule?.lectures) {
      if (lecture?.id === lectureId) {
        return {
          moduleId: currModule?.order,
          lessonId: lecture?.order,
        };
      }
    }
  }
  return null; // not found
}

export const normalizeYouTubeUrl = (url: string): string => {
  const raw = extractRawVideoUrl(url);

  const patterns = [
    /youtu\.be\/([\w-]+)/,
    /youtube\.com\/watch\?v=([\w-]+)/,
    /youtube\.com\/embed\/([\w-]+)/,
    /youtube\.com\/shorts\/([\w-]+)/,
    /youtube\.com\/live\/([\w-]+)/,
    /youtube\.com\/v\/([\w-]+)/,
  ];

  for (const p of patterns) {
    const match = raw.match(p);
    if (match) return `https://www.youtube.com/watch?v=${match[1]}`;
  }

  return raw;
};

export const extractRawVideoUrl = (input: string): string => {
  if (!input) return "";
  const iframeMatch = input.match(/src="([^"]+)"/);
  return iframeMatch ? iframeMatch[1] : input.trim();
};

export const normalizeVimeoUrl = (url: string): string => {
  const raw = extractRawVideoUrl(url);

  const embedMatch = raw.match(/player\.vimeo\.com\/video\/(\d+)/);
  if (embedMatch) return `https://vimeo.com/${embedMatch[1]}`;

  const normalMatch = raw.match(/vimeo\.com\/(\d+)/);
  if (normalMatch) return `https://vimeo.com/${normalMatch[1]}`;

  return raw;
};

export const cleanVideoUrl = (url: string): string => {
  if (!url) return "";
  const u = extractRawVideoUrl(url);

  if (u.includes("youtube") || u.includes("youtu.be"))
    return normalizeYouTubeUrl(u);
  if (u.includes("vimeo")) return normalizeVimeoUrl(u);

  return u;
};

export const getEmbedUrl = (url: string) => {
  if (!url) return "";

  const clean = cleanVideoUrl(url);

  // YouTube
  const yt = clean.match(/v=([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;

  // Vimeo
  const vm = clean.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;

  return clean;
};

// Helper: get duration for embed video (YouTube, Vimeo, or direct MP4/WebM)
export const getEmbedVideoDuration = async (
  url: string,
): Promise<number | undefined> => {
  try {
    const cleanUrlValue = cleanVideoUrl(url);
    // YouTube oEmbed (returns duration in seconds is not directly available, need YouTube API for exact)
    if (cleanUrlValue.includes("youtube")) {
      // Use oEmbed to validate, duration fallback to undefined
      const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
        cleanUrlValue,
      )}&format=json`;
      const res = await fetch(oEmbedUrl);
      if (res.ok) {
        // const data = await res.json();
        // YouTube oEmbed doesn't provide duration, so we just return undefined
        return undefined;
      }
    }

    // Vimeo oEmbed (provides duration in seconds)
    if (cleanUrlValue.includes("vimeo.com")) {
      const match = url.match(/vimeo\.com\/(\d+)/);
      if (match) {
        const videoId = match[1];
        const res = await fetch(
          `https://vimeo.com/api/v2/video/${videoId}.json`,
        );
        const data = await res.json();
        return data?.[0]?.duration; // duration in seconds
      }
    }

    // Direct MP4/WebM link
    if (cleanUrlValue.match(/\.(mp4|webm)$/)) {
      return new Promise((resolve) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = url;
        video.onloadedmetadata = () => resolve(video.duration);
        video.onerror = () => resolve(undefined);
      });
    }

    return undefined;
  } catch (error) {
    console.warn("Failed to get embed video duration:", error);
    return undefined;
  }
};

export const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration); // duration in seconds
    };

    video.onerror = () => reject("Invalid video file");
    video.src = URL.createObjectURL(file);
  });
};

export const handleDownload = async (fileUrl: string, name?: string) => {
  try {
    const res = await fetch("https://abserve-video-storage.s3.eu-north-1.amazonaws.com/course-attachments/1769773777413-9a6gma-document-3102527.pdf");

    if (!res.ok) {
      throw new Error("Download failed");
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "file.pdf";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("File download error:", error);
  }
};

// convert USD to INR
type CoinbaseResponse = {
  data: {
    currency: string;
    rates: Record<string, string>; // Coinbase returns rates as strings
  };
};

export async function convertUSDToINR(amount: number): Promise<number> {
  const res = await fetch("https://api.coinbase.com/v2/exchange-rates?currency=USD");
  if (!res.ok) {
    throw new Error("Failed to fetch exchange rates");
  }
  const data: CoinbaseResponse = await res.json();
  const rateStr = data.data.rates["INR"];
  if (!rateStr) {
    throw new Error("INR rate not found");
  }
  const rate = parseFloat(rateStr);
  return amount * rate;
}