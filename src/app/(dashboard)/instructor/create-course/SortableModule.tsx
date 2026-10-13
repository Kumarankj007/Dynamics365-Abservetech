"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/core/components/ui/button";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/core/components/ui/accordion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import React from "react";
import { SortableModuleProps } from "@/core/utils/interface";
import SortableLecture from "./SortableLecture";
const SortableModule = ({
  module,
  moduleIndex,
  modules,
  setModules,
  isPreview,
  uploadProgress,
  setUploadProgress = () => {},
  attachmentsProgress,
  setAttachmentsProgress = () => {},
  deleteModule,
  addLecture,
  moveLecture,
  deleteLecture,
  handleLectureDragEnd,
}: SortableModuleProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <AccordionItem
      ref={setNodeRef}
      style={style}
      value={`module-${module.id}`}
      className="border rounded-lg"
    >
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-3 text-left w-full">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="font-medium">
              {module.title || `Module ${moduleIndex + 1}`}
            </div>
            <div className="text-sm text-muted-foreground">
              {module.lectures.length} lecture
              {module.lectures.length !== 1 ? "s" : ""}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {modules.length > 1 && !isPreview && (
              <Button
                asChild
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteModule(module.id);
                }}
                className="h-5 w-5 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-2 h-2" />
              </Button>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Module Title *</Label>
              <Input
                placeholder="e.g., Introduction to Power BI"
                disabled={isPreview}
                value={module.title}
                required
                onChange={(e) => {
                  setModules(
                    modules.map((m) =>
                      m.id === module.id ? { ...m, title: e.target.value } : m
                    )
                  );
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">
                Description (Optional)
              </Label>
              <Input
                placeholder="Brief module description"
                value={module.description}
                disabled={isPreview}
                onChange={(e) => {
                  setModules(
                    modules.map((m) =>
                      m.id === module.id
                        ? { ...m, description: e.target.value }
                        : m
                    )
                  );
                }}
                className="mt-1"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">Lectures</Label>
              {!isPreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addLecture(module.id, moduleIndex)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Lecture
                </Button>
              )}
            </div>

            <DndContext
              sensors={useSensors(
                useSensor(PointerSensor),
                useSensor(KeyboardSensor, {
                  coordinateGetter: sortableKeyboardCoordinates,
                })
              )}
              collisionDetection={closestCenter}
              onDragEnd={(event: any) => handleLectureDragEnd(module.id, event)}
            >
              <SortableContext
                items={module.lectures.map((l) => l.id)}
                strategy={verticalListSortingStrategy}
              >
                <Accordion type="single" collapsible className="space-y-3">
                  {module.lectures.map((lecture, lectureIndex) => (
                    <SortableLecture
                      key={lecture.id}
                      lecture={lecture}
                      isPreview={isPreview}
                      lectureIndex={lectureIndex}
                      moduleId={module.id}
                      module={module}
                      setModules={setModules}
                      moveLecture={moveLecture}
                      deleteLecture={deleteLecture}
                      progress={
                        (uploadProgress as unknown as Record<string, number>)?.[
                          lecture.id
                        ] ?? 0
                      }
                      onProgress={(p: number) =>
                        setUploadProgress((prev: any) => ({
                          ...prev,
                          [lecture.id]: p,
                        }))
                      }
                      attachmentsProgress={
                        (attachmentsProgress as unknown as Record<string, number>)?.[
                          lecture.id
                        ] ?? 0
                      }
                      setAttachmentsProgress={(p: number) =>
                        setAttachmentsProgress((prev: any) => ({
                          ...prev,
                          [lecture.id]: p,
                        }))
                      }
                    />
                  ))}
                </Accordion>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default SortableModule;
