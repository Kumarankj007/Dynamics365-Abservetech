import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dynamics 365 Lab",
  description: "Dynamics 365 Lab",
};
const Layout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default Layout;
