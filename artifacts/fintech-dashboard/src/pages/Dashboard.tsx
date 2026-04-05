import { useEffect, useState } from "react";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { ChartsSection } from "@/components/dashboard/ChartsSection";
import { InsightsSection } from "@/components/dashboard/InsightsSection";
import { apiBaseUrl, fetchApiHealth } from "@/lib/api";

type ApiStatus = "checking" | "connected" | "error" | "missing";

export function Dashboard() {
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
          <h1 className="text-3xl font-bold text-slate-50 tracking-tight">Dashboard</h1>
          <p className="text-slate-400 mt-1.5 font-medium">Here's your financial overview for October 2024.</p>
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
      <InsightsSection />
    </main>
  );
}
