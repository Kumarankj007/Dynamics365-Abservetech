"use client";
import Link from "next/link";
import { useAuthStore } from "../store/authStore";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { token } = useAuthStore((state) => state);

  // Single source of truth for footer content
  const footer = [
    {
      categoryTitle: "Explore",
      category: [
        { label: "Home", url: "/" },
        { label: "Microsoft Dynamics 365 Courses", url: "/courses" },
        {
          label: "Microsoft Dynamics 365 Jobs",
          url: "https://dynamics365jobs.io/",
          newWindow: true,
        },
        // { label: "Microsoft Dynamics 365 Blogs", url: "/blog" },
        { label: "About Us", url: "/about" },
      ],
    },
    {
      categoryTitle: "Key Categories",
      category: [
        {
          // label: "Dynamics 365 Finance & Operations (F&O)",
          label: "Dynamics 365 Finance & SCM (F&O) Masterclass",
          url: "/courses/detail/?id=7b701efa-2e42-4088-aed0-655f3837f0b4",
        },
        {
          label: "The Ultimate Power Platform Course",
          url: "/courses/detail/?id=62935c9c-2010-422c-bd5f-6268c3297617",
        },
        {
          label: "Copilot Studio Hands-On Course",
          url: "/courses/detail/?id=d301a8cf-5021-441b-aacf-0beb2108c99a",
        },
      ],
    },
    {
      categoryTitle: "Support",
      category: [
        { label: "Help Center", url: "/" },
        { label: "FAQs", url: "/" },
        { label: "Contact Us", url: "/" },
        { label: "Privacy Policy", url: "/" },
        { label: "Terms & Conditions", url: "/" },
      ],
    },
    {
      categoryTitle: "Get Started",
      category: token
        ? [{ label: "Dashboard", url: "/student/dashboard" }]
        : [
            { label: "Sign Up", url: "/signup" },
            { label: "Login", url: "/login" },
            // example of an action that’s not a page:
            // { label: "Become an Instructor", url: "#", isButton: true },
          ],
    },
  ];

  return (
    <footer className="bg-black/40 backdrop-blur-md border-t border-white/10 mt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {footer.map((section) => (
            <div key={section.categoryTitle} className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                {section.categoryTitle}
              </h3>
              <div className="space-y-3">
                {section.category.map((item) => (
                  // item?.isButton ? (
                  //   <button
                  //     key={item.label}
                  //     className="block text-left text-white/80 hover:text-primary transition-colors duration-300"
                  //   >
                  //     {item.label}
                  //   </button>
                  // ) :
                  <Link
                    key={item.label}
                    href={item.url}
                    target={item.newWindow ? "_blank" : "_self"}
                    className="block text-white/80 hover:text-primary transition-colors duration-300"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-8">
          <p className="text-center text-white/60 text-sm">
            © Dynamics365Lab {currentYear}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
