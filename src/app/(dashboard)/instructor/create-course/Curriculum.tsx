"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/core/components/ui/button";
import { Plus } from "lucide-react";
import { Accordion } from "@/core/components/ui/accordion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Label } from "@/core/components/ui/label";
import React, { useState } from "react";
import CourseNavigation from "./courseNavigation";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import APICONSTANT from "@/core/utils/ApiConstant";
import { Request } from "@/core/utils/apiTools";
import SortableModule from "./SortableModule";
import useSnackbarStore from "@/core/store/toaster";
import { Lecture, Module } from "@/core/utils/interface";
import UseLoadingRouter from "@/core/hooks/useLoadRoute";

export default function Curriculum({
  courseData,
  modules,
  setModules,
  setCourseData,
  setFinalData,
  handleTabNavigation = () => {},
  isPreview = false,
  refetch= () => {},
  validModule,
}: {
  courseData: any;
  modules: Module[];
  setModules: React.Dispatch<React.SetStateAction<Module[]>>;
  setFinalData: React.Dispatch<React.SetStateAction<any>>;
  setCourseData: React.Dispatch<React.SetStateAction<any>>;
  handleTabNavigation?: (direction: "next" | "prev") => void;
  isPreview?: boolean;
  refetch?: (queryId: string) => void;
  validModule: any;
}) {
  const router = UseLoadingRouter();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const [uploadProgress, setUploadProgress] = useState<{
    [lectureId: number]: number;
  }>({});
  const [attachmentsProgress, setAttachmentsProgress] = useState<{
    [lectureId: number]: number;
  }>({});
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // const [modules, setModules] = useState<Module[]>([
  //   {
  //     id: 1,
  //     title: "",
  //     description: "",
  //     lectures: [
  //       {
  //         id: 1,
  //         title: "",
  //         type: "UPLOAD_VIDEO",
  //         videoFile: null,
  //         embedUrl: "",
  //         resources: null,
  //       },
  //     ],
  //   },
  // ]);

  // console.log(modules, "modules")

  const handleDragEnd = (event: { active: any; over: any }) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setModules((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleLectureDragEnd = (
    moduleId: number,
    event: { active: any; over: any }
  ) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setModules((modules) =>
        modules.map((module) => {
          if (module.id === moduleId) {
            const oldIndex = module.lectures.findIndex(
              (lecture) => lecture.id === active.id
            );
            const newIndex = module.lectures.findIndex(
              (lecture) => lecture.id === over.id
            );

            return {
              ...module,
              lectures: arrayMove(module.lectures, oldIndex, newIndex),
            };
          }
          return module;
        })
      );
    }
  };

  const moveModule = (moduleId: number, direction: string) => {
    const moduleIndex = modules.findIndex((m) => m.id === moduleId);
    if (
      (direction === "up" && moduleIndex > 0) ||
      (direction === "down" && moduleIndex < modules.length - 1)
    ) {
      const newIndex = direction === "up" ? moduleIndex - 1 : moduleIndex + 1;
      setModules(arrayMove(modules, moduleIndex, newIndex));
    }
  };

  const moveLecture = (
    moduleId: number,
    lectureId: number,
    direction: string
  ) => {
    setModules(
      modules.map((module) => {
        if (module.id === moduleId) {
          const lectureIndex = module.lectures.findIndex(
            (l) => l.id === lectureId
          );
          if (
            (direction === "up" && lectureIndex > 0) ||
            (direction === "down" && lectureIndex < module.lectures.length - 1)
          ) {
            const newIndex =
              direction === "up" ? lectureIndex - 1 : lectureIndex + 1;
            return {
              ...module,
              lectures: arrayMove(module.lectures, lectureIndex, newIndex),
            };
          }
        }
        return module;
      })
    );
  };

  const deleteModule = (moduleId: number) => {
    if (modules.length > 1) {
      setModules(modules.filter((m) => m.id !== moduleId));
    }
  };

  const deleteLecture = (moduleId: number, lectureId: number) => {
    setModules(
      modules.map((module) => {
        if (module.id === moduleId && module.lectures.length > 1) {
          return {
            ...module,
            lectures: module.lectures.filter((l) => l.id !== lectureId),
          };
        }
        return module;
      })
    );
  };

  const newModule = {
    id: Date.now(),
    title: "",
    description: "",
    lectures: [
      {
        id: Date.now(),
        title: "",
        type: "UPLOAD_VIDEO",
        videoFile: null,
        duration: 0,
        embedUrl: "",
        resources: null,
        attachments: [],
      },
    ],
  };
  const addModule = () => {
    setModules([...modules, newModule]);
    // if (validModule) {
    // } else {
    //   showSnackbar(
    //     "Please fill in all fields of previous modules and lectures before adding a new one.",
    //     "warning",
    //     4000
    //   );
    // }
  };

  const addLecture = (moduleId: number, moduleIndex: number) => {
    // const validLecture = modules[moduleIndex]?.lectures?.every(
    //   (lecture) =>
    //     lecture?.title?.trim() != "" &&
    //     (lecture?.type == "UPLOAD_VIDEO"
    //       ? lecture?.videoFile != null
    //       : lecture?.type == "READING_MATERIAL"
    //       ? lecture?.resources != null
    //       : lecture?.type == "EMBED_LINK"
    //       ? lecture?.embedUrl != ""
    //       : true)
    // );
    // console.log(validLecture, "validLecture");
    setModules(
      modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lectures: [...module.lectures, ...newModule?.lectures],
            }
          : module
      )
    );
    // if (validLecture == true) {
    // } else {
    //   showSnackbar(
    //     "Please fill in all fields of previous lectures before adding a new one.",
    //     "warning",
    //     4000
    //   );
    // }
  };

  const apiCall = async (data: any) => {
    const { action, modules } = data;
    const res = await Request(
      `${APICONSTANT.curriculum}/${courseData?.id}`,
      "POST",
      { modules: modules }
    );
    if (res?.success) {
      if (action == "continue") {
        // setCourseData((pre: any) => ({ ...pre, modules: modules }));
        // setFinalData((pre: any) => ({ ...pre, modules: modules }));
        refetch(res?.data?.id);
        // handleTabNavigation("next");
      } else if (action == "save") {
        router?.push("/instructor/courses/");
      }
    }
    return res;
  };

  const { trigger, isPending } = useCustomMutation(apiCall);

  // format the payload structure
  function formatPayload(modules: Module[]) {
    return modules.map((course: Module) => ({
      title: course.title || ``,
      description: course.description || ``,
      lectures: course.lectures.map((lecture: Lecture) => ({
        title: lecture.title || ``,
        contentType: lecture.type || "UPLOAD_VIDEO",
        ...(lecture?.attachments && lecture?.attachments?.length > 0 ? {attachments: lecture?.attachments} : {}),
        
        ...(lecture.type == "UPLOAD_VIDEO"
          ? {
              fileUrl: lecture.videoFile || "",
              duration: lecture?.duration || 0,
            }
          : { videoUrl: lecture?.embedUrl || "" }),
      })),
    }));
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // prevent page reload
    const action = (e.nativeEvent as any).submitter?.value;
    const payload = formatPayload(modules);
    // console.log(payload, "payload");
    if (validModule) {
      const formData = new FormData();
      formData.append("modules", JSON.stringify(payload));
      trigger({ ...{ modules: payload }, action });
    } else {
      showSnackbar(
        "Please fill in all fields of modules and lectures before submitting files",
        "warning",
        4000
      );
    }
  };

  return (
    <CourseNavigation
      isPending={isPending}
      isPreview={isPreview}
      tabValue="curriculum"
      handleSubmit={handleSubmit}
      handleTabNavigation={handleTabNavigation}
    >
      <div>
        <Label
          className={
            (isPreview ? "text-primary" : "text-foreground") +
            " text-base font-medium"
          }
        >
          Course Curriculum
        </Label>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          Build your course structure with modules and lectures. Use drag
          handles or arrow buttons to reorder items.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={modules.map((m) => m.id)}
          strategy={verticalListSortingStrategy}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {modules.map((module, moduleIndex) => (
              <SortableModule
                key={module.id}
                isPreview={isPreview}
                module={module}
                moduleIndex={moduleIndex}
                modules={modules}
                uploadProgress={uploadProgress as unknown as () => void}
                setUploadProgress={setUploadProgress}
                attachmentsProgress={attachmentsProgress as unknown as () => void}
                setAttachmentsProgress={setAttachmentsProgress}
                setModules={setModules}
                moveModule={moveModule}
                deleteModule={deleteModule}
                addLecture={addLecture}
                moveLecture={moveLecture}
                deleteLecture={deleteLecture}
                handleLectureDragEnd={handleLectureDragEnd}
              />
            ))}
          </Accordion>
        </SortableContext>
      </DndContext>

      {!isPreview && (
        <Button
          type="button"
          variant="outline"
          onClick={addModule}
          className="w-full border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Module
        </Button>
      )}
    </CourseNavigation>
  );
}
