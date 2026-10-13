"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PaymentSettingsFormValues, paymentSettingsSchema } from "./schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/passwordInput";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { APICONSTANT } from "@/services/config";
import { useSettings } from "@/providers/settings-provider";

type Props = {
  defaultValues: PaymentSettingsFormValues;
};

export default function PaymentForm({ defaultValues }: Props) {
  const [isPending, startTransition] = useTransition();
  const { refetch } = useSettings();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentSettingsFormValues>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues,
  });
  const mutation = useApiMutation("put");

  const onSubmit = (data: PaymentSettingsFormValues) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("stripePublishableKey", data.stripePublishableKey);
        formData.append("stripeSecretKey", data.stripeSecretKey);
        // formData.append("razorpayKeyId", data.razorpayKeyId);
        // formData.append("razorpayKeySecret", data.razorpayKeySecret);
        // formData.append("razorpayWebhookSecret", data.razorpayWebhookSecret);

        const response = await mutation.mutateAsync({
          url: {
            apiUrl: APICONSTANT.UPDATE_SETTINGS,
          },
          body: formData,
        });
        if (response?.status) {
          refetch();
        }
      } catch (error) {
        console.error(error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex gap-6 md:flex-row flex-col">
        {/* <div className="flex-1 space-y-4">
          <div>
            <Label>Razorpay Key Id</Label>
            <PasswordInput
              {...register("razorpayKeyId")}
              className="border p-2 w-full"
            />
            {errors.razorpayKeyId && (
              <p className="text-red-500 text-sm">
                {errors.razorpayKeyId.message}
              </p>
            )}
          </div>

          <div>
            <Label>Razorpay Key Secret</Label>
            <PasswordInput
              {...register("razorpayKeySecret")}
              className="border p-2 w-full"
            />
            {errors.razorpayKeySecret && (
              <p className="text-red-500 text-sm">
                {errors.razorpayKeySecret.message}
              </p>
            )}
          </div>

          <div>
            <Label>Razorpay Webhook Secret</Label>
            <PasswordInput
              {...register("razorpayWebhookSecret")}
              className="border p-2 w-full"
            />
            {errors.razorpayWebhookSecret && (
              <p className="text-red-500 text-sm">
                {errors.razorpayWebhookSecret.message}
              </p>
            )}
          </div>
        </div> */}
        <div className="flex-1 space-y-4">
          {/* Stripe Publishable Key */}
          <div>
            <Label>Stripe Publishable Key</Label>
            <PasswordInput
              {...register("stripePublishableKey")}
              className="border p-2 w-full"
            />
            {errors.stripePublishableKey && (
              <p className="text-red-500 text-sm">
                {errors.stripePublishableKey.message}
              </p>
            )}
          </div>

          {/* Stripe Secret Key */}
          <div>
            <Label>Stripe Secret Key</Label>
            <PasswordInput
              {...register("stripeSecretKey")}
              className="border p-2 w-full"
            />
            {errors.stripeSecretKey && (
              <p className="text-red-500 text-sm">
                {errors.stripeSecretKey.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <Button type="submit" variant={"outline"} disabled={isPending}>
        {isPending ? "Updating..." : "Update Payment"}
      </Button>
    </form>
  );
}
