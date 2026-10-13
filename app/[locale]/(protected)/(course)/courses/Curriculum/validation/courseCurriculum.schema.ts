import { z } from "zod";

export const attachmentSchema = z.object({
  name: z.string(),
  fileUrl: z.string().url(),
  fileType: z.string(),
  size: z.number().optional(),
  uploadedAt: z.string().optional(),
});

export const lectureSchema = z
    .object({
        title: z.string().min(1, "Lecture title is required"),
        videoType: z.enum(["upload", "embed"], {
            required_error: "Select video type",
        }),
        // videoUrl: z
        //     .string()
        //     .url("Please enter a valid video URL")
        //     .optional()
        //     .or(z.literal("")), // allow empty if not required
        // Allow ANY string, including iframe HTML, YouTube shorts, Vimeo embed
        videoUrl: z.string().optional(),
        fileUrl: z.string().optional(),
        duration: z.number().optional(),
        attachments: z.array(attachmentSchema).optional(),
    })
    // Validate Embed
  .refine(
    (data) => {
      if (data.videoType === "embed") {
        return !!data.videoUrl && data.videoUrl.trim().length > 0;
      }
      return true;
    },
    {
      message: "Please enter a valid video link",
      path: ["videoUrl"],
    }
  )

  // Validate Upload
  .refine(
    (data) => {
      if (data.videoType === "upload") {
        return !!data.fileUrl;
      }
      return true;
    },
    {
      message: "Please upload a video file",
      path: ["fileUrl"],
    }
  );

export const moduleSchema = z.object({
    title: z.string().min(1, "Module title is required"),
    description: z.string().optional(),
    lectures: z
        .array(lectureSchema)
        .min(1, "At least one lecture is required"),
});

export const courseMediaSchema = z.object({
    modules: z.array(moduleSchema).min(1, "At least one module is required"),
});

export type CourseMediaSchemaType = z.infer<typeof courseMediaSchema>;