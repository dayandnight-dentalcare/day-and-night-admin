"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Calendar, 
  Users, 
  Clock, 
  UploadCloud, 
  History, 
  Send, 
  LogOut,
  Stethoscope
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Bookings", href: "/dashboard/bookings", icon: Calendar },
  { name: "Patients", href: "/dashboard/patients", icon: Users },
  { name: "Slot Manager", href: "/dashboard/slots", icon: Clock },
  { name: "Upload Campaign", href: "/dashboard/campaign/upload", icon: UploadCloud },
  { name: "Campaign History", href: "/dashboard/campaign/history", icon: History },
  { name: "Delivery Status", href: "/dashboard/campaign/delivery", icon: Send },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // Mock logout
    localStorage.removeItem("adminAuth");
    router.push("/login");
  };

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-slate-200 shadow-sm fixed inset-y-0 z-50">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-100">
        <Stethoscope className="h-8 w-8 text-primary" />
        <span className="ml-3 text-lg font-bold text-slate-900 tracking-tight">Day & Night</span>
      </div>
      
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600",
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center px-3 py-2.5 text-sm font-medium text-slate-600 rounded-lg hover:bg-rose-50 hover:text-rose-700 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 text-slate-400 group-hover:text-rose-500 transition-colors" />
          Logout
        </button>
      </div>
    </div>
  );
}
