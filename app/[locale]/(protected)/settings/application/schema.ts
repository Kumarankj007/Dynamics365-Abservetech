import { z } from "zod"

export const applicationSettingsSchema = z.object({
  appName: z
    .string()
    .min(2, "App name must be at least 2 characters"),

  baseUrl: z
    .string()
    .url("Enter valid URL")
    .refine((val) => val.startsWith("https://"), {
      message: "Base URL must start with https://",
    }),

  port: z
    .string()
    .regex(/^\d+$/, "Port must be numeric")
    .refine((val) => Number(val) > 0 && Number(val) < 65536, {
      message: "Port must be between 1 and 65535",
    }),

  logo: z
    .any()
    .optional(),

  favicon: z
    .any()
    .optional(),
})

export type ApplicationSettingsFormValues =
  z.infer<typeof applicationSettingsSchema>