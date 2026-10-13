import { z } from "zod";

export const paymentSettingsSchema = z.object({
  stripePublishableKey: z.string().min(1, "Stripe Publishable Key is required"),
  stripeSecretKey: z.string().min(1, "Stripe Secret Key is required"),
  // razorpayKeyId: z.string().min(1, "Razorpay Key Id is required"),
  // razorpayKeySecret: z.string().min(1, "Razorpay Key Secret is required"),
  // razorpayWebhookSecret: z.string().min(1, "Razorpay Webhook Secret is required"),
});

export type PaymentSettingsFormValues = z.infer<typeof paymentSettingsSchema>;
