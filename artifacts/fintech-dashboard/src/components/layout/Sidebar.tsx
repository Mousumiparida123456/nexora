import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  PieChart,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BRAND, MAIN_NAV, TOOL_NAV } from "@/components/layout/nav";

const AUTH_STORAGE_KEY = "nexora.authenticated";

function NavItem({
  href, label, icon: Icon, collapsed, active,
}: {
  href: string; label: string; icon: React.ElementType;
  collapsed: boolean; active: boolean;
}) {
  return (
    <Link href={href}>
      <div
        title={collapsed ? label : undefined}
        className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all duration-150 group
          ${active
            ? "bg-emerald-500/15 text-emerald-400 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]"
            : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/60"}`}
      >
        {active && (
          <motion.div
            layoutId="sidebar-active-bar"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-emerald-400"
          />
        )}

        <Icon className={`h-[18px] w-[18px] flex-shrink-0 transition-colors ${active ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"}`} />

        {!collapsed && (
          <span className="text-sm font-medium whitespace-nowrap overflow-hidden">{label}</span>
        )}

        {/* Tooltip when collapsed */}
        {collapsed && (
          <div className="pointer-events-none absolute left-full ml-3 z-50 hidden group-hover:flex items-center">
            <div className="rounded-lg bg-slate-800 border border-slate-700/60 px-3 py-1.5 shadow-xl">
              <span className="text-xs font-medium text-slate-200 whitespace-nowrap">{label}</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  function isActive(href: string) {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  }

  function handleLogout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setLocation("/login");
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="hidden md:flex relative h-screen sticky top-0 flex-shrink-0 flex-col border-r border-slate-800/60 bg-slate-950 overflow-hidden z-40"
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-800/60 ${collapsed ? "justify-center px-0" : ""}`}>
        <div className="h-9 w-9 flex-shrink-0 rounded-xl bg-emerald-500 flex items-center justify-center shadow-[0_0_16px_rgba(16,185,129,0.3)]">
          <PieChart className="h-5 w-5 text-slate-950" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-base font-bold text-slate-50 tracking-tight leading-none">{BRAND.name}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">{BRAND.tagline}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto overflow-x-hidden">
        <div>
          {!collapsed && (
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-2">
              Main Menu
            </p>
          )}
          <div className="space-y-0.5">
            {MAIN_NAV.map((item) => (
              <NavItem key={item.href} {...item} collapsed={collapsed} active={isActive(item.href)} />
            ))}
          </div>
        </div>

        <div>
          {!collapsed && (
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-2">
              Tools
            </p>
          )}
          <div className="space-y-0.5">
            {TOOL_NAV.map((item) => (
              <NavItem key={item.href} {...item} collapsed={collapsed} active={isActive(item.href)} />
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-800/60 px-3 py-3 space-y-0.5">
        <Link href="/notifications">
          <div title={collapsed ? "Notifications" : undefined}
            className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all group
              ${isActive("/notifications")
                ? "bg-emerald-500/15 text-emerald-400 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]"
                : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/60"}
              ${collapsed ? "justify-center" : ""}`}
          >
            {isActive("/notifications") && (
              <motion.div
                layoutId="sidebar-active-bar"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-emerald-400"
              />
            )}
            <div className="relative flex-shrink-0">
              <Bell className={`h-[18px] w-[18px] ${isActive("/notifications") ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"}`} />
              {!isActive("/notifications") && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white ring-2 ring-slate-950">
                  3
                </span>
              )}
            </div>
            {!collapsed && <span className="text-sm font-medium whitespace-nowrap">Notifications</span>}
            {!collapsed && !isActive("/notifications") && (
              <span className="ml-auto flex items-center justify-center h-5 min-w-5 rounded-full bg-rose-500/20 border border-rose-500/30 px-1.5 text-[10px] font-bold text-rose-400">
                3
              </span>
            )}
            {collapsed && (
              <div className="pointer-events-none absolute left-full ml-3 z-50 hidden group-hover:flex items-center">
                <div className="rounded-lg bg-slate-800 border border-slate-700/60 px-3 py-1.5 shadow-xl">
                  <span className="text-xs font-medium text-slate-200 whitespace-nowrap">Notifications</span>
                </div>
              </div>
            )}
          </div>
        </Link>

        <Link href="/settings">
          <div title={collapsed ? "Settings" : undefined}
            className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all group
              ${isActive("/settings")
                ? "bg-emerald-500/15 text-emerald-400 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]"
                : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/60"}
              ${collapsed ? "justify-center" : ""}`}
          >
            {isActive("/settings") && (
              <motion.div
                layoutId="sidebar-active-bar"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-emerald-400"
              />
            )}
            <Settings className={`h-[18px] w-[18px] flex-shrink-0 transition-colors ${isActive("/settings") ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"}`} />
            {!collapsed && <span className="text-sm font-medium whitespace-nowrap">Settings</span>}
            {collapsed && (
              <div className="pointer-events-none absolute left-full ml-3 z-50 hidden group-hover:flex items-center">
                <div className="rounded-lg bg-slate-800 border border-slate-700/60 px-3 py-1.5 shadow-xl">
                  <span className="text-xs font-medium text-slate-200 whitespace-nowrap">Settings</span>
                </div>
              </div>
            )}
          </div>
        </Link>

        <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-slate-800/60 transition-all mt-1 ${collapsed ? "justify-center" : ""}`}>
          <Avatar className="h-8 w-8 flex-shrink-0 border border-slate-700 ring-2 ring-emerald-500/20">
            <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
            <AvatarFallback className="bg-slate-800 text-slate-300 text-xs">JD</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 overflow-hidden min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">John Doe</p>
              <p className="text-[10px] text-slate-500 truncate">Free Plan</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all group text-slate-500 hover:text-rose-300 hover:bg-rose-500/10 ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="h-[18px] w-[18px] flex-shrink-0 transition-colors text-slate-500 group-hover:text-rose-300" />
          {!collapsed && <span className="text-sm font-medium whitespace-nowrap">Logout</span>}
          {collapsed && (
            <div className="pointer-events-none absolute left-full ml-3 z-50 hidden group-hover:flex items-center">
              <div className="rounded-lg bg-slate-800 border border-slate-700/60 px-3 py-1.5 shadow-xl">
                <span className="text-xs font-medium text-slate-200 whitespace-nowrap">Logout</span>
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[68px] z-50 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900 text-slate-400 shadow-lg hover:text-slate-100 hover:border-slate-600 transition-all"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </motion.aside>
  );
}
