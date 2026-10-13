/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/core/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";
import UseLoadingRouter from "../hooks/useLoadRoute";
import { useEffect, useState } from "react";
import { useCustomMutation } from "../hooks/useCustomMutation";
import APICONSTANT from "../utils/ApiConstant";
import { Request } from "../utils/apiTools";
import CourseCard from "./CourseCard";

const FeaturedCoursesSection = () => {
  const router = UseLoadingRouter();
  const [course, setCourse] = useState([]);

  const apiCall = async (data: any) => {
    return await Request(
      `${APICONSTANT.courseUserOverview}`,
      "GET",
      data
    );
  };
  const { trigger } = useCustomMutation(
    apiCall,
    {
      onSuccessCallback: (data: any) => {
        // console.log(data?.data, "data")
        if (data?.status && data?.data?.data) {
          setCourse(data?.data?.data);
        }
      },
    },
    false
  );

  useEffect(() => {
    trigger({limit: 3, page: 1});
  }, []);
  return (
    course?.length > 0 && (
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Featured Courses
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every course you see here is handpicked, thoroughly reviewed, and
              built by experts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {course
              ?.filter((item: any, ind) => ind < 3)
              ?.map((course: any, index) => (
                <CourseCard course={course} index={index} key={index} />
              ))}
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={() => {
                router.push("/courses");
                window.scrollTo(0, 0);
              }}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Browse All Courses
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    )
  );
};

export default FeaturedCoursesSection;
