import type { Metadata } from "next";
import HeroSection from "@/core/components/HeroSection";
import LogoStripSection from "@/core/components/LogoStripSection";
import FeaturedCoursesSection from "@/core/components/FeaturedCoursesSection";
import TrustedBySection from "@/core/components/TrustedBySection";
import ContactSection from "@/core/components/ContactSection";

export const metadata: Metadata = {
  title:
    "Microsoft Dynamics 365 Courses & Jobs | Finance & Operations Training",
  description:
    "Looking for a Microsoft Dynamics 365 Courses & Jobs platform? Dynamics365Lab offers F&O & Power Apps training, expert-led courses & career growth in business apps.",
  alternates: { canonical: "/" },
  openGraph: {
    title:
      "Microsoft Dynamics 365 Courses & Jobs | Finance & Operations Training",
    description:
      "Looking for a Microsoft Dynamics 365 Courses & Jobs platform? Dynamics365Lab offers F&O & Power Apps training, expert-led courses & career growth in business apps.",
    type: "website",
    url: "https://www.dynamics365lab.io/",
  },
};

const Index = () => {
  return (
    <div className="min-h-screen ">
      <HeroSection />
      <LogoStripSection />
      <FeaturedCoursesSection />
      <TrustedBySection />
      <ContactSection />
    </div>
  );
};

export default Index;
