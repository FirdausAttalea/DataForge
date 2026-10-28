"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  X,
  LayoutGrid,
  FolderOpen,
  Compass,
  Database,
  Code2,
  Lightbulb,
  Zap,
  BookOpen,
  Settings,
} from "lucide-react";
import { UserCard } from "./UserCard";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  disabled?: boolean;
  badge?: string;
}

const navigationItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: <LayoutGrid size={20} /> },
  { label: "My Projects", href: "/projects", icon: <FolderOpen size={20} /> },
  { label: "Explore Cases", href: "/cases", icon: <Compass size={20} /> },
  { label: "Datasets", href: "/datasets", icon: <Database size={20} /> },
];

const toolItems: NavItem[] = [
  { label: "SQL Lab", href: "/sql-lab", icon: <Code2 size={20} /> },
  { label: "Insights", href: "/insights", icon: <Lightbulb size={20} /> },
  { label: "Pipelines", href: "/pipelines", icon: <Zap size={20} />, disabled: true, badge: "P1" },
  { label: "ML Lab", href: "/ml-lab", icon: <Lightbulb size={20} />, disabled: true, badge: "P2" },
];

const bottomItems: NavItem[] = [
  { label: "Documentation", href: "/documentation", icon: <BookOpen size={20} /> },
  { label: "Settings", href: "/settings", icon: <Settings size={20} /> },
];

function SidebarNavItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  if (item.disabled) {
    return (
      <div
        aria-disabled="true"
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 cursor-not-allowed opacity-50"
      >
        {item.icon}
        <span className="text-sm font-medium">{item.label}</span>
        {item.badge && <span className="ml-auto text-xs font-semibold text-slate-400">{item.badge}</span>}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
        isActive
          ? "bg-indigo-100 text-indigo-600"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {item.icon}
      <span className="text-sm font-medium">{item.label}</span>
      {item.badge && <span className="ml-auto text-xs font-semibold">{item.badge}</span>}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/";
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-3 bg-indigo-600 text-white rounded-full shadow-lg md:hidden hover:bg-indigo-700 transition"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-white border-r border-slate-200 flex flex-col z-40 transform transition-transform md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="px-6 py-4 border-b border-slate-200">
          <h1 className="text-lg font-bold text-slate-900">DataForge</h1>
        </div>

        {/* Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
          {/* Navigation */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Navigation</p>
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarNavItem key={item.label} item={item} isActive={isActive(item.href)} />
              ))}
            </div>
          </div>

          {/* Tools */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Tools</p>
            <div className="space-y-1">
              {toolItems.map((item) => (
                <SidebarNavItem key={item.label} item={item} isActive={isActive(item.href)} />
              ))}
            </div>
          </div>

          {/* Bottom Items */}
          <div>
            <div className="space-y-1">
              {bottomItems.map((item) => (
                <SidebarNavItem key={item.label} item={item} isActive={isActive(item.href)} />
              ))}
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 border-t border-slate-200">
          <UserCard />
        </div>
      </aside>

      {/* Spacer for desktop */}
      <div className="hidden md:block w-72" />
    </>
  );
}
