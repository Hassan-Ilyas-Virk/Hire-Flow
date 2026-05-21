"use client";

import { useState, useEffect } from "react";

interface Job {
  email: string;
  company_name: string;
  role: string;
  cover_letter: string;
  status: "draft" | "sending" | "sent" | "error";
}

const MARQUEE_ITEMS = [
  "apply smarter not harder",
  "ai-powered cover letters",
  "one paste, multiple apps",
  "no more copy-paste grind",
  "built different",
  "your next job is one click away",
  "let ai cook",
  "mass apply like a pro",
];

const CARD_COLORS = ["card-lime", "card-pink", "card-cyan", "card-purple", "card-orange", "card-yellow"];
const NUM_COLORS = ["num-lime", "num-pink", "num-cyan", "num-purple", "num-orange", "num-yellow"];
const TAG_STYLES = [
  { bg: "rgba(212,255,43,0.1)", border: "#d4ff2b", color: "#d4ff2b" },
  { bg: "rgba(255,60,172,0.1)", border: "#ff3cac", color: "#ff3cac" },
  { bg: "rgba(0,240,255,0.1)", border: "#00f0ff", color: "#00f0ff" },
  { bg: "rgba(191,90,242,0.1)", border: "#bf5af2", color: "#bf5af2" },
];

