import { z } from "zod";

export const awsSettingsSchema = z.object({
  awsAccessKeyId: z
    .string()
    .min(16, "Invalid AWS Access Key ID")
    .max(32, "Invalid AWS Access Key ID")
    .regex(/^[A-Z0-9]+$/, "Access Key must be uppercase alphanumeric"),

  awsSecretAccessKey: z
    .string()
    .min(40, "Invalid AWS Secret Access Key")
    .max(128, "Invalid AWS Secret Access Key"),

  awsRegion: z
    .string()
    .min(1, "AWS Region is required"),

  awsBucketName: z
    .string()
    .min(3, "Bucket name too short")
    .max(63, "Bucket name too long")
    .regex(
      /^[a-z0-9.-]+$/,
      "Bucket name must be lowercase letters, numbers, dots or hyphens"
    ),

  useAws: z.boolean(),
});

export type AwsSettingsFormValues = z.infer<
  typeof awsSettingsSchema
>;
