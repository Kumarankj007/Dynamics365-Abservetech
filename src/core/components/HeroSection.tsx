"use client"
import { Button } from "@/core/components/ui/button";
import { ArrowRight, BookOpen, Briefcase } from "lucide-react";
// import heroBgAiRobot from "@/assets/hero-bg-ai-robot.jpg";
import SparkleEffect from "./SparkleEffect";
import UseLoadingRouter from "../hooks/useLoadRoute";

// AI Agent - Mentor AI Hologram (FINAL CHOICE)
// import aiMentorHologram from "@/assets/ai-mentor-hologram.png";

// Previous variations (commented out)
// import aiAgentGeometric from "@/assets/ai-agent-geometric.png";
// import aiAgentCircuit from "@/assets/ai-agent-circuit.png";
// import aiAgentHologram from "@/assets/ai-agent-hologram.png";
// import aiAgentNeural from "@/assets/ai-agent-neural.png";
// import aiAgentParticles from "@/assets/ai-agent-particles.png";
// import aiAgentMinimal from "@/assets/ai-agent-minimal.png";
// import aiAgentDatastream from "@/assets/ai-agent-datastream.png";

const HeroSection = () => {
  const router = UseLoadingRouter();

  return (
    <section className=" bg-gradient-hero relative overflow-hidden flex items-center justify-center px-6">
      {/* Subtle background image - commented out to focus on AI agent */}
      {/* <div 
        className="absolute inset-0 opacity-10 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${heroBgAiRobot})`,
          backgroundPosition: 'center center'
        }}
      /> */}
      
      {/* AI Agent Background - Option 1 variations (very subtle range) */}
      
      {/* Option 1A: Extra subtle (10%) */}
      {/* <div 
        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${aiMentorHologram})`,
          backgroundPosition: 'center center',
          opacity: 0.10
        }}
      /> */}
      
      {/* Option 1B: Very subtle (12%) - CONFIRMED */}
      <div 
        className="absolute inset-0"
        style={{ 
          backgroundImage: `url('/assets/banner.png')`,
          backgroundPosition: 'center center',
          backgroundAttachment: "fixed",
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          opacity: 0.12,
          transform: 'none',
          transition: 'none'
        }}
      />
      
      {/* Option 1C: Original very subtle (15%) */}
      {/* <div 
        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${aiMentorHologram})`,
          backgroundPosition: 'center center',
          opacity: 0.15
        }}
      /> */}
      
      {/* Option 1D: Slightly more (18%) */}
      {/* <div 
        className="absolute inset-0 opacity-18 bg-contain bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${aiMentorHologram})`,
          backgroundPosition: 'center center'
        }}
      /> */}
      
      {/* Option 1E: Soft blend very subtle (12% with soft-light) */}
      {/* <div 
        className="absolute inset-0 opacity-12 bg-contain bg-center bg-no-repeat mix-blend-soft-light"
        style={{ 
          backgroundImage: `url(${aiMentorHologram})`,
          backgroundPosition: 'center center'
        }}
      /> */}
      
      {/* Option 1F: Screen blend subtle (15% with screen) */}
      {/* <div 
        className="absolute inset-0 opacity-15 bg-contain bg-center bg-no-repeat mix-blend-screen"
        style={{ 
          backgroundImage: `url(${aiMentorHologram})`,
          backgroundPosition: 'center center'
        }}
      /> */}
      
      {/* Option 1G: Overlay blend subtle (20% with overlay) */}
      {/* <div 
        className="absolute inset-0 opacity-20 bg-contain bg-center bg-no-repeat mix-blend-overlay"
        style={{ 
          backgroundImage: `url(${aiMentorHologram})`,
          backgroundPosition: 'center center'
        }}
      /> */}
      
      {/* Optional overlay for subtlety */}
      <div className="absolute inset-0 bg-gradient-to-br from-hero-bg/30 via-transparent to-hero-bg/50" />
      
      {/* Sparkle Effect - Change variant to try different styles */}
      {/* Options: 'classic', 'floating-orbs', 'twinkling-stars', 'geometric', 'color-changing', 'fast-moving' */}
      <SparkleEffect variant="color-changing" />
      
      <div className="max-w-4xl mx-auto text-center animate-fade-in relative z-10 sm:mt-32 mt-28 mb-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-center">
          <span 
            className="block mb-3 sm:w-auto w-[300px] mx-auto"
            style={{ color: 'hsl(280, 45%, 88%)' }}
          >
            The Best Dynamics 365
          </span>
          <span 
            className="block mb-3"
            style={{ color: 'hsl(280, 45%, 88%)' }}
          >
            Courses And Jobs
          </span>
          <span 
            className="block"
            style={{ color: 'hsl(280, 45%, 88%)' }}
          >
            - All-In-One Platform
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-text-muted-light mb-12 max-w-3xl mx-auto leading-relaxed">
          Join thousands of professionals mastering Microsoft Business Applications. 
          Learn from certified experts and advance your career in the fastest-growing enterprise platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button 
            variant="hero" 
            size="xl"
            className="group animate-fade-in-scale"
            style={{ animationDelay: "0.2s" }}
            onClick={() => router.push('/courses')}
          >
            <BookOpen className="w-6 h-6" />
            Browse All Courses
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            variant="hero-glass" 
            size="xl"
            onClick={() => window.open("https://dynamics365jobs.io/")}
            className="group animate-fade-in-scale"
            style={{ animationDelay: "0.4s" }}
          >
            <Briefcase className="w-6 h-6" />
            Find D365 Jobs
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="mt-8 text-text-muted-light">
          <p className="text-sm">
            <span className="font-semibold">Explore Courses:</span> Browse our comprehensive library of Dynamics 365 training
          </p>
          <p className="text-sm mt-2">
            <span className="font-semibold">Find D365 Jobs:</span> Connect with top employers seeking Microsoft specialists
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;