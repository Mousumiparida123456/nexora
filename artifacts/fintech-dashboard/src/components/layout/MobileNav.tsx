import { Link, useLocation } from "wouter";
import { LogOut, Menu, PieChart } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BRAND, MAIN_NAV, TOOL_NAV, BOTTOM_NAV } from "@/components/layout/nav";

const AUTH_STORAGE_KEY = "nexora.authenticated";

function MobileNavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <SheetClose asChild>
      <Link href={href}>
        <a
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
            active
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
              : "text-slate-300 hover:bg-slate-800/60 border border-transparent"
          }`}
        >
          <Icon className={`h-4 w-4 flex-shrink-0 ${active ? "text-emerald-300" : "text-slate-400"}`} />
          <span className="text-sm font-semibold">{label}</span>
        </a>
      </Link>
    </SheetClose>
  );
}

export function MobileNav() {
  const [location, setLocation] = useLocation();

  function isActive(href: string) {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  }

  const currentLabel =
    [...MAIN_NAV, ...TOOL_NAV, ...BOTTOM_NAV].find((x) => isActive(x.href))?.label ?? BRAND.name;

  function handleLogout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setLocation("/login");
  }

  return (
    <div className="md:hidden sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <button
              className="h-10 w-10 rounded-xl border border-slate-800/70 bg-slate-900/60 flex items-center justify-center text-slate-200 hover:bg-slate-900 transition-all"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[86vw] max-w-[320px] p-0 bg-slate-950 border-slate-800/70 text-slate-50"
          >
            <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800/60">
              <div className="h-9 w-9 flex-shrink-0 rounded-xl bg-emerald-500 flex items-center justify-center shadow-[0_0_16px_rgba(16,185,129,0.3)]">
                <PieChart className="h-5 w-5 text-slate-950" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-slate-50 tracking-tight leading-none truncate">
                  {BRAND.name}
                </p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                  {BRAND.tagline}
                </p>
              </div>
            </div>

            <ScrollArea className="h-[calc(100dvh-86px)] px-3 py-4">
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-2">
                    Main Menu
                  </p>
                  <div className="space-y-1">
                    {MAIN_NAV.map((item) => (
                      <MobileNavItem key={item.href} {...item} active={isActive(item.href)} />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-2">
                    Tools
                  </p>
                  <div className="space-y-1">
                    {TOOL_NAV.map((item) => (
                      <MobileNavItem key={item.href} {...item} active={isActive(item.href)} />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-2">
                    More
                  </p>
                  <div className="space-y-1">
                    {BOTTOM_NAV.map((item) => (
                      <MobileNavItem key={item.href} {...item} active={isActive(item.href)} />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-2">
                    Session
                  </p>
                  <SheetClose asChild>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-slate-300 transition-all hover:bg-rose-500/10 hover:text-rose-300"
                    >
                      <LogOut className="h-4 w-4 flex-shrink-0 text-slate-400" />
                      <span className="text-sm font-semibold">Logout</span>
                    </button>
                  </SheetClose>
                </div>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-slate-500 truncate">{BRAND.name}</p>
          <p className="text-sm font-bold text-slate-50 truncate">{currentLabel}</p>
        </div>
      </div>
    </div>
  );
}
