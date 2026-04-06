import { useEffect, useState } from "react";
import { ShieldAlert, Lightbulb, TrendingUp } from "lucide-react";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { ChartsSection } from "@/components/dashboard/ChartsSection";
import { apiBaseUrl, fetchApiHealth } from "@/lib/api";
import { useDashboard } from "@/lib/dashboard-context";

type ApiStatus = "checking" | "connected" | "error" | "missing";

export function Dashboard() {
  const { theme } = useDashboard();
  const [apiStatus, setApiStatus] = useState<ApiStatus>(
    apiBaseUrl ? "checking" : "missing",
  );
  const [apiMessage, setApiMessage] = useState(
    apiBaseUrl ? "Checking backend connection..." : "Set VITE_API_BASE_URL in Vercel.",
  );

  useEffect(() => {
    if (!apiBaseUrl) return;

    const controller = new AbortController();

    fetchApiHealth(controller.signal)
      .then((data) => {
        setApiStatus(data.status === "ok" ? "connected" : "error");
        setApiMessage(
          data.status === "ok"
            ? `Connected to ${apiBaseUrl}`
            : `Unexpected API status: ${data.status}`,
        );
      })
      .catch((error: unknown) => {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        setApiStatus("error");
        setApiMessage(
          error instanceof Error ? error.message : "Unable to reach backend.",
        );
      });

    return () => controller.abort();
  }, []);

  const apiBadgeClassName =
    apiStatus === "connected"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : apiStatus === "checking"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
        : "border-rose-500/30 bg-rose-500/10 text-rose-300";

  return (
    <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-16 max-w-6xl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className={theme === "dark" ? "text-3xl font-bold text-slate-50 tracking-tight" : "text-3xl font-bold text-slate-950 tracking-tight"}>Dashboard</h1>
          <p className={theme === "dark" ? "mt-1.5 font-medium text-slate-400" : "mt-1.5 font-medium text-slate-500"}>Here's your financial overview for October 2024.</p>
        </div>
        <div className={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${apiBadgeClassName}`}>
          <p className="font-semibold">
            {apiStatus === "connected"
              ? "Backend Connected"
              : apiStatus === "checking"
                ? "Checking Backend"
                : "Backend Not Ready"}
          </p>
          <p className="mt-1 text-xs opacity-80">{apiMessage}</p>
        </div>
      </div>
      <SummaryCards />

      <ChartsSection />

      <section className="mt-10 space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className={theme === "dark" ? "text-xl font-semibold text-slate-50" : "text-xl font-semibold text-slate-950"}>AI Insights</h2>
            <p className={theme === "dark" ? "text-sm text-slate-400" : "text-sm text-slate-500"}>Quick cards with the top recommendations from your spending data.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className={theme === "dark" ? "rounded-3xl border border-slate-800 bg-slate-950/85 p-6 shadow-sm" : "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"}>
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 shadow-sm">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 className={theme === "dark" ? "text-lg font-semibold text-slate-50" : "text-lg font-semibold text-slate-950"}>Spending Alert</h3>
            <p className={theme === "dark" ? "mt-3 text-sm text-slate-400" : "mt-3 text-sm text-slate-500"}>
              Your entertainment spending increased by <span className="font-semibold text-amber-400">23%</span> this month. Consider reducing subscriptions to save ~₹3,700.
            </p>
          </div>

          <div className={theme === "dark" ? "rounded-3xl border border-slate-800 bg-slate-950/85 p-6 shadow-sm" : "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"}>
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 shadow-sm">
              <Lightbulb className="h-5 w-5" />
            </div>
            <h3 className={theme === "dark" ? "text-lg font-semibold text-slate-50" : "text-lg font-semibold text-slate-950"}>Savings Opportunity</h3>
            <p className={theme === "dark" ? "mt-3 text-sm text-slate-400" : "mt-3 text-sm text-slate-500"}>
              Based on your income pattern, you could save an additional <span className="font-semibold text-emerald-400">₹31,500</span> this month by optimizing your grocery budget.
            </p>
          </div>

          <div className={theme === "dark" ? "rounded-3xl border border-slate-800 bg-slate-950/85 p-6 shadow-sm" : "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"}>
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 shadow-sm">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className={theme === "dark" ? "text-lg font-semibold text-slate-50" : "text-lg font-semibold text-slate-950"}>Investment Tip</h3>
            <p className={theme === "dark" ? "mt-3 text-sm text-slate-400" : "mt-3 text-sm text-slate-500"}>
              You have <span className="font-semibold text-sky-400">₹99,600</span> sitting idle in checking. Moving it to high-yield savings could earn ~₹5,000/year at 5% APY.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
