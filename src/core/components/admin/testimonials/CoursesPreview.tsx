import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Testimonial } from "@/pages/admin/TestimonialsManager";

interface CoursesPreviewProps {
  testimonials: Testimonial[];
}

export function CoursesPreview({ testimonials }: CoursesPreviewProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
          <Star className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">No published testimonials</p>
        <p className="text-xs text-gray-400 mt-1">Add testimonials to see preview</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Reviews</h3>
        <p className="text-sm text-gray-500">Browse All Courses Preview</p>
      </div>
      
      <div className="bg-white border rounded-lg p-4">
        <div className="grid gap-4">
          {testimonials.slice(0, 4).map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white border border-gray-200 p-4 rounded-lg hover:shadow-sm transition-shadow"
            >
              {/* Star Rating */}
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${
                      i < (testimonial.rating || 5) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-200'
                    }`} 
                  />
                ))}
              </div>
              
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  {testimonial.headshot ? (
                    <AvatarImage 
                      src={testimonial.headshot} 
                      alt={`Headshot of ${testimonial.name}`}
                    />
                  ) : (
                    <AvatarFallback className="bg-gray-100 text-gray-600 text-sm font-medium">
                      {getInitials(testimonial.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm mb-1">
                    {testimonial.name}
                  </h4>
                  <p className="text-xs text-gray-500 mb-2">
                    {testimonial.role} at {testimonial.company}
                  </p>
                  
                  <blockquote className="text-sm text-gray-700 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {testimonials.length > 4 && (
        <p className="text-xs text-gray-500 text-center">
          Showing first 4 of {testimonials.length} testimonials
        </p>
      )}
    </div>
  );
}