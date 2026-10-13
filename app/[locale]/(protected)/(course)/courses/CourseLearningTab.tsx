"use client"

import React, { useEffect, useState } from "react"
import CourseButtons from "./CourseButtons/CourseButtons"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import useApiMutation from "@/hooks/Mutations/useApiMutation"
import { APICONSTANT } from "@/services/config"
import { useEditCourseStore } from "@/app/store/useEditCourseStore"

interface CourseLearningTabProps {
  editCourseId?: string | null
  courseId: string | null
  onNext: () => void
  onNextOnly: () => void
  onBack: () => void
  onSaveDraft?: () => void
}

const courseLearningSchema = z.object({
  outcomes: z.array(z.string().min(1, "Outcome cannot be empty")),
})

type CourseLearningForm = z.infer<typeof courseLearningSchema>

const CourseLearningTab: React.FC<CourseLearningTabProps> = ({
  editCourseId,
  courseId,
  onNext,
  onNextOnly,
  onBack,
  onSaveDraft,
}) => {
  const mutation = useApiMutation("post")
  const [isLoading, setIsLoading] = useState(false)

  const { editCourse, fetchEditCourse } = useEditCourseStore()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CourseLearningForm>({
    resolver: zodResolver(courseLearningSchema),
    defaultValues: { outcomes: [""] },
  })

  const outcomes = watch("outcomes")

  useEffect(() => {
    const isSameCourse = editCourseId && editCourse?.id && editCourseId === editCourse.id;
    if (isSameCourse && editCourse?.learningOutcomes?.length) {
      reset({ outcomes: editCourse.learningOutcomes })
    } else {
      // reset({ outcomes: [""] })
    }
  }, [editCourseId, editCourse, reset])

  const handleAddOutcome = () => {
    if (outcomes[outcomes.length - 1].trim() === "") return
    setValue("outcomes", [...outcomes, ""])
  }

  const handleRemoveOutcome = (index: number) => {
    if (outcomes.length > 1) {
      const updated = outcomes.filter((_, i) => i !== index)
      setValue("outcomes", updated)
    }
  }

  const onSubmit = async (data: CourseLearningForm) => {
    if (!courseId) return
    try {
      setIsLoading(true)
      const res = await mutation.mutateAsync({
        url: { apiUrl: `${APICONSTANT.CREATE_COURSE_LEARNING}/${courseId}` },
        body: data,
      })

      if (res?.status === true) {
        if(res?.data?.id) fetchEditCourse(res?.data?.id);
        onNext()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const isNextDisabled =
    isLoading || outcomes.some((outcome) => !outcome || outcome.trim() === "")

  return (
    <div>
      <form className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Learning Outcomes *</h3>
            <p className="text-gray-600">
              What will students learn in this course?
            </p>
          </div>
          <Button
            type="button"
            onClick={handleAddOutcome}
            className="gap-2"
            disabled={outcomes[outcomes.length - 1].trim() === ""}
          >
            <Plus size={16} /> Add Outcome
          </Button>
        </div>

        {outcomes.map((_, index) => (
          <div key={index} className="flex gap-3 items-center">
            <Input
              placeholder={`Learning Outcome ${index + 1}`}
              {...register(`outcomes.${index}` as const)}
            />
            {index > 0 && (
              <Button
                type="button"
                size="icon"
                onClick={() => handleRemoveOutcome(index)}
              >
                <Trash2 size={16} />
              </Button>
            )}
            {errors.outcomes?.[index] && (
              <p className="text-red-500 text-sm">
                {errors.outcomes[index]?.message}
              </p>
            )}
          </div>
        ))}
      </form>

      <CourseButtons
        onNext={handleSubmit(onSubmit)}
        onNextOnly={onNextOnly}
        onBack={onBack}
        // onSaveDraft={onSaveDraft}
        isLoading={isLoading}
        isNextDisabled={isNextDisabled}
        nextLabel="Save Learning"
      />
    </div>
  )
}

export default CourseLearningTab