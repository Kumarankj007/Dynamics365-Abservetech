/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Plus, Trash2, HelpCircle } from "lucide-react";
import React from "react";
import CourseNavigation from "./courseNavigation";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import APICONSTANT from "@/core/utils/ApiConstant";
import { Request } from "@/core/utils/apiTools";
import { Button } from "@/core/components/ui/button";
import useSnackbarStore from "@/core/store/toaster";
import UseLoadingRouter from "@/core/hooks/useLoadRoute";

export default function Learnings({
  courseData,
  setCourseData,
  setFinalData,
  refetch =() => {},
  isPreview = false,
  handleTabNavigation = () => {},
}: any) {
  const router = UseLoadingRouter();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  const updateLearningOutcome = (index: number, value: string) => {
    const newOutcomes = [...courseData.learningOutcomes];
    newOutcomes[index] = value;
    setCourseData({ ...courseData, learningOutcomes: newOutcomes });
  };

  const removeLearningOutcome = (index: number) => {
    if (courseData.learningOutcomes.length > 4) {
      setCourseData({
        ...courseData,
        learningOutcomes: courseData.learningOutcomes.filter(
          (_: any, i: number) => i !== index
        ),
      });
    }
  };

  const addLearningOutcome = () => {
    if (courseData.learningOutcomes.length < 10) {
      setCourseData({
        ...courseData,
        learningOutcomes: [...courseData.learningOutcomes, ""],
      });
    }
  };

  const apiCall = async (data: any) => {
    const { action, ...rest } = data;
    const res = await Request(
      `${APICONSTANT.learning}/${courseData?.id}`,
      "POST",
      rest
    );
    if (res?.success) {
      if (action == "continue") {
        // setFinalData(courseData);
        refetch(res?.data?.id)
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
    const payload = courseData?.learningOutcomes?.filter(
      (item: string) => item.trim() != ""
    );
    if (payload?.length > 0) {
      trigger({
        outcomes: payload,
        action: action,
      });
    } else {
      showSnackbar("Outcomes must contain at least 1 elements", "error");
    }
  };

  return (
    <CourseNavigation
      isPending={isPending}
      isPreview={isPreview}
      tabValue="what-youll-learn"
      handleSubmit={handleSubmit}
      handleTabNavigation={handleTabNavigation}
    >
      <div className="space-y-4">
        <div>
          <Label
            className={
              (isPreview ? "text-primary" : "text-foreground") +
              " text-base font-medium"
            }
          >
            Learning Outcomes *
          </Label>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Add 4–6 clear learning outcomes. These will appear in the Course
            Info tab for students.
          </p>

          <div className="space-y-3">
            {courseData?.learningOutcomes && (
              <>
                {courseData?.learningOutcomes?.length > 0 &&
                  courseData?.learningOutcomes?.map(
                    (outcome: any, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                          {index + 1}
                        </div>
                        <Input
                          placeholder={`Learning outcome ${index + 1}`}
                          disabled={isPreview}
                          value={outcome}
                          onChange={(e) =>
                            updateLearningOutcome(index, e.target.value)
                          }
                          className="flex-1 h-11"
                        />
                        {courseData.learningOutcomes.length > 4 &&
                          !isPreview && (
                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              onClick={() => removeLearningOutcome(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                      </div>
                    )
                  )}
              </>
            )}
          </div>

          {courseData.learningOutcomes.length < 10 && !isPreview && (
            <Button
              variant="outline"
              type="button"
              onClick={addLearningOutcome}
              className="mt-4 w-full border-dashed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Learning Outcome
            </Button>
          )}

          {courseData.learningOutcomes.length % 2 !== 0 &&
            courseData.learningOutcomes.length >= 4 &&
            !isPreview && (
              <p className="text-sm text-yellow-600 bg-yellow-50 mt-4 p-2 rounded border border-yellow-200">
                <HelpCircle className="w-4 h-4 inline mr-1" />
                Please add one more outcome to keep an even number of points.
              </p>
            )}
        </div>
      </div>
    </CourseNavigation>
  );
}
