// import dynamicsFoIcon from "@/assets/dynamics-fo-icon.png";
// import dynamicsSalesIcon from "@/assets/dynamics-sales-icon.png";
// import dynamicsCsIcon from "@/assets/dynamics-cs-icon.png";
// import powerPlatformIcon from "@/assets/power-platform-icon.png";
// import powerBiIcon from "@/assets/power-bi-icon.png";
// import dataverseIcon from "@/assets/dataverse-icon.png";

const AppsSection = () => {
  const apps = [
    {
      name: "Dynamics 365 F&O",
      // icon: dynamicsFoIcon,
      description: "Finance & Operations"
    },
    {
      name: "Dynamics 365 Sales",
      // icon: dynamicsSalesIcon,
      description: "Customer Relationship Management"
    },
    {
      name: "Dynamics 365 Customer Service",
      // icon: dynamicsCsIcon,
      description: "Service Management"
    },
    {
      name: "Power Platform",
      // icon: powerPlatformIcon,
      description: "Low-Code Development"
    },
    {
      name: "Power BI",
      // icon: powerBiIcon,
      description: "Business Intelligence"
    },
    {
      name: "Dataverse",
      // icon: dataverseIcon,
      description: "Data Platform"
    }
  ];

  return (
    <section className="py-20 bg-dark-section">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-text-light mb-6">
            Microsoft Business Applications We Support
          </h2>
          <p className="text-xl text-text-muted-light max-w-3xl mx-auto">
            Comprehensive training for the complete Microsoft ecosystem
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {apps.map((app, index) => (
            <div
              key={app.name}
              className="group flex flex-col items-center p-6 rounded-2xl bg-hero-bg/50 border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-glow animate-fade-in-scale"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 mb-4 group-hover:animate-float">
                {/* <img 
                  src={app.icon} 
                  alt={app.name}
                  className="w-full h-full object-contain filter brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                /> */}
              </div>
              <h3 className="text-text-light font-semibold text-center text-sm mb-2">
                {app.name}
              </h3>
              <p className="text-text-muted-light text-xs text-center">
                {app.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AppsSection;