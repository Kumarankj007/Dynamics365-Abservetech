"use client"
import React, { useState } from "react";
import SiteBreadcrumb from "@/components/site-breadcrumb";
import CourseReviews from "./CourseReviews";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, BookOpen, Eye, FileEdit } from "lucide-react";

export interface CourseType {
    title: string;
    count: number;
}

function Page() {
    const [CoursesOverview, setCoursesOverview] = useState<CourseType[]>([
      { title: "Published", count: 0 },
      { title: "In Review", count: 0 },
      { title: "Changes Needed", count: 0 },
      { title: "Drafts", count: 0 },
    ]);
  const getIcon = (title: string) => {
    switch (title) {
      case "Published":
        return <BookOpen size={24} className="text-green-600" />;
      case "In Review":
        return <Eye size={24} className="text-yellow-600" />;
      case "Changes Needed":
        return <AlertTriangle size={24} className="text-red-500" />;
      case "Drafts":
        return <FileEdit size={24} className="text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <>
      <SiteBreadcrumb />
      <div className="space-y-6">
        <div>
          <p className="text-2xl font-bold text-default-900">Courses</p>
          <p className="text-gray-600">
            Manage course content and approval workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CoursesOverview.map((course, index) => (
            <Card
              key={index}
              className="p-4 text-start flex items-center justify-between"
            >
              <div>
                <p className="text-lg font-semibold flex items-center gap-2">
                  {getIcon(course.title)} {course.title}
                </p>
              </div>
              <p className="text-2xl font-semibold">{course.count}</p>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-0">
            <CourseReviews setCoursesOverview={setCoursesOverview} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default Page;
