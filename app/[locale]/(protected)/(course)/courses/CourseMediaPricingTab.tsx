"use client";
import React, { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ReactPlayer from "react-player";
import DeleteConfirmModal from "@/components/DeleteModal/DeleteConfirmModal";
import { showToast } from "@/lib/toastSonner";
import CourseButtons from "./CourseButtons/CourseButtons";
import { useVideoUploadMutation } from "@/hooks/Mutations/useVideoUploadMutation";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { APICONSTANT } from "@/services/config";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEditCourseStore } from "@/app/store/useEditCourseStore";

interface CourseMediaPricingTabProps {
  editCourseId?: string | null;
  courseId: string | null;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft?: () => void;
  onNextOnly?: () => void;
}

const subscriptionOption = [
  {
    id: "1_MONTH",
    label: "1 Month Access",
    description: "Short-term access",
    shortDescriptions: "Limited time access",
  },
  {
    id: "6_MONTHS",
    label: "6 Months Access",
    description: "Extended learning period",
    shortDescriptions: "Extended learning period",
  },
  {
    id: "1_YEAR",
    label: "1 Year Access",
    description: "Full year to complete",
    shortDescriptions: "Full year to complete",
  },
  {
    id: "LIFETIME",
    label: "Lifetime Access",
    description: "Permanent access",
    shortDescriptions: "Most popular option",
  },
];

const PricingOptionSchema = yup.object({
  option: yup.string().required(),
  price: yup
    .number()
    .typeError("Enter a valid price")
    .positive("Price must be greater than 0")
    .required("Price is required"),
  description: yup.string().optional(),
});

const CourseMediaSchema = yup.object({
  introVideoUrl: yup.string().required("Intro video is required"),
  introDuration: yup
    .number()
    // .min(1, "Video duration must be greater than 0")
    .required(),
  pricingOptions: yup
    .array(PricingOptionSchema)
    .min(1, "Select at least one pricing option"),
});

type CourseMediaForm = yup.InferType<typeof CourseMediaSchema>;

