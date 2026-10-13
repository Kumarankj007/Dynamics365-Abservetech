/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import React from "react";
import CourseNavigation from "./courseNavigation";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import APICONSTANT from "@/core/utils/ApiConstant";
import { Request } from "@/core/utils/apiTools";
import useSnackbarStore from "@/core/store/toaster";
import UseLoadingRouter from "@/core/hooks/useLoadRoute";

export default function CourseTitle({
  courseData,
  setCourseData,
  setFinalData,
  isPreview = false,
  refetch =() => {},
  handleTabNavigation = () => {},
}: any) {
  const router = UseLoadingRouter();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const apiCall = async (data: any) => {
    const { action, ...rest } = data;
    const res = await Request(APICONSTANT.addTitle, "POST", rest);
    if (res?.success) {
      // setCourseData({ ...courseData, id: res?.data?.id });
      if (action == "continue") {
        // setFinalData({ ...courseData, id: res?.data?.id });
        refetch(res?.data?.id);
        // handleTabNavigation("next");
      } else if (action == "save") {
        router?.push("/instructor/courses/");
      }
    }
    return res;
  };

  const { trigger, isPending } = useCustomMutation(apiCall);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // prevent page reload
    const action = (e.nativeEvent as any).submitter?.value;
    if (courseData?.title?.trim() == "") {
      showSnackbar("Course title is required", "error");
    } else if (courseData?.id != "") {
      // call your next tab navigation
      // handleTabNavigation("next");
    } else if (courseData?.id == "") {
      trigger({
        title: courseData?.title,
        action: action,
      });
    }
  };

  return (
    <CourseNavigation
      isPending={isPending}
      tabValue="course-title"
      courseId={courseData?.id}
      isPreview={isPreview}
      handleSubmit={handleSubmit}
      handleTabNavigation={handleTabNavigation}
    >
      <div className="space-y-4">
        <div>
          <Label
            htmlFor="course-title"
            className={
              (isPreview ? "text-primary" : "text-foreground") +
              " text-base font-medium"
            }
          >
            Course Title *
          </Label>
          <Input
            id="course-title"
            autoFocus
            disabled={courseData?.id != "" || isPreview}
            placeholder="e.g., Master Power BI Dashboard Creation"
            value={courseData.title}
            onChange={(e) =>
              setCourseData({
                ...courseData,
                title: e.target.value,
              })
            }
            className="mt-2 h-12 text-base"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Choose a name that succinctly describes your course.
          </p>
        </div>
      </div>
    </CourseNavigation>
  );
}
