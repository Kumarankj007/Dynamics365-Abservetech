"use client";
import { User, LogOut, GraduationCap } from "lucide-react";
import Link from "next/link";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/core/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { useAuthStore } from "../store/authStore";

interface UserAvatarDropdownProps {
  user?: {
    name?: string;
    email?: string;
    photoUrl?: string;
  };
  onLogout?: () => void;
  onBecomeInstructor?: () => void;
}

const UserAvatarDropdown = ({
  user,
  onLogout,
  onBecomeInstructor,
}: UserAvatarDropdownProps) => {
  // Get initials from name or email
  const { userData } = useAuthStore((state) => state);
  // console.log(user, "user");
  const getInitials = () => {
    if (user?.name) {
      // const parts = user.name.split(" ");
      // if (parts.length >= 2) {
      //   return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      // }
      return user.name.slice(0, 1).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 1).toUpperCase();
    }
    return "U";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex items-center justify-center w-10 h-10 rounded-full ring-2 ring-white/20 hover:ring-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black/20 transition-all duration-300"
          aria-haspopup="menu"
          aria-label="User menu"
        >
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.photoUrl} alt={user?.name || "User"} />
            <AvatarFallback className="bg-primary/20 text-white text-[18px] font-semibold border border-primary/40">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl shadow-lg"
        sideOffset={8}
      >
        <DropdownMenuItem asChild>
          <Link
            href="/student/profile"
            className="flex items-center px-4 py-3 text-sm text-white hover:bg-white/10 hover:text-white rounded-md transition-colors cursor-pointer focus:bg-white/10 focus:text-white focus:outline-none"
          >
            <User className="w-4 h-4 mr-3" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>

        {userData && !userData?.role?.includes("Instructor") && (
          <DropdownMenuItem
            onClick={onBecomeInstructor}
            className="flex items-center px-4 py-3 text-sm text-white hover:bg-white/10 hover:text-white rounded-md transition-colors cursor-pointer focus:bg-white/10 focus:text-white focus:outline-none"
          >
            <GraduationCap className="w-4 h-4 mr-3" />
            <span>Become an Instructor</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={onLogout}
          className="flex items-center px-4 py-3 text-sm text-white hover:bg-white/10 hover:text-white rounded-md transition-colors cursor-pointer focus:bg-white/10 focus:text-white focus:outline-none"
        >
          <LogOut className="w-4 h-4 mr-3" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAvatarDropdown;
