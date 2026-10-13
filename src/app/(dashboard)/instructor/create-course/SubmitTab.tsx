/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import CourseNavigation from "./courseNavigation";
import CourseTitle from "./CourseTitle";
import Learnings from "./Learnings";
import Description from "./Description";
import PricingMedia from "./PricingMedia";
import Curriculum from "./Curriculum";

export default function SubmitTab({
  courseData,
  setCourseData,
  modules,
  setModules,
  finalBtn,
  setFinalData,
  handleTabNavigation = () => {},
  validModule,
}: any) {
  return (
    <CourseNavigation
      tabValue="submit"
      courseId={courseData?.id}
      finalBtn={finalBtn}
      handleTabNavigation={handleTabNavigation}
    >
      <CourseTitle
        courseData={courseData}
        isPreview={true}
        setCourseData={setCourseData}
        handleTabNavigation={handleTabNavigation}
      />
      <hr />
      <Learnings
        courseData={courseData}
        isPreview={true}
        setCourseData={setCourseData}
        handleTabNavigation={handleTabNavigation}
      />
      <hr />
      <Curriculum
        isPreview={true}
        courseData={courseData}
        setCourseData={setCourseData}
        setFinalData={setFinalData}
        validModule={validModule}
        modules={modules}
        setModules={setModules}
        handleTabNavigation={handleTabNavigation}
      />
      <hr />
      <Description
        isPreview={true}
        courseData={courseData}
        setCourseData={setCourseData}
        handleTabNavigation={handleTabNavigation}
      />
      <hr />
      <PricingMedia
        isPreview={true}
        courseData={courseData}
        setCourseData={setCourseData}
        handleTabNavigation={handleTabNavigation}
      />
    </CourseNavigation>
  );
}
