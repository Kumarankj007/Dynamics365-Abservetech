import { 
  BarChart3, 
  Users, 
  GraduationCap, 
  BookOpen, 
  CreditCard, 
  Receipt,
  Percent,
  Settings2, 
  Tag,
  ChevronRight,
  Home,
  MessageSquare
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: BarChart3 },
  { title: "Students", url: "/admin/students", icon: Users },
  { title: "Instructors", url: "/admin/instructors", icon: GraduationCap },
  { title: "Create Course", url: "/admin/create-course", icon: BookOpen },
  { title: "Manage Courses", url: "/admin/manage-courses", icon: BookOpen },
  { title: "Course Reviews", url: "/admin/courses", icon: BookOpen },
  { title: "Payout Requests", url: "/admin/payouts", icon: CreditCard },
  { title: "Transactions", url: "/admin/transactions", icon: Receipt },
  { title: "Commissions", url: "/admin/commissions", icon: Percent },
  { title: "Catalog Config", url: "/admin/catalog", icon: Settings2 },
  { title: "Coupons", url: "/admin/coupons", icon: Tag },
  { title: "Profile", url: "/admin/profile", icon: Users },
  { title: "Testimonials", url: "/admin/testimonials", icon: MessageSquare },
  { title: "Settings", url: "/admin/settings", icon: Settings2 },
];

export function AdminSidebar() {
  const sidebar = useSidebar();
  const collapsed = !sidebar.open;
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar className="border-r bg-white border-gray-200">
      <div className="flex h-16 items-center border-b border-gray-200 px-6 bg-white">
        <SidebarTrigger className="mr-2 text-gray-700 hover:text-gray-900" />
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <NavLink to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Home className="w-4 h-4 text-gray-600 hover:text-gray-900" />
            </NavLink>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
          </div>
        )}
      </div>

      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className={`${collapsed ? "sr-only" : ""} text-gray-600 px-3 py-2 text-xs uppercase tracking-wide font-medium`}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavLink
                    to={item.url}
                    end={item.url === "/admin"}
                    className={({ isActive }) => `
                      flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors w-full
                      ${isActive ? 
                        'bg-primary text-white font-medium shadow-sm' : 
                        'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="truncate">{item.title}</span>}
                    {!collapsed && isActive(item.url) && (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}