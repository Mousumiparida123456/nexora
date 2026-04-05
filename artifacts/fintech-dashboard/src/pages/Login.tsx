import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Fingerprint, KeyRound, Lock, Mail, Shield, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";

const AUTH_STORAGE_KEY = "nexora.authenticated";

function isValidVaultId(value: string) {
  const trimmed = value.trim();
  return trimmed.includes("@") && trimmed.length >= 8;
}

export function Login() {
  const [, setLocation] = useLocation();
  const [vaultId, setVaultId] = useState("name@nexora.vault");
  const [accessKey, setAccessKey] = useState("");
  const [persistSession, setPersistSession] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const canSubmit = useMemo(() => {
    return isValidVaultId(vaultId) && accessKey.trim().length >= 10 && !submitting;
  }, [vaultId, accessKey, submitting]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setSubmitting(false);
    localStorage.setItem(AUTH_STORAGE_KEY, "true");
    setLocation("/dashboard");
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
            className="relative w-full max-w-[410px]"
          >
            <header className="mb-6 flex items-center gap-2 px-1">
              <ShieldCheck className="h-6 w-6 text-[#36d8a2]" />
              <span className="text-[1.6rem] font-black uppercase tracking-[0.18em] text-[#36d8a2]">
                Nexora Vault
              </span>
            </header>

            <div className="rounded-[28px] border border-white/6 bg-[linear-gradient(180deg,#132440_0%,#0c1931_100%)] p-5 shadow-[0_30px_90px_rgba(2,8,20,0.68)] sm:p-6">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2a5f55] bg-[#122927] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#59d9af]">
                <span className="h-2 w-2 rounded-full bg-[#51e0b4]" />
                Live Status: Encrypted
              </div>

              <div className="space-y-1">
                <h1 className="max-w-[12ch] text-[2.1rem] font-black leading-[1.02] text-[#d9e5f2] sm:text-[2.35rem]">
                  The Markets Never Sleep.
                </h1>
                <p className="text-sm font-medium text-[#8ea6bc]">
                  Access your Nexora command vault.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-[#7189a3]">
                    Institutional ID
                  </label>
                  <div className="flex h-12 items-center gap-3 rounded-[10px] border border-[#142847] bg-[#07162b] px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                    <Mail className="h-4 w-4 shrink-0 text-[#8ea6bc]" />
                    <input
                      value={vaultId}
                      onChange={(e) => setVaultId(e.target.value)}
                      onBlur={() => setTouched(true)}
                      className="w-full bg-transparent text-sm font-semibold text-[#96aec5] outline-none placeholder:text-[#44586f]"
                      placeholder="name@nexora.vault"
                      autoComplete="username"
                    />
                  </div>
                  {touched && !isValidVaultId(vaultId) ? (
                    <p className="text-[11px] text-[#f59ca8]">Enter a valid institutional ID.</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-[#7189a3]">
                      Access Key
                    </label>
                    <button
                      type="button"
                      className="text-[10px] font-black uppercase tracking-[0.18em] text-[#46d7a5] transition hover:text-[#6fe7be]"
                    >
                      Recover
                    </button>
                  </div>
                  <div className="flex h-12 items-center gap-3 rounded-[10px] border border-[#142847] bg-[#07162b] px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                    <Lock className="h-4 w-4 shrink-0 text-[#8ea6bc]" />
                    <input
                      value={accessKey}
                      onChange={(e) => setAccessKey(e.target.value)}
                      onBlur={() => setTouched(true)}
                      type="password"
                      className="w-full bg-transparent text-sm font-semibold tracking-[0.28em] text-[#96aec5] outline-none placeholder:text-[#44586f]"
                      placeholder="************"
                      autoComplete="current-password"
                    />
                  </div>
                  {touched && accessKey.trim().length < 10 ? (
                    <p className="text-[11px] text-[#f59ca8]">Access key must be at least 10 characters.</p>
                  ) : null}
                </div>

                <label className="flex cursor-pointer items-start gap-3 pt-1 text-xs text-[#90a5ba]">
                  <span className="mt-[2px] flex h-4 w-4 items-center justify-center rounded-[3px] border border-[#203555] bg-[#0a1730]">
                    <input
                      type="checkbox"
                      checked={persistSession}
                      onChange={(e) => setPersistSession(e.target.checked)}
                      className="sr-only"
                    />
                    {persistSession ? <span className="h-2 w-2 rounded-[2px] bg-[#4bddac]" /> : null}
                  </span>
                  <span>Maintain persistent session [Hardware Auth]</span>
                </label>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="mt-1 h-14 w-full rounded-full bg-[linear-gradient(90deg,#48d9a8_0%,#51e29a_100%)] text-[13px] font-black uppercase tracking-[0.18em] text-[#103229] shadow-[0_10px_30px_rgba(72,217,168,0.28)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Securing Session..." : "Initialize Connection"}
                </button>
              </form>

              <div className="mt-6 border-t border-white/6 pt-5">
                <p className="text-center text-[10px] font-black uppercase tracking-[0.24em] text-[#5d7691]">
                  Biometric Gateway
                </p>
                <div className="mt-4 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    aria-label="Fingerprint login"
                    className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-[#173153] bg-[#0a1c37] text-[#3ee2b1] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition hover:-translate-y-0.5"
                  >
                    <Fingerprint className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    aria-label="Shield login"
                    className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-[#173153] bg-[#0a1c37] text-[#66f0c0] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition hover:-translate-y-0.5"
                  >
                    <Shield className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="px-2 pb-1 pt-5 text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#5f748c]">
                Authorized access only. All interactions are
              </p>
              <p className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#5f748c]">
                recorded and secured via multi-layer architectural encryption.
              </p>
            </div>

            <div className="mt-5 border-t border-[#173153] pt-4">
              <p className="text-center text-[9px] font-bold uppercase tracking-[0.18em] text-[#2dcaa0]">
                (C) 2024 Nexora Vault. Protected by multi-layer encryption
              </p>
              <div className="mt-4 flex items-center justify-center gap-5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#536a83]">
                <span>Terms of Service</span>
                <span>Privacy Policy</span>
              </div>
            </div>

            <div className="pointer-events-none absolute -right-2 top-8 text-[#1f3551]">
              <KeyRound className="h-16 w-16 opacity-20" />
            </div>
          </motion.div>
        </section>

        <section className="relative hidden overflow-hidden lg:flex lg:min-h-screen">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#070b12_0%,#0d1017_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(74,222,180,0.08),transparent_20%),radial-gradient(circle_at_80%_15%,rgba(109,99,255,0.10),transparent_18%),radial-gradient(circle_at_50%_75%,rgba(12,107,75,0.18),transparent_30%)]" />
          <div className="absolute inset-[7%] rounded-[38px] border border-[#203248] bg-[linear-gradient(180deg,#12110f_0%,#0f1013_100%)] shadow-[0_40px_120px_rgba(0,0,0,0.45)]" />

          <div className="absolute left-[18%] top-[12%] h-[68%] w-[56%] rounded-[28px] bg-[radial-gradient(circle_at_52%_28%,rgba(255,113,59,0.88),transparent_10%),radial-gradient(circle_at_46%_40%,rgba(255,185,73,0.55),transparent_8%),radial-gradient(circle_at_36%_58%,rgba(244,85,61,0.82),transparent_9%),radial-gradient(circle_at_56%_54%,rgba(253,226,145,0.70),transparent_7%),radial-gradient(circle_at_66%_64%,rgba(215,58,41,0.84),transparent_9%),radial-gradient(circle_at_41%_71%,rgba(255,156,145,0.65),transparent_8%),radial-gradient(circle_at_29%_48%,rgba(125,145,255,0.24),transparent_6%),radial-gradient(circle_at_70%_44%,rgba(93,116,234,0.18),transparent_7%),radial-gradient(circle_at_50%_50%,rgba(12,16,20,0),rgba(12,16,20,0.84)_62%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]" />
          <div className="absolute left-[24%] top-[18%] h-[54%] w-[42%] rounded-[48%] bg-[radial-gradient(circle_at_50%_35%,rgba(255,93,58,0.88),transparent_13%),radial-gradient(circle_at_38%_58%,rgba(255,201,84,0.72),transparent_10%),radial-gradient(circle_at_60%_55%,rgba(255,239,182,0.68),transparent_9%),radial-gradient(circle_at_46%_70%,rgba(240,98,73,0.8),transparent_11%),radial-gradient(circle_at_70%_32%,rgba(58,86,173,0.18),transparent_8%),radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.08),rgba(0,0,0,0.78)_74%)] blur-[2px]" />
          <div className="absolute left-[28%] top-[70%] h-[14%] w-[26%] rounded-[46%] bg-[radial-gradient(circle_at_50%_20%,rgba(255,210,174,0.42),transparent_22%),linear-gradient(180deg,rgba(68,44,24,0.85),rgba(21,16,14,0.95))] shadow-[0_12px_40px_rgba(0,0,0,0.5)]" />

          <div className="absolute left-[22%] top-[20%] h-[18%] w-[8%] rotate-[-18deg] rounded-full bg-[linear-gradient(180deg,rgba(40,74,39,0.08),rgba(81,111,59,0.58),rgba(25,39,24,0.78))]" />
          <div className="absolute left-[34%] top-[32%] h-[28%] w-[1px] rotate-[8deg] bg-[linear-gradient(180deg,rgba(130,171,97,0.1),rgba(130,171,97,0.75),rgba(29,45,24,0.2))]" />
          <div className="absolute left-[44%] top-[27%] h-[34%] w-[1px] rotate-[-14deg] bg-[linear-gradient(180deg,rgba(130,171,97,0.08),rgba(120,151,76,0.72),rgba(29,45,24,0.18))]" />
          <div className="absolute left-[52%] top-[24%] h-[38%] w-[1px] rotate-[12deg] bg-[linear-gradient(180deg,rgba(130,171,97,0.08),rgba(136,167,87,0.7),rgba(29,45,24,0.16))]" />
          <div className="absolute left-[60%] top-[30%] h-[30%] w-[1px] rotate-[20deg] bg-[linear-gradient(180deg,rgba(130,171,97,0.08),rgba(136,167,87,0.7),rgba(29,45,24,0.16))]" />

          <div className="absolute left-[26%] top-[26%] h-[74px] w-[74px] rounded-[55%] border border-[#ff8d61]/30 bg-[radial-gradient(circle_at_35%_35%,rgba(255,175,103,0.9),rgba(255,92,47,0.78)_46%,rgba(79,15,10,0.18)_72%,transparent_74%)]" />
          <div className="absolute left-[40%] top-[43%] h-[88px] w-[88px] rounded-[58%] border border-[#ffd7a1]/20 bg-[radial-gradient(circle_at_36%_34%,rgba(255,247,235,0.95),rgba(255,204,174,0.72)_28%,rgba(244,111,81,0.74)_54%,rgba(80,17,11,0.18)_74%,transparent_76%)]" />
          <div className="absolute left-[56%] top-[54%] h-[78px] w-[78px] rounded-[58%] border border-[#ff744f]/24 bg-[radial-gradient(circle_at_36%_34%,rgba(255,179,151,0.92),rgba(255,84,38,0.78)_42%,rgba(90,19,12,0.18)_74%,transparent_76%)]" />
          <div className="absolute left-[48%] top-[20%] h-[70px] w-[70px] rounded-[54%] border border-[#ff5c32]/22 bg-[radial-gradient(circle_at_36%_34%,rgba(255,112,59,0.96),rgba(226,54,20,0.76)_50%,rgba(70,17,10,0.18)_72%,transparent_74%)]" />
          <div className="absolute left-[30%] top-[56%] h-[66px] w-[66px] rounded-[58%] border border-[#ffb998]/20 bg-[radial-gradient(circle_at_34%_34%,rgba(255,219,210,0.94),rgba(255,145,130,0.72)_42%,rgba(130,43,37,0.2)_72%,transparent_75%)]" />
          <div className="absolute left-[62%] top-[34%] h-[52px] w-[52px] rounded-[56%] border border-[#8fa2ff]/18 bg-[radial-gradient(circle_at_34%_34%,rgba(105,136,255,0.58),rgba(34,48,108,0.38)_48%,transparent_74%)]" />

          <div className="absolute left-[18%] top-[12%] h-[68%] w-[56%] rounded-[28px] bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent_30%,rgba(255,255,255,0.02)_52%,transparent_76%)] mix-blend-screen" />

          <div className="relative z-10 flex w-full items-end justify-start p-10">
            <div className="max-w-md rounded-[28px] border border-white/10 bg-[#081a31]/45 p-6 backdrop-blur-md">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#8fe0cb]">
                Nexora Secure Access
              </p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-white">
                Nexora intelligence wrapped in vault-grade encryption.
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#d2e4f5]/78">
                A visual field inspired by encrypted liquidity, orbital market signals, and vault
                telemetry. Built to feel premium, precise, and always-on.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
