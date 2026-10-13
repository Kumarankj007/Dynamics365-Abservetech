"use client";
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import CourseButtons from "./CourseButtons/CourseButtons";
import useReactQuery from "@/hooks/useReactQuery";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { z } from "zod";
import { APICONSTANT } from "@/services/config";
import { useEditCourseStore } from "@/app/store/useEditCourseStore";

const courseDescriptionSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters"),
  approximateDuration: z.string().uuid("Select a duration"),
  categoryId: z.string().uuid("Select a category"),
  subCategoryId: z.string().uuid("Select a subcategory"),
  suggestedTags: z.array(z.string().uuid()).optional(),
  customTags: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof courseDescriptionSchema>;

interface Props {
  courseId?: string | null;
  editCourseId?: string | null;
  onNext: () => void;
  onNextOnly: () => void;
  onBack: () => void;
}

const CourseDescriptionTab: React.FC<Props> = ({
  courseId,
  editCourseId,
  onNext,
  onNextOnly,
  onBack,
}) => {
  const {
    control,
    handleSubmit,
    register,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(courseDescriptionSchema),
    defaultValues: {
      description: "",
      approximateDuration: "",
      categoryId: "",
      subCategoryId: "",
      suggestedTags: [],
      customTags: [],
    },
  });

  const [customTagInput, setCustomTagInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const mutation = useApiMutation("post");
  const { editCourse, fetchEditCourse } = useEditCourseStore();
  const selectedCategory = watch("categoryId");

  const { data: durationData } = useReactQuery<{
    data?: { data: { id: string; label: string }[] };
  }>("GET_DURATION_BANDS");
  const { data: categoryData } = useReactQuery<{
    data?: { data: { id: string; category: string }[] };
  }>("GET_CATEGORY");
  const { data: tagsData } = useReactQuery<{
    data?: { data: { id: string; tag: string }[] };
  }>("GET_TAGS_BANDS");
  const { data: subCategoryData } = useReactQuery<{
    data?: { data: { id: string; subcategory: string; categoryId: string }[] };
  }>("GET_SUBCATEGORY");

  useEffect(() => {
    if (!editCourseId || !editCourse) return;

    const {
      description = "",
      approximateDurationEntity,
      category,
      suggestedTags = [],
      customTags = [],
    } = editCourse;
    reset({
      description,
      approximateDuration: approximateDurationEntity?.id || "",
      categoryId: category?.id || "",
      suggestedTags:
        suggestedTags?.map((tag: any) =>
          typeof tag === "string" ? tag : tag.id,
        ) || [],
      customTags: customTags || [],
    });

    if (!subCategoryData?.data?.data?.length) return;

    const subCategoryIdToUse =
      editCourse?.subCategoryId || editCourse?.subCategory?.id || "";

    if (subCategoryIdToUse) {
      const subExists = subCategoryData?.data?.data?.some(
        (sc) => sc.id === subCategoryIdToUse,
      );
      if (!subExists) return;
    }
    setValue("subCategoryId", subCategoryIdToUse);
  }, [editCourseId, editCourse, subCategoryData, reset]);

  const addCustomTag = () => {
    if (customTagInput.trim() === "") return;
    const currentTags = watch("customTags") || [];
    if (!currentTags.includes(customTagInput.trim())) {
      setValue("customTags", [...currentTags, customTagInput.trim()]);
    }
    setCustomTagInput("");
  };

  const removeCustomTag = (tag: string) => {
    const currentTags = watch("customTags") || [];
    setValue(
      "customTags",
      currentTags.filter((t) => t !== tag),
    );
  };

  const toggleSuggestedTag = (tagId: string) => {
    const current = watch("suggestedTags") || [];
    if (current.includes(tagId)) {
      setValue(
        "suggestedTags",
        current.filter((t) => t !== tagId),
      );
    } else {
      setValue("suggestedTags", [...current, tagId]);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      const response = await mutation.mutateAsync({
        url: { apiUrl: `${APICONSTANT.CREATE_COURSE_DESCRIPTION}/${courseId}` },
        body: { ...data },
      });
      if (response?.status === true) {
        // setIsSaved(true)
        if (response?.data?.id) fetchEditCourse(response?.data?.id);
        onNext();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form className="space-y-4">
        <div>
          <Label>Course Description *</Label>
          <Textarea
            placeholder="Master the Power Platform with this complete course..."
            {...register("description")}
            className="w-full min-h-[150px]"
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Category *</Label>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select
                  {...field}
                  onValueChange={(e) => {
                    field.onChange(e);
                    setValue("subCategoryId", "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryData?.data?.data?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && (
              <p className="text-red-500 text-xs mt-1">
                {errors.categoryId.message}
              </p>
            )}
          </div>
          {selectedCategory != "" && (
            <div>
              <Label>Subcategory *</Label>
              <Controller
                control={control}
                name="subCategoryId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!selectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subcategory" />
                    </SelectTrigger>

                    <SelectContent>
                      {subCategoryData?.data?.data
                        ?.filter((sc) => sc.categoryId === watch("categoryId"))
                        .map((sc) => (
                          <SelectItem key={sc.id} value={sc.id}>
                            {sc.subcategory}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.subCategoryId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.subCategoryId.message}
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <Label>Approximate Duration *</Label>
          <Controller
            control={control}
            name="approximateDuration"
            render={({ field }) => (
              <Select {...field} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Duration" />
                </SelectTrigger>
                <SelectContent>
                  {durationData?.data?.data?.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.approximateDuration && (
            <p className="text-red-500 text-xs mt-1">
              {errors.approximateDuration.message}
            </p>
          )}
        </div>

        <div>
          <Label>Suggested Tags</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {tagsData?.data?.data?.map((tag) => (
              <button
                type="button"
                key={tag.id}
                className={`px-3 py-1 rounded-full text-sm ${
                  watch("suggestedTags")?.includes(tag.id)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => toggleSuggestedTag(tag.id)}
              >
                {tag.tag}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Custom Tags</Label>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Enter custom tag"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addCustomTag())
              }
            />
            <Button type="button" onClick={addCustomTag}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {watch("customTags")?.map((tag) => (
              <div
                key={tag}
                className="px-3 py-1 bg-green-200 text-green-800 rounded-full flex items-center gap-1"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeCustomTag(tag)}
                  className="font-bold"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>
      </form>
      <CourseButtons
        onNext={handleSubmit(onSubmit)}
        onNextOnly={onNextOnly}
        onBack={onBack}
        isLoading={isLoading}
        nextLabel="Save Description"
      />
    </div>
  );
};

export default CourseDescriptionTab;
