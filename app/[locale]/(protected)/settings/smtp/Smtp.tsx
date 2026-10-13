"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SmtpSettingsFormValues, smtpSettingsSchema } from "./schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/passwordInput";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { APICONSTANT } from "@/services/config";
import { useSettings } from "@/providers/settings-provider";

type Props = {
  defaultValues: SmtpSettingsFormValues;
};

export default function SmtpForm({ defaultValues }: Props) {
  const [isPending, startTransition] = useTransition();
    const { refetch } = useSettings();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SmtpSettingsFormValues>({
    resolver: zodResolver(smtpSettingsSchema),
    defaultValues,
  });
  const mutation = useApiMutation("put");

  const onSubmit = (data: SmtpSettingsFormValues) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("smtp", JSON.stringify(data));

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      {/* Host */}
      <div>
        <Label>SMTP Host</Label>
        <Input
          type="text"
          {...register("host")}
          className="border p-2 w-full"
        />
        {errors.host && (
          <p className="text-red-500 text-sm">{errors.host.message}</p>
        )}
      </div>

      {/* Port */}
      <div>
        <Label>Port</Label>
        <Input
          type="number"
          {...register("port", { valueAsNumber: true })}
          className="border p-2 w-full"
        />
        {errors.port && (
          <p className="text-red-500 text-sm">{errors.port.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <Label>Email</Label>
        <Input
          type="email"
          {...register("user")}
          className="border p-2 w-full"
        />
        {errors.user && (
          <p className="text-red-500 text-sm">{errors.user.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <Label>Password</Label>
        <PasswordInput {...register("pass")} className="border p-2 w-full" />
        {errors.pass && (
          <p className="text-red-500 text-sm">{errors.pass.message}</p>
        )}
      </div>

      {/* Secure */}
      <div className="flex items-center gap-2">
        <Input
          type="checkbox"
          id="secure"
          className="w-4"
          {...register("secure")}
        />
        <Label htmlFor="secure">Secure</Label>
      </div>

      <Button type="submit" variant={"outline"} disabled={isPending}>
        {isPending ? "Updating..." : "Update SMTP"}
      </Button>
    </form>
  );
}
