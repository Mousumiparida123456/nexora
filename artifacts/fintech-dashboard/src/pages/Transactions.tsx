import { useState } from "react";
import { motion } from "framer-motion";
import { AddTransactionForm } from "@/components/transactions/AddTransactionForm";
import { TransactionList } from "@/components/transactions/TransactionList";
import { MOCK_TRANSACTIONS, type Transaction } from "@/components/transactions/transactionData";
import { ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
}

export function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);

  function handleAdd(tx: Transaction) {
    setTransactions((prev) => [tx, ...prev]);
  }

  function handleDelete(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const net = totalIncome - totalExpense;

  return (
    <main className="container mx-auto px-4 py-8 pb-16">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-50 tracking-tight">Transactions</h1>
          <p className="text-slate-400 mt-1.5 font-medium">Manage and track all your financial activity.</p>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
        >
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
              <ArrowUpCircle className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Income</p>
              <p className="text-xl font-bold text-emerald-400 mt-0.5" data-testid="text-total-income">
                {formatCurrency(totalIncome)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-5 py-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-rose-500/15 flex items-center justify-center flex-shrink-0">
              <ArrowDownCircle className="h-5 w-5 text-rose-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Expenses</p>
              <p className="text-xl font-bold text-rose-400 mt-0.5" data-testid="text-total-expenses">
                {formatCurrency(totalExpense)}
              </p>
            </div>
          </div>

          <div className={`rounded-2xl border px-5 py-4 flex items-center gap-4 ${
            net >= 0
              ? "border-blue-500/20 bg-blue-500/5"
              : "border-amber-500/20 bg-amber-500/5"
          }`}>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              net >= 0 ? "bg-blue-500/15" : "bg-amber-500/15"
            }`}>
              <Wallet className={`h-5 w-5 ${net >= 0 ? "text-blue-400" : "text-amber-400"}`} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Net Balance</p>
              <p
                className={`text-xl font-bold mt-0.5 ${net >= 0 ? "text-blue-400" : "text-amber-400"}`}
                data-testid="text-net-balance"
              >
                {net >= 0 ? "+" : ""}{formatCurrency(net)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Add form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
          <AddTransactionForm onAdd={handleAdd} />
        </motion.div>

        {/* Transaction list */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
        >
          <TransactionList transactions={transactions} onDelete={handleDelete} />
        </motion.div>
    </main>
  );
}
