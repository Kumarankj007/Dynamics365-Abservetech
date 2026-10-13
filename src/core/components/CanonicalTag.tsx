"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SITE_URL = "https://www.dynamics365lab.io";

/**
 * Ensures a single, self-referencing <link rel="canonical"> exists on every
 * route. Runs on all pages (including client-only ones that can't export
 * metadata) and updates the tag on client-side navigation. If a canonical tag
 * was already rendered at build time (e.g. via the Metadata API on the home and
 * courses pages), it reuses that same tag instead of adding a duplicate.
 */
export default function CanonicalTag() {
  const pathname = usePathname();

  useEffect(() => {
    let path = pathname || "/";
    if (path !== "/" && !path.endsWith("/")) path += "/";
    const href = `${SITE_URL}${path}`;

    let link = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", href);
  }, [pathname]);

  return null;
}
