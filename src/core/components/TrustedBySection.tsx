/* eslint-disable react/no-unescaped-entities */
import { Badge } from "@/core/components/ui/badge";
import ImageComponent from "./imageComponent";

const TrustedBySection = () => {
  const profileAvatars = [
    {
      name: "Sarah Johnson",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face",
    },
    {
      name: "Michael Chen",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
    },
    {
      name: "Emily Rodriguez",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
    },
    {
      name: "David Wilson",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
    },
    {
      name: "Lisa Thompson",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face",
    },
    {
      name: "James Miller",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face",
    },
    {
      name: "Anna Davis",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face",
    },
    {
      name: "Robert Garcia",
      image:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=64&h=64&fit=crop&crop=face",
    },
    {
      name: "Maria Lopez",
      image:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop&crop=face",
    },
    {
      name: "Kevin Brown",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=face",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Senior Business Analyst",
      company: "Microsoft",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face",
      review:
        "This is one of the best D365 F&O courses I’ve found online. I learned almost every module, and it helped me tremendously during interviews and on my project as a reliable reference guide. I’ve never seen such an elaborate, in-depth course on Dynamics 365 F&O. It gave me complete clarity and confidence to perform effectively in my organization.",
      featured: false,
    },
    {
      name: "Michael Chen",
      role: "Solution Architect",
      company: "Accenture",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
      review:
        "Coming from a traditional ERP background, I wanted to transition into no-code platforms and fully understand canvas and model-driven apps. This course provided real projectbased learning with practical business scenarios and examples. It helped me grasp the concepts clearly and directly supported my current project work. A well-structured, handson course that truly bridges theory and real-world application.",
      featured: true,
    },
    {
      name: "Emily Rodriguez",
      role: "Functional Consultant",
      company: "Deloitte",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
      review:
        "After taking other Business Applications courses before, I recently enrolled in the Copilot Studio course expecting a step-by-step journey from basics to advanced. It delivered exactly that. I now have a complete understanding of building agents from scratch to advanced levels. I still use the lessons as a reference while experimenting with connectors, triggers, and MCPs. Extremely practical and valuable training",
      featured: false,
    },
  ];

  return (
    <section className="py-24 bg-hero-bg">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header with Avatar Row */}
        <div className="text-center mb-16">
          <p className="text-text-muted-light text-lg mb-8">Trusted by:</p>

          {/* Profile Avatars Row */}
          <div className="flex flex-wrap justify-center items-center gap-2 mb-12">
            {profileAvatars.map((profile, index) => (
              <div
                key={profile.name}
                className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-110 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ImageComponent
                  height={30}
                  width={30}
                  src={profile.image}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-text-light mb-6">
            What our students say
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className={`p-8 rounded-2xl border transition-all duration-300 hover:scale-105 animate-fade-in ${
                testimonial.featured
                  ? "bg-white/10 border-white/30 ring-2 ring-primary/30"
                  : "bg-white/5 border-white/10 hover:border-white/20"
              }`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <ImageComponent
                    height={30}
                    width={30}
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-text-light font-semibold">
                    {testimonial.name}
                  </h4>
                  <p className="text-text-muted-light text-sm">
                    {testimonial.role}
                  </p>
                  {/* <Badge
                    variant="secondary"
                    className="bg-primary/20 text-primary border-primary/30 mt-1"
                  >
                    {testimonial.company}
                  </Badge> */}
                </div>
              </div>

              <blockquote className="text-text-light leading-relaxed">
                "{testimonial.review}"
              </blockquote>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center mt-20">
          <div className="animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <div className="text-5xl font-bold text-text-light mb-2 glow-text">
              25,000+
            </div>
            <p className="text-text-muted-light">Professionals Trained</p>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "0.7s" }}>
            <div className="text-5xl font-bold text-text-light mb-2 glow-text">
              2M+
            </div>
            <p className="text-text-muted-light">Community Platform Views</p>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "0.8s" }}>
            <div className="text-5xl font-bold text-text-light mb-2 glow-text">
              4.9/5
            </div>
            <p className="text-text-muted-light">Average Rating</p>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "0.9s" }}>
            <div className="text-5xl font-bold text-text-light mb-2 glow-text">
              98%
            </div>
            <p className="text-text-muted-light">Course Completion Rate</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBySection;
