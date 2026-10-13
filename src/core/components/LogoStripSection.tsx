"use client";

import ImageComponent from "./imageComponent";

// import dataverseIcon from "@/assets/dataverse-icon.png";
// import dynamicsCsIcon from "@/assets/dynamics-cs-icon.png";
// import dynamicsFoIcon from "@/assets/dynamics-fo-icon.png";
// import dynamicsSalesIcon from "@/assets/dynamics-sales-icon.png";
// import powerBiIcon from "@/assets/power-bi-icon.png";
// import powerPlatformIcon from "@/assets/power-platform-icon.png";

type DesignVariant =
  | "minimal"
  | "gradient-cards"
  | "geometric"
  | "elegant-borders"
  | "dark-elegant"
  | "dark-glass"
  | "dark-minimal"
  | "dark-glow"
  | "dark-neon"
  | "dark-pulse"
  | "dark-aurora"
  | "dark-cyber";

const LogoStripSection = () => {
  // Glow variations: 'dark-glow', 'dark-neon', 'dark-pulse', 'dark-aurora', 'dark-cyber'
  // Other dark themes: 'dark-elegant', 'dark-glass', 'dark-minimal'
  const designVariant = "dark-neon" as DesignVariant;

  const logos = [
    {
      name: "D365 Finance",
      icon: "/assets/icons/2b151128-59dc-4905-ac8c-d7851aea98de.png",
      alt: "Dynamics 365 Finance",
      text: "D365 Finance",
    },
    {
      name: "D365 SCM",
      icon: "/assets/icons/42732d70-e077-4dc6-a43b-ba53b3ec20c5.png",
      alt: "Dynamics 365 Supply Chain Management",
      text: "D365 SCM",
    },
    {
      name: "D365 Sales (CE)",
      icon: "/assets/icons/4694cdc7-585f-4598-823c-2c53ac8c5c52.png",
      alt: "Dynamics 365 Sales",
      text: "D365 Sales (CE)",
    },
    {
      name: "D365 F&O",
      icon: "/assets/icons/2b151128-59dc-4905-ac8c-d7851aea98de.png",
      alt: "Dynamics 365 Finance & Operations",
      text: "D365 F&O",
    },
    {
      name: "D365 Field Service",
      icon: "/assets/icons/a64d39b9-626d-41b3-b8d2-956e270c2c4b.png",
      alt: "Dynamics 365 Field Service",
      text: "D365 Field Service",
    },
    {
      name: "Power Apps",
      icon: "/assets/icons/6ec8bf22-6930-4de0-9250-b1daa79dca66.png",
      alt: "Power Apps",
      text: "Power Apps",
    },
    {
      name: "Power Automate",
      icon: "/assets/icons/8b3f9924-9976-4c4c-9eb4-affd9b1916ff.png",
      alt: "Power Automate",
      text: "Power Automate",
    },
    {
      name: "Power BI",
      icon: "/assets/icons/dfd212ab-4941-4417-a8de-7e2c5e353c37.png",
      alt: "Power BI",
      text: "Power BI",
    },
    {
      name: "Copilot Studio",
      icon: "/assets/icons/4ca98820-4e59-4473-b8b5-e61c29e9c266.png",
      alt: "Copilot Studio",
      text: "Copilot Studio",
    },
  ];

  const duplicatedLogos = [...logos, ...logos];

  // Design configurations
  const designs = {
    minimal: {
      section: "py-20 bg-white",
      container: "max-w-7xl mx-auto px-6",
      heading: "text-4xl md:text-5xl font-bold text-gray-900 mb-4",
      subheading: "text-xl text-gray-600 max-w-3xl mx-auto",
      logoCard:
        "flex-shrink-0 flex items-center justify-center mx-6 md:mx-8 group cursor-pointer",
      logoWrapper:
        "p-6 rounded-xl bg-white shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:scale-105 hover:-translate-y-1",
      logo: "h-12 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300",
      fadeEdge: "bg-gradient-to-r from-white to-transparent",
    },
    "gradient-cards": {
      section: "py-20 bg-gradient-to-b from-gray-50 to-white",
      container: "max-w-7xl mx-auto px-6",
      heading:
        "text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4",
      subheading: "text-xl text-gray-700 max-w-3xl mx-auto",
      logoCard:
        "flex-shrink-0 flex items-center justify-center mx-6 md:mx-8 group cursor-pointer",
      logoWrapper:
        "p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-lg border border-white/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-105",
      logo: "h-12 w-auto object-contain filter drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300",
      fadeEdge: "bg-gradient-to-r from-gray-50 to-transparent",
    },
    geometric: {
      section: "py-20 bg-white relative overflow-hidden",
      container: "max-w-7xl mx-auto px-6 relative z-10",
      heading: "text-4xl md:text-5xl font-bold text-gray-900 mb-4",
      subheading: "text-xl text-gray-600 max-w-3xl mx-auto",
      logoCard:
        "flex-shrink-0 flex items-center justify-center mx-6 md:mx-8 group cursor-pointer",
      logoWrapper:
        "p-6 rounded-2xl bg-white border-2 border-blue-100 transition-all duration-300 hover:border-blue-300 hover:bg-blue-50/50 hover:scale-105 relative overflow-hidden",
      logo: "h-12 w-auto object-contain relative z-10 transition-transform duration-300 group-hover:scale-110",
      fadeEdge: "bg-gradient-to-r from-white to-transparent",
    },
    "elegant-borders": {
      section: "py-20 bg-gray-50",
      container: "max-w-7xl mx-auto px-6",
      heading: "text-4xl md:text-5xl font-bold text-gray-900 mb-4",
      subheading: "text-xl text-gray-600 max-w-3xl mx-auto",
      logoCard:
        "flex-shrink-0 flex items-center justify-center mx-6 md:mx-8 group cursor-pointer",
      logoWrapper:
        "p-8 rounded-lg bg-white border-l-4 border-blue-500 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-l-8 hover:border-blue-600",
      logo: "h-12 w-auto object-contain transition-all duration-300 group-hover:scale-110",
      fadeEdge: "bg-gradient-to-r from-gray-50 to-transparent",
    },
    "dark-elegant": {
      section: "py-20 bg-dark-section",
      container: "max-w-7xl mx-auto px-6",
      heading: "text-4xl md:text-5xl font-bold text-text-light mb-4",
      subheading: "text-xl text-text-muted-light max-w-3xl mx-auto",
      logoCard:
        "flex-shrink-0 flex items-center justify-center mx-6 md:mx-8 group cursor-pointer",
      logoWrapper:
        "p-8 rounded-lg bg-hero-bg/50 border-l-4 border-primary shadow-sm transition-all duration-300 hover:shadow-glow hover:border-l-8 hover:border-primary-glow hover:bg-hero-bg/70",
      logo: "h-12 w-auto object-contain filter brightness-0 invert opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110",
      fadeEdge: "bg-gradient-to-r from-dark-section to-transparent",
    },
    "dark-glass": {
      section: "py-20 bg-hero-bg",
      container: "max-w-7xl mx-auto px-6",
      heading: "text-4xl md:text-5xl font-bold text-text-light mb-4 glow-text",
      subheading: "text-xl text-text-muted-light max-w-3xl mx-auto",
      logoCard:
        "flex-shrink-0 flex items-center justify-center mx-6 md:mx-8 group cursor-pointer",
      logoWrapper:
        "p-8 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg transition-all duration-300 hover:bg-white/20 hover:border-white/40 hover:shadow-glow",
      logo: "h-12 w-auto object-contain filter brightness-0 invert opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110",
      fadeEdge: "bg-gradient-to-r from-hero-bg to-transparent",
    },
    "dark-minimal": {
      section: "py-20 bg-dark-section",
      container: "max-w-7xl mx-auto px-6",
      heading: "text-4xl md:text-5xl font-bold text-text-light mb-4",
      subheading: "text-xl text-text-muted-light max-w-3xl mx-auto",
      logoCard:
        "flex-shrink-0 flex items-center justify-center mx-6 md:mx-8 group cursor-pointer",
      logoWrapper:
        "p-6 rounded-xl bg-hero-bg/60 border border-primary/20 transition-all duration-300 hover:bg-hero-bg/80 hover:border-primary/40 hover:scale-105",
      logo: "h-12 w-auto object-contain filter brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity duration-300",
      fadeEdge: "bg-gradient-to-r from-dark-section to-transparent",
    },
    "dark-glow": {
      section: "py-20 bg-hero-bg relative overflow-hidden",
      container: "max-w-7xl mx-auto px-6 relative z-10",
      heading: "text-4xl md:text-5xl font-bold text-text-light mb-4 glow-text",
      subheading: "text-xl text-text-muted-light max-w-3xl mx-auto",
      logoCard:
        "flex-shrink-0 flex items-center justify-center mx-6 md:mx-8 group cursor-pointer",
      logoWrapper:
        "p-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary-glow/10 border border-primary/30 shadow-lg transition-all duration-300 hover:shadow-glow hover:bg-gradient-to-br hover:from-primary/30 hover:to-primary-glow/20 hover:scale-105",
      logo: "h-12 w-auto object-contain filter brightness-0 invert opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110",
      fadeEdge: "bg-gradient-to-r from-hero-bg to-transparent",
    },
    "dark-neon": {
      section: "py-16 bg-black relative overflow-hidden",
      container: "max-w-7xl mx-auto px-6 relative z-10",
      heading:
        "text-3xl md:text-4xl font-bold mb-4 glow-text" +
        " " +
        `text-[hsl(280,45%,88%)]`,
      subheading: "text-xl text-cyan-100 max-w-3xl mx-auto",
      logoCard:
        "flex-shrink-0 flex items-center justify-center mx-6 md:mx-8 group cursor-pointer",
      logoWrapper:
        "p-6 rounded-lg bg-black/50 border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:border-cyan-400 hover:shadow-cyan-400/50 hover:scale-105 hover:bg-cyan-950/20 w-40 h-32 flex items-center justify-center",
      logo: "h-12 w-auto object-contain filter brightness-0 invert opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110",
      fadeEdge: "bg-gradient-to-r from-black to-transparent",
    },
    "dark-pulse": {
      section: "py-20 bg-hero-bg relative overflow-hidden",
      container: "max-w-7xl mx-auto px-6 relative z-10",
      heading: "text-4xl md:text-5xl font-bold text-text-light mb-4 glow-text",
      subheading: "text-xl text-text-muted-light max-w-3xl mx-auto",
      logoCard:
        "flex-shrink-0 flex items-center justify-center mx-6 md:mx-8 group cursor-pointer",
      logoWrapper:
        "p-8 rounded-lg bg-primary/10 border border-primary/40 transition-all duration-500 hover:border-primary hover:bg-primary/20 hover:scale-105 pulse",
      logo: "h-12 w-auto object-contain filter brightness-0 invert opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110",
      fadeEdge: "bg-gradient-to-r from-hero-bg to-transparent",
    },
    "dark-aurora": {
      section:
        "py-20 bg-gradient-to-br from-purple-900/20 via-hero-bg to-blue-900/20 relative overflow-hidden",
      container: "max-w-7xl mx-auto px-6 relative z-10",
      heading:
        "text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4",
      subheading: "text-xl text-text-muted-light max-w-3xl mx-auto",
      logoCard:
        "flex-shrink-0 flex items-center justify-center mx-6 md:mx-8 group cursor-pointer",
      logoWrapper:
        "p-8 rounded-lg bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 border border-purple-400/30 backdrop-blur-sm transition-all duration-300 hover:from-purple-500/20 hover:via-pink-500/20 hover:to-blue-500/20 hover:border-purple-400/60 hover:scale-105",
      logo: "h-12 w-auto object-contain filter brightness-0 invert opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110",
      fadeEdge: "bg-gradient-to-r from-purple-900/20 to-transparent",
    },
    "dark-cyber": {
      section: "py-20 bg-gray-900 relative overflow-hidden",
      container: "max-w-7xl mx-auto px-6 relative z-10",
      heading: "text-4xl md:text-5xl font-bold text-green-400 mb-4 glow-text",
      subheading: "text-xl text-green-100 max-w-3xl mx-auto",
      logoCard:
        "flex-shrink-0 flex items-center justify-center mx-6 md:mx-8 group cursor-pointer",
      logoWrapper:
        "p-8 rounded-none bg-black/60 border border-green-500/40 shadow-lg shadow-green-500/20 transition-all duration-300 hover:border-green-400 hover:shadow-green-400/40 hover:scale-105 hover:bg-green-950/30 relative overflow-hidden",
      logo: "h-12 w-auto object-contain filter brightness-0 invert opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110",
      fadeEdge: "bg-gradient-to-r from-gray-900 to-transparent",
    },
  };

  const currentDesign = designs[designVariant];

  return (
    <section className={currentDesign.section}>
      {/* Geometric background pattern for geometric variant */}
      {designVariant === "geometric" && (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-purple-500 rounded-full"></div>
          <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-blue-400 rounded-full"></div>
        </div>
      )}

      {/* Dark glow background pattern */}
      {designVariant === "dark-glow" && (
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-primary-glow/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-primary/15 rounded-full blur-xl"></div>
        </div>
      )}

      {/* Neon background effects */}
      {designVariant === "dark-neon" && (
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute top-60 right-20 w-32 h-32 bg-cyan-400/15 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-20 left-1/2 w-36 h-36 bg-cyan-300/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>
      )}

      {/* Aurora background effects */}
      {designVariant === "dark-aurora" && (
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "3s" }}
          ></div>
        </div>
      )}

      {/* Cyber grid background */}
      {designVariant === "dark-cyber" && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24px,rgba(34,197,94,0.5)_25px,rgba(34,197,94,0.5)_26px,transparent_27px),linear-gradient(rgba(34,197,94,0.5)_1px,transparent_1px)] bg-[25px_25px]"></div>
          <div className="absolute top-20 left-20 w-32 h-32 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-20 w-24 h-24 bg-green-400/20 rounded-full blur-xl animate-pulse"
            style={{ animationDelay: "1.5s" }}
          ></div>
        </div>
      )}

      <div className={currentDesign.container}>
        {/* Section Header */}
        <div className="text-center my-6">
          <h2 className={currentDesign.heading}>
            Microsoft Business Applications We Support
          </h2>
          <p className={currentDesign.subheading}>
            Comprehensive training for the complete Microsoft ecosystem.
          </p>
        </div>

        {/* Logo Strip Container */}
        <div className="overflow-hidden relative py-7">
          <div
            className={`flex animate-scroll animate-scroll-left:hover`}
            style={{ width: "calc(200% + 96px)" }}
          >
            {duplicatedLogos.map((logo, index) => (
              <div
                key={`${logo.name}-${index}`}
                className={currentDesign.logoCard}
                title={logo.alt}
              >
                <div className={currentDesign.logoWrapper}>
                  <div className="flex flex-col items-center justify-center h-full">
                    <ImageComponent
                      height={100}
                      width={100}
                      src={logo.icon}
                      alt={logo.alt}
                      className="h-16 w-auto object-contain mb-2"
                    />
                    <span className="text-xs font-medium text-cyan-100 text-center leading-tight">
                      {logo.text}
                    </span>
                  </div>
                  {/* Geometric accent for geometric variant */}
                  {designVariant === "geometric" && (
                    <div className="absolute top-0 right-0 w-4 h-4 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                  {/* Glow accent for dark-glow variant */}
                  {designVariant === "dark-glow" && (
                    <div className="absolute top-0 right-0 w-4 h-4 bg-primary-glow rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-glow"></div>
                  )}
                  {/* Neon accents */}
                  {designVariant === "dark-neon" && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg shadow-cyan-400/50"></div>
                  )}
                  {/* Aurora particles */}
                  {designVariant === "dark-aurora" && (
                    <>
                      <div className="absolute top-2 right-2 w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-4 right-4 w-1 h-1 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute top-6 right-6 w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    </>
                  )}
                  {/* Cyber lines */}
                  {designVariant === "dark-cyber" && (
                    <>
                      <div className="absolute top-0 left-0 w-full h-px bg-green-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute bottom-0 left-0 w-full h-px bg-green-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-0 left-0 w-px h-full bg-green-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-0 right-0 w-px h-full bg-green-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Fade edges */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-20 pointer-events-none ${currentDesign.fadeEdge}`}
          />
          <div
            className={`absolute right-0 top-0 bottom-0 w-20 pointer-events-none ${currentDesign.fadeEdge
              .replace("from-", "to-")
              .replace("to-", "from-")}`}
          />
        </div>
      </div>
    </section>
  );
};

export default LogoStripSection;
