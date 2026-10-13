/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import { useState } from "react";
import Link from "next/link";
import { Menu, X, User, GraduationCap, LogOut } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/core/components/ui/navigation-menu";
import ImageComponent from "./imageComponent";
import { useAuthStore } from "../store/authStore";
import { setCookie } from "../utils/helperFunction";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import BecomeInstructorModal from "./BecomeInstructorModal";
import UserAvatarDropdown from "./UserAvatarDropdown";
import UseLoadingRouter from "../hooks/useLoadRoute";

const NavigationCourses = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = UseLoadingRouter();
  const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);
  const { token, setToken, DeleteApi, userData, switchRole } = useAuthStore(
    (state) => state
  );

  const mockUser = {
    name: userData ? userData?.fullname : "",
    email: userData ? userData?.email : "",
    photoUrl: userData ? userData?.profile : "",
  };

  // console.log(userData, 'userData')

  const apiCallRole = async (data: any) => {
    return switchRole(data);
  };
  const { trigger } = useCustomMutation(apiCallRole, {
    onSuccessCallback() {
      setIsMenuOpen(false);
      router?.push(
        userData?.currentRole == "Instructor" ? "/instructor/dashboard" : "/"
      );
    },
  });

  // delete api:
  const apiCall = async () => {
    return DeleteApi({});
  };
  const { trigger: DeleteTrigger } = useCustomMutation(apiCall);
  const deleteAccount = () => {
    // DeleteTrigger({});
    setCookie("appToken", "", 0);
    window.localStorage.clear();
    setToken(false);
  };

  // when logout:
  const handleLogout = () => {
    setCookie("appToken", "", 0);
    window.localStorage.clear();
    setToken(false);
  };

  return (
    <>
      {/* Logo and Brand Name - Far Left */}
      <div className="fixed top-6 left-4 z-50">
        <Link
          href="/courses/"
          className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-2 px-4 flex items-center space-x-3 group"
        >
          <span
            className="text-xl font-bold text-white group-hover:text-primary transition-colors drop-shadow-lg"
            style={{
              textShadow: "0 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.3)",
            }}
          >
            Back to courses
          </span>
        </Link>
      </div>

      {/* Navigation Menu - Top Center-Right */}
      <nav className="fixed top-6 right-6 z-50">
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-4">
          {/* Navigation Menu */}
          <NavigationMenu>
            <NavigationMenuList className="flex items-center space-x-1">
              {/* Home */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/"
                    className="nav-link xl:px-4 px-2 py-3 text-sm font-medium text-white transition-all duration-300 hover:text-white relative"
                  >
                    Home
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              {/* Courses Menu */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="nav-link bg-transparent text-white hover:text-white hover:bg-white/10 data-[state=open]:bg-white/10 data-[state=open]:text-white xl:px-4 px-2 py-3 text-sm font-medium">
                  Courses
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-48 p-4 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl">
                    <NavigationMenuLink asChild>
                      <Link
                        href="/courses"
                        className="block px-4 py-2 text-sm text-white hover:bg-white/10 hover:text-white rounded-md transition-colors"
                      >
                        Browse All Courses
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Jobs Menu */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="nav-link bg-transparent text-white hover:text-white hover:bg-white/10 data-[state=open]:bg-white/10 data-[state=open]:text-white xl:px-4 px-2 py-3 text-sm font-medium">
                  Jobs
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-48 p-4 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl">
                    <NavigationMenuLink asChild>
                      <a
                        href="https://dynamics365jobs.io/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-2 text-sm text-white hover:bg-white/10 hover:text-white rounded-md transition-colors"
                      >
                        Browse D365 Jobs
                      </a>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Blog */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/blog"
                    className="nav-link xl:px-4 px-2 py-3 text-sm font-medium text-white transition-all duration-300 hover:text-white relative"
                  >
                    Blog
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* About Us */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/about"
                    className="nav-link xl:px-4 px-2 py-3 text-sm font-medium text-white transition-all duration-300 hover:text-white relative"
                  >
                    About Us
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            {/* Signup Button */}
            {!token && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-10 px-4 border-2 border-primary/60 bg-transparent text-white hover:text-white hover:bg-primary/10 hover:border-primary hover:shadow-glow transition-all duration-300 rounded-lg"
                >
                  <Link href="/signup">Sign up</Link>
                </Button>

                {/* Login Button */}
                <Button variant="hero" size="sm" asChild className="h-10 px-4">
                  <Link href="/login">Login</Link>
                </Button>
              </>
            )}
            {token && (
              <>
                {/* Dashboard Link - Only when logged in */}
                <Link
                  href="/student/dashboard"
                  className="flex items-center space-x-2 xl:px-4 px-2 py-2.5 text-sm font-medium text-white hover:text-primary hover:bg-white/5 rounded-lg transition-all duration-300"
                >
                  <User className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>

                {/* Instructor View Link */}
                {userData && userData?.role?.includes("Instructor") && (
                  <div
                    onClick={() => {
                      trigger({ newRole: "Instructor" });
                    }}
                    className="flex items-center space-x-2 xl:px-4 px-2 py-2.5 text-sm font-medium text-white hover:text-primary hover:bg-white/5 rounded-lg transition-all duration-300 cursor-pointer"
                  >
                    <User className="w-5 h-5" />
                    <span>Instructor View</span>
                  </div>
                )}

                <>
                  <UserAvatarDropdown
                    user={mockUser}
                    onLogout={handleLogout}
                    onBecomeInstructor={() => setIsInstructorModalOpen(true)}
                  />
                </>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 rounded-xl"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          {/* Mobile Menu Dropdown */}
          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-black/90 backdrop-blur-md border border-white/10 rounded-2xl p-4">
              <div className="space-y-4 h-auto max-h-[70vh] overflow-auto">
                {/* Mobile Menu Items */}
                <div className="space-y-2">
                  <Link
                    href="/"
                    className="block px-4 py-2 text-sm text-white hover:bg-white/10 hover:text-white rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/courses"
                    className="block px-4 py-2 text-sm text-white hover:bg-white/10 hover:text-white rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Browse All Courses
                  </Link>
                  <a
                    href="https://dynamics365jobs.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-white hover:bg-white/10 hover:text-white rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Browse D365 Jobs
                  </a>
                  <Link
                    href="/blog"
                    className="block px-4 py-2 text-sm text-white hover:bg-white/10 hover:text-white rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Blog
                  </Link>
                  <Link
                    href="/about"
                    className="block px-4 py-2 text-sm text-white hover:bg-white/10 hover:text-white rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About Us
                  </Link>
                </div>

                {/* Mobile Auth Buttons */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  {!token && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="w-full h-10 border-2 border-primary/60 bg-transparent text-white hover:text-white hover:bg-primary/10 hover:border-primary hover:shadow-glow"
                      >
                        <Link
                          href="/signup"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Sign up
                        </Link>
                      </Button>
                      <Button
                        variant="hero"
                        size="sm"
                        asChild
                        className="w-full h-10"
                      >
                        <Link
                          href="/login"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Login
                        </Link>
                      </Button>
                    </>
                  )}

                  {token && (
                    <>
                      <Link
                        href="/studet/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 rounded-md transition-colors w-full"
                      >
                        <User className="w-5 h-5" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href="/student/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 rounded-md transition-colors w-full"
                      >
                        <User className="w-5 h-5" />
                        <span>Profile</span>
                      </Link>

                      {userData && !userData?.role?.includes("Instructor") && (
                        <div
                          onClick={() => {
                            setIsMenuOpen(false);
                            setIsInstructorModalOpen(true);
                          }}
                          className="flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 rounded-md transition-colors w-full"
                        >
                          <GraduationCap className="w-4 h-4" />
                          <span>Become an Instructor</span>
                        </div>
                      )}
                      {userData && userData?.role?.includes("Instructor") && (
                        <div
                          onClick={() => {
                            trigger({ newRole: "Instructor" });
                          }}
                          // onClick={() => setIsMenuOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 rounded-md transition-colors w-full cursor-pointer"
                        >
                          <User className="w-5 h-5" />
                          <span>Instructor View</span>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 rounded-md transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        <span>Logout</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <BecomeInstructorModal
        isOpen={isInstructorModalOpen}
        onClose={() => setIsInstructorModalOpen(false)}
      />
    </>
  );
};

export default NavigationCourses;
