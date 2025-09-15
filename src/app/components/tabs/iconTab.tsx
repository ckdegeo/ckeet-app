'use client';

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import "./tabs.css";

interface IconTabItem {
  id: string;
  label: string;
  icon: LucideIcon;
  content: ReactNode;
  disabled?: boolean;
}

interface IconTabProps {
  items: IconTabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export default function IconTab({
  items,
  activeTab,
  onChange,
  className = "",
}: IconTabProps) {
  return (
    <div className="w-full flex flex-col gap-4">
      {/* Cabeçalho das Tabs */}
      <div className="w-full overflow-x-auto pb-1 hide-scrollbar">
        <div 
          className={`
            flex flex-nowrap gap-2 p-1
            border-b border-[var(--on-background)]
            min-w-max
            ${className}
          `}
        >
          {items.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && onChange(tab.id)}
                disabled={tab.disabled}
                className={`
                  cursor-pointer
                  px-4 py-2
                  rounded-full
                  font-medium
                  transition-all
                  text-sm
                  flex items-center gap-2
                  ${
                    activeTab === tab.id
                      ? "bg-[var(--primary)] text-[var(--on-primary)]"
                      : "text-[var(--foreground)] hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                  }
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                `}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo da Tab Ativa */}
      <div className="w-full">
        {items.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}