/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { useAuthStore } from "@/core/store/authStore";
import { Button } from "@/core/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/core/components/ui/avatar";
import { User, Mail, Lock, Upload, Save, Key } from "lucide-react";
import { useEffect } from "react";
import { objValid } from "@/core/utils/helperFunction";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import useSnackbarStore from "@/core/store/toaster";
import InputCard from "@/core/components/InputCard";

type FormData = {
  fullName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  profile?: FileList;
};

const Profile = () => {
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const { userData, updateProfile, changeUserPassword } = useAuthStore(
    (state) => state
  );
  const updateApi = async (data: any) => {
    return await updateProfile(data);
  };

  const { trigger: updateTrigger, isPending } = useCustomMutation(updateApi, {
    onSuccessCallback: (res: any) => {
      // console.log(res, "res");
      if (res?.success && res?.data) {
        reset({
          fullName: res?.data?.fullname,
          email: res?.data?.email,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    },
  });
  const passwordApi = async (data: any) => {
    return await changeUserPassword(data);
  };

  const { trigger: passwordTrigger, isPending: passwordIsPending } =
    useCustomMutation(passwordApi, {
      onSuccessCallback: () => {
        reset({
          fullName: userData?.fullname || "",
          email: userData?.email || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      },
    });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  useEffect(() => {
    if (objValid(userData)) {
      // console.log(userData, 'userData')
      reset({
        fullName: userData?.fullname || "",
        email: userData?.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [userData, reset]);

  const onSubmit = async (data: FormData, action: any) => {
    // console.log("Submitted Data:", data);
    if (action == "profile") {
      const formData = new FormData();
      formData.append("fullname", data?.fullName || "");
      // formData.append("email", data?.email || "");
      const file = data?.profile?.[0] || "";
      formData.append(
        "profile",
        file ? file : userData?.profile ? userData?.profile : ""
      );
      updateTrigger(formData);
    } else if (action == "password") {
      const payload = {
        currentPassword: data?.currentPassword || "",
        newPassword: data?.newPassword || "",
        confirmPassword: data?.confirmPassword || "",
      };
      passwordTrigger(payload);
    }
  };

  const handleAvatarUpload = () => {
    document.getElementById("avatar")?.click();
  };
  const avatarFile = watch("profile")?.[0] || null;
  // const newPassword = watch("newPassword");

  return (
    <form
      onSubmit={handleSubmit((data, e: any) => {
        // Determine which button was clicked using e.nativeEvent.submitter
        const action = (e.nativeEvent as any).submitter?.name;
        onSubmit(data, action);
      })}
      className="space-y-6 max-w-2xl"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Picture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage
                src={
                  avatarFile
                    ? URL.createObjectURL(avatarFile)
                    : userData?.profile
                }
                alt="Profile"
              />
              <AvatarFallback className="text-lg">
                {userData?.fullname
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "P"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              {/* Hidden file input */}
              <input
                type="file"
                accept="image/*"
                id="avatar"
                className="hidden"
                {...register("profile", {
                  validate: (files) => {
                    const file = files?.[0];
                    if (!file) return true; // optional
                    if (file.size > 2 * 1024 * 1024)
                      showSnackbar(
                        "File size must be less than 2MB",
                        "warning"
                      );
                    if (!file.type.startsWith("image/"))
                      showSnackbar("Only image files are allowed", "warning");
                    return true;
                  },
                })}
              />

              {/* Custom trigger button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleAvatarUpload}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload New Avatar
              </Button>
              <p className="text-sm text-muted-foreground">
                Recommended: 400x400px, max 2MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              {...register("fullName", { required: "Full name is required" })}
              placeholder="Enter your full name"
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              readOnly
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Invalid email format",
                },
              })}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              name="profile"
              disabled={isSubmitting || isPending}
              className="min-w-32"
            >
              {isSubmitting || isPending ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <InputCard
              name="currentPassword"
              label="Current Password"
              placeholder="Enter your current password"
              type="password"
              control={control}
              errors={errors}
            />
          </div>

          <div className="space-y-2">
            <InputCard
              name="newPassword"
              label="New Password"
              placeholder="Enter your new password"
              type="password"
              control={control}
              errors={errors}
              pattern={{
                value:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/,
                message:
                  "Password must be 8–20 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character",
              }}
            />
          </div>

          <div className="space-y-2">
            <InputCard
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm your new password"
              type="password"
              getValues={getValues}
              control={control}
              errors={errors}
            />
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Password requirements:</p>
            <ul className="list-disc list-inside ml-2 mt-1">
              <li>At least 8 characters long</li>
              <li>Include uppercase and lowercase letters</li>
              <li>Include at least one number</li>
              <li>Include at least one special character</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          name="password"
          disabled={isSubmitting || passwordIsPending}
          className="min-w-32"
        >
          {isSubmitting || passwordIsPending ? (
            "Changing..."
          ) : (
            <>
              <Key className="h-4 w-4 mr-2" />
              Change Password
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default Profile;