export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [text, setText] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("hireflow_auth") === "1") setAuthed(true);
  }, []);

  function handleLogin() {
    if (pin === "4753") {
      localStorage.setItem("hireflow_auth", "1");
      setAuthed(true);
    }
  }

  if (!authed) {
    return (
      <main className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="blob-1" aria-hidden="true" />
        <div className="blob-2" aria-hidden="true" />
        <div className="chunky-card card-lime p-8 sm:p-10 max-w-sm w-full space-y-6 text-center">
          <h1
            className="text-4xl font-extrabold tracking-tighter"
            style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
          >
            <span className="bg-gradient-to-r from-zlime via-zcyan to-zpurple bg-clip-text text-transparent">
              Hire
            </span>
            <span className="bg-gradient-to-r from-zpink via-zorange to-zyellow bg-clip-text text-transparent">
              Flow
            </span>
          </h1>
          <p className="text-zgray-text text-sm font-mono">enter pin to continue</p>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="****"
            maxLength={4}
            className="thicc-input w-full px-4 py-3 text-center text-2xl tracking-[0.5em] text-zwhite"
            autoFocus
          />
          <button onClick={handleLogin} className="btn-genz w-full py-3 text-sm">
            <span>unlock</span>
          </button>
        </div>
      </main>
    );
  }

  async function handleGenerate() {
    if (!text.trim()) return;
    setLoading(true);
    setJobs([]);
    try {
      const res = await fetch("/api/parse-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.jobs) {
        setJobs(
          data.jobs.map((j: Omit<Job, "status">) => ({
            ...j,
            status: "draft",
          }))
        );
      }
    } catch {
      alert("Failed to generate drafts.");
    } finally {
      setLoading(false);
    }
  }

  function updateJob(index: number, field: keyof Job, value: string) {
    setJobs((prev) =>
      prev.map((j, i) => (i === index ? { ...j, [field]: value } : j))
    );
  }

  async function handleSend(index: number) {
    const job = jobs[index];
    updateJob(index, "status", "sending");
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: job.email,
          company_name: job.company_name,
          role: job.role,
          cover_letter: job.cover_letter,
        }),
      });
      if (res.ok) {
        updateJob(index, "status", "sent");
      } else {
        updateJob(index, "status", "error");
      }
    } catch {
      updateJob(index, "status", "error");
    }
  }

  return (
    <main className="relative z-10 min-h-screen">
      {/* Background blobs */}
      <div className="blob-1" aria-hidden="true" />
      <div className="blob-2" aria-hidden="true" />
      <div className="blob-3" aria-hidden="true" />
      <div className="blob-4" aria-hidden="true" />

      {/* Marquee Banner */}
      <div className="w-full overflow-hidden border-b-2 border-zgray-light py-3 bg-zgray/80 backdrop-blur-sm">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              className="mx-6 text-xs font-mono uppercase tracking-[0.2em] text-zgray-text whitespace-nowrap"
            >
              {item} <span className="color-cycle mx-4 font-bold">*</span>
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8 lg:py-12 space-y-8 lg:space-y-10">
        {/* Header */}
        <header className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-5">
            <h1
              className="text-5xl sm:text-6xl lg:text-8xl font-extrabold tracking-tighter leading-none"
              style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
            >
              <span className="bg-gradient-to-r from-zlime via-zcyan to-zpurple bg-clip-text text-transparent">
                Hire
              </span>
              <span className="bg-gradient-to-r from-zpink via-zorange to-zyellow bg-clip-text text-transparent">
                Flow
              </span>
            </h1>
            <div className="flex items-center gap-2 pb-2">
              <span className="float-dot bg-zlime" />
              <span className="float-dot bg-zcyan" style={{ animationDelay: "0.5s" }} />
              <span className="float-dot bg-zpink" style={{ animationDelay: "1s" }} />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-zgray-text">
                v1.0
              </span>
            </div>
          </div>

          <p className="text-zgray-text text-sm sm:text-base max-w-xl leading-relaxed">
            paste job postings. get ai cover letters. send applications.{" "}
            <span className="bg-gradient-to-r from-zpink to-zorange bg-clip-text text-transparent font-bold">
              that&apos;s literally it.
            </span>
          </p>

          {/* Colorful sticker tags */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { label: "next.js", idx: 0 },
              { label: "groq ai", idx: 1 },
              { label: "nodemailer", idx: 2 },
              { label: "zod", idx: 3 },
            ].map(({ label, idx }) => (
              <span
                key={label}
                className="sticker-tag"
                style={{
                  background: TAG_STYLES[idx].bg,
                  border: `1.5px solid ${TAG_STYLES[idx].border}`,
                  color: TAG_STYLES[idx].color,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: TAG_STYLES[idx].color }}
                />
                {label}
              </span>
            ))}
          </div>
        </header>

        {/* Input Section */}
        <section className="rainbow-border p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3 mb-1">
            <div className="flex items-center gap-3">
              <span className="inline-flex gap-1">
                <span className="w-3 h-3 rounded-full bg-zlime" />
                <span className="w-3 h-3 rounded-full bg-zcyan" />
                <span className="w-3 h-3 rounded-full bg-zpink" />
              </span>
              <h2
                className="text-sm font-bold uppercase tracking-[0.15em] text-zwhite"
                style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
              >
                Drop your job posts here
              </h2>
            </div>
            <button
              onClick={async () => {
                try {
                  const clipText = await navigator.clipboard.readText();
                  setText(clipText);
                } catch {
                  // clipboard access denied or unavailable
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono uppercase tracking-wider text-zgray-text border border-zgray-light hover:border-zlime hover:text-zlime transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              paste
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="paste one or more job descriptions..."
            rows={8}
            className="thicc-input w-full px-4 py-3 text-sm leading-relaxed text-zwhite min-h-[140px] resize-y"
          />
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <p className="text-[11px] font-mono text-zgray-text tracking-wide">
              supports bulk job postings in one paste
            </p>
            <button
              onClick={handleGenerate}
              disabled={loading || !text.trim()}
              className="btn-genz px-8 py-3.5 text-sm"
            >
              <span className="flex items-center justify-center gap-2">
                {loading && (
                  <svg
                    className="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}
                {loading ? "cooking..." : "generate drafts"}
              </span>
            </button>
          </div>
        </section>

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-5">
            {[0, 1].map((n) => (
              <div key={n} className={`chunky-card ${CARD_COLORS[n]} p-6 space-y-4`}>
                <div className="flex items-center gap-3">
                  <div className="genz-skeleton w-10 h-10 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <div className="genz-skeleton h-6 w-2/5" />
                    <div className="genz-skeleton h-3 w-1/4" />
                  </div>
                </div>
                <div className="genz-skeleton h-10 w-full mt-2" />
                <div className="space-y-2 mt-2">
                  <div className="genz-skeleton h-3 w-full" />
                  <div className="genz-skeleton h-3 w-5/6" />
                  <div className="genz-skeleton h-3 w-3/5" />
                  <div className="genz-skeleton h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Job Cards */}
        {jobs.length > 0 && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2
                className="text-2xl sm:text-3xl font-extrabold tracking-tight gradient-underline inline-block"
                style={{
                  fontFamily: "var(--font-syne), system-ui, sans-serif",
                }}
              >
                {jobs.length} draft{jobs.length > 1 ? "s" : ""} ready
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-mono text-zgray-text uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-zgreen animate-pulse" />
                  review // edit // send
                </span>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono uppercase tracking-wider text-zgray-text border border-zgray-light hover:border-zcyan hover:text-zcyan transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  retry
                </button>
              </div>
            </div>

            {jobs.map((job, i) => (
              <div
                key={i}
                className={`chunky-card ${CARD_COLORS[i % CARD_COLORS.length]} p-4 sm:p-6 space-y-5 animate-pop-in`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 w-11 h-11 rounded-2xl ${NUM_COLORS[i % NUM_COLORS.length]} flex items-center justify-center shrink-0 font-extrabold text-sm shadow-lg`}
                      style={{
                        fontFamily: "var(--font-syne), system-ui, sans-serif",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <h3
                        className="font-bold text-lg sm:text-xl text-zwhite leading-tight"
                        style={{
                          fontFamily: "var(--font-syne), system-ui, sans-serif",
                        }}
                      >
                        {job.role}
                      </h3>
                      <p className="text-zgray-text text-sm mt-0.5 font-mono flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{
                            background: [
                              "#d4ff2b",
                              "#ff3cac",
                              "#00f0ff",
                              "#bf5af2",
                              "#ff6b35",
                              "#ffe14d",
                            ][i % 6],
                          }}
                        />
                        @ {job.company_name}
                      </p>
                    </div>
                  </div>

                  {job.status !== "draft" && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider shrink-0 ${
                        job.status === "sent"
                          ? "pill-sent"
                          : job.status === "error"
                            ? "pill-error"
                            : "pill-sending"
                      }`}
                    >
                      {job.status === "sending" && (
                        <svg
                          className="w-3 h-3 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                      )}
                      {job.status === "sent"
                        ? "sent!"
                        : job.status === "error"
                          ? "failed"
                          : "sending..."}
                    </span>
                  )}
                </div>

                {/* Colorful divider */}
                <div
                  className="h-0.5 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${
                      ["#d4ff2b", "#ff3cac", "#00f0ff", "#bf5af2", "#ff6b35", "#ffe14d"][i % 6]
                    }, transparent)`,
                  }}
                />

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="label-tag">recipient email</label>
                  <input
                    type="email"
                    value={job.email}
                    onChange={(e) => updateJob(i, "email", e.target.value)}
                    className="thicc-input w-full px-4 py-2.5 text-sm text-zwhite"
                  />
                </div>

                {/* Cover Letter Field */}
                <div className="space-y-2">
                  <label className="label-tag">cover letter</label>
                  <textarea
                    value={job.cover_letter}
                    onChange={(e) =>
                      updateJob(i, "cover_letter", e.target.value)
                    }
                    rows={8}
                    className="thicc-input w-full px-4 py-3 text-sm leading-relaxed text-zwhite resize-y"
                  />
                </div>

                {/* Send / Retry Button */}
                <div className="flex justify-end gap-3">
                  {job.status === "error" && (
                    <button
                      onClick={() => handleSend(i)}
                      className="flex items-center gap-2 px-7 py-2.5 text-sm font-bold rounded-xl border-2 border-zorange text-zorange hover:bg-zorange/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      retry
                    </button>
                  )}
                  <button
                    onClick={() => handleSend(i)}
                    disabled={
                      job.status === "sending" || job.status === "sent" || job.status === "error"
                    }
                    className="btn-send px-7 py-2.5 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      {job.status !== "sending" && job.status !== "sent" && job.status !== "error" && (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                          />
                        </svg>
                      )}
                      {job.status === "sending"
                        ? "sending..."
                        : job.status === "sent"
                          ? "sent!"
                          : job.status === "error"
                            ? "send it"
                            : "send it"}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Empty State */}
        {!loading && jobs.length === 0 && (
          <div className="text-center py-16 sm:py-20">
            <div className="flex justify-center gap-3 mb-5">
              <span className="float-dot w-4 h-4 bg-zlime" />
              <span className="float-dot w-4 h-4 bg-zpink" style={{ animationDelay: "0.3s" }} />
              <span className="float-dot w-4 h-4 bg-zcyan" style={{ animationDelay: "0.6s" }} />
              <span className="float-dot w-4 h-4 bg-zpurple" style={{ animationDelay: "0.9s" }} />
              <span className="float-dot w-4 h-4 bg-zorange" style={{ animationDelay: "1.2s" }} />
            </div>
            <p
              className="text-zgray-text text-sm max-w-sm mx-auto leading-relaxed"
            >
              paste some job descriptions above and hit{" "}
              <span className="bg-gradient-to-r from-zlime to-zcyan bg-clip-text text-transparent font-bold uppercase text-xs tracking-wider">
                generate drafts
              </span>{" "}
              to let ai cook
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="pt-6 pb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-0.5 w-12 bg-gradient-to-r from-zlime via-zpink to-zpurple rounded-full" />
            <p className="text-[11px] font-mono text-zgray-text uppercase tracking-widest">
              hireflow // built by hassan ilyas
            </p>
          </div>
          <div className="flex gap-4">
            <a
              href="https://github.com/Hassan-Ilyas-Virk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono uppercase tracking-widest text-zgray-text hover:text-zlime transition-colors"
            >
              github
            </a>
            <span className="text-zgray-light">|</span>
            <a
              href="https://www.linkedin.com/in/hassan-ilyas-virk/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono uppercase tracking-widest text-zgray-text hover:text-zpink transition-colors"
            >
              linkedin
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
