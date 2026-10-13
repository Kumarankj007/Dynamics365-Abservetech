/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/core/components/ui/avatar";
import { User, Camera, Save, Eye, Briefcase } from "lucide-react";
import { useAuthStore } from "@/core/store/authStore";
import { useForm } from "react-hook-form";
import useSnackbarStore from "@/core/store/toaster";
import InputCard from "@/core/components/InputCard";
import { useFieldArray } from "react-hook-form";
import { getPhoneCodeStr, objValid } from "@/core/utils/helperFunction";
import CountryCode from "@/core/lib/CountryCode";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";

type FormData = {
  fullName: string;
  email?: string;
  phoneCode?: string;
  phoneNumber?: string;
  professionalTitle?: string;
  location?: string;
  website?: string;
  bio?: string;
  yearsOfExperience?: string;
  areasOfExpertise?: { value: string }[];
  profile?: FileList;
};

const Profile = () => {
  // const { toast } = useToast();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const { userData, updateProfile } = useAuthStore((state) => state);
  const updateApi = async (data: any) => {
    return await updateProfile(data);
  };

  const { trigger: updateTrigger, isPending } = useCustomMutation(updateApi, {
    onSuccessCallback: (res: any) => {
      // console.log(res, "res");
      if (res?.success && res?.data) {
      }
    },
  });
  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  // React Hook Form field array
  const { fields, append, remove } = useFieldArray({
    control,
    name: "areasOfExpertise",
  });

  useEffect(() => {
    if (objValid(userData)) {
      // console.log(userData, 'userData')
      const selected = CountryCode.find(
        (item) => item.dial_code == userData?.phoneCode
      );
      reset({
        fullName: userData?.fullname || "",
        email: userData?.email || "",
        phoneCode: selected?.label || "",
        phoneNumber: userData?.phoneNumber || "",
        professionalTitle: userData?.professionalTitle || "",
        location: userData?.location || "",
        website: userData?.website || "",
        bio: userData?.bio || "",
        yearsOfExperience: userData?.yearsOfExperience || "",
        areasOfExpertise:
          userData?.areasOfExpertise?.map((item) => ({ value: item })) || [],
      });
    }
  }, [userData, reset]);

  // const handleInputChange = (field: string, value: string) => {
  //   setProfileData((prev) => ({
  //     ...prev,
  //     [field]: value,
  //   }));
  // };

  // const handleExpertiseAdd = (expertise: string) => {
  //   if (expertise.trim() && !profileData.expertise.includes(expertise.trim())) {
  //     setProfileData((prev) => ({
  //       ...prev,
  //       expertise: [...prev.expertise, expertise.trim()],
  //     }));
  //   }
  // };

  // const handleExpertiseRemove = (index: number) => {
  //   setProfileData((prev) => ({
  //     ...prev,
  //     expertise: prev.expertise.filter((_, i) => i !== index),
  //   }));
  // };

  // const handleSaveProfile = () => {
  //   // toast({
  //   //   title: "Profile Updated",
  //   //   description: "Your profile information has been saved successfully."
  //   // });
  // };

  const handleImageUpload = () => {
    document.getElementById("avatar")?.click();
  };
  const avatarFile = watch("profile")?.[0] || null;

  const onSubmit = async (data: FormData) => {
    // console.log("Submitted Data:", data);
    const formData = new FormData();
    formData.append("fullname", data?.fullName || "");
    // formData.append("email", data?.email || "");
    formData.append("phoneNumber", data?.phoneNumber || "");
    formData.append("professionalTitle", data?.professionalTitle || "");
    formData.append("location", data?.location || "");
    formData.append("website", data?.website || "");
    formData.append("bio", data?.bio || "");
    formData.append("yearsOfExperience", data?.yearsOfExperience || "");
    const expertiseValues = data?.areasOfExpertise?.map(
      (item: any) => item.value
    );
    formData.append("areasOfExpertise", JSON.stringify(expertiseValues));
    formData.append(
      "phoneCode",
      getPhoneCodeStr(data.phoneCode, true) || "+91"
    );
    const file = data?.profile?.[0] || "";
    formData.append(
      "profile",
      file ? file : userData?.profile ? userData?.profile : ""
    );
    updateTrigger(formData);
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
        <p className="text-muted-foreground">
          Manage your instructor profile information that appears on course
          pages
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Profile Preview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Course Page Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* How it appears on course pages */}
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Avatar className="w-16 h-16">
                    <AvatarImage
                      src={userData?.profile}
                      alt={userData?.fullname}
                    />
                    <AvatarFallback className="uppercase">
                      {(userData?.fullname ?? "P")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    {userData?.fullname && (
                      <h3 className="font-bold text-lg first-letter:uppercase">
                        {userData?.fullname}
                      </h3>
                    )}
                    {userData?.professionalTitle && (
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary mb-2"
                      >
                        {userData?.professionalTitle}
                      </Badge>
                    )}
                    {userData?.bio && (
                      <p className="text-sm text-muted-foreground">
                        {userData?.bio}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {userData?.yearsOfExperience && (
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <span>{userData?.yearsOfExperience} experience</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {userData?.areasOfExpertise?.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Edit Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Profile Picture */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage
                    src={
                      avatarFile
                        ? URL.createObjectURL(avatarFile)
                        : userData?.profile
                    }
                    alt={userData?.fullname}
                  />
                  <AvatarFallback className="uppercase">
                    {userData?.fullname
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "P"}
                  </AvatarFallback>
                </Avatar>
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
                <div>
                  <Button
                    type={"button"}
                    variant="outline"
                    onClick={handleImageUpload}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 400x400px, max 2MB
                  </p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <InputCard
                    type="text"
                    control={control}
                    errors={errors}
                    requiredMsg="Full name is required"
                    label="Full Name*"
                    {...register("fullName")}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <InputCard
                    type="text"
                    control={control}
                    errors={errors}
                    requiredMsg="Professional Title is required"
                    label="Professional Title*"
                    {...register("professionalTitle", {
                      required: "Professional Title is required",
                    })}
                    placeholder="Enter your Professional Title"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="relative">
                    <InputCard
                      type="email"
                      control={control}
                      errors={errors}
                      label="Email"
                      iconName="CiMail"
                      iconLib="ci"
                      requiredMsg="Email is required"
                      inputProps={{ readOnly: userData?.email ? true : false }}
                      pattern={{
                        value: /^[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: "Invalid Email format",
                      }}
                      {...register("email")}
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                <div>
                  <InputCard
                    name="phoneNumber"
                    phName="phoneCode"
                    label="Phone Number"
                    placeholder="Enter Your Phone Number"
                    requiredMsg="Phone Number is required"
                    control={control}
                    errors={errors}
                    pattern={{
                      value: /^[0-9]+$/,
                      message: "Phone Number Invalid",
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <InputCard
                    type="text"
                    control={control}
                    errors={errors}
                    iconName="GrLocation"
                    iconLib="gr"
                    label="Location (Optional)"
                    {...register("location")}
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <InputCard
                    type="text"
                    control={control}
                    errors={errors}
                    iconName="TbWorld"
                    iconLib="tb"
                    pattern={{
                      value:
                        /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/i,
                      message:
                        "Please enter a valid URL (e.g. https://example.com)",
                    }}
                    label="Website (Optional)"
                    {...register("website")}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              {/* Bio/Description */}
              <div>
                <InputCard
                  type="text"
                  control={control}
                  errors={errors}
                  requiredMsg="Description is required"
                  textarea
                  label="Bio/Description *"
                  {...register("bio")}
                  placeholder="Description"
                />
              </div>

              {/* Experience */}
              <div>
                <InputCard
                  type="text"
                  control={control}
                  errors={errors}
                  label="Years of Experience"
                  {...register("yearsOfExperience")}
                  placeholder="e.g. 5+ years, 10+ years"
                />
              </div>

              {/* Areas of Expertise */}
              <div>
                <Label htmlFor="expertise-tag-input">Areas of Expertise</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {fields.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => remove(index)}
                    >
                      {skill?.value} ×
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="expertise-tag-input"
                    placeholder="Add an expertise area and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const inputValue = (
                          e.target as HTMLInputElement
                        ).value.trim();
                        if (inputValue != "") {
                          append({ value: inputValue });
                          (e.target as HTMLInputElement).value = "";
                        }
                      }
                    }}
                  />
                  <Button
                    variant="default"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      const input = document.getElementById(
                        "expertise-tag-input"
                      ) as HTMLInputElement | null;
                      if (input) {
                        const inputValue = input.value.trim();
                        if (inputValue) {
                          append({ value: inputValue }); // ✅ append value, not element
                          input.value = ""; // ✅ clear input correctly
                        }
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Press Enter to add each expertise area
                </p>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button type={"submit"} disabled={isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {isPending ? "Saving" : "Save Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default Profile;
