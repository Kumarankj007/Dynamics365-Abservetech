/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
// import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Badge } from "@/core/components/ui/badge";
import { Checkbox } from "@/core/components/ui/checkbox";
import { Trash2, Upload } from "lucide-react";
import { Label } from "@/core/components/ui/label";
import React, { useEffect, useRef, useState } from "react";
import CourseNavigation from "./courseNavigation";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import APICONSTANT from "@/core/utils/ApiConstant";
import { Request } from "@/core/utils/apiTools";
import useSnackbarStore from "@/core/store/toaster";
import VideoPlayer from "@/core/components/VideoPlayer";
import { Button } from "@/core/components/ui/button";
import { Box, LinearProgress, Typography } from "@mui/material";
import { subscriptionOption } from "@/core/utils/constants";
import UseLoadingRouter from "@/core/hooks/useLoadRoute";
import { getVideoDuration } from "@/core/utils/helperFunction";

export default function PricingMedia({
  courseData,
  setCourseData,
  setFinalData,
  isPreview = false,
  refetch = () => {},
  handleTabNavigation = () => {},
}: any) {
  const router = UseLoadingRouter();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const [progress, setProgress] = useState(0);
  const controllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (courseData?.introVideo != null) {
      setProgress(100);
    } else {
      setProgress(0);
    }
  }, [courseData?.introVideo]);

  const triggerApiCall = async (data: any) => {
    const controller = new AbortController();
    controllerRef.current = controller;
    return await Request(
      `${APICONSTANT.videoUpload}?type=course-intros`,
      "POST",
      data,
      {},
      "true",
      setProgress,
      controller.signal, // ✅ pass abort signal
    );
  };

  // cancelled upload
  const cancelUpload = () => {
    controllerRef.current?.abort();
    setProgress(0);
  };

  const { trigger: uploadTrigger } = useCustomMutation(triggerApiCall, {
    onSuccessCallback(data) {
      if (data?.success && data?.data) {
        setCourseData({ ...courseData, introVideo: data?.data });
      }
      if (inputRef.current) inputRef.current.value = "";
    },
  });

  const apiCall = async (data: any) => {
    const { action, ...rest } = data;
    const res = await Request(
      `${APICONSTANT.pricing}/${courseData?.id}`,
      "POST",
      rest,
    );
    if (res?.success){
      if (action == "continue") {
        // handleTabNavigation("next");
        refetch(res?.data?.id);
      } else if (action == "save") {
        router?.push("/instructor/courses/");
      }
    }
    return res;
  };
  const { trigger, isPending } = useCustomMutation(apiCall, {
    onSuccessCallback: (data: any) => {
      // console.log(data, "data");
      if (data?.success) {
        setCourseData({
          ...courseData,
          introVideo: data?.data?.introVideoUrl,
          pricingOptions: data?.data?.pricingOptions,
        });
        setFinalData({
          ...courseData,
          introVideo: data?.data?.introVideoUrl,
          pricingOptions: data?.data?.pricingOptions,
        });
      }
    },
  });

  const validatePrices = (
    pricingOptions: { option: string; price: string }[],
  ) => {
    const messages: string[] = [];
    if (pricingOptions.length == 0) {
      messages.push(`must be Select the subscription`);
    }
    pricingOptions.forEach((opt) => {
      if (!opt.price) {
        messages.push(`Prices cannot be empty`);
      } else if (isNaN(Number(opt.price))) {
        messages.push(`Prices must be a number`);
      } else if (Number(opt.price) <= 0) {
        messages.push(`Prices must be greater than zero`);
      }
    });

    return messages.length > 0 ? messages.join(", ") : ""; // or "\n" for multiline
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const action = (e.nativeEvent as any).submitter?.value;
    e.preventDefault(); // prevent page reload
    // console.log(courseData, "courseData");
    if (courseData?.introVideo == null) {
      showSnackbar("Intro video is required", "error", 4000);
    } else if (validatePrices(courseData?.pricingOptions) != "") {
      showSnackbar(validatePrices(courseData?.pricingOptions), "error", 4000);
    } else if (
      courseData?.introVideo != null &&
      validatePrices(courseData?.pricingOptions) == ""
    ) {
      const payload = {
        introVideoUrl: courseData?.introVideo,
        ...courseData?.introDuration && {introDuration: Math.round(courseData?.introDuration)},
        pricingOptions: courseData?.pricingOptions,
      };
      // console.log(payload, "payload")
      trigger({ ...payload, action });
    }
  };
  return (
    <CourseNavigation
      isPending={isPending}
      isPreview={isPreview}
      tabValue="pricing-media"
      handleSubmit={handleSubmit}
      courseId={courseData?.id}
      handleTabNavigation={handleTabNavigation}
    >
      {/* Intro Video Section */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium text-foreground">
            Intro Video * (Course Preview)
          </Label>
          <p
            className="text-sm text-muted-foreground mt-1 mb-4"
            onClick={cancelUpload}
          >
            This is the only hero video for the course detail page. Students
            will see this as a preview.
          </p>
          {courseData?.introVideo == null && !isPreview && (
            <label
              htmlFor="avatar"
              className="block border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
            >
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Upload Your Course Intro Video
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload a compelling intro video that showcases your course
                content
              </p>
              {courseData?.introVideo && (
                <p className="text-md text-muted-foreground mb-1">
                  {courseData?.introVideo?.name}
                </p>
              )}
              <Input
                type="file"
                ref={inputRef}
                accept={"video/*"}
                onChange={async (e) => {
                  const file = e?.target?.files?.[0];
                  const formData = new FormData();
                  if (file) {
                    formData.append("lectureFiles", file);
                    const duration = await getVideoDuration(file);
                    // console.log("Video Duration:", duration, "seconds");
                    setCourseData({ ...courseData, introDuration: duration });
                    uploadTrigger(formData);
                  }
                }}
                id="avatar"
                className={courseData?.introVideo ? "hidden" : "w-auto mx-auto"}
                required
              />
              {/* <Button>
              <Upload className="w-4 h-4 mr-2" />
              Choose Video File
            </Button> */}
            </label>
          )}
          {courseData?.introVideo == null && (
            <div className="flex items-center mt-5 gap-2">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {`${Math.round(progress) == 100 ? 99 : Math.round(progress)}%`}
                </Typography>
              </Box>
              <Box sx={{ width: "100%" }}>
                {/* <div className={`loader w-[${progress}%]`}></div> */}
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 15,
                    borderRadius: 5,
                    transition: "all 0.5s linear", // smooth animation
                    backgroundColor: "#e0e0e0",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 6,
                      backgroundSize: "200% 100%",
                      backgroundPosition: "right",
                      animation: "l3 10s infinite linear",
                      backgroundImage:
                        "repeating-linear-gradient(-35deg,#0080ff 0 15px,#e0e0e0 0 27px)",
                      transition: "all 0.5s linear",
                    },
                  }}
                />
              </Box>
              {progress > 0 && progress < 81 && (
                <Button
                  asChild
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={cancelUpload}
                  className="h-5 w-5 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
          {courseData?.introVideo &&
            (courseData?.introVideo instanceof File ||
              courseData?.introVideo != "") && (
              <div className="relative mt-5">
                {!isPreview && (
                  <Button
                    asChild
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCourseData({
                        ...courseData,
                        introVideo: null,
                        introDuration: 0,
                      });
                      setProgress(0);
                    }}
                    className="absolute right-3 top-3 z-10 md:h-9 h-6 md:w-9 w-6 p-1 shadow-lg bg-white text-red-500 "
                  >
                    <Trash2 className="w-2 h-2" />
                  </Button>
                )}
                <VideoPlayer
                  src={
                    courseData?.introVideo instanceof File
                      ? URL.createObjectURL(courseData?.introVideo)
                      : courseData?.introVideo
                  }
                />
              </div>
            )}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="space-y-6">
        <div>
          <Label
            className={
              (isPreview ? "text-primary" : "text-foreground") +
              " text-base font-medium"
            }
          >
            Pricing Options *
          </Label>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            Select which pricing options to offer for your course. Students can
            choose the option that works best for them.
          </p>
        </div>

        {/* Pricing Options Selection */}
        {!isPreview && (
          <div className="space-y-4">
            <Label className="text-sm font-medium text-foreground">
              Available Access Options
            </Label>
            <div className="flex flex-wrap gap-3">
              {subscriptionOption.map((option: any) => {
                return (
                  <div
                    key={option.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg"
                    onClick={() => {
                      // console.log(courseData.pricingOptions, "pricingOptions")
                      const isSelected =
                        courseData.pricingOptions.some(
                          (opt: any) => opt.option === option.id,
                        ) || false;

                      const updatedOptions = isSelected
                        ? courseData.pricingOptions.filter(
                            (opt: any) => opt.option !== option.id,
                          )
                        : [
                            ...courseData.pricingOptions,
                            { option: option.id, price: "" },
                          ];

                      // setCourseData({
                      //   ...courseData,
                      //   pricingOptions: updatedOptions,
                      // });
                    }}
                  >
                    <Checkbox
                      checked={courseData.pricingOptions.some(
                        (opt: any) => opt.option === option.id,
                      )}
                      onCheckedChange={(checked) => {
                        const updatedOptions = checked
                          ? [
                              ...courseData.pricingOptions,
                              { option: option.id, price: "" },
                            ]
                          : courseData.pricingOptions.filter(
                              (opt: any) => opt.option !== option.id,
                            );

                        setCourseData({
                          ...courseData,
                          pricingOptions: updatedOptions,
                        });
                      }}
                    />
                    <div className="flex-1">
                      <Label className="text-sm font-medium">
                        {option.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pricing Inputs Grid */}
        {courseData?.pricingOptions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {courseData?.pricingOptions &&
              courseData?.pricingOptions?.map((item: any, ind: number) => {
                const selected = subscriptionOption.find(
                  (data) => data?.id == item?.option,
                );
                const price =
                  courseData.pricingOptions.find(
                    (opt: any) => opt.option === selected?.id,
                  )?.price || "";
                return (
                  <Card
                    key={ind}
                    className="border-2 hover:border-primary/50 transition-colors"
                  >
                    <CardHeader className="text-center pb-4 flex flex-row flex-wrap justify-between">
                      <div>
                        {selected?.label && (
                          <CardTitle className="text-base">
                            {selected?.label}
                          </CardTitle>
                        )}
                        {selected?.shortDescriptions && (
                          <p className="text-xs text-muted-foreground">
                            {selected?.shortDescriptions}
                          </p>
                        )}
                      </div>
                      {selected?.id == "LIFETIME" && (
                        <Badge variant="default" className="text-xs ">
                          Popular
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">
                          Price (USD)
                        </Label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input
                            placeholder="49"
                            type="number"
                            disabled={isPreview}
                            value={price}
                            step={0.001}
                            min={0.001}
                            onChange={(e) => {
                              const updatedOptions =
                                courseData.pricingOptions.map((opt: any) =>
                                  opt.option === selected?.id
                                    ? { ...opt, price: Number(e.target.value) }
                                    : opt,
                                );
                              setCourseData({
                                ...courseData,
                                pricingOptions: updatedOptions,
                              });
                            }}
                            className="pl-8"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}

        {/* Pricing Guidelines */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              Pricing Guidelines
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • Courses 50+ hours → eligible for 1 Month, 6 Months, 1 Year
              </li>
              <li>• Courses 20–50 hours → eligible for 6 Months, 1 Year</li>
              <li>• Courses under 20 hours → recommended for Lifetime only</li>
              <li>• Admin reserves right to adjust eligibility</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </CourseNavigation>
  );
}
