'use client';

import { useState } from "react";
import { Bell } from "lucide-react";
import Button from "../buttons/button";

interface Notification {
  id: number;
  title: string;
  time: string;
  unread: boolean;
}

interface NotificationButtonProps {
  className?: string;
  notifications?: Notification[];
}

export default function NotificationButton({ 
  className = "",
  notifications = [
    { id: 1, title: "Nova venda realizada", time: "2 min atrás", unread: true },
    { id: 2, title: "Integração atualizada", time: "1 hora atrás", unread: true },
    { id: 3, title: "Relatório mensal disponível", time: "2 horas atrás", unread: false },
  ]
}: NotificationButtonProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Bell size={20} className="text-[var(--foreground)]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[var(--error)] text-[var(--on-error)] text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 bg-[var(--surface)] border border-gray-200 rounded-lg shadow-lg z-50 
                          sm:w-80 
                          max-sm:fixed max-sm:inset-x-4 max-sm:right-4 max-sm:w-auto max-sm:max-w-none">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-[var(--foreground)]">Notificações</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    notification.unread ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-2">
                      <p className="text-sm font-medium text-[var(--foreground)] break-words">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.time}
                      </p>
                    </div>
                    {notification.unread && (
                      <div className="w-2 h-2 bg-[var(--primary)] rounded-full mt-1 flex-shrink-0"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4">
              <Button className="w-full text-sm py-2">
                Ver todas as notificações
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Click Outside Handler */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </>
  );
}
