"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useTransition } from "react";
import {
  ApplicationSettingsFormValues,
  applicationSettingsSchema,
} from "./schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash, Trash2 } from "lucide-react";
import useApiMutation from "@/hooks/Mutations/useApiMutation";
import { APICONSTANT } from "@/services/config";
import { useSettings } from "@/providers/settings-provider";
import { buildImageUrl } from "@/lib/utils";
import ImageComponent from "@/components/imageComponent";

type Props = {
  defaultValues: ApplicationSettingsFormValues;
};


export default function ApplicationSettingsForm({ defaultValues }: Props) {
  const [isPending, startTransition] = useTransition();
  const { refetch } = useSettings();
  const [logoPreview, setLogoPreview] = useState<string | null>(
    defaultValues.logo || null,
  );
  const [faviconPreview, setFaviconPreview] = useState<string | null>(
    defaultValues.favicon || null,
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<ApplicationSettingsFormValues>({
    resolver: zodResolver(applicationSettingsSchema),
    defaultValues,
  });

  const logoFile = watch("logo");
  const faviconFile = watch("favicon");

  // 🔥 Preview Logo
  useEffect(() => {
    if (typeof logoFile !== "string" && logoFile?.length > 0) {
      const file = logoFile[0];
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);

      return () => URL.revokeObjectURL(previewUrl);
    }
    if (defaultValues.logo) {
      setLogoPreview(buildImageUrl(defaultValues.logo));
    }
  }, [logoFile]);

  // 🔥 Preview Favicon
  useEffect(() => {
    if (typeof faviconFile !== "string" && faviconFile?.length > 0) {
      const file = faviconFile[0];
      const previewUrl = URL.createObjectURL(file);
      setFaviconPreview(previewUrl);

      return () => URL.revokeObjectURL(previewUrl);
    }
    if (defaultValues?.favicon) {
      setFaviconPreview(buildImageUrl(defaultValues.favicon));
    }
  }, [faviconFile]);

  const mutation = useApiMutation("put");

  const onSubmit = async (data: ApplicationSettingsFormValues) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("appName", data.appName);
        formData.append("baseUrl", data.baseUrl);
        formData.append("port", data.port);

        if (data.logo?.[0]) {
          formData.append(
            "logo",
            typeof data.logo == "string" ? data.logo : data.logo[0],
          );
        }

        if (data.favicon?.[0]) {
          formData.append(
            "favicon",
            typeof data.favicon == "string" ? data.favicon : data.favicon[0],
          );
        }

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
  const removeLogo = () => {
    setLogoPreview(null);
    setValue("logo", undefined);
  };

  const removeFavicon = () => {
    setFaviconPreview(null);
    setValue("favicon", undefined);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      {/* App Name */}
      <div>
        <Label>App Name</Label>
        <Input {...register("appName")} className="w-full border p-2 rounded" />
        {errors.appName && (
          <p className="text-red-500 text-sm">{errors.appName.message}</p>
        )}
      </div>

      {/* Base URL */}
      <div>
        <Label>Base URL</Label>
        <Input {...register("baseUrl")} className="w-full border p-2 rounded" />
        {errors.baseUrl && (
          <p className="text-red-500 text-sm">{errors.baseUrl.message}</p>
        )}
      </div>

      {/* Port */}
      <div>
        <Label>Port</Label>
        <Input {...register("port")} className="w-full border p-2 rounded" />
        {errors.port && (
          <p className="text-red-500 text-sm">{errors.port.message}</p>
        )}
      </div>

      {/* Logo Upload */}
      <div>
        <Label>Logo Upload</Label>
        <Input type="file" accept="image/*" {...register("logo")} />

        {logoPreview && (
          <div className="mt-3 relative w-40">
            <ImageComponent
              src={logoPreview}
              width={100}
              height={100}
              alt="Logo Preview"
              className="w-full h-auto rounded border"
            />
            <button
              type="button"
              onClick={removeLogo}
              className="absolute top-1 right-1 bg-red-600 text-white px-2 py-1 text-xs rounded"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Favicon Upload */}
      <div>
        <Label>Favicon Upload</Label>
        <Input type="file" accept=".ico,image/png" {...register("favicon")} />

        {faviconPreview && (
          <div className="mt-3 relative w-16">
            <ImageComponent
              src={faviconPreview}
              width={200}
              height={200}
              alt="Favicon Preview"
              className="w-full h-auto rounded border"
            />
            <button
              type="button"
              onClick={removeFavicon}
              className="absolute top-1 right-1 bg-red-600 text-white px-2 py-1 text-xs rounded"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Submit */}
      <Button type="submit" variant={"outline"} disabled={isPending}>
        {isPending ? "Updating..." : "Update Application"}
      </Button>
    </form>
  );
}
