// "use client";
// import React, { useState, useRef } from "react";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Card } from "@/components/ui/card";
// import { Upload } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress";
// import CourseButtons from "./CourseButtons";
// import { useVideoUploadMutation } from "@/hooks/Mutations/useVideoUploadMutation";
// import ReactPlayer from "react-player";
// import DeleteConfirmModal from "@/components/DeleteModal/DeleteConfirmModal";
// import { showToast } from "@/lib/toastSonner";
// interface CourseMediaPricingTabProps {
//   onBack: () => void;
//   onPublish: () => void;
//   onSaveDraft?: () => void;
// }

// const AccessOptions = [
//   { title: "1 Month Access", description: "Short-term access" },
//   { title: "6 Months Access", description: "Extended learning period" },
//   { title: "1 Year Access", description: "Full year to complete" },
//   { title: "Lifetime Access", description: "Permanent access" },
// ];

// const CourseMediaPricingTab: React.FC<CourseMediaPricingTabProps> = ({
//   onBack,
//   onPublish,
//   onSaveDraft,
// }) => {
//   const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
//   const [pricing, setPricing] = useState<{ [key: string]: string }>({});

//   // Video states
//   const [videoFile, setVideoFile] = useState<File | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//   const [videoUrl, setVideoUrl] = useState<string | null>(null);

//   // Upload states
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [controller, setController] = useState<AbortController | null>(null);

//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [modalAction, setModalAction] = useState<"remove" | "cancel" | null>(null);

//   const fileInputRef = useRef<HTMLInputElement | null>(null);

//   const { mutate: uploadVideo } = useVideoUploadMutation();

//   const handleSelectOption = (title: string) => {
//     setSelectedOptions((prev) =>
//       prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
//     );
//   };

//   const handlePriceChange = (title: string, value: string) => {
//     setPricing((prev) => ({ ...prev, [title]: value }));
//   };

//   const openFilePicker = () => fileInputRef.current?.click();

//   const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (!file.type.startsWith("video/")) {
//       showToast.error("Please upload a valid video file!");
//       return;
//     }

//     setVideoFile(file);
//     setPreviewUrl(URL.createObjectURL(file));
//     uploadVideoToServer(file);
//   };

//   const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     const file = e.dataTransfer.files?.[0];
//     if (file) {
//       handleVideoUpload({ target: { files: [file] } } as any);
//     }
//   };

//   const uploadVideoToServer = (file: File) => {
//     const newController = new AbortController();
//     setController(newController);
//     setUploading(true);
//     setUploadProgress(0);

//     uploadVideo(
//       {
//         file,
//         onUploadProgress: (progress) => setUploadProgress(progress),
//         controller: newController,
//       },
//       {
//         onSuccess: (response) => {
//           setVideoUrl(response?.data?.url || "");
//           setUploadProgress(100);
//         },
//         onError: (error) => {
//           console.error("Video upload failed:", error);
//           setUploadProgress(0);
//           // alert("Video upload failed!");
//         },
//         onSettled: () => {
//           setUploading(false);
//           setController(null);
//         },
//       }
//     );
//   };

//   const cancelUpload = () => {
//     controller?.abort();
//     setUploading(false);
//     setUploadProgress(0);
//     setVideoFile(null);
//     setPreviewUrl(null);
//   };

//   const removeVideo = () => {
//     setVideoFile(null);
//     setPreviewUrl(null);
//     setVideoUrl(null);
//     setUploadProgress(0);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <h3 className="text-lg font-semibold">Intro Video * (Course Preview)</h3>
//         <p className="text-gray-600">
//           This video will be shown on the course detail page as a preview.
//         </p>

//         <div
//           onDrop={handleDrop}
//           onDragOver={(e) => e.preventDefault()}
//           className="relative border-2 border-dashed border-gray-300 dark:border-default-300 w-full px-6 py-8 flex flex-col items-center justify-center rounded-lg cursor-pointer"
//         >
//           {previewUrl ? (
//             <div className="w-full space-y-4">
//               <div className="relative w-full rounded-lg overflow-hidden bg-black">
//                 <ReactPlayer
//                   src={videoUrl || previewUrl}
//                   controls={uploadProgress === 100}
//                   playing={false}
//                   width="100%"
//                   height="400px"
//                   muted
//                   playsInline
//                   style={{
//                     borderRadius: "8px",
//                     overflow: "hidden",
//                     pointerEvents: uploading ? "none" : "auto",
//                     opacity: uploading ? 0.5 : 1,
//                     transition: "opacity 0.3s ease",
//                   }}
//                 />

//                 {uploading && (
//                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 text-white">
//                     <div className="relative flex items-center justify-center w-20 h-20">
//                       <div className="w-20 h-20 border-4 border-t-white border-gray-400 rounded-full animate-spin"></div>
//                       <span className="absolute text-sm font-semibold">{uploadProgress}%</span>
//                     </div>
//                     <p className="mt-3 text-sm">Uploading Video...</p>
//                     <Button onClick={() => { setModalAction("cancel"); setShowCancelModal(true); }}>Cancel Upload</Button>
//                   </div>
//                 )}
//               </div>

