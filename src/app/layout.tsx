import "./globals.css";
import { Poppins } from "next/font/google";
import type { Metadata } from "next";
import Script from "next/script";
import GlobalProvider from "@/core/components/Globalprovider";
import MountedProvider from "@/core/components/MountedProvider";
import CanonicalTag from "@/core/components/CanonicalTag";
// import APICONSTANT from "@/core/utils/ApiConstant";
// import { SettingsResponse } from "@/core/utils/interface";

const GA_MEASUREMENT_ID = "G-7X3TFE8JSF";

// Matches the client-provided Website Schema.txt deliverable verbatim.
const websiteJsonLd = {
  "@context": "https://www.schema.org",
  "@type": "WebSite",
  name: "Dynamics365Lab",
  alternateName: "dynamics365lab",
  url: "https://www.dynamics365lab.io/",
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dynamics365lab.io"),
  title: "Dynamics365lab",
  description: "Dynamics 365 Lab",
  authors: [{ name: "Dynamic" }],
  icons: {
    icon: "/assets/logo.png", // Path relative to the `public` directory
    apple: "/assets/logo.png", // For Apple devices
  },
  openGraph: {
    title: "Dynamics365lab",
    description: "Dynamics 365 Lab",
    type: "website",
  },
};

// export async function generateMetadata(): Promise<Metadata> {
//   const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://10.1.1.45:3000/";
//   console.log(baseUrl, "baseUrl")
//   const defaultMetadata: Metadata = {
//     title: "Dynamics365lab",
//     description: "Dynamics 365 Lab",
//     authors: [{ name: "Dynamic" }],
//     icons: {
//       icon: "/assets/logo.png",
//       apple: "/assets/logo.png",
//     },
//     openGraph: {
//       title: "Dynamics365lab",
//       description: "Dynamics 365 Lab",
//       type: "website",
//     },
//   };

//   try {
//     if (!baseUrl) return defaultMetadata;

//     const res = await fetch(`${baseUrl}${APICONSTANT.settings}`, {
//       cache: "force-cache",
//     });

//     if (!res.ok) throw new Error("Failed to fetch settings");

//     const resJson: SettingsResponse = await res.json();
//     const settings = resJson?.data;

//     const faviconUrl = settings?.favicon
//       ? new URL(`auth/${settings.favicon}`, baseUrl).toString()
//       : "/assets/logo.png";

//       console.log(faviconUrl, "faviconUrl")

//     return {
//       title: settings?.appName || defaultMetadata.title,
//       description: "Dynamics 365 Lab",
//       authors: [{ name: "Dynamic" }],
//       icons: {
//         icon: faviconUrl,
//         apple: faviconUrl,
//       },
//       openGraph: {
//         title: settings?.appName || defaultMetadata.title || "",
//         description: "Dynamics 365 Lab",
//         type: "website",
//       },
//     };
//   } catch (error) {
//     console.error("Metadata Error:", error);
//     return defaultMetadata;
//   }
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        {/* WebSite structured data (JSON-LD) — baked into static HTML */}
        <Script
          id="website-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {/* Google Analytics (gtag.js) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
        </Script>
        <CanonicalTag />
        <MountedProvider>
          <GlobalProvider>
            <>{children}</>
          </GlobalProvider>
        </MountedProvider>
      </body>
    </html>
  );
}
