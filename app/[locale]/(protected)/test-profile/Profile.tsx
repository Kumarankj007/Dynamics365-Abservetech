"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Camera,
  Save,
  Eye,
  Star,
  Users,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

type FormData = {
  fullName: string;
  professionalTitle?: string;
  bio?: string;
  profile?: FileList;
};

const AdminProfile = () => {
  const [profileData, setProfileData] = useState({
    profilePicture: "/lovable-uploads/ai-mentor-hologram.png",
    name: "Admin User",
    title: "Platform Administrator",
    bio: "Experienced education technology administrator with expertise in course curation and platform management. Committed to delivering high-quality learning experiences.",
  });

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const handleSave = () => {
    // Handle save logic here
    toast.success("Profile updated successfully!");
  };

  const handleImageUpload = () => {
    document.getElementById("avatar")?.click();
  };
  const avatarFile = watch("profile")?.[0] || null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Admin Profile
          </h2>
          <p className="text-muted-foreground">
            Manage your profile information that appears when you publish
            courses
          </p>
        </div>
        <Button onClick={handleSave} className="flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Form */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="w-5 h-5" />
                <span>Profile Picture</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage
                    src={
                      avatarFile
                        ? URL.createObjectURL(avatarFile)
                        : profileData.profilePicture
                    }
                    alt={profileData.name}
                  />
                  <AvatarFallback>
                    {profileData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
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
                    //   console.log(files, "file");
                      const file = files?.[0];
                      if (!file) return true; // optional
                      if (file.size > 2 * 1024 * 1024)
                        toast.error("File size must be less than 2MB");
                      if (!file.type.startsWith("image/"))
                        toast.error("Only image files are allowed");
                      return true;
                    },
                  })}
                />
                <div>
                  <Button
                    variant="outline"
                    onClick={handleImageUpload}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Picture</span>
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Recommended size: 400x400px
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="title">Professional Title *</Label>
                <Input
                  id="title"
                  value={profileData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., Platform Administrator, Course Curator"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio/Description *</Label>
                <Textarea
                  id="bio"
                  rows={4}
                  value={profileData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Write a brief description about yourself and your expertise..."
                />
                <p className="text-sm text-muted-foreground mt-1">
                  This will appear on course pages when you publish courses
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Course Page Preview</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                This is how your profile will appear on course pages
              </p>
            </CardHeader>
            <CardContent>
              {/* Instructor Preview Card */}
              <div className="border rounded-lg p-6 bg-card">
                <div className="flex items-start space-x-4">
                  <Avatar className="w-16 h-16 border-2 border-border">
                    <AvatarImage
                      src={profileData.profilePicture}
                      alt={profileData.name}
                    />
                    <AvatarFallback className="text-lg font-semibold">
                      {profileData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {profileData.name || "Your Name"}
                    </h3>
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge
                        color="secondary"
                        className="bg-primary text-primary-foreground"
                      >
                        {profileData.title || "Your Title"}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      {profileData.bio || "Your bio will appear here..."}
                    </p>
                  </div>
                </div>

                {/* Mock stats */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <GraduationCap className="w-4 h-4" />
                      <span>Platform Admin</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
