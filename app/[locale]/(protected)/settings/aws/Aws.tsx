"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AwsSettingsFormValues, awsSettingsSchema } from "./schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/passwordInput";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { APICONSTANT } from "@/services/config";
import { useSettings } from "@/providers/settings-provider";

type Props = {
  defaultValues: AwsSettingsFormValues;
};

export default function AwsForm({ defaultValues }: Props) {
  const [isPending, startTransition] = useTransition();
  const { refetch } = useSettings();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AwsSettingsFormValues>({
    resolver: zodResolver(awsSettingsSchema),
    defaultValues,
  });
  const mutation = useApiMutation("put");

  const onSubmit = (data: AwsSettingsFormValues) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("awsAccessKeyId", data.awsAccessKeyId);
        formData.append("awsSecretAccessKey", data.awsSecretAccessKey);
        formData.append("awsBucketName", data.awsBucketName);
        formData.append("awsRegion", data.awsRegion);
        formData.append("useAws", String(data.useAws));

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
      {/* AWS Access Key Id */}
      <div>
        <Label>AWS Access Key Id</Label>
        <PasswordInput
          {...register("awsAccessKeyId")}
          className="border p-2 w-full"
        />
        {errors.awsAccessKeyId && (
          <p className="text-red-500 text-sm">
            {errors.awsAccessKeyId.message}
          </p>
        )}
      </div>

      {/* AWS Secret Access Key */}
      <div>
        <Label>AWS Secret Access Key</Label>
        <PasswordInput
          {...register("awsSecretAccessKey")}
          className="border p-2 w-full"
        />
        {errors.awsSecretAccessKey && (
          <p className="text-red-500 text-sm">
            {errors.awsSecretAccessKey.message}
          </p>
        )}
      </div>

      {/* AWS Bucket Name */}
      <div>
        <Label>AWS Bucket Name</Label>
        <Input
          type="text"
          {...register("awsBucketName")}
          className="border p-2 w-full"
        />
        {errors.awsBucketName && (
          <p className="text-red-500 text-sm">{errors.awsBucketName.message}</p>
        )}
      </div>

      {/* AWS Region */}
      <div>
        <Label>AWS Region</Label>
        <Input
          type="text"
          {...register("awsRegion")}
          className="border p-2 w-full"
        />
        {errors.awsRegion && (
          <p className="text-red-500 text-sm">{errors.awsRegion.message}</p>
        )}
      </div>

      {/* Secure */}
      <div className="flex items-center gap-2">
        <Input
          type="checkbox"
          id="useAws"
          className="w-4"
          {...register("useAws")}
        />
        <Label htmlFor="useAws">Use AWS</Label>
      </div>

      <Button type="submit" variant={"outline"} disabled={isPending}>
        {isPending ? "Updating..." : "Update SMTP"}
      </Button>
    </form>
  );
}