const CourseMediaPricingTab: React.FC<CourseMediaPricingTabProps> = ({
  editCourseId,
  courseId,
  onNext,
  onSaveDraft,
  onBack,
  onNextOnly,
}) => {
  const { editCourse, fetchEditCourse } = useEditCourseStore();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [controller, setController] = useState<AbortController | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [pricing, setPricing] = useState<{ [key: string]: string }>({});
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [modalAction, setModalAction] = useState<"remove" | "cancel" | null>(
    null
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const mutation = useApiMutation("post");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { mutate: uploadVideo } = useVideoUploadMutation();

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CourseMediaForm>({
    resolver: yupResolver(CourseMediaSchema),
    defaultValues: { introVideoUrl: "", introDuration: 0, pricingOptions: [] },
  });

  // console.log('====================================');
  // console.log(errors);
  // console.log('====================================');

  useEffect(() => {
    const isSameCourse = editCourseId && editCourse?.id && editCourseId === editCourse.id;
    if (isSameCourse && editCourse) {
      const { introVideoUrl, pricingOptions } = editCourse;

      if (introVideoUrl) {
        setVideoUrl(introVideoUrl);
        setValue("introVideoUrl", introVideoUrl);
      }

      if (pricingOptions?.length) {
        const preselected = pricingOptions.map(
          (p: any) =>
            subscriptionOption.find((o) => o.id === p.option)?.label || p.option
        );
        const prepricing: { [key: string]: string } = {};
        pricingOptions.forEach((p: any) => {
          const label =
            subscriptionOption.find((o) => o.id === p.option)?.label ||
            p.option;
          prepricing[label] = String(p.price);
        });
        setSelectedOptions(preselected);
        setPricing(prepricing);
        setValue("pricingOptions", pricingOptions);
      }
    } else {
      // reset({ introVideoUrl: "", introDuration: 0, pricingOptions: [] });
      // setVideoUrl(null);
      // setSelectedOptions([]);
      // setPricing({});
    }
  }, [editCourseId, editCourse, reset, setValue]);

  const openFilePicker = () => fileInputRef.current?.click();

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      showToast.error("Please upload a valid video file!");
      return;
    }

    const videoElement = document.createElement("video");
    videoElement.preload = "metadata";
    videoElement.onloadedmetadata = () => {
      const duration = Math.round(videoElement.duration);
      setValue("introDuration", duration);
      uploadVideoToServer(file);
    };

    videoElement.src = URL.createObjectURL(file);
    setVideoFile(file);
    setPreviewUrl(videoElement.src);
    setIsDirty(true);
  };

  const uploadVideoToServer = (file: File) => {
    const newController = new AbortController();
    setController(newController);
    setUploading(true);
    setUploadProgress(0);

    uploadVideo(
      {
        file,
        onUploadProgress: (progress) => setUploadProgress(progress),
        controller: newController,
      },
      {
        onSuccess: async (res) => {
          const uploadedUrl =
            typeof res?.data === "string"
              ? res.data
              : (res?.data as unknown as string) || "";
          if (!uploadedUrl) {
            setUploading(false);
            return;
          }

          setVideoUrl(uploadedUrl);
          setValue("introVideoUrl", uploadedUrl, { shouldValidate: true });
          setUploadProgress(100);
          setUploading(false);
          setIsDirty(true);
        },
        onError: () => {
          setUploadProgress(0);
          setUploading(false);
        },
        onSettled: () => setController(null),
      }
    );
  };

  const cancelUpload = () => {
    controller?.abort();
    setUploading(false);
    setUploadProgress(0);
    setVideoFile(null);
    setPreviewUrl(null);
  };

  const removeVideo = () => {
    setVideoFile(null);
    setPreviewUrl(null);
    setVideoUrl(null);
    setUploadProgress(0);
    setValue("introVideoUrl", "");
    setValue("introDuration", 0);
    setIsDirty(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSelectOption = (title: string) => {
    setSelectedOptions((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
    setIsDirty(true);
  };

  const handlePriceChange = (title: string, value: string) => {
    setPricing((prev) => ({ ...prev, [title]: value }));
    setIsDirty(true);
  };

  useEffect(() => {
    const pricingPayload = selectedOptions.map((title) => {
      const opt = subscriptionOption.find((o) => o.label === title);
      return {
        option: opt?.id || title.toUpperCase(),
        price: Number(pricing[title] || 0),
        description: opt?.description || "",
      };
    });

    setValue("pricingOptions", pricingPayload);
  }, [selectedOptions, pricing, setValue]);

  const onSubmit = async (data: CourseMediaForm) => {
    // console.log("object")
    if (uploading) {
      showToast.error("Please wait until video upload completes.");
      return;
    }

    if (isPublished && !isDirty) {
      showToast.info("No changes detected. Course already published!");
      return;
    }

    try {
      setIsLoading(true);
      const response = await mutation.mutateAsync({
        url: { apiUrl: APICONSTANT.CREATE_COURSE_PRICING + `/${courseId}` },
        body: data,
      });

      if (response?.status === true) {
        if(response?.data?.id) fetchEditCourse(response?.data?.id);
        // setIsPublished(true);
        setIsDirty(false);
        onNext();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const playerUrl = videoUrl || previewUrl;

  return (
    <div>
      <form className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Intro Video * (Course Preview)</h3>
          <p className="text-gray-600">
            This video will be shown on the course detail page.
          </p>

          <div
            className={`relative border-2 border-dashed rounded-lg px-6 py-8 flex flex-col items-center justify-center cursor-pointer ${errors.introVideoUrl ? "border-red-500" : "border-gray-300"
              }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center justify-center py-10 w-full">
                <div className="relative flex items-center justify-center w-20 h-20">
                  <div className="w-20 h-20 border-4 border-t-white border-gray-400 rounded-full animate-spin"></div>
                  <span className="absolute text-sm font-semibold">
                    {uploadProgress}%
                  </span>
                </div>
                <p className="mt-3 text-sm text-gray-600">Uploading Video...</p>
                <Button
                  type="button"
                  className="mt-3"
                  onClick={() => {
                    setModalAction("cancel");
                    setShowCancelModal(true);
                  }}
                >
                  Cancel Upload
                </Button>
              </div>
            ) : playerUrl ? (
              <div className="w-full space-y-4">
                <div className="relative w-full rounded-lg overflow-hidden bg-black">
                  <ReactPlayer
                    src={playerUrl}
                    controls
                    width="100%"
                    height="400px"
                    muted
                    playsInline
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                  <Button variant="outline" type="button" onClick={openFilePicker}>
                    Replace Video
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setModalAction("remove");
                      setShowCancelModal(true);
                    }}
                  >
                    Remove Video
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="flex flex-col items-center"
                onClick={openFilePicker}
              >
                <Upload size={32} className="text-gray-500 mb-2" />
                <p className="text-gray-600 font-medium">
                  Upload Your Course Intro Video
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  Upload a compelling intro video that showcases your course.
                </p>
                <Button type="button" variant="outline">
                  Choose Video File
                </Button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoUpload}
            />
          </div>
          {errors.introVideoUrl && (
            <p className="text-red-500 text-sm mt-2">
              {errors.introVideoUrl.message}
            </p>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold">Pricing Options *</h3>
          <p className="text-gray-600">Select pricing models for your course.</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {subscriptionOption.map((option) => (
              <Card key={option.label} className="flex items-start gap-3 p-4">
                <Checkbox
                  checked={selectedOptions.includes(option.label)}
                  onCheckedChange={() => handleSelectOption(option.label)}
                />
                <div>
                  <h4 className="font-semibold">{option.label}</h4>
                  <p className="text-gray-500 text-sm">
                    {option.shortDescriptions}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {errors.pricingOptions && (
            <p className="text-red-500 text-sm mt-2">
              {errors.pricingOptions.message}
            </p>
          )}

          {selectedOptions.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {selectedOptions.map((title, index) => (
                <Card key={title} className="p-4">
                  <h4 className="font-semibold">{title}</h4>
                  <p className="text-gray-500 text-sm">
                    {
                      subscriptionOption.find((o) => o.label === title)
                        ?.description
                    }
                  </p>
                  <Input
                    type="number"
                    min="1"
                    placeholder="$ 0"
                    value={pricing[title] || ""}
                    onChange={(e) => handlePriceChange(title, e.target.value)}
                    className={`mt-4 ${errors.pricingOptions?.[index]?.price
                        ? "border-red-500"
                        : ""
                      }`}
                  />
                  {errors.pricingOptions?.[index]?.price && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.pricingOptions[index]?.price?.message}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </form>

      <CourseButtons
        onNext={handleSubmit(onSubmit)}
        nextLabel={
          isLoading
            ? "Processing..."
            : "Save Media & Pricing"
        }
        isLoading={isLoading}
        isNextDisabled={isPublished && !isDirty}
        // isNextDisabled={false}
        onBack={onBack}
        onNextOnly={onNextOnly}
      />

      {/* {isPublished && !isDirty && (
        <p className="text-green-600 text-sm text-center mt-2">
          All changes saved. Edit something to republish.
        </p>
      )} */}

      <DeleteConfirmModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => {
          if (modalAction === "remove") removeVideo();
          if (modalAction === "cancel") cancelUpload();
          setShowCancelModal(false);
          setModalAction(null);
        }}
        title={modalAction === "remove" ? "Remove Video" : "Cancel Upload"}
        description={
          modalAction === "remove"
            ? "Are you sure you want to remove this video? This action cannot be undone."
            : "Are you sure you want to cancel this upload? The progress will be lost."
        }
        confirmText={modalAction === "remove" ? "Remove" : "Cancel Upload"}
        cancelText="Close"
      />
    </div>
  );
};

export default CourseMediaPricingTab;