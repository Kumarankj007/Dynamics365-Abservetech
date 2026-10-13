/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";
import {
  Card,
} from "@/core/components/ui/card";
import { Star } from "lucide-react";
import Loading from "./ui/Loading";
import CourseCard from "./CourseCard";
import PaginationFooter from "./PaginationFooter";
import { Dispatch, SetStateAction } from "react";

const CourseCatalogSection = ({
  courses,
  isPending = false,
  totalPages,
  page,
  setPage,
}: {
  courses?: any;
  isPending?: boolean;
  totalPages: number;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
}) => {

  // const courses = [
  //   {
  //     title: "Dynamics 365 Finance & Operations Masterclass: From new legal entity to live system.",
  //     instructor: "Mohammad Yasar, MVP",
  //     rating: 4.9,
  //     duration: "100 hours",
  //     tags: ["D365 SCM", "D365 Finance", "D365 WMS", "PMA", "Production", "All-in-one Bundle"],
  //     description: "Learn D365 F&O by building a legal entity from the ground up — fully implementation-driven. Real-world hands-on training based on actual project execution, not theory."
  //   },
  //   {
  //     title: "The Ultimate Power Platform Course: Canvas, Model-Driven & Dataverse",
  //     instructor: "Mohammad Yasar, MVP",
  //     rating: 4.8,
  //     duration: "30 hours",
  //     tags: ["Low Code", "Canvas App", "Model-Driven App", "Dataverse", "Power Apps", "Project-Based"],
  //     description: "Master the Power Platform with this complete course covering Canvas apps, Model-Driven apps, and Dataverse. From basic controls to advanced app building, you'll learn everything hands-on with real-world project scenarios."
  //   },
  //   {
  //     title: "Copilot Studio Hands-On Course: Automate, Build, and Empower with AI",
  //     instructor: "Mohammad Yasar, MVP",
  //     rating: 4.7,
  //     duration: "20 hours",
  //     tags: ["Copilot Studio", "AI Builder", "No Code AI", "Microsoft Copilot", "Conversational AI"],
  //     description: "Unlock the full power of Copilot Studio with hands-on, project-based learning. Build intelligent AI solutions using natural language and automation. Perfect for beginners and professionals."
  //   },
  //   {
  //     title: "Dynamics 365 Sales Advanced Configuration",
  //     instructor: "Emma Thompson",
  //     rating: 4.9,
  //     duration: "10 hours",
  //     tags: ["Advanced", "Dynamics 365 Sales", "Configuration", "CRM"],
  //     description: "Advanced sales process automation and customization techniques for enterprise deployments."
  //   },
  //   {
  //     title: "Dataverse Security & Governance",
  //     instructor: "James Wilson",
  //     rating: 4.7,
  //     duration: "8 hours",
  //     tags: ["Advanced", "Dataverse", "Security", "Governance"],
  //     description: "Comprehensive security model implementation and data governance best practices."
  //   },
  //   {
  //     title: "Power BI for Dynamics 365 Integration",
  //     instructor: "Lisa Park",
  //     rating: 4.8,
  //     duration: "14 hours",
  //     tags: ["Intermediate", "Power BI", "Integration", "Analytics"],
  //     description: "Create powerful business intelligence solutions integrated with Dynamics 365 data."
  //   },
  //   {
  //     title: "Customer Service Omnichannel Setup",
  //     instructor: "David Kumar",
  //     rating: 4.9,
  //     duration: "11 hours",
  //     tags: ["Intermediate", "Customer Service", "Omnichannel", "Configuration"],
  //     description: "Design and implement comprehensive customer service solutions across all channels."
  //   }
  // ];

  return isPending && courses?.length ==0 ? (
    <>
      <Loading />
    </>
  ) : (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {courses?.length > 0 && (
          <div className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                All Expert-Approved Courses
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Every course you see here is handpicked, thoroughly reviewed,
                and built by experts
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-3">
              {courses.map((course: any, index: number) => (
                <CourseCard course={course} index={index} key={course?.id} />
              ))}
            </div>
            <PaginationFooter
              page={page}
              setPage={setPage}
              totalPages={totalPages}
            />
          </div>
        )}

        {/* What Our Students Say Section */}
        {/* <div className="">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Our Students Say
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real feedback from professionals who transformed their careers
              with our courses
            </p>
          </div>

          <div className="relative overflow-hidden">
            <div className="flex gap-6 animate-scroll-left">
              <Card className="bg-gradient-card border-0 p-6 min-w-[350px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold text-lg">
                      SJ
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Sarah Johnson
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Senior Business Analyst
                    </p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground italic">
                  "The Dynamics 365 courses are incredibly comprehensive and
                  well-structured. I went from beginner to certified
                  professional in just 3 months. The hands-on labs really made
                  the difference in understanding complex business processes."
                </p>
              </Card>

              <Card className="bg-gradient-card border-0 p-6 min-w-[350px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold text-lg">
                      MC
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Michael Chen
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Solution Architect
                    </p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground italic">
                  "Outstanding platform for D365 learning! The instructors are
                  industry experts and the content is always up-to-date with the
                  latest features. This training directly contributed to my
                  promotion and 40% salary increase."
                </p>
              </Card>

              <Card className="bg-gradient-card border-0 p-6 min-w-[350px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold text-lg">
                      ER
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Emily Rodriguez
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Functional Consultant
                    </p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground italic">
                  "I've tried many online training platforms, but this one
                  stands out for its practical approach. The real-world
                  scenarios and case studies helped me understand how to
                  implement D365 solutions effectively in enterprise
                  environments."
                </p>
              </Card>

              <Card className="bg-gradient-card border-0 p-6 min-w-[350px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold text-lg">
                      DK
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      David Kumar
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      D365 F&O Consultant
                    </p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground italic">
                  "The D365 F&O Masterclass transformed my career. Mohammad's
                  implementation-driven approach helped me understand complex
                  supply chain workflows and land a senior consultant role at a
                  Fortune 500 company."
                </p>
              </Card>

              <Card className="bg-gradient-card border-0 p-6 min-w-[350px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold text-lg">
                      JW
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Jessica Williams
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Power Platform Developer
                    </p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground italic">
                  "The Power Platform course exceeded all expectations. From
                  Canvas apps to Model-Driven solutions, I mastered everything
                  needed to become a certified Power Apps developer. The
                  project-based learning was invaluable."
                </p>
              </Card>

              <Card className="bg-gradient-card border-0 p-6 min-w-[350px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold text-lg">
                      RT
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Robert Thompson
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      D365 F&O Implementation Lead
                    </p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground italic">
                  "The hands-on F&O training helped me lead a successful
                  multi-million dollar implementation. The SCM, Finance and WMS
                  modules were explained with real-world scenarios that I
                  directly applied at my company."
                </p>
              </Card>

              <Card className="bg-gradient-card border-0 p-6 min-w-[350px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold text-lg">
                      AL
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Amanda Liu
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Power Platform Architect
                    </p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground italic">
                  "Copilot Studio course opened up AI automation possibilities I
                  never knew existed. Now I build intelligent chatbots and
                  workflow automations that save our company 30+ hours per
                  week."
                </p>
              </Card>

              <Card className="bg-gradient-card border-0 p-6 min-w-[350px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold text-lg">
                      CM
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Carlos Martinez
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      D365 Finance Consultant
                    </p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground italic">
                  "The D365 Finance modules in the F&O course were incredibly
                  detailed. From general ledger setup to advanced financial
                  reporting, I gained expertise that made me the go-to finance
                  consultant at my firm."
                </p>
              </Card>
            </div>
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default CourseCatalogSection;
