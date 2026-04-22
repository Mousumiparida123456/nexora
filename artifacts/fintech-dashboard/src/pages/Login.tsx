import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";

export function Login() {
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    api.startLogin("/dashboard");
  }

  return (
    <main className="min-h-screen supports-[height:100dvh]:min-h-dvh bg-[#07111f] text-[#d6e7f6]">
      <div className="grid min-h-screen supports-[height:100dvh]:min-h-dvh grid-cols-1 lg:grid-cols-2">
        <section className="relative flex min-h-[56vh] items-center justify-center overflow-hidden border-b border-[#173153] bg-[linear-gradient(180deg,#081324_0%,#0b1830_100%)] px-5 py-10 lg:min-h-screen lg:border-b-0 lg:border-r">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(48,207,160,0.15),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(109,99,255,0.16),transparent_26%)]" />
          <div className="absolute inset-[12px] rounded-[28px] border border-[#6d63ff]/55 shadow-[0_0_0_1px_rgba(109,99,255,0.3),0_0_50px_rgba(80,76,255,0.12)]" />

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="relative w-full max-w-[430px]"
          >
            <header className="mb-6 flex items-center gap-2 px-1">
              <ShieldCheck className="h-6 w-6 text-[#36d8a2]" />
              <span className="text-[1.6rem] font-black uppercase tracking-[0.18em] text-[#36d8a2]">
                Nexora Vault
              </span>
            </header>

            <div className="rounded-[28px] border border-white/6 bg-[linear-gradient(180deg,#132440_0%,#0c1931_100%)] p-6 shadow-[0_30px_90px_rgba(2,8,20,0.68)]">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2a5f55] bg-[#122927] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#59d9af]">
                <span className="h-2 w-2 rounded-full bg-[#51e0b4]" />
                Live Status: Encrypted
              </div>

              <div className="space-y-2">
                <h1 className="text-[2.1rem] font-black leading-[1.02] text-[#d9e5f2] sm:text-[2.35rem]">
                  Continue to Secure Dashboard
                </h1>
                <p className="text-sm font-medium text-[#8ea6bc]">
                  Authentication is handled by the backend identity flow.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-14 w-full rounded-full bg-[linear-gradient(90deg,#48d9a8_0%,#51e29a_100%)] text-[13px] font-black uppercase tracking-[0.18em] text-[#103229] shadow-[0_10px_30px_rgba(72,217,168,0.28)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Redirecting..." : "Continue Secure Login"}
                </button>
              </form>
            </div>
          </motion.div>
        </section>

        <section className="relative hidden overflow-hidden lg:flex lg:min-h-screen">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#070b12_0%,#0d1017_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(74,222,180,0.08),transparent_20%),radial-gradient(circle_at_80%_15%,rgba(109,99,255,0.10),transparent_18%),radial-gradient(circle_at_50%_75%,rgba(12,107,75,0.18),transparent_30%)]" />

          <div className="relative z-10 flex w-full items-end justify-start p-10">
            <div className="max-w-md rounded-[28px] border border-white/10 bg-[#081a31]/45 p-6 backdrop-blur-md">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#8fe0cb]">
                Nexora Secure Access
              </p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-white">
                Session-based auth with backend protection.
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#d2e4f5]/78">
                Sign in is delegated to the backend provider and returns to your dashboard with a secure session cookie.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
