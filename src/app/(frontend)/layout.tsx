import Footer from "@/core/components/Footer";
import Navigation from "@/core/components/Navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-hero-bg">
      <Navigation />
      <div className="min-h-screen bg-hero-bg relative">{children}</div>
      <Footer />
    </div>
  );
}
