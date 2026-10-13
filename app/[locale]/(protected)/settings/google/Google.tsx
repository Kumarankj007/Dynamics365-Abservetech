"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleSettingsFormValues, googleSettingsSchema } from "./schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/passwordInput";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { APICONSTANT } from "@/services/config";
import { useSettings } from "@/providers/settings-provider";

type Props = {
  defaultValues: GoogleSettingsFormValues;
};

export default function GoogleForm({ defaultValues }: Props) {
  const [isPending, startTransition] = useTransition();
    const { refetch } = useSettings();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GoogleSettingsFormValues>({
    resolver: zodResolver(googleSettingsSchema),
    defaultValues,
  });
  const mutation = useApiMutation("put");

  const onSubmit = (data: GoogleSettingsFormValues) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("googleClientId", data.googleClientId);
        formData.append("googleClientSecret", data.googleClientSecret);

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
      {/* Stripe Publishable Key */}
      <div>
        <Label>Google Client Id</Label>
        <PasswordInput
          {...register("googleClientId")}
          className="border p-2 w-full"
        />
        {errors.googleClientId && (
          <p className="text-red-500 text-sm">
            {errors.googleClientId.message}
          </p>
        )}
      </div>

      {/* Stripe Secret Key */}
      <div>
        <Label>Google Client Secret</Label>
        <PasswordInput
          {...register("googleClientSecret")}
          className="border p-2 w-full"
        />
        {errors.googleClientSecret && (
          <p className="text-red-500 text-sm">
            {errors.googleClientSecret.message}
          </p>
        )}
      </div>

      <Button type="submit" variant={"outline"} disabled={isPending}>
        {isPending ? "Updating..." : "Update Google"}
      </Button>
    </form>
  );
}
