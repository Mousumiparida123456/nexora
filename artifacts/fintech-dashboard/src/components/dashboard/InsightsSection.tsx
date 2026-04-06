import { motion } from "framer-motion";
import { Sparkles, AlertTriangle, Lightbulb, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboard } from "@/lib/dashboard-context";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.4
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function InsightsSection() {
  const { formatCurrency } = useDashboard();

  return (
    <div className="mt-6">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-4 flex items-center gap-2"
      >
        <Sparkles className="h-5 w-5 text-indigo-400" />
        <h2 className="text-lg font-semibold text-slate-100 tracking-tight">AI Insights</h2>
      </motion.div>
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-3"
      >
        <motion.div variants={item}>
          <Card className="bg-[#1e293b]/60 border-amber-900/30 hover:bg-[#1e293b] hover:border-amber-900/50 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 opacity-80 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 shadow-inner">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <h3 className="mb-2 font-semibold text-slate-200">Spending Alert</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Your entertainment spending increased by <span className="text-amber-400 font-bold">23%</span> this month. Consider reducing streaming subscriptions to save ~{formatCurrency(3700)}.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-[#1e293b]/60 border-emerald-900/30 hover:bg-[#1e293b] hover:border-emerald-900/50 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-80 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 shadow-inner">
                <Lightbulb className="h-5 w-5 text-emerald-500" />
              </div>
              <h3 className="mb-2 font-semibold text-slate-200">Savings Opportunity</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Based on your income pattern, you could save an additional <span className="text-emerald-400 font-bold">{formatCurrency(31500)}</span> this month by optimizing your grocery budget.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-[#1e293b]/60 border-blue-900/30 hover:bg-[#1e293b] hover:border-blue-900/50 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-80 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 shadow-inner">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <h3 className="mb-2 font-semibold text-slate-200">Investment Tip</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                You have {formatCurrency(99600)} sitting idle in checking. Moving it to a high-yield savings account could earn <span className="text-blue-400 font-bold">~{formatCurrency(5000)}/year</span> at 5% APY.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
