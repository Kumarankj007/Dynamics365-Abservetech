'use client'
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import CourseButtons from "./CourseButtons/CourseButtons"
import { z } from "zod"
import useApiMutation from "@/hooks/Mutations/useApiMutation"
import { APICONSTANT } from "@/services/config"
import { useEditCourseStore } from "@/app/store/useEditCourseStore"

const courseTitleSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
})

interface Props {
  editCourseId?: string | null
  editData?: { id?: string; title?: string } | null
  onNext: () => void
  onNextOnly: () => void
  setTabsLocked: (value: boolean) => void
  setCourseId: (id: string) => void
}

function CourseTitleTab({
  editCourseId,
  editData,
  onNext,
  onNextOnly,
  setTabsLocked,
  setCourseId,
}: Props) {
  const [isTitleSaved, setIsTitleSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const mutation = useApiMutation("post")

  const { fetchEditCourse } = useEditCourseStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(courseTitleSchema),
    defaultValues: { title: "" },
  })

  const title = watch("title")

  useEffect(() => {
    const isSameCourse = editCourseId && editData?.id && editCourseId === editData.id;
    if (isSameCourse && editData?.title) {
      reset({ title: editData.title })
      setIsTitleSaved(true)
      setTabsLocked(false)
      setCourseId(editData?.id || "")
    } else {
      // reset({ title: "" })
      // setIsTitleSaved(false)
      // setTabsLocked(true)
      // setCourseId("")
    }
  }, [editCourseId, editData, reset, setTabsLocked, setCourseId])

  const onSubmit = async (data: { title: string }) => {
    try {
      setIsLoading(true)
      const response = await mutation.mutateAsync({
        url: { apiUrl: APICONSTANT.CREATE_COURSE_TITLE },
        body: data,
      })

      if (response?.status === true) {
        setIsTitleSaved(true)
        setTabsLocked(false)
        if(response?.data?.id) setCourseId(response?.data?.id)
        if(response?.data?.id) fetchEditCourse(response?.data?.id)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>Course Title *</Label>
          <Input
            placeholder="Enter course title"
            {...register("title")}
            disabled={isTitleSaved}
          />
          {errors.title && (
            <p className="text-red-500 text-xs">{errors.title.message}</p>
          )}
        </div>
      </form>

      <CourseButtons
        onNextOnly={isTitleSaved ? onNextOnly : undefined}
        onNext={handleSubmit(onSubmit)}
        isNextDisabled={!title || isTitleSaved}
        isLoading={isLoading}
        nextLabel="Save Title"
      />
    </div>
  )
}

export default CourseTitleTab;