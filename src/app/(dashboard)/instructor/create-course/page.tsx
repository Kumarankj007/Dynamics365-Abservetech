/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/core/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import useSnackbarStore from "@/core/store/toaster";
import CourseTitle from "./CourseTitle";
import Learnings from "./Learnings";
import Curriculum from "./Curriculum";
import Description from "./Description";
import PricingMedia from "./PricingMedia";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import { Request } from "@/core/utils/apiTools";
import APICONSTANT from "@/core/utils/ApiConstant";
import { Module } from "@/core/utils/interface";
import SubmitTab from "./SubmitTab";

const CreateCourse = () => {
  // const { queryId } = useParams(); // Get course ID for edit mode
  const pathname = window?.location?.pathname; // Get current location
  const isEditMode = pathname.includes("/edit-course/"); // Detect edit mode
  const tabs = [
    "course-title",
    "what-youll-learn",
    "curriculum",
    "course-description",
    "pricing-media",
    "submit",
  ];

  const [activeTab, setActiveTab] = useState<string>("course-title");
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const [finalBtn, setFinalBtn] = useState<boolean>(false);
  const [courseData, setCourseData] = useState<any>({
    id: "",
    title: "",
    learningOutcomes: ["", "", "", ""],
    modules: [],
    description: "",
    duration: "",
    category: "",
    subcategory: "",
    tags: [],
    introVideo: null,
    introDuration: 0,
    pricingOptions: [],
  });
  const [finalData, setFinalData] = useState<any>({
    id: "",
    title: "",
    learningOutcomes: ["", "", "", ""],
    modules: [],
    description: "",
    duration: "",
    category: "",
    subcategory: "",
    tags: [],
    introVideo: null,
    introDuration: 0,
    pricingOptions: [],
  });

  const [modules, setModules] = useState<Module[]>([
    {
      id: 1,
      title: "",
      description: "",
      lectures: [
        {
          id: 1,
          title: "",
          type: "UPLOAD_VIDEO",
          videoFile: null,
          duration: 0,
          attachments: [],
          embedUrl: "",
          resources: null,
        },
      ],
    },
  ]);

  const apiCall = async (id: string) => {
    return await Request(APICONSTANT.courseDetails + "/" + id, "GET");
  };
  const { trigger } = useCustomMutation(
    apiCall,
    {
      onSuccessCallback: (data: any) => {
        if (data?.status && data?.data) {
          const courseDetail = { ...data?.data, ...data?.data?.draftData };
          const modulesFormat =
            courseDetail?.curriculum?.length > 0
              ? courseDetail?.curriculum.map((module: any) => ({
                  id: module.order, // map order → id
                  title: module.title,
                  description: module.description,
                  lectures: module.lectures.map((lecture: any) => ({
                    id: lecture.order,
                    title: lecture.title,
                    type: lecture.contentType || "",
                    videoFile: lecture.fileUrl || null, // since it's already uploaded
                    duration: lecture.duration || 0,
                    embedUrl: lecture?.videoUrl || "",
                    attachments: lecture?.attachments || [],
                    resources: null,
                  })),
                }))
              : modules;
          const update = {
            id: courseDetail?.id || "",
            title: courseDetail?.title || "",
            learningOutcomes:
              (courseDetail?.learningOutcomes?.length > 0 &&
                courseDetail?.learningOutcomes) ||
              courseData?.learningOutcomes,
            modules: modulesFormat,
            description: courseDetail?.description || "",
            duration: courseDetail?.approximateDurationEntity?.id || "",
            category: courseDetail?.category?.id || "",
            subcategory: courseDetail?.subCategory?.id || "",
            tags: [
              ...(courseDetail?.suggestedTags?.map((item: any) => item?.id) ||
                []),
              ...(courseDetail?.customTags || []),
            ],
            introVideo: courseDetail?.introVideoUrl || null,
            pricingOptions: courseDetail?.pricingOptions || [],
          };
          setCourseData(update);
          setFinalData(update);
          setModules(modulesFormat);
        }
      },
    },
    false,
  );

  const refetch = (queryId: string) => {
    trigger(queryId);
  };
  
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const queryId = query.get("id");
    if (queryId) {
      refetch(queryId);
    }
  }, []);

  const validModule = modules?.every(
    (item: any) =>
      item?.title?.trim() != "" &&
      item?.lectures?.every((lecture: any) => {
        return (
          lecture?.title?.trim() != "" &&
          (lecture?.type == "UPLOAD_VIDEO"
            ? lecture?.videoFile != null
            : lecture?.type == "READING_MATERIAL"
              ? lecture?.resources != null
              : lecture?.type == "EMBED_LINK"
                ? lecture?.embedUrl != ""
                : true)
        );
      }),
  );

  const isCourseDataValid = (): boolean => {
    if (!finalData.id.trim()) return false;
    if (!finalData.title.trim()) return false;
    if (!finalData.description.trim()) return false;
    if (!finalData.duration.trim()) return false;
    if (!finalData.category.trim()) return false;
    if (!finalData.subcategory.trim()) return false;
    if (
      !finalData.learningOutcomes ||
      finalData.learningOutcomes
        .filter((item: string) => item.trim() != "")
        .some((lo: string) => lo.trim() == "")
    )
      return false;
    if (!finalData.introVideo) return false;
    if (!finalData.modules || !validModule) return false;

    // Validate pricing options
    if (!finalData.pricingOptions || finalData.pricingOptions.length === 0)
      return false;

    const invalidPrice = finalData.pricingOptions.some(
      (opt: any) =>
        !opt.price || isNaN(Number(opt.price)) || Number(opt.price) <= 0,
    );
    if (invalidPrice) return false;

    return true;
  };

  useEffect(() => {
    setFinalBtn(isCourseDataValid());
  }, [finalData]);

  const handleTabNavigation = (direction: "next" | "prev") => {
    const currentIndex = tabs.indexOf(activeTab);
    const isLastStepBeforeFinal = currentIndex === tabs.length - 2;
    const hasCourseId = courseData?.id !== "";

    // Validation before moving forward
    if (direction === "next") {
      if (!courseData?.title) {
        showSnackbar("Enter a title for your course to continue.", "info");
        return;
      }

      if (!hasCourseId) {
        showSnackbar("Save the course title to continue.", "info");
        return;
      }
    }

    // Navigation: NEXT
    if (direction === "next" && hasCourseId) {
      if (currentIndex < tabs.length - 2) {
        setActiveTab(tabs[currentIndex + 1]);
      } else if (isLastStepBeforeFinal && isCourseDataValid()) {
        setActiveTab(tabs[currentIndex + 1]);
      } else {
        showSnackbar("Fill in all tabs to move to the review step.", "info");
      }
    }

    // Navigation: PREV
    if (direction === "prev" && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }

    // setFinalData(courseData);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 bg-background min-h-screen">
      {/* Header */}
      <div className="text-center space-y-2 pt-8">
        <h1 className="text-3xl font-bold text-foreground">
          {isEditMode ? "Edit Course" : "Create New Course"}
        </h1>
        <p className="text-muted-foreground">
          {isEditMode
            ? "Update your course content and settings"
            : "Create your course step by step with our guided wizard"}
        </p>
      </div>

      {/* Main Content Card */}

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          // console.log(value, "index");
          if (courseData?.id != "") {
            if (value !== "submit") {
              setActiveTab(value);
            } else if (value == "submit" && isCourseDataValid()) {
              setActiveTab(value);
            } else {
              showSnackbar(
                "Fill in all tabs to move to the review step.",
                "info",
              );
            }
          } else {
            if (courseData?.title == "") {
              showSnackbar(
                "Enter a title for your course to continue.",
                "info",
              );
              return;
            }
            showSnackbar("Save the course title to continue.", "info");
          }
        }}
        className="w-full"
      >
        <Card className="bg-card border border-b-0 rounded-b-none shadow-card">
          <CardContent className="p-0">
            {/* Modern Flat Tabs */}
            <TabsList className="flex flex-wrap w-full bg-muted/30 rounded-none border-b h-auto p-0">
              <TabsTrigger
                value="course-title"
                className="flex-1 basis-40 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary py-4 px-6 text-sm font-medium transition-colors hover:text-primary/80"
              >
                Course Title
              </TabsTrigger>
              <TabsTrigger
                value="what-youll-learn"
                className="flex-1 basis-40 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary py-4 px-6 text-sm font-medium transition-colors hover:text-primary/80"
              >
                What You&apos;ll Learn
              </TabsTrigger>
              <TabsTrigger
                value="curriculum"
                className="flex-1 basis-40 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary py-4 px-6 text-sm font-medium transition-colors hover:text-primary/80"
              >
                Curriculum
              </TabsTrigger>
              <TabsTrigger
                value="course-description"
                className="flex-1 basis-40 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary py-4 px-6 text-sm font-medium transition-colors hover:text-primary/80"
              >
                Course Description
              </TabsTrigger>
              <TabsTrigger
                value="pricing-media"
                className="flex-1 basis-40 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary py-4 px-6 text-sm font-medium transition-colors hover:text-primary/80"
              >
                Pricing & Media
              </TabsTrigger>
              <TabsTrigger
                value="submit"
                className="flex-1 basis-40 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary py-4 px-6 text-sm font-medium transition-colors hover:text-primary/80"
              >
                Publish Course
              </TabsTrigger>
            </TabsList>
          </CardContent>
        </Card>
        <CourseTitle
          courseData={courseData}
          setCourseData={setCourseData}
          setFinalData={setFinalData}
          refetch={refetch}
          handleTabNavigation={handleTabNavigation}
        />
        <Learnings
          courseData={courseData}
          setCourseData={setCourseData}
          setFinalData={setFinalData}
          refetch={refetch}
          handleTabNavigation={handleTabNavigation}
        />
        <Curriculum
          courseData={courseData}
          setCourseData={setCourseData}
          setFinalData={setFinalData}
          validModule={validModule}
          modules={modules}
          setModules={setModules}
          refetch={refetch}
          handleTabNavigation={handleTabNavigation}
        />
        <Description
          courseData={courseData}
          setCourseData={setCourseData}
          setFinalData={setFinalData}
          refetch={refetch}
          handleTabNavigation={handleTabNavigation}
        />
        <PricingMedia
          courseData={courseData}
          setCourseData={setCourseData}
          setFinalData={setFinalData}
          refetch={refetch}
          handleTabNavigation={handleTabNavigation}
        />
        <SubmitTab
          courseData={finalData}
          finalBtn={finalBtn}
          setFinalData={setFinalData}
          validModule={validModule}
          modules={modules}
          setModules={setModules}
          setCourseData={setCourseData}
          handleTabNavigation={handleTabNavigation}
        />
      </Tabs>
    </div>
  );
};

export default CreateCourse;
