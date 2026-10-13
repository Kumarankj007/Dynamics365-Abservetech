import { useState, useEffect } from "react";
import { X, Upload, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Testimonial } from "@/pages/admin/TestimonialsManager";

interface TestimonialFormProps {
  isOpen: boolean;
  onClose: () => void;
  testimonial?: Testimonial | null;
  type: "homepage" | "courses";
  canPublish: boolean;
  onSave: (testimonial: Omit<Testimonial, "id" | "lastUpdated">) => void;
}

export function TestimonialForm({
  isOpen,
  onClose,
  testimonial,
  type,
  canPublish,
  onSave
}: TestimonialFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    company: "",
    quote: "",
    headshot: "",
    published: false,
    order: 1,
    showCompanyPill: true,
    rating: 5
  });

  const [headshotFile, setHeadshotFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    if (testimonial) {
      setFormData({
        name: testimonial.name,
        role: testimonial.role,
        company: testimonial.company,
        quote: testimonial.quote,
        headshot: testimonial.headshot || "",
        published: testimonial.published,
        order: testimonial.order,
        showCompanyPill: testimonial.showCompanyPill ?? true,
        rating: testimonial.rating ?? 5
      });
      setPreviewUrl(testimonial.headshot || "");
    } else {
      setFormData({
        name: "",
        role: "",
        company: "",
        quote: "",
        headshot: "",
        published: false,
        order: 1,
        showCompanyPill: true,
        rating: 5
      });
      setPreviewUrl("");
    }
    setHeadshotFile(null);
  }, [testimonial, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeadshotFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFormData(prev => ({ ...prev, headshot: url }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canPublish && formData.published && !testimonial?.published) {
      return; // Prevent saving if trying to publish when limit reached
    }

    onSave({
      ...formData,
      headshot: previewUrl
    });
    
    // Clean up preview URL
    if (headshotFile && previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const charCount = formData.quote.length;
  const maxChars = 500;
  const canSave = formData.name && formData.role && formData.company && formData.quote && charCount <= maxChars;
  const showPublishWarning = !canPublish && formData.published && !testimonial?.published;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {testimonial ? "Edit Testimonial" : "Add Testimonial"}
            <Badge variant="outline" className="ml-2">
              {type === "homepage" ? "Homepage" : "Browse All Courses"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Headshot Upload */}
          <div className="space-y-2">
            <Label>Headshot</Label>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                {previewUrl ? (
                  <AvatarImage src={previewUrl} alt="Preview" />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                    {formData.name ? getInitials(formData.name) : "??"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('headshot-upload')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                  <input
                    id="headshot-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Recommended 512×512 PNG/JPG. Cropped to circle on display.
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Job Title / Role *</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                placeholder="e.g., Senior Finance Manager"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company *</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              placeholder="e.g., Microsoft"
              required
            />
          </div>

          {/* Quote */}
          <div className="space-y-2">
            <Label htmlFor="quote">Quote *</Label>
            <Textarea
              id="quote"
              value={formData.quote}
              onChange={(e) => setFormData(prev => ({ ...prev, quote: e.target.value }))}
              placeholder="Enter testimonial quote..."
              className="min-h-[100px]"
              maxLength={maxChars}
              required
            />
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">400-500 characters recommended</span>
              <span className={`${charCount > maxChars ? 'text-red-500' : 'text-gray-500'}`}>
                {charCount}/{maxChars}
              </span>
            </div>
          </div>

          {/* Type-specific fields */}
          {type === "homepage" && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Homepage Options</h4>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="company-pill">Show company pill</Label>
                  <p className="text-sm text-gray-500">Display company name as a pill badge</p>
                </div>
                <Switch
                  id="company-pill"
                  checked={formData.showCompanyPill}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showCompanyPill: checked }))}
                />
              </div>
            </div>
          )}

          {type === "courses" && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Course Catalog Options</h4>
              <div className="space-y-2">
                <Label>Star Rating</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, rating }))}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          rating <= formData.rating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {formData.rating} star{formData.rating !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Show initials if no photo (automatic fallback)
              </p>
            </div>
          )}

          {/* Visibility */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="published">Visibility</Label>
                <p className="text-sm text-gray-500">
                  {formData.published ? "Published and visible on the website" : "Saved as draft"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                />
                <Badge variant={formData.published ? "default" : "secondary"}>
                  {formData.published ? "Published" : "Draft"}
                </Badge>
              </div>
            </div>

            {showPublishWarning && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  You can publish up to 5 testimonials on this section. Unpublish another to proceed.
                </p>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!canSave || showPublishWarning}
            >
              {testimonial ? "Update Testimonial" : "Save Testimonial"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}