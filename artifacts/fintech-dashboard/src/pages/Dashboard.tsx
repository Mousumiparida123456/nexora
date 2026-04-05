import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { ChartsSection } from "@/components/dashboard/ChartsSection";
import { InsightsSection } from "@/components/dashboard/InsightsSection";

export function Dashboard() {
  return (
    <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-16 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-50 tracking-tight">Dashboard</h1>
        <p className="text-slate-400 mt-1.5 font-medium">Here's your financial overview for October 2024.</p>
      </div>
      <SummaryCards />
      <ChartsSection />
      <InsightsSection />
    </main>
  );
}
