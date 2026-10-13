import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Testimonial } from "@/pages/admin/TestimonialsManager";

interface HomepagePreviewProps {
  testimonials: Testimonial[];
}

export function HomepagePreview({ testimonials }: HomepagePreviewProps) {
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
        <h3 className="text-lg font-semibold text-white mb-2">What our students say</h3>
        <p className="text-sm text-gray-300">Homepage Preview</p>
      </div>
      
      <div className="bg-gray-900 p-4 rounded-lg">
        <div className="grid gap-4">
          {testimonials.slice(0, 3).map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-4 rounded-lg hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <Avatar className="w-12 h-12 flex-shrink-0">
                  {testimonial.headshot ? (
                    <AvatarImage 
                      src={testimonial.headshot} 
                      alt={`Headshot of ${testimonial.name}`}
                    />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(testimonial.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-white text-sm">
                      {testimonial.name}
                    </h4>
                    {testimonial.showCompanyPill && (
                      <Badge 
                        variant="secondary" 
                        className="bg-primary/20 text-primary-foreground text-xs px-2 py-0.5"
                      >
                        {testimonial.company}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-400 mb-2">{testimonial.role}</p>
                  
                  <blockquote className="text-sm text-gray-200 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {testimonials.length > 3 && (
        <p className="text-xs text-gray-500 text-center">
          Showing first 3 of {testimonials.length} testimonials
        </p>
      )}
    </div>
  );
}