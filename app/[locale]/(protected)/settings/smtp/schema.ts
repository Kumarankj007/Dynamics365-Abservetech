import { z } from "zod"

export const smtpSettingsSchema = z.object({
  host: z
    .string()
    .min(1, "Host is required")
    .regex(/^[a-zA-Z0-9.-]+$/, "Invalid host"),

  port: z
    .number({
      required_error: "Port is required",
      invalid_type_error: "Port must be a number",
    })
    .int("Port must be an integer")
    .min(1, "Port must be greater than 0")
    .max(65535, "Port must be less than 65536"),

  user: z
    .string()
    .min(1, "User email is required")
    .email("Invalid email address"),

  pass: z
    .string()
    .min(8, "Password must be at least 8 characters"),

  secure: z.boolean(),
});

export type SmtpSettingsFormValues =
  z.infer<typeof smtpSettingsSchema>