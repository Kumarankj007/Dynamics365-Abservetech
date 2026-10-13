"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Textarea } from "@/core/components/ui/textarea";
import { Badge } from "@/core/components/ui/badge";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { Label } from "@/core/components/ui/label";
import React, { useEffect } from "react";
import CourseNavigation from "./courseNavigation";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import APICONSTANT from "@/core/utils/ApiConstant";
import { Request } from "@/core/utils/apiTools";
import useSnackbarStore from "@/core/store/toaster";
import { useForm } from "react-hook-form";
import { useCatelogStore } from "@/core/store/catelogStore";
import UseLoadingRouter from "@/core/hooks/useLoadRoute";

export default function Description({
  courseData,
  setCourseData,
  setFinalData,
  isPreview,
  refetch =() => {},
  handleTabNavigation = () => {},
}: any) {
  const router = UseLoadingRouter();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const {
    categories,
    subCategories,
    durations,
    suggestedTags: suggestedTagsList,
  } = useCatelogStore((state) => state);

  const categoriesOptions =
    categories?.length > 0 &&
    categories?.map((cat) => ({
      id: cat.id,
      name: cat.category,
      enabled: true,
      subcategories: subCategories
        .filter((sub) => sub?.category?.id === cat.id)
        .map((sub) => ({
          id: sub.id,
          name: sub.subcategory,
          enabled: true,
        })),
    }));

  const durationBands =
    durations?.length > 0 &&
    durations.map((item) => ({
      id: item.id,
      name: item.label,
      enabled: item.isActive,
      key: item.id,
    }));

  // Course configuration data - matches admin catalog config
  const courseConfig = {
    categories: categoriesOptions || [],
    durationBands: durationBands || [],
  };

  // Get enabled categories and subcategories
  const enabledCategories = courseConfig?.categories?.filter(
    (cat) => cat.enabled
  );

  const getTags = (tagId: string) => {
    const tag = suggestedTagsList?.find((tag) => tag.id === tagId)?.tag;
    return tag;
  };

  const getCategories = (categoryId: string) => {
    const category = courseConfig?.categories?.find(
      (cat) => cat.id === categoryId
    )?.name;
    return category;
  };

  const getEnabledSubcategories = (categoryId: string) => {
    const category = courseConfig?.categories?.find(
      (cat) => cat.id === categoryId
    );
    return category ? category?.subcategories.filter((sub) => sub.enabled) : [];
  };

  const enabledDurations = courseConfig?.durationBands?.filter(
    (duration) => duration.enabled
  );

  const handleCustomtagInput = (target: any) => {
    const value = target.value.trim();
    const tagName = courseData.tags?.map((item: string) => getTags(item));
    if (value && !tagName.includes(value)) {
      setCourseData({
        ...courseData,
        tags: [...courseData.tags, value],
      });
      target.value = "";
    } else if (tagName.includes(value)) {
      showSnackbar("Already exist tag", "warning");
    }
  };

  // validate:
  const { register, handleSubmit, setValue, reset } = useForm({
    defaultValues: {
      description: courseData.description,
      duration: courseData.duration,
      category: courseData.category,
      subcategory: courseData.subcategory,
    },
  });
  register("description", {
    required: "Course description is required",
    minLength: {
      value: 10,
      message: "Description must be at least 10 characters",
    },
  });
  register("duration", { required: "Please select a duration" });
  register("category", { required: "Please select a category" });
  register("subcategory", { required: "Please select a subcategory" });

  useEffect(()=>{
    reset({
      description: courseData.description,
      duration: courseData.duration,
      category: courseData.category,
      subcategory: courseData.subcategory,
    })
  },[courseData])

  const apiCall = async (data: any) => {
    const { action, ...rest } = data;
    const res = await Request(
      `${APICONSTANT.description}/${courseData?.id}`,
      "POST",
      rest
    );
    if (res?.success) {
      if (action == "continue") {
        // setFinalData(courseData);
        refetch(res?.data?.id);
        // handleTabNavigation("next");
      } else if (action == "save") {
        router?.push("/instructor/courses/");
      }
    }
    return res;
  };

  const { trigger, isPending } = useCustomMutation(apiCall);

  //  user selected suggestedtags:
  const suggestedTags = courseData?.tags?.filter((item: string) => {
    return suggestedTagsList.some((tag) => tag?.id == item);
  });

  // user selected customtags:
  const customTags = courseData?.tags?.filter((item: string) => {
    return !suggestedTagsList.some((tag) => tag?.id == item);
  });

  const onSubmit = (data: any, e?: any) => {
    const action = (e.nativeEvent as any).submitter?.value;

    const payload: any = {};
    payload.description = courseData?.description;
    payload.approximateDuration = courseData?.duration;
    payload.categoryId = courseData?.category;
    payload.subCategoryId = courseData?.subcategory;
    if (suggestedTags?.length > 0) payload.suggestedTags = suggestedTags;
    if (customTags?.length > 0) payload.customTags = customTags;
    // console.log(payload, "payload");
    trigger({ ...payload, action });
  };

  const onError = (errors: any) => {
    // show the first error message via toast
    const firstError: any = Object.values(errors)[0];
    if (firstError && typeof firstError?.message === "string") {
      showSnackbar(firstError?.message, "error");
    } else {
      showSnackbar("Please fill all required fields correctly.", "error");
    }
  };
  return (
    <CourseNavigation
      isPending={isPending}
      isPreview={isPreview}
      tabValue="course-description"
      handleSubmit={handleSubmit(onSubmit, onError)}
      handleTabNavigation={handleTabNavigation}
    >
      {/* Course Description */}
      <div className="space-y-4">
        <div>
          <Label
            htmlFor="description"
            className={
              (isPreview ? "text-primary" : "text-foreground") +
              " text-base font-medium"
            }
          >
            Course Description *
          </Label>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Write a compelling description that highlights what students will
            learn and achieve. This appears on course cards and must be approved
            by admin.
          </p>
          <Textarea
            id="description"
            disabled={isPreview}
            placeholder="Example: Master the Power Platform with this complete course covering Canvas apps, Model-Driven apps, and Dataverse. From basic controls to advanced app building, you'll learn everything hands-on with real-world project scenarios."
            value={courseData.description}
            onChange={(e) => {
              setCourseData({
                ...courseData,
                description: e.target.value,
              });
              setValue("description", e.target.value);
            }}
            className="min-h-[120px]"
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm text-muted-foreground">
              Keep it concise and engaging for course listings.
            </p>
            <span className="text-xs text-muted-foreground">
              {courseData?.description?.length}/200
            </span>
          </div>
        </div>
      </div>

      {/* Course Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Duration */}
        <div>
          <Label className="text-base font-medium text-foreground">
            Approximate Duration *
          </Label>
          <p className="text-sm text-muted-foreground mt-1 mb-3">
            Estimate the total time to complete your course.
          </p>
          <Select
            disabled={isPreview}
            value={courseData.duration || ""}
            onValueChange={(value) => {
              setCourseData({ ...courseData, duration: value });
              setValue("duration", value, { shouldValidate: true });
            }}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {enabledDurations.map((duration) => (
                <SelectItem key={duration.id} value={duration.key}>
                  {duration.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div>
          <Label className="text-base font-medium text-foreground">
            Category *
          </Label>
          <p className="text-sm text-muted-foreground mt-1 mb-3">
            Choose the primary Microsoft Dynamics 365 area.
          </p>
          <Select
            disabled={isPreview}
            value={courseData.category}
            onValueChange={(value) => {
              setCourseData({
                ...courseData,
                category: value,
                subcategory: "",
              });
              setValue("category", value, { shouldValidate: true });
            }}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {enabledCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Subcategory */}
      {courseData.category && (
        <div>
          <Label className="text-base font-medium text-foreground">
            Subcategory *
          </Label>
          <p className="text-sm text-muted-foreground mt-1 mb-3">
            Select a more specific area within{" "}
            {getCategories(courseData.category)}.
          </p>
          <Select
            disabled={isPreview}
            value={courseData.subcategory}
            onValueChange={(value) => {
              setCourseData({ ...courseData, subcategory: value });

              setValue("subcategory", value, { shouldValidate: true });
            }}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select subcategory" />
            </SelectTrigger>
            <SelectContent>
              {getEnabledSubcategories(courseData.category).map(
                (subcategory) => (
                  <SelectItem key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Tags */}
      <div>
        <Label className="text-base font-medium text-foreground">
          Course Tags
        </Label>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Add tags to help students discover your course. Choose from suggested
          tags or add your own.
        </p>

        {/* Suggested Tags */}
        {!isPreview && (
          <div className="mb-4">
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">
              Suggested Tags
            </Label>
            <div className="flex flex-wrap gap-2">
              {suggestedTagsList?.map((tag) => (
                <Button
                  key={tag?.id}
                  type="button"
                  variant={
                    courseData?.tags?.includes(tag) ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    const updatedTags = courseData?.tags?.includes(tag?.id)
                      ? courseData?.tags?.filter((t: any) => t !== tag?.id)
                      : [...courseData.tags, tag?.id];
                    setCourseData({ ...courseData, tags: updatedTags });
                  }}
                  className="h-8 text-xs"
                >
                  {tag?.tag}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Tags Input */}
        <div className="space-y-2">
          {!isPreview && (
            <>
              <Label className="text-sm font-medium text-muted-foreground">
                Custom Tags
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="custom-tag-input"
                  placeholder="Add custom tag..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const target = e.target as HTMLInputElement;
                      handleCustomtagInput(target);
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  variant="default"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    const input = document.getElementById(
                      "custom-tag-input"
                    ) as HTMLInputElement | null;
                    if (!input) return;
                    handleCustomtagInput(input);
                  }}
                >
                  Add
                </Button>
              </div>
            </>
          )}

          {/* Selected Tags */}
          {courseData?.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 p-3 bg-muted/30 rounded-lg">
              {courseData?.tags?.map((tag: any, index: number) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {getTags(tag) || tag}
                  <Button
                    variant="ghost"
                    type="button"
                    size="sm"
                    disabled={isPreview}
                    onClick={() => {
                      const updatedTags = courseData.tags.filter(
                        (_: any, i: number) => i !== index
                      );
                      setCourseData({
                        ...courseData,
                        tags: updatedTags,
                      });
                    }}
                    className="h-3 w-3 p-0 hover:bg-transparent"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </CourseNavigation>
  );
}
