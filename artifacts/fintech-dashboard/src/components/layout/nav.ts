import {
  LayoutDashboard,
  ArrowLeftRight,
  Gauge,
  TrendingUp,
  Sparkles,
  Bell,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItemDef = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const BRAND = {
  name: "NEXORA",
  tagline: "Investment Planner",
} as const;

export const MAIN_NAV: NavItemDef[] = [
  { href: "/dashboard",    label: "Dashboard",        icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions",     icon: ArrowLeftRight },
  { href: "/credit-score", label: "Credit Simulator", icon: Gauge },
  { href: "/invest",       label: "Investments",      icon: TrendingUp },
];

export const TOOL_NAV: NavItemDef[] = [
  { href: "/ai-assistant", label: "AI Assistant", icon: Sparkles },
];

export const BOTTOM_NAV: NavItemDef[] = [
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings",      label: "Settings",      icon: Settings },
];
