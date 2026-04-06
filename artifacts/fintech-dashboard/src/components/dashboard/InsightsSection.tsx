import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  CircleDot,
  PiggyBank,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/lib/dashboard-context";
import { cn } from "@/lib/utils";

const heatmapMonths = ["Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
const heatmapDays = ["", "Tue", "", "Thu", "", "Sat", ""];
const heatmapValues = [
  [0, 1, 2, 1, 1, 2, 3, 2, 1, 0, 1, 0, 1],
  [0, 2, 1, 2, 3, 2, 4, 3, 2, 1, 2, 1, 0],
  [1, 1, 3, 2, 3, 4, 4, 3, 2, 2, 1, 1, 1],
  [1, 2, 2, 3, 4, 4, 4, 3, 2, 2, 1, 1, 1],
  [2, 2, 3, 4, 4, 4, 4, 3, 2, 2, 1, 1, 0],
  [2, 3, 3, 4, 4, 4, 4, 3, 2, 1, 1, 1, 1],
  [1, 2, 2, 3, 3, 3, 3, 2, 1, 1, 0, 0, 0],
];

const categoryTrendData = [
  { month: "Oct", Housing: 850, Shopping: 950, "Food & Dining": 430, Utilities: 95 },
  { month: "Nov", Housing: 1200, Shopping: 820, "Food & Dining": 510, Utilities: 115 },
  { month: "Dec", Housing: 1120, Shopping: 1080, "Food & Dining": 720, Utilities: 130 },
  { month: "Jan", Housing: 980, Shopping: 740, "Food & Dining": 600, Utilities: 105 },
  { month: "Feb", Housing: 1040, Shopping: 860, "Food & Dining": 690, Utilities: 120 },
  { month: "Mar", Housing: 1180, Shopping: 780, "Food & Dining": 650, Utilities: 140 },
];

const topCategories = [
  { name: "Housing", amount: 5100, value: 42.4, transactions: 6, color: "#ef4444" },
  { name: "Shopping", amount: 2850, value: 23.7, transactions: 8, color: "#f97316" },
  { name: "Food & Dining", amount: 2030, value: 16.9, transactions: 18, color: "#f59e0b" },
  { name: "Utilities", amount: 523, value: 4.3, transactions: 6, color: "#22c55e" },
  { name: "Education", amount: 470, value: 3.9, transactions: 3, color: "#3b82f6" },
  { name: "Health", amount: 435, value: 3.6, transactions: 5, color: "#14b8a6" },
];

const comparisonData = [
  { month: "Oct 2024", income: 5450, expenses: 1580 },
  { month: "Nov 2024", income: 5700, expenses: 1860 },
  { month: "Dec 2024", income: 6700, expenses: 2615 },
  { month: "Jan 2025", income: 5100, expenses: 1608 },
  { month: "Feb 2025", income: 5650, expenses: 2620 },
  { month: "Mar 2025", income: 6600, expenses: 1740 },
];

const breakdownData = [
  { month: "Mar 2025", income: 6600, expenses: 1740, change: "34%", net: 4860, savings: 74 },
  { month: "Feb 2025", income: 5650, expenses: 2620, change: "63%", net: 3030, savings: 54 },
  { month: "Jan 2025", income: 5100, expenses: 1608, change: "39%", net: 3492, savings: 68 },
  { month: "Dec 2024", income: 6700, expenses: 2615, change: "41%", net: 4085, savings: 61 },
  { month: "Nov 2024", income: 5700, expenses: 1860, change: "18%", net: 3840, savings: 67 },
  { month: "Oct 2024", income: 5450, expenses: 1580, change: "—", net: 3870, savings: 71 },
];

const observations = [
  {
    title: "Top Spending Category",
    value: "Housing",
    detail: "₹5,100.00 total — 42.4% of all expenses",
    icon: ShieldCheck,
    accent: "text-red-500 bg-red-500/10",
  },
  {
    title: "Month-over-Month Expenses",
    value: "-33.6%",
    detail: "Expenses decreased from ₹2,620.00 to ₹1,740.00",
    icon: TrendingDown,
    accent: "text-emerald-500 bg-emerald-500/10",
  },
  {
    title: "Current Month Savings Rate",
    value: "73.6%",
    detail: "Great job! You’re saving well above the 20% benchmark.",
    icon: PiggyBank,
    accent: "text-emerald-700 bg-emerald-500/10",
  },
  {
    title: "Largest Transaction",
    value: "₹4,800.00",
    detail: "Monthly salary (raise) on Mar 1, 2025",
    icon: DollarSign,
    accent: "text-sky-600 bg-sky-500/10",
  },
  {
    title: "Most Frequent Category",
    value: "Food & Dining",
    detail: "18 transactions — small amounts add up quickly",
    icon: BarChart3,
    accent: "text-emerald-600 bg-emerald-500/10",
  },
  {
    title: "Overall Net Balance",
    value: "₹23,177.00",
    detail: "You’ve saved ₹23,177.00 across all recorded transactions.",
    icon: CircleDot,
    accent: "text-slate-900 bg-slate-200",
  },
];

function HeatmapCell({ level }: { level: number }) {
  const colors = [
    "bg-slate-100 dark:bg-slate-900",
    "bg-slate-200 dark:bg-slate-800",
    "bg-slate-300 dark:bg-slate-700",
    "bg-blue-500/40 dark:bg-blue-500/30",
    "bg-blue-500 dark:bg-blue-400",
  ];
  return <div className={cn("h-4 w-4 rounded-md border border-slate-300/60 shadow-sm dark:border-slate-700/60 transition-colors", colors[level])} />;
}

export function InsightsSection() {
  const { formatCurrency, formatCompactCurrency, theme } = useDashboard();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/80"
      >
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={cn("text-xs uppercase tracking-[0.3em]", theme === "dark" ? "text-slate-400" : "text-slate-500")}>Spending Heatmap</p>
            <h2 className={cn("mt-2 text-2xl font-semibold", theme === "dark" ? "text-slate-100" : "text-slate-950")}>Insights</h2>
            <p className={cn("mt-2 max-w-2xl text-sm leading-6", theme === "dark" ? "text-slate-400" : "text-slate-600")}>Daily expense intensity over the past year.</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-800/80 dark:bg-slate-900 dark:text-slate-200">
            <span className="text-slate-500">Less</span>
            <span className="mx-2 inline-flex h-3 w-3 rounded-md bg-slate-200" />
            <span className="mx-2 inline-flex h-3 w-3 rounded-md bg-slate-300" />
            <span className="mx-2 inline-flex h-3 w-3 rounded-md bg-indigo-500" />
            <span className="ml-2 text-slate-500">More</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[720px] rounded-3xl border border-slate-200/90 bg-slate-50 p-5 dark:border-slate-800/90 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-700/80">
              <div>
                <p className={cn("text-sm font-semibold", theme === "dark" ? "text-slate-200" : "text-slate-950")}>Daily spending intensity</p>
                <p className={cn("text-xs text-slate-500", theme === "dark" ? "text-slate-400" : "text-slate-600")}>Track how activity changes across the year.</p>
              </div>
              <div className={cn("rounded-2xl border px-3 py-1 text-xs font-medium", theme === "dark" ? "border-slate-700 bg-slate-950 text-slate-300" : "border-slate-200 bg-white text-slate-700")}>Apr — Apr</div>
            </div>
            <div className="mt-5">
              <div className="grid min-w-full grid-cols-[90px_repeat(13,minmax(0,1fr))] gap-4 pb-2 text-[10px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                <div />
                {heatmapMonths.map((month, index) => (
                  <div key={`${month}-${index}`} className="text-center">{month}</div>
                ))}
              </div>
              <div className="mt-3 grid min-w-full grid-cols-[90px_repeat(13,minmax(0,1fr))] gap-4">
                <div className="grid grid-rows-[repeat(7,minmax(0,1fr))] gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  {heatmapDays.map((day, index) => (
                    <span key={`${day}-${index}`} className="h-4 leading-4">{day}</span>
                  ))}
                </div>
                <div className="grid grid-rows-[repeat(7,minmax(0,1fr))] gap-2">
                  {heatmapValues.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid w-full grid-cols-[repeat(13,minmax(0,1fr))] gap-2">
                      {row.map((level, index) => (
                        <HeatmapCell key={`${rowIndex}-${index}`} level={level} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className={cn("h-full border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-950/80")}> 
            <CardHeader className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle className={cn("text-lg font-semibold", theme === "dark" ? "text-slate-100" : "text-slate-950")}>Spending Patterns by Category</CardTitle>
                <p className={cn("text-sm text-slate-500", theme === "dark" ? "text-slate-400" : "text-slate-600")}>Monthly expense trends for your top 4 categories.</p>
              </div>
            </CardHeader>
            <CardContent className="h-[320px] pt-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={categoryTrendData} margin={{ top: 10, right: 24, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke={theme === "dark" ? "#334155" : "#e2e8f0"} vertical={false} opacity={0.5} />
                  <XAxis dataKey="month" stroke={theme === "dark" ? "#64748b" : "#64748b"} tickLine={false} axisLine={false} tick={{ fill: theme === "dark" ? "#94a3b8" : "#64748b", fontSize: 12 }} />
                  <YAxis stroke={theme === "dark" ? "#64748b" : "#64748b"} tickLine={false} axisLine={false} tick={{ fill: theme === "dark" ? "#94a3b8" : "#64748b", fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 14, border: theme === "dark" ? "1px solid #334155" : "1px solid #e2e8f0", backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff" }} cursor={{ stroke: theme === "dark" ? "#475569" : "#cbd5e1", strokeWidth: 1, strokeDasharray: "4 4" }} />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 10, fontSize: 12, color: theme === "dark" ? "#94a3b8" : "#64748b" }} />
                  <Line type="monotone" dataKey="Housing" stroke="#ef4444" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="Shopping" stroke="#f97316" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="Food & Dining" stroke="#f59e0b" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="Utilities" stroke="#22c55e" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className={cn("h-full border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-950/80")}> 
            <CardHeader className="mb-3">
              <CardTitle className={cn("text-lg font-semibold", theme === "dark" ? "text-slate-100" : "text-slate-950")}>Top Spending Categories</CardTitle>
              <p className={cn("text-sm text-slate-500", theme === "dark" ? "text-slate-400" : "text-slate-600")}>By total amount spent — all time.</p>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {topCategories.map((category) => (
                <div key={category.name} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{category.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{category.transactions} txns</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-950 dark:text-slate-100">{formatCurrency(category.amount)}</p>
                      <p className={cn("text-xs font-medium", category.name === "Housing" ? "text-slate-500" : "text-slate-500")}>{category.value.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                    <div className="h-2 rounded-full" style={{ width: `${category.value}%`, backgroundColor: category.color }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className={cn("border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-950/80")}> 
            <CardHeader className="pb-3">
              <CardTitle className={cn("text-lg font-semibold", theme === "dark" ? "text-slate-100" : "text-slate-950")}>Monthly Comparison</CardTitle>
              <p className={cn("text-sm text-slate-500", theme === "dark" ? "text-slate-400" : "text-slate-600")}>Income vs expenses — last 6 months.</p>
            </CardHeader>
            <CardContent className="h-[340px] pt-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke={theme === "dark" ? "#334155" : "#e2e8f0"} vertical={false} opacity={0.5} />
                  <XAxis dataKey="month" stroke={theme === "dark" ? "#64748b" : "#64748b"} tickLine={false} axisLine={false} tick={{ fill: theme === "dark" ? "#94a3b8" : "#64748b", fontSize: 12 }} />
                  <YAxis stroke={theme === "dark" ? "#64748b" : "#64748b"} tickLine={false} axisLine={false} tick={{ fill: theme === "dark" ? "#94a3b8" : "#64748b", fontSize: 12 }} tickFormatter={(value) => formatCompactCurrency(value)} />
                  <Tooltip contentStyle={{ borderRadius: 14, border: theme === "dark" ? "1px solid #334155" : "1px solid #e2e8f0", backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff" }} cursor={{ fill: theme === "dark" ? "rgba(148,163,184,0.08)" : "rgba(148,163,184,0.12)" }} />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 10, fontSize: 12, color: theme === "dark" ? "#94a3b8" : "#64748b" }} />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className={cn("border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-950/80")}> 
            <CardHeader className="pb-3">
              <CardTitle className={cn("text-lg font-semibold", theme === "dark" ? "text-slate-100" : "text-slate-950")}>Month-by-Month Breakdown</CardTitle>
              <p className={cn("text-sm text-slate-500", theme === "dark" ? "text-slate-400" : "text-slate-600")}>All recorded months with savings rate and expense trend.</p>
            </CardHeader>
            <CardContent className="overflow-x-auto pt-0">
              <div className="min-w-[680px]">
                <table className="w-full border-separate border-spacing-y-3 text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      <th className="pb-3">Month</th>
                      <th className="pb-3">Income</th>
                      <th className="pb-3">Expenses</th>
                      <th className="pb-3">vs Prior</th>
                      <th className="pb-3">Net</th>
                      <th className="pb-3">Savings %</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-3">
                    {breakdownData.map((row) => (
                      <tr key={row.month} className="rounded-3xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/80">
                        <td className="px-4 py-4 font-semibold text-slate-900 dark:text-slate-100">{row.month}</td>
                        <td className="px-4 py-4 text-emerald-600 dark:text-emerald-400">{formatCurrency(row.income)}</td>
                        <td className="px-4 py-4 text-rose-600 dark:text-rose-400">{formatCurrency(row.expenses)}</td>
                        <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{row.change === "—" ? "—" : row.change}</td>
                        <td className="px-4 py-4 text-emerald-600 dark:text-emerald-400">+{formatCurrency(row.net)}</td>
                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">{row.savings}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {observations.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <Card className={cn("border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-950/80")}> 
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-center gap-3">
                    <div className={cn("grid h-11 w-11 place-items-center rounded-2xl", item.accent)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className={cn("text-sm font-medium", theme === "dark" ? "text-slate-400" : "text-slate-500")}>{item.title}</p>
                      <p className={cn("mt-1 text-xl font-semibold", theme === "dark" ? "text-slate-100" : "text-slate-950")}>{item.value}</p>
                    </div>
                  </div>
                  <p className={cn("text-sm leading-6", theme === "dark" ? "text-slate-400" : "text-slate-600")}>{item.detail}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
