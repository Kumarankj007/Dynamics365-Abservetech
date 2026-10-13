"use client"
import { useState } from "react";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Textarea } from "@/core/components/ui/textarea";
import { Mail, Send, MessageCircle } from "lucide-react";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [currentVariation, setCurrentVariation] = useState(0);

  const messageVariations = [
    {
      title: "Ready to Transform Your Business?",
      description: "We're here to support your Dynamics 365 journey every step of the way. Whether you need training, consulting, or have questions about our services, don't hesitate to reach out. Submit the form below or email us directly – we're always available to discuss your needs and help you achieve your business goals."
    },
    {
      title: "Let's Connect and Collaborate",
      description: "Your success is our priority. From comprehensive training programs to custom solutions, we offer the full spectrum of Dynamics 365 services. Feel free to contact us through the form or send a direct email for immediate assistance. We're here to answer questions, discuss availability, and explore how we can support your organization."
    },
    {
      title: "Expert Support, Personalized Service",
      description: "Looking for Dynamics 365 expertise? You've come to the right place. Our team is ready to assist with training, implementation, or any questions you might have. Use the contact form for detailed inquiries or reach out via email for quick questions. We welcome all collaboration opportunities and are excited to hear from you."
    },
    {
      title: "Your Dynamics 365 Partner Awaits",
      description: "Whether you're just getting started or looking to optimize your existing setup, we're here to help. Our comprehensive services range from beginner training to advanced consulting. Contact us using the form below or email directly – we're always open to discussing your requirements, availability, and how we can best serve your business needs."
    },
    {
      title: "Questions? We Have Answers.",
      description: "From training schedules to custom service packages, we're your go-to resource for all things Dynamics 365. Our friendly team is standing by to provide the support and guidance you need. Submit your inquiry through our contact form or drop us an email directly. We're here to help with any questions about our services, availability, or collaboration opportunities."
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      // toast({
      //   title: "Missing Information",
      //   description: "Please fill in all fields before submitting.",
      //   variant: "destructive",
      // });
      return;
    }

    // Simulate form submission
    // toast({
    //   title: "Message Sent Successfully!",
    //   description: "Thank you for reaching out. We'll get back to you within 24 hours.",
    // });

    // Reset form
    setFormData({ name: "", email: "", message: "" });
  };

  const currentMessage = messageVariations[currentVariation];

  return (
    <section className="py-24 bg-hero-bg border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <MessageCircle className="w-5 h-5 text-primary" />
            <span className="text-primary font-medium">Get In Touch</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-text-light mb-6">
            {currentMessage.title}
          </h2>
          
          <p className="text-lg text-text-muted-light max-w-4xl mx-auto leading-relaxed mb-8">
            {currentMessage.description}
          </p>

          {/* Message Variation Selector */}
          <div className="flex justify-center gap-2 mb-12">
            {messageVariations.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentVariation(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentVariation 
                    ? "bg-primary scale-125" 
                    : "bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`View message variation ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Contact Form */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300">
            <h3 className="text-2xl font-bold text-text-light mb-6 flex items-center gap-3">
              <Send className="w-6 h-6 text-primary" />
              Send Us a Message
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-text-light font-medium mb-2">
                    Full Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/20 text-text-light placeholder:text-text-muted-light focus:border-primary focus:ring-primary/20"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-text-light font-medium mb-2">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/20 text-text-light placeholder:text-text-muted-light focus:border-primary focus:ring-primary/20"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-text-light font-medium mb-2">
                  Message *
                </label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us about your needs, questions, or how we can help..."
                  value={formData.message}
                  onChange={handleInputChange}
                  className="bg-white/5 border-white/20 text-text-light placeholder:text-text-muted-light focus:border-primary focus:ring-primary/20 min-h-32 resize-none"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
              >
                <Send className="w-5 h-5 mr-2" />
                Send Message
              </Button>
            </form>
          </div>

          {/* Direct Contact Info */}
          <div className="space-y-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300">
              <h3 className="text-2xl font-bold text-text-light mb-6 flex items-center gap-3">
                <Mail className="w-6 h-6 text-primary" />
                Direct Contact
              </h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-text-muted-light mb-3">
                    Prefer to email directly? Reach out to us at:
                  </p>
                  <a 
                    href="mailto:contact@dynamics365lab.com"
                    className="inline-flex items-center gap-2 text-xl font-semibold text-primary hover:text-primary-glow transition-colors duration-300 group"
                  >
                    <Mail className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    contact@dynamics365lab.com
                  </a>
                </div>
                
                <div className="border-t border-white/10 pt-6">
                  <h4 className="text-lg font-semibold text-text-light mb-3">What to expect:</h4>
                  <ul className="space-y-2 text-text-muted-light">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span>Response within 24 hours</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span>Personalized consultation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span>Flexible scheduling options</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span>Custom solution recommendations</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-primary-glow/10 border border-primary/20 rounded-3xl p-8">
              <h4 className="text-xl font-bold text-text-light mb-4">Ready to Get Started?</h4>
              <p className="text-text-muted-light mb-6">
                Join thousands of professionals who have transformed their careers with our Dynamics 365 training programs.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">Training</span>
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">Consulting</span>
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">Implementation</span>
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;