//               {!uploading && (
//                 <div className="flex flex-col md:flex-row gap-3">
//                   <Button variant="outline" onClick={openFilePicker}>
//                     Replace Video
//                   </Button>
//                   <Button onClick={() => { setModalAction("remove"); setShowCancelModal(true); }}>Remove Video</Button>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="flex flex-col items-center">
//               <Upload size={32} className="text-gray-500 mb-2" />
//               <p className="text-gray-600 font-medium">
//                 Upload Your Course Intro Video
//               </p>
//               <p className="text-gray-500 text-sm mb-4">
//                 Upload a compelling intro video that showcases your content.
//               </p>
//               <Button type="button" variant="outline" onClick={openFilePicker}>
//                 Choose Video File
//               </Button>
//             </div>
//           )}

//           <input
//             ref={fileInputRef}
//             type="file"
//             accept="video/*"
//             className="hidden"
//             onChange={handleVideoUpload}
//           />
//         </div>

//         {uploading && (
//           <div className="mt-4">
//             <Progress value={uploadProgress} className="h-2" />
//             <p className="text-center text-sm text-gray-500 mt-1">
//               Uploading... {uploadProgress}%
//             </p>
//           </div>
//         )}
//       </div>

//       <div>
//         <h3 className="text-lg font-semibold">Pricing Options *</h3>
//         <p className="text-gray-600">
//           Select the pricing models students can choose from.
//         </p>
//       </div>

//       <div>
//         <h4 className="text-md font-semibold mb-4">Available Access Options</h4>
//         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
//           {AccessOptions.map((option, index) => (
//             <Card key={index} className="flex items-start gap-3 p-4">
//               <Checkbox
//                 checked={selectedOptions.includes(option.title)}
//                 onCheckedChange={() => handleSelectOption(option.title)}
//               />
//               <div>
//                 <h4 className="font-semibold">{option.title}</h4>
//                 <p className="text-gray-500 text-sm">{option.description}</p>
//               </div>
//             </Card>
//           ))}
//         </div>
//       </div>

//       {selectedOptions.length > 0 && (
//         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
//           {selectedOptions.map((title, index) => (
//             <Card key={index} className="p-4">
//               <h4 className="font-semibold">{title}</h4>
//               <p className="text-gray-500 text-sm">
//                 {AccessOptions.find((o) => o.title === title)?.description}
//               </p>
//               <Input
//                 type="number"
//                 placeholder="$ 0"
//                 value={pricing[title] || ""}
//                 onChange={(e) => handlePriceChange(title, e.target.value)}
//                 className="mt-4"
//               />
//             </Card>
//           ))}
//         </div>
//       )}

//       <CourseButtons
//         onBack={onBack}
//         onNext={onPublish}
//         onSaveDraft={onSaveDraft}
//         nextLabel="Publish Course"
//       />

//       <DeleteConfirmModal
//         open={showCancelModal}
//         onClose={() => setShowCancelModal(false)}
//         onConfirm={() => {
//           if (modalAction === "remove") removeVideo();
//           if (modalAction === "cancel") cancelUpload();
//           setShowCancelModal(false);
//           setModalAction(null);
//         }}
//         title={modalAction === "remove" ? "Remove Video" : "Cancel Upload"}
//         description={
//           modalAction === "remove"
//             ? "Are you sure you want to remove this video? This action cannot be undone."
//             : "Are you sure you want to cancel this upload? The progress will be lost."
//         }
//         confirmText={modalAction === "remove" ? "Remove" : "Cancel Upload"}
//         cancelText="Close"
//       />
//     </div>
//   );
// };

// export default CourseMediaPricingTab;


// const uploadVideoToServer = async (file: File) => {
//   const newController = new AbortController();
//   setController(newController);
//   setUploading(true);
//   setUploadProgress(0);

//   try {
//     type UploadResponse = { data?: { url?: string } };
//     const res = (await postVideoMethod(
//       APICONSTANT.UPLOAD_VIDEO,
//       file,
//       (progress) => setUploadProgress(progress),
//       newController
//     )) as UploadResponse;

//     setVideoUrl(res?.data?.url || "");
//     setUploadProgress(100);
//   } catch (error: any) {
//     // @ts-ignore
//     if (axios.isCancel && axios.isCancel(error)) {
//       console.log("Upload canceled");
//     } else {
//       console.error("Upload failed:", error);
//       alert("Video upload failed!");
//     }
//   } finally {
//     setUploading(false);
//     setController(null);
//   }
// };

{/* <div className="relative w-full rounded-lg overflow-hidden bg-black">
                <video
                  src={previewUrl}
                  controls={uploadProgress === 100}
                  controlsList="nodownload"
                  className={`w-full max-h-[400px] rounded-lg transition-opacity duration-300 ${uploading ? "opacity-40 pointer-events-none" : "opacity-100"
                    }`}
                  style={{
                    aspectRatio: "16 / 9",
                    objectFit: "contain",
                  }}
                />

                {uploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 text-white">
                    <div className="relative flex items-center justify-center w-20 h-20">
                      <div className="w-20 h-20 border-4 border-t-white border-gray-400 rounded-full animate-spin"></div>
                      <span className="absolute text-sm font-semibold">{uploadProgress}%</span>
                    </div>
                    <p className="mt-3 text-sm">Uploading Video...</p>
                    <Button
                      onClick={cancelUpload}
                      variant="outline"
                      className="mt-4 text-white border-white hover:bg-white hover:text-black"
                    >
                      Cancel Upload
                    </Button>
                  </div>
                )}
              </div> */}