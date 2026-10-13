import { z } from "zod";

export const googleSettingsSchema = z.object({
  googleClientId: z.string().min(1, "Host is required"),
  googleClientSecret: z.string().min(1, "Host is required"),
});

export type GoogleSettingsFormValues = z.infer<typeof googleSettingsSchema>;
