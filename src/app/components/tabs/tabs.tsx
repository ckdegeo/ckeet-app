'use client';

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import "./tabs.css";

interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  icon?: LucideIcon;
  disabled?: boolean;
}

interface TabProps {
  items: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export default function Tabs({
  items,
  activeTab,
  onChange,
  className = "",
}: TabProps) {
  return (
    <div className="w-full flex flex-col gap-4">
      {/* Cabeçalho das Tabs */}
      <div className="w-full overflow-x-auto pb-1 hide-scrollbar">
        <div 
          className={`
            flex flex-nowrap gap-2 p-1
            border-b border-[var(--on-background)]/10
            min-w-max
            ${className}
          `}
        >
          {items.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onChange(tab.id)}
              disabled={tab.disabled}
              className={`
                px-6 py-3
                rounded-full
                font-medium
                transition-all
                text-base
                flex items-center gap-2
                ${
                  activeTab === tab.id
                    ? "bg-[var(--primary)] text-[var(--on-primary)]"
                    : "text-[var(--foreground)] hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                }
                ${
                  tab.disabled
                    ? "opacity-40 cursor-not-allowed"
                    : "cursor-pointer"
                }
              `}
            >
              {tab.icon && <tab.icon size={18} />}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo da Tab Ativa */}
      <div className="w-full">
        {items.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}