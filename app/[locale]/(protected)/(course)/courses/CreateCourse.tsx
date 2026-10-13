'use client'
import React, { useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import CourseTitleTab from "./CourseTitleTab"
import CourseLearningTab from "./CourseLearningTab"
import CourseCurriculumTab from "./Curriculum/CourseCurriculumTab"
import CourseDescriptionTab from "./CourseDescriptionTab"
import CourseMediaPricingTab from "./CourseMediaPricingTab"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { useEditCourseStore } from "@/app/store/useEditCourseStore"
import PublishCourse from "./PublishCourse"
import { useRouter } from "@/components/navigation"

interface props {
    editCourseId?: string | null;
}

function CreateCourse({editCourseId}: props) {
    // console.log(editCourseId, "Edit Course Id");
    const route = useRouter()
    const [tab, setTab] = React.useState("title")
    const [isLocked, setIsLocked] = React.useState(true)
    const [courseId, setCourseId] = React.useState<string | null>(null)

    const { editCourse, fetchEditCourse, loading } = useEditCourseStore()

    const steps = ["title", "learning", "curriculum", "description", "media", "publishCourse"]
    const progress = ((steps.indexOf(tab) + 1) / steps.length) * 100

    const handleSaveDraft = () => alert("Course Draft Saved!")

    useEffect(() => {
    if (editCourseId != null) { 
        fetchEditCourse(editCourseId) 
        setCourseId(editCourseId) 
        setIsLocked(false) }
  }, [editCourseId, fetchEditCourse])

    return (
        <div className="space-y-6">
            {!editCourseId && 
            <Card>
                <CardContent className="p-6 space-y-6">
                    <CardTitle className="text-xl">Course Creation Progress</CardTitle>
                    <Progress value={progress} className="h-4" />
                </CardContent>
            </Card>
            }

            <Card>
                <CardContent className="p-6 space-y-6">
                    <Tabs
                        value={tab}
                        onValueChange={(value) => {
                            if (isLocked && value !== "title") return
                            setTab(value)
                        }}
                    >
                        <TabsList className="flex md:grid md:grid-cols-6 w-full overflow-x-auto whitespace-nowrap">
                            <TabsTrigger value="title">Course Title</TabsTrigger>
                            <TabsTrigger value="learning" disabled={isLocked}>
                                What You'll Learn
                            </TabsTrigger>
                            <TabsTrigger value="curriculum" disabled={isLocked}>
                                Curriculum
                            </TabsTrigger>
                            <TabsTrigger value="description" disabled={isLocked}>
                                Course Description
                            </TabsTrigger>
                            <TabsTrigger value="media" disabled={isLocked}>
                                Pricing & Media
                            </TabsTrigger>
                            <TabsTrigger value="publishCourse" disabled={isLocked}>
                                Publish Course
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="title" forceMount>
                            <CourseTitleTab
                                editCourseId={editCourseId}
                                editData={editCourse}
                                onNextOnly={() => setTab("learning")}
                                onNext={() => setTab("title")}
                                setTabsLocked={setIsLocked}
                                setCourseId={setCourseId}
                            />
                        </TabsContent>

                        <TabsContent value="learning" forceMount>
                            <CourseLearningTab
                                courseId={courseId}
                                editCourseId={editCourseId}
                                onNextOnly={() => setTab("curriculum")}
                                onNext={() => setTab("learning")}
                                onSaveDraft={handleSaveDraft}
                                onBack={() => setTab("title")}
                            />
                        </TabsContent>

                        <TabsContent value="curriculum" forceMount>
                            <CourseCurriculumTab
                                courseId={courseId}
                                editCourseId={editCourseId}
                                onNextOnly={() => setTab("description")}
                                onNext={() => setTab("curriculum")}
                                onBack={() => setTab("learning")}
                            />
                        </TabsContent>

                        <TabsContent value="description" forceMount>
                            <CourseDescriptionTab
                                courseId={courseId}
                                editCourseId={editCourseId}
                                onNextOnly={() => setTab("media")}
                                onNext={() => setTab("description")}
                                onBack={() => setTab("curriculum")}
                            />
                        </TabsContent>

                        <TabsContent value="media" forceMount>
                            <CourseMediaPricingTab
                                editCourseId={editCourseId} 
                                courseId={courseId} 
                                onBack={() => setTab("description")} 
                                onNext={() => setTab("media")}
                                onNextOnly={() => setTab("publishCourse")}
                            />
                        </TabsContent>

                        <TabsContent value="publishCourse">
                            <PublishCourse
                                courseId={courseId}
                                editCourseId={editCourseId}
                                onNext={() => {setTab("publishCourse"); route?.push(editCourse?.user ?"/course-reviews" : "/manage-courses")}}
                                onBack={() => setTab("media")}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}

export default CreateCourse
