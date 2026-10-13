"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Textarea } from "@/core/components/ui/textarea";
import { Badge } from "@/core/components/ui/badge";
import { Checkbox } from "@/core/components/ui/checkbox";
// import { RadioGroup, RadioGroupItem } from "@/core/components/ui/radio-group";
import {
  ChevronLeft,
  Save,
  Send,
  Plus,
  Trash2,
  Upload,
  HelpCircle,
  GripVertical,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/core/components/ui/tabs";
import { Label } from "@/core/components/ui/label";
// import { Progress } from "@/core/components/ui/progress";
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import UseLoadingRouter from "@/core/hooks/useLoadRoute";
import useSnackbarStore from "@/core/store/toaster";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import APICONSTANT from "@/core/utils/ApiConstant";
import { Request } from "@/core/utils/apiTools";

// Sortable Module Component
interface Module {
  id: number;
  title: string;
  description: string;
  lectures: {
    id: number;
    title: string;
    description: string;
    type: string;
    videoFile: File | null;
    embedUrl: string;
    resources: any[];
  }[];
}

interface SortableModuleProps {
  module: Module;
  moduleIndex: number;
  modules: Module[];
  setModules: any;
  moveModule: (moduleId: number, direction: string) => void;
  deleteModule: (moduleId: number) => void;
  addLecture: (moduleId: number) => void;
  moveLecture: (moduleId: number, lectureId: number, direction: string) => void;
  deleteLecture: (moduleId: number, lectureId: number) => void;
  handleLectureDragEnd: (moduleId: number, event: any) => void;
}

const SortableModule = ({
  module,
  moduleIndex,
  modules,
  setModules,
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
            {modules.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteModule(module.id);
                }}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
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
                value={module.title}
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => addLecture(module.id)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Lecture
              </Button>
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
                      lectureIndex={lectureIndex}
                      moduleId={module.id}
                      module={module}
                      moveLecture={moveLecture}
                      deleteLecture={deleteLecture}
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

// Sortable Lecture Component
interface Lecture {
  id: number;
  title: string;
  description: string;
  type: string;
  videoFile: File | null;
  embedUrl: string;
  resources: any[];
}

interface SortableLectureProps {
  lecture: Lecture;
  lectureIndex: number;
  moduleId: number;
  module: any;
  moveLecture: (moduleId: number, lectureId: number, direction: string) => void;
  deleteLecture: (moduleId: number, lectureId: number) => void;
}

const SortableLecture = ({
  lecture,
  lectureIndex,
  moduleId,
  module,
  deleteLecture,
}: SortableLectureProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: lecture.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <AccordionItem
      ref={setNodeRef}
      style={style}
      value={`lecture-${lecture.id}`}
      className="border rounded bg-muted/30"
    >
      <AccordionTrigger className="px-3 py-2 hover:no-underline">
        <div className="flex items-center gap-2 text-left w-full">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-3 h-3 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">
              {lecture.title || `Lecture ${lectureIndex + 1}`}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {module.lectures.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteLecture(moduleId, lecture.id);
                }}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-3 pb-3">
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium">Lecture Title *</Label>
              <Input
                placeholder={`Lecture ${lectureIndex + 1}`}
                value={lecture.title}
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Content Type</Label>
              <Select defaultValue="video">
                <SelectTrigger className="mt-1 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Upload Video</SelectItem>
                  <SelectItem value="embed">Embed Link</SelectItem>
                  <SelectItem value="reading">Reading Material</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <Label className="text-xs font-medium">Video Upload</Label>
              <div className="mt-1 border-2 border-dashed border-muted-foreground/25 rounded-lg p-3 text-center hover:border-primary/50 transition-colors">
                <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                <p className="text-xs text-muted-foreground mb-1">
                  Drag and drop your video file, or click to browse
                </p>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Choose File
                </Button>
              </div>
            </div>

            <div className="text-center text-muted-foreground text-xs">or</div>

            <div>
              <Label className="text-xs font-medium">External Video Link</Label>
              <Input
                placeholder="https://youtube.com/watch?v=..."
                className="mt-1 h-8 text-sm"
              />
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

const CreateCourse = () => {
  // const { id } = useParams(); // Get course ID for edit mode
  const pathname = usePathname(); // Get current location
  const router = UseLoadingRouter();
  const isEditMode = pathname.includes("/edit-course/"); // Detect edit mode

  const [activeTab, setActiveTab] = useState("course-title");
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const [courseData, setCourseData] = useState<any>({
    id: "gfdgfd",
    title: "",
    learningOutcomes: ["", "", "", ""],
    modules: [],
    description: "",
    duration: "",
    category: "",
    subcategory: "",
    tags: [],
    introVideo: null,
    pricingOptions: [],
    oneMonthPrice: "",
    sixMonthPrice: "",
    oneYearPrice: "",
    lifetimePrice: "",
  });

  const apiCall = async (data: any) => {
    return await Request(APICONSTANT.addTitle, "POST", data);
  };
  const { trigger } = useCustomMutation(apiCall, {
    onSuccessCallback: (data: any) => {
      // console.log(data, "data");
      if (data?.success) {
        setCourseData({...courseData, id:data?.data?.id});
        // router.push("/login");
      }
    },
  });

  // Course configuration data - matches admin catalog config
  const courseConfig = {
    categories: [
      {
        id: 1,
        name: "Finance & Operations",
        enabled: true,
        subcategories: [
          { id: 101, name: "Trade", enabled: true },
          { id: 102, name: "Production", enabled: true },
          { id: 103, name: "Warehouse", enabled: true },
          { id: 104, name: "Asset Leasing", enabled: true },
          { id: 105, name: "Project Accounting", enabled: true },
          { id: 106, name: "Taxation", enabled: false },
          { id: 107, name: "Other", enabled: true },
        ],
      },
      {
        id: 2,
        name: "Supply Chain Management",
        enabled: true,
        subcategories: [
          { id: 201, name: "Procurement", enabled: true },
          { id: 202, name: "Inventory", enabled: true },
          { id: 203, name: "Planning", enabled: true },
          { id: 204, name: "Transportation", enabled: true },
          { id: 205, name: "Distribution", enabled: true },
          { id: 206, name: "Other", enabled: true },
        ],
      },
      {
        id: 3,
        name: "Customer Engagement (CRM)",
        enabled: true,
        subcategories: [
          { id: 301, name: "Sales", enabled: true },
          { id: 302, name: "Customer Service", enabled: true },
          { id: 303, name: "Marketing", enabled: true },
          { id: 304, name: "Field Service", enabled: true },
          { id: 305, name: "Project Ops (CRM)", enabled: true },
          { id: 306, name: "Other", enabled: true },
        ],
      },
      {
        id: 4,
        name: "Power Platform",
        enabled: true,
        subcategories: [
          { id: 401, name: "Power BI", enabled: true },
          { id: 402, name: "Power Apps", enabled: true },
          { id: 403, name: "Power Automate", enabled: true },
          { id: 404, name: "Power Pages", enabled: true },
          { id: 405, name: "Dataverse", enabled: true },
          { id: 406, name: "Other", enabled: true },
        ],
      },
    ],
    durationBands: [
      { id: 1, name: "< 5 hours", enabled: true },
      { id: 2, name: "5 – 20 hours", enabled: true },
      { id: 3, name: "20 – 50 hours", enabled: true },
      { id: 4, name: "50+ hours", enabled: true },
    ],
  };

  // Get enabled categories and subcategories
  const enabledCategories = courseConfig.categories.filter(
    (cat) => cat.enabled
  );
  const getEnabledSubcategories = (categoryName: string) => {
    const category = courseConfig.categories.find(
      (cat) => cat.name === categoryName
    );
    return category ? category.subcategories.filter((sub) => sub.enabled) : [];
  };
  const enabledDurations = courseConfig.durationBands.filter(
    (duration) => duration.enabled
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [modules, setModules] = useState([
    {
      id: 1,
      title: "",
      description: "",
      lectures: [
        {
          id: 1,
          title: "",
          description: "",
          type: "video",
          videoFile: null,
          embedUrl: "",
          resources: [],
        },
      ],
    },
  ]);

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

  const addModule = () => {
    const newModule = {
      id: Date.now(),
      title: "",
      description: "",
      lectures: [
        {
          id: Date.now(),
          title: "",
          description: "",
          type: "video",
          videoFile: null,
          embedUrl: "",
          resources: [],
        },
      ],
    };
    setModules([...modules, newModule]);
  };

  const addLecture = (moduleId: number) => {
    setModules(
      modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lectures: [
                ...module.lectures,
                {
                  id: Date.now(),
                  title: "",
                  description: "",
                  type: "video",
                  videoFile: null,
                  embedUrl: "",
                  resources: [],
                },
              ],
            }
          : module
      )
    );
  };

  const updateLearningOutcome = (index: number, value: string) => {
    const newOutcomes = [...courseData.learningOutcomes];
    newOutcomes[index] = value;
    setCourseData({ ...courseData, learningOutcomes: newOutcomes });
  };

  const addLearningOutcome = () => {
    if (courseData.learningOutcomes.length < 6) {
      setCourseData({
        ...courseData,
        learningOutcomes: [...courseData.learningOutcomes, ""],
      });
    }
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

  const handleTabNavigation = (direction: string) => {
    const tabs = [
      "course-title",
      "what-youll-learn",
      "curriculum",
      "course-description",
      "pricing-media",
    ];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex == 0 && courseData?.title != "") {
      trigger({
        title: courseData?.title,
      });
    }
    if (
      direction === "next" &&
      currentIndex < tabs.length - 1 &&
      courseData?.id != ""
    ) {
      setActiveTab(tabs[currentIndex + 1]);
    } else if (direction === "prev" && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const isLastTab = activeTab === "pricing-media";
  const isFirstTab = activeTab === "course-title";

  // Back button should only be disabled on first tab when NOT in edit mode
  const isBackDisabled = isFirstTab && !isEditMode;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 bg-background min-h-screen">
      {/* Header */}
      <div className="text-center space-y-2 pt-8">
        <h1 className="text-3xl font-bold text-foreground">
          {isEditMode ? "Edit Course" : "Create New Course"}
        </h1>
        <p className="text-muted-foreground">
          {isEditMode
            ? "Update your course content and settings"
            : "Create your course step by step with our guided wizard"}
        </p>
      </div>

      {/* Main Content Card */}
      <Card className="bg-card border shadow-card">
        <CardContent className="p-0">
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              if (courseData?.id != "") {
                setActiveTab(value);
              } else {
                showSnackbar("Fill the course title", "info");
              }
            }}
            className="w-full"
          >
            {/* Modern Flat Tabs */}
            <TabsList className="grid w-full grid-cols-5 bg-muted/30 rounded-none border-b h-auto p-0">
              <TabsTrigger
                value="course-title"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary py-4 px-6 text-sm font-medium transition-colors hover:text-primary/80"
              >
                Course Title
              </TabsTrigger>
              <TabsTrigger
                value="what-youll-learn"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary py-4 px-6 text-sm font-medium transition-colors hover:text-primary/80"
              >
                What You&apos;ll Learn
              </TabsTrigger>
              <TabsTrigger
                value="curriculum"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary py-4 px-6 text-sm font-medium transition-colors hover:text-primary/80"
              >
                Curriculum
              </TabsTrigger>
              <TabsTrigger
                value="course-description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary py-4 px-6 text-sm font-medium transition-colors hover:text-primary/80"
              >
                Course Description
              </TabsTrigger>
              <TabsTrigger
                value="pricing-media"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary py-4 px-6 text-sm font-medium transition-colors hover:text-primary/80"
              >
                Pricing & Media
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <div className="p-8">
              {/* Tab 1: Course Title */}
              <TabsContent value="course-title" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="course-title"
                      className="text-base font-medium text-foreground"
                    >
                      Course Title *
                    </Label>
                    <Input
                      id="course-title"
                      placeholder="e.g., Master Power BI Dashboard Creation"
                      value={courseData.title}
                      onChange={(e) =>
                        setCourseData({ ...courseData, title: e.target.value })
                      }
                      className="mt-2 h-12 text-base"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Choose a name that succinctly describes your course.
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: What You'll Learn */}
              <TabsContent value="what-youll-learn" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium text-foreground">
                      Learning Outcomes *
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                      Add 4–6 clear learning outcomes. These will appear in the
                      Course Info tab for students.
                    </p>

                    <div className="space-y-3">
                      {courseData.learningOutcomes.map(
                        (outcome: any, index: number) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                              {index + 1}
                            </div>
                            <Input
                              placeholder={`Learning outcome ${index + 1}`}
                              value={outcome}
                              onChange={(e) =>
                                updateLearningOutcome(index, e.target.value)
                              }
                              className="flex-1 h-11"
                            />
                            {courseData.learningOutcomes.length > 4 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLearningOutcome(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        )
                      )}
                    </div>

                    {courseData.learningOutcomes.length < 6 && (
                      <Button
                        variant="outline"
                        onClick={addLearningOutcome}
                        className="mt-4 w-full border-dashed"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Learning Outcome
                      </Button>
                    )}

                    {courseData.learningOutcomes.length % 2 !== 0 &&
                      courseData.learningOutcomes.length >= 4 && (
                        <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                          <HelpCircle className="w-4 h-4 inline mr-1" />
                          Please add one more outcome to keep an even number of
                          points.
                        </p>
                      )}
                  </div>
                </div>
              </TabsContent>

              {/* Tab 3: Curriculum */}
              <TabsContent value="curriculum" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium text-foreground">
                      Course Curriculum
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1 mb-6">
                      Build your course structure with modules and lectures. Use
                      drag handles or arrow buttons to reorder items.
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
                      <Accordion
                        type="single"
                        collapsible
                        className="space-y-4"
                      >
                        {modules.map((module, moduleIndex) => (
                          <SortableModule
                            key={module.id}
                            module={module}
                            moduleIndex={moduleIndex}
                            modules={modules}
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

                  <Button
                    variant="outline"
                    onClick={addModule}
                    className="w-full border-dashed"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Module
                  </Button>
                </div>
              </TabsContent>

              {/* Tab 4: Course Description */}
              <TabsContent
                value="course-description"
                className="mt-0 space-y-8"
              >
                {/* Course Description */}
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="description"
                      className="text-base font-medium text-foreground"
                    >
                      Course Description *
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                      Write a compelling description that highlights what
                      students will learn and achieve. This appears on course
                      cards and must be approved by admin.
                    </p>
                    <Textarea
                      id="description"
                      placeholder="Example: Master the Power Platform with this complete course covering Canvas apps, Model-Driven apps, and Dataverse. From basic controls to advanced app building, you'll learn everything hands-on with real-world project scenarios."
                      value={courseData.description}
                      onChange={(e) =>
                        setCourseData({
                          ...courseData,
                          description: e.target.value,
                        })
                      }
                      className="min-h-[120px]"
                      maxLength={200}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-muted-foreground">
                        Keep it concise and engaging for course listings.
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {courseData.description.length}/200
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
                      value={courseData.duration}
                      onValueChange={(value) =>
                        setCourseData({ ...courseData, duration: value })
                      }
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {enabledDurations.map((duration) => (
                          <SelectItem key={duration.id} value={duration.name}>
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
                      value={courseData.category}
                      onValueChange={(value) =>
                        setCourseData({
                          ...courseData,
                          category: value,
                          subcategory: "",
                        })
                      }
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {enabledCategories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
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
                      Select a more specific area within {courseData.category}.
                    </p>
                    <Select
                      value={courseData.subcategory}
                      onValueChange={(value) =>
                        setCourseData({ ...courseData, subcategory: value })
                      }
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {getEnabledSubcategories(courseData.category).map(
                          (subcategory) => (
                            <SelectItem
                              key={subcategory.id}
                              value={subcategory.name}
                            >
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
                    Add tags to help students discover your course. Choose from
                    suggested tags or add your own.
                  </p>

                  {/* Suggested Tags */}
                  <div className="mb-4">
                    <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Suggested Tags
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Dynamics365",
                        "ERP",
                        "CRM",
                        "F&O",
                        "PowerBI",
                        "Finance",
                        "SupplyChain",
                        "ProjectOps",
                        "HR",
                        "AI",
                        "PowerApps",
                        "PowerAutomate",
                        "BusinessCentral",
                        "CustomerService",
                        "Sales",
                      ].map((tag) => (
                        <Button
                          key={tag}
                          variant={
                            courseData.tags.includes(tag)
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => {
                            const updatedTags = courseData.tags.includes(tag)
                              ? courseData.tags.filter((t: any) => t !== tag)
                              : [...courseData.tags, tag];
                            setCourseData({ ...courseData, tags: updatedTags });
                          }}
                          className="h-8 text-xs"
                        >
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Tags Input */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Custom Tags
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add custom tag..."
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const target = e.target as HTMLInputElement;
                            const value = target.value.trim();
                            if (value && !courseData.tags.includes(value)) {
                              setCourseData({
                                ...courseData,
                                tags: [...courseData.tags, value],
                              });
                              target.value = "";
                            }
                          }
                        }}
                        className="flex-1"
                      />
                    </div>

                    {/* Selected Tags */}
                    {courseData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 p-3 bg-muted/30 rounded-lg">
                        {courseData.tags.map((tag: any, index: number) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {tag}
                            <Button
                              variant="ghost"
                              size="sm"
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
              </TabsContent>

              {/* Tab 5: Pricing & Media */}
              <TabsContent value="pricing-media" className="mt-0 space-y-8">
                {/* Intro Video Section */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium text-foreground">
                      Intro Video * (Course Preview)
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                      This is the only hero video for the course detail page.
                      Students will see this as a preview.
                    </p>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        Upload Your Course Intro Video
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload a compelling intro video that showcases your
                        course content
                      </p>
                      <Button>
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Video File
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium text-foreground">
                      Pricing Options *
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1 mb-6">
                      Select which pricing options to offer for your course.
                      Students can choose the option that works best for them.
                    </p>
                  </div>

                  {/* Pricing Options Selection */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-foreground">
                      Available Access Options
                    </Label>
                    <div className="space-y-3">
                      {[
                        {
                          id: "1month",
                          label: "1 Month Access",
                          description: "Short-term access",
                        },
                        {
                          id: "6months",
                          label: "6 Months Access",
                          description: "Extended learning period",
                        },
                        {
                          id: "1year",
                          label: "1 Year Access",
                          description: "Full year to complete",
                        },
                        {
                          id: "lifetime",
                          label: "Lifetime Access",
                          description: "Permanent access",
                        },
                      ].map((option) => {
                        return (
                          <div
                            key={option.id}
                            className="flex items-center space-x-3 p-3 border rounded-lg"
                          >
                            <Checkbox
                              checked={courseData.pricingOptions.includes(
                                option.id
                              )}
                              onCheckedChange={(checked) => {
                                const updatedOptions = checked
                                  ? [...courseData.pricingOptions, option.id]
                                  : courseData.pricingOptions.filter(
                                      (opt: any) => opt !== option.id
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

                  {/* Pricing Inputs Grid */}
                  {courseData.pricingOptions.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {courseData.pricingOptions.includes("1month") && (
                        <Card className="border-2 hover:border-primary/50 transition-colors">
                          <CardHeader className="text-center pb-4">
                            <CardTitle className="text-base">
                              1 Month Access
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                              Limited time access
                            </p>
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
                                  value={courseData.oneMonthPrice}
                                  onChange={(e) =>
                                    setCourseData({
                                      ...courseData,
                                      oneMonthPrice: e.target.value,
                                    })
                                  }
                                  className="pl-8"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {courseData.pricingOptions.includes("6months") && (
                        <Card className="border-2 hover:border-primary/50 transition-colors">
                          <CardHeader className="text-center pb-4">
                            <CardTitle className="text-base">
                              6 Months Access
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                              Extended learning period
                            </p>
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
                                  placeholder="99"
                                  value={courseData.sixMonthPrice}
                                  onChange={(e) =>
                                    setCourseData({
                                      ...courseData,
                                      sixMonthPrice: e.target.value,
                                    })
                                  }
                                  className="pl-8"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {courseData.pricingOptions.includes("1year") && (
                        <Card className="border-2 hover:border-primary/50 transition-colors">
                          <CardHeader className="text-center pb-4">
                            <CardTitle className="text-base">
                              1 Year Access
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                              Full year to complete
                            </p>
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
                                  placeholder="129"
                                  value={courseData.oneYearPrice}
                                  onChange={(e) =>
                                    setCourseData({
                                      ...courseData,
                                      oneYearPrice: e.target.value,
                                    })
                                  }
                                  className="pl-8"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {courseData.pricingOptions.includes("lifetime") && (
                        <Card className="border-2 border-primary/30 hover:border-primary/50 transition-colors bg-primary/5">
                          <CardHeader className="text-center pb-4">
                            <div className="flex items-center justify-center gap-1 mb-2">
                              <CardTitle className="text-base">
                                Lifetime Access
                              </CardTitle>
                              <Badge variant="default" className="text-xs">
                                Popular
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Most popular option
                            </p>
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
                                  placeholder="149"
                                  value={courseData.lifetimePrice}
                                  onChange={(e) =>
                                    setCourseData({
                                      ...courseData,
                                      lifetimePrice: e.target.value,
                                    })
                                  }
                                  className="pl-8"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
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
                          • Courses 50+ hours → eligible for 1 Month, 6 Months,
                          1 Year
                        </li>
                        <li>
                          • Courses 20–50 hours → eligible for 6 Months, 1 Year
                        </li>
                        <li>
                          • Courses under 20 hours → recommended for Lifetime
                          only
                        </li>
                        <li>• Admin reserves right to adjust eligibility</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Navigation Footer */}
      <Card className="border-t bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => {
                if (isFirstTab && isEditMode) {
                  // Navigate back to manage courses when in edit mode
                  router?.push("/instructor/courses");
                } else {
                  // Normal tab navigation
                  handleTabNavigation("prev");
                }
              }}
              disabled={isBackDisabled}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="flex items-center gap-3">
              <Button variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>

              {isLastTab ? (
                <Button>
                  <Send className="w-4 h-4 mr-2" />
                  Review & Submit
                </Button>
              ) : (
                <Button onClick={() => handleTabNavigation("next")}>
                  Continue
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCourse;
