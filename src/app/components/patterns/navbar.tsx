'use client';

import { Search as SearchIcon } from "lucide-react";
import Search from "../inputs/search";
import NotificationButton from "../notifications/notificationButton";
import UserMenu from "../user/userMenu";

interface NavbarProps {
  className?: string;
  title?: string;
}

export default function Navbar({ className = "", title = "Dashboard" }: NavbarProps) {

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

          {/* Search Bar */}
          <div className="hidden sm:block max-w-md flex-1">
            <Search 
              placeholder="Buscar..."
              className="bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        {/* Right Section - Actions and User */}
        <div className="flex items-center gap-3">
          {/* Mobile Search Button */}
          <button className="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <SearchIcon size={20} className="text-[var(--foreground)]" />
          </button>

          {/* Notifications */}
          <NotificationButton />

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="sm:hidden mt-3">
        <Search 
          placeholder="Buscar..."
          className="bg-gray-50 border-gray-200"
        />
      </div>
    </nav>
  );
}