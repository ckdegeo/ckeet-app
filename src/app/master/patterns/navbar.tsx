'use client';

import { Search as SearchIcon, Store } from "lucide-react";
import UserMenu from "@/app/components/user/userMenu";
import IconOnlyButton from "@/app/components/buttons/iconOnlyButton";

export default function Navbar({ className = "", title = "Master" }) {

  return (
    <nav className={`
      bg-[var(--surface)] border-b border-gray-200 px-4 py-3
      ${className}
    `}>
      <div className="flex items-center justify-between">
        {/* Left Section - Title and Search */}
        <div className="flex items-center gap-6 flex-1">
          {/* Page Title */}
          <div className="hidden md:block">
            <h1 className="text-2xl font-semibold text-[var(--foreground)]">
              {title}
            </h1>
          </div>
        </div>

        {/* Right Section - Actions and User */}
        <div className="flex items-center gap-3">
          {/* Mobile Search Button */}
          <button className="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <SearchIcon size={20} className="text-[var(--foreground)]" />
          </button>

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}