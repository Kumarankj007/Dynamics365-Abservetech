import type { Metadata } from "next";
import CoursesClient from "./CoursesClient";

export const metadata: Metadata = {
  title: "Microsoft Dynamics 365 & Power Platform Courses | Dynamics365Lab",
  description:
    "Find Microsoft Dynamics 365 & Power Platform courses at Dynamics365Lab. Learn Copilot Studio, Finance & Operations (F&O) expert-led training & certification support.",
  alternates: { canonical: "/courses/" },
  openGraph: {
    title: "Microsoft Dynamics 365 & Power Platform Courses | Dynamics365Lab",
    description:
      "Find Microsoft Dynamics 365 & Power Platform courses at Dynamics365Lab. Learn Copilot Studio, Finance & Operations (F&O) expert-led training & certification support.",
    type: "website",
    url: "https://www.dynamics365lab.io/courses/",
  },
};

const CoursesPage = () => {
  return <CoursesClient />;
};

export default CoursesPage;
