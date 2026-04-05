import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  ArrowUpCircle,
  ArrowDownCircle,
  Trash2,
  SlidersHorizontal,
} from "lucide-react";
import { CategoryIcon } from "./CategoryIcon";
import {
  type Transaction,
  type Category,
  type TransactionType,
  CATEGORIES,
} from "./transactionData";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
}

export function TransactionList({ transactions, onDelete }: TransactionListProps) {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<Category | "All">("All");
  const [filterType, setFilterType] = useState<TransactionType | "All">("All");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !tx.description.toLowerCase().includes(q) &&
          !tx.category.toLowerCase().includes(q)
        )
          return false;
      }
      if (filterCategory !== "All" && tx.category !== filterCategory) return false;
      if (filterType !== "All" && tx.type !== filterType) return false;
      if (filterDateFrom && tx.date < filterDateFrom) return false;
      if (filterDateTo && tx.date > filterDateTo) return false;
      return true;
    });
  }, [transactions, search, filterCategory, filterType, filterDateFrom, filterDateTo]);

  const totalIncome = filtered
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const hasActiveFilters =
    filterCategory !== "All" ||
    filterType !== "All" ||
    filterDateFrom !== "" ||
    filterDateTo !== "";

  function clearFilters() {
    setFilterCategory("All");
    setFilterType("All");
    setFilterDateFrom("");
    setFilterDateTo("");
  }

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-[#1e293b]/90 overflow-hidden shadow-xl shadow-slate-950/30">
      {/* Header */}
      <div className="border-b border-slate-700/50 px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Transactions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Summary pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5">
              <ArrowUpCircle className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400">{formatCurrency(totalIncome)}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 px-3 py-1.5">
              <ArrowDownCircle className="h-3.5 w-3.5 text-rose-400" />
              <span className="text-xs font-semibold text-rose-400">{formatCurrency(totalExpense)}</span>
            </div>
          </div>
        </div>

        {/* Search + Filter toggle */}
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              data-testid="input-search-transactions"
              className="w-full rounded-xl bg-slate-900/60 border border-slate-700/60 pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            data-testid="button-toggle-filters"
            className={`w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
              hasActiveFilters
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-slate-700/60 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-slate-600"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-700/40">
                {/* Category filter */}
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">Category</label>
                  <div className="relative">
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value as Category | "All")}
                      data-testid="select-filter-category"
                      className="w-full rounded-xl bg-slate-900/60 border border-slate-700/60 px-3 pr-8 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 appearance-none cursor-pointer"
                    >
                      <option value="All" className="bg-slate-900">All Categories</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c} className="bg-slate-900">{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                {/* Type filter */}
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">Type</label>
                  <div className="relative">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as TransactionType | "All")}
                      data-testid="select-filter-type"
                      className="w-full rounded-xl bg-slate-900/60 border border-slate-700/60 px-3 pr-8 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 appearance-none cursor-pointer"
                    >
                      <option value="All" className="bg-slate-900">All Types</option>
                      <option value="income" className="bg-slate-900">Income</option>
                      <option value="expense" className="bg-slate-900">Expense</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                {/* Date from */}
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">From</label>
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    data-testid="input-filter-date-from"
                    className="w-full rounded-xl bg-slate-900/60 border border-slate-700/60 px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 [color-scheme:dark]"
                  />
                </div>

                {/* Date to */}
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">To</label>
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    data-testid="input-filter-date-to"
                    className="w-full rounded-xl bg-slate-900/60 border border-slate-700/60 px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 [color-scheme:dark]"
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-3 text-xs text-slate-500 hover:text-rose-400 transition-colors underline-offset-2 hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Transaction rows */}
      <div className="divide-y divide-slate-800/60">
        <AnimatePresence initial={false}>
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-slate-600"
            >
              <Search className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">No transactions found</p>
              <p className="text-xs mt-1">Try adjusting your search or filters</p>
            </motion.div>
          ) : (
            filtered.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8, height: 0 }}
                transition={{ delay: i < 10 ? i * 0.02 : 0 }}
                data-testid={`row-transaction-${tx.id}`}
                className="group flex items-center gap-4 px-6 py-3.5 hover:bg-slate-800/30 transition-colors"
              >
                <CategoryIcon category={tx.category} size="md" />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{tx.description}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{tx.category}</p>
                </div>

                <div className="hidden sm:block text-xs text-slate-500 text-right shrink-0">
                  {formatDate(tx.date)}
                </div>

                <div
                  className={`text-sm font-bold shrink-0 w-28 text-right ${
                    tx.type === "income" ? "text-emerald-400" : "text-rose-400"
                  }`}
                  data-testid={`text-amount-${tx.id}`}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </div>

                <button
                  onClick={() => onDelete(tx.id)}
                  data-testid={`button-delete-${tx.id}`}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                  aria-label="Delete transaction"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
