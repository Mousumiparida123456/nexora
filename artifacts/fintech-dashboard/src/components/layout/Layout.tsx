import { useLocation } from "wouter";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isAuthRoute = location === "/login" || location.startsWith("/login/");

  if (isAuthRoute) {
    return (
      <div className="min-h-screen supports-[height:100dvh]:min-h-dvh bg-[#0f172a] text-slate-50 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
        <div className="min-h-screen supports-[height:100dvh]:min-h-dvh">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen supports-[height:100dvh]:min-h-dvh bg-[#0f172a] text-slate-50 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <div className="md:flex md:min-h-screen supports-[height:100dvh]:md:min-h-dvh">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileNav />
          <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
