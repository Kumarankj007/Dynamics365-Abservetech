export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-hero-bg">
      <div className="min-h-screen bg-hero-bg relative">{children}</div>
    </div>
  );
}
