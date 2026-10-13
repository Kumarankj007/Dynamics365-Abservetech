/* eslint-disable react/no-unescaped-entities */
'use client'
import { Card, CardContent } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Button } from "@/core/components/ui/button";
import { Textarea } from "@/core/components/ui/textarea";
import { Badge } from "@/core/components/ui/badge";
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Mail, 
  Globe, 
  Eye,
  Calendar,
  Target,
  Lightbulb,
  Trophy
} from "lucide-react";
import { useEffect } from "react";
import LogoStripSection from "@/core/components/LogoStripSection";

const About = () => {
  useEffect(() => {
    document.title = "About Dynamics365Lab | Practical Dynamics 365 Training";
    const metaDesc = "Learn. Apply. Grow. Dynamics365Lab offers hands-on Dynamics 365 F&O, Power Platform, and Copilot training with 10K+ jobs.";

    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = metaDesc;

    const canonicalHref = window.location.origin + "/about";
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonicalHref;

    const orgLd = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Dynamics365Lab",
      url: "https://www.dynamics365lab.com",
      sameAs: ["https://www.youtube.com/@Dynamics365Lab"],
      description: "Hands-on, implementation-first Dynamics 365 training and job board."
    };
    const existing = document.getElementById('ld-org');
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'ld-org';
    script.text = JSON.stringify(orgLd);
    document.head.appendChild(script);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Stats Section */}
      <section className="relative bg-hero-bg py-16 md:py-20 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-hero-bg/30 via-transparent to-hero-bg/60" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-16 animate-fade-in">
              <h1 className="text-[2rem] md:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-tight" style={{ color: 'hsl(280, 45%, 88%)' }}>
                About Dynamics 365 Lab
              </h1>
              <p className="mt-4 text-base md:text-lg text-text-muted-light max-w-3xl mx-auto">
                Learn. Apply. Grow. All in One Place.
              </p>
            </div>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center group">
                <div className="rounded-xl p-6 border bg-white/10 border-white/15 hover:border-primary/40 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <Eye className="h-8 w-8 text-primary mx-auto mb-4" />
                  <div className="text-3xl md:text-4xl font-bold text-text-light mb-2">2M+</div>
                  <div className="text-text-muted-light font-medium">YouTube views</div>
                </div>
              </div>
              
              <div className="text-center group">
                <div className="rounded-xl p-6 border bg-white/10 border-white/15 hover:border-emerald-400/40 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <Users className="h-8 w-8 text-emerald-400 mx-auto mb-4" />
                  <div className="text-3xl md:text-4xl font-bold text-text-light mb-2">22K+</div>
                  <div className="text-text-muted-light font-medium">Trusted learners</div>
                </div>
              </div>
              
              <div className="text-center group">
                <div className="rounded-xl p-6 border bg-white/10 border-white/15 hover:border-purple-400/40 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <Briefcase className="h-8 w-8 text-purple-400 mx-auto mb-4" />
                  <div className="text-3xl md:text-4xl font-bold text-text-light mb-2">10K+</div>
                  <div className="text-text-muted-light font-medium">Dynamics 365 jobs listed</div>
                </div>
              </div>
              
              <div className="text-center group">
                <div className="rounded-xl p-6 border bg-white/10 border-white/15 hover:border-primary/40 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <Calendar className="h-8 w-8 text-primary mx-auto mb-4" />
                  <div className="text-3xl md:text-4xl font-bold text-text-light mb-2">4K+</div>
                  <div className="text-text-muted-light font-medium">Weekly active learners</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-20 bg-card/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Mission Statement */}
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm bg-primary/10 text-primary border-primary/20">
                Our Mission
              </Badge>
              <h2 className="text-4xl font-bold text-foreground mb-8">
                Bridging the Gap Between Learning and Real-World Implementation
              </h2>
            </div>

            {/* Content Grid */}
            <div className="grid lg:grid-cols-2 gap-12 mb-16">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="mt-1 flex-shrink-0 rounded-md bg-primary/20 p-3 ring-2 ring-primary/50 shadow-lg">
                    <Target className="h-7 w-7 text-primary drop-shadow-sm" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Practical Training Focus</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Welcome to Dynamics365Lab, the all-in-one platform built exclusively for Microsoft Dynamics 365 professionals. We provide hands-on, real-world training focused on Dynamics 365 Finance and Operations (F&O), Power Platform, and Microsoft Copilot. Our courses go beyond theory, offering implementation-driven learning designed by Microsoft MVPs and industry experts.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="mt-1 flex-shrink-0 rounded-md bg-emerald-500/20 p-3 ring-2 ring-emerald-500/50 shadow-lg">
                    <Lightbulb className="h-7 w-7 text-emerald-600 drop-shadow-sm" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Current Offerings</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Every lesson mirrors actual project scenarios, so you're not just learning—you're preparing to deliver. Whether you're just starting out or looking to advance in your career, our expert-led courses ensure you gain practical skills that translate directly to workplace success.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="mt-1 flex-shrink-0 rounded-md bg-purple-500/20 p-3 ring-2 ring-purple-500/50 shadow-lg">
                    <TrendingUp className="h-7 w-7 text-purple-600 drop-shadow-sm" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Vision for Growth</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Our vision is to grow a thriving ecosystem where learning meets opportunity. We are actively collaborating with global experts and MVPs to expand into areas like Customer Engagement (CE), Business Central, Dataverse, and more. As our course catalog grows, so does our mission to make expert-level Dynamics 365 knowledge accessible to learners worldwide.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="mt-1 flex-shrink-0 rounded-md bg-amber-500/20 p-3 ring-2 ring-amber-500/50 shadow-lg">
                    <Trophy className="h-7 w-7 text-amber-600 drop-shadow-sm" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Integrated Job Board</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      What makes Dynamics365Lab truly unique is our integrated Dynamics 365 Job Board, pulling in over 10,000 active job listings focused exclusively on F&O, Power Platform, and related roles. It's more than just training—our platform is where professionals learn, apply, and grow, all in one place.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Microsoft Products Strip - mirrored from homepage */}
      <LogoStripSection />

      {/* Contact Section */}
      <section className="py-20 bg-hero-bg relative">
        <div className="absolute inset-0 bg-gradient-to-br from-hero-bg/30 via-transparent to-hero-bg/60" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-text-light mb-4">Get In Touch with Dynamics365Lab</h2>
              <p className="text-text-muted-light">Have questions? We'd love to hear from you.</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                    <Mail className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-light">Email</p>
                    <p className="text-text-muted-light">contact@dynamics365lab.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                    <Globe className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-light">Website</p>
                    <p className="text-text-muted-light">https://www.dynamics365lab.com</p>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <Card className="bg-white/10 border-white/15 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-text-light mb-6">Send us a message</h3>
                  <form className="space-y-4">
                    <div>
                      <Input 
                        placeholder="Your Name" 
                        className="bg-hero-bg/60 border-white/20 text-text-light placeholder:text-text-muted-light focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div>
                      <Input 
                        type="email" 
                        placeholder="Your Email" 
                        className="bg-hero-bg/60 border-white/20 text-text-light placeholder:text-text-muted-light focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div>
                      <Textarea 
                        placeholder="Your Message" 
                        rows={4}
                        className="bg-hero-bg/60 border-white/20 text-text-light placeholder:text-text-muted-light focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <Button className="w-full" size="lg">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;