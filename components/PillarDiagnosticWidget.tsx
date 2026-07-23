"use client";

import { useState } from "react";
import type { Act } from "@/lib/content";

type Props = {
  actSlug: Act["slug"];
  actTitle: string;
};

export default function PillarDiagnosticWidget({ actSlug, actTitle }: Props) {
  // Step 1: Interactive Calculator Inputs
  const [valA, setValA] = useState<number>(
    actSlug === "ui-ux" ? 15000 : actSlug === "development" ? 3.2 : actSlug === "seo" ? 45 : 25000
  );
  const [valB, setValB] = useState<number>(
    actSlug === "ui-ux" ? 1.4 : actSlug === "development" ? 2 : actSlug === "seo" ? 30 : 12
  );

  // Form submission state
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  // Real-time calculated diagnostics
  const getCalculatedDiagnostics = () => {
    switch (actSlug) {
      case "ui-ux": {
        const currentPipeline = Math.round(valA * (valB / 100));
        const projectedPipeline = Math.round(currentPipeline * 2.4);
        const uplift = projectedPipeline - currentPipeline;
        return {
          metric1Label: "Current Mo. Leads",
          metric1Val: currentPipeline.toLocaleString(),
          metric2Label: "Projected Mo. Leads (2.4×)",
          metric2Val: projectedPipeline.toLocaleString(),
          metricHighlight: `+${uplift.toLocaleString()} monthly pipeline opportunities`,
          recommendation: "Refactoring information architecture & trust signals can eliminate drop-off in high-intent buyer journeys.",
        };
      }
      case "development": {
        const bounceRisk = Math.min(Math.round(valA * 22), 85);
        const targetLcp = 0.8;
        const speedMultiplier = (valA / targetLcp).toFixed(1);
        return {
          metric1Label: "Estimated Bounce Penalty",
          metric1Val: `${bounceRisk}%`,
          metric2Label: "Hydration Acceleration",
          metric2Val: `${speedMultiplier}× Faster`,
          metricHighlight: "LCP target < 1.0s via React 19 RSC architecture",
          recommendation: "Eliminating client-side waterfalls and adopting zero-bundle server components restores lost visitor intent.",
        };
      }
      case "seo": {
        const potentialMonthlyReach = Math.round(valA * (valB / 100) * 180);
        return {
          metric1Label: "Keyword Coverage Target",
          metric1Val: `${valA} High-Intent Clusters`,
          metric2Label: "Est. Organic Reach Gap",
          metric2Val: `${potentialMonthlyReach.toLocaleString()} visits/mo`,
          metricHighlight: "Claim rich snippet accordions via dynamic FAQ schemas",
          recommendation: "Structuring technical SEO & JSON-LD schema layers turns search queries directly into qualified discovery paths.",
        };
      }
      case "lead-generation": {
        const totalValue = valA;
        const convRate = valB / 100;
        const estimatedQualifiedDeals = Math.max(1, Math.round((totalValue * convRate) / 5000));
        const estimatedCacReduction = "35%";
        return {
          metric1Label: "Target ACV / Deal Size",
          metric1Val: `$${valA.toLocaleString()}`,
          metric2Label: "Est. CAC Efficiency",
          metric2Val: `-${estimatedCacReduction}`,
          metricHighlight: `~${estimatedQualifiedDeals} quarterly high-value deal ops`,
          recommendation: "Multi-step intent-gated diagnostic funnels qualify buyer readiness before sales team touches the lead.",
        };
      }
    }
  };

  const diagnostics = getCalculatedDiagnostics();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/lead-diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actSlug,
          email,
          company,
          valA,
          valB,
          summary: diagnostics.metricHighlight,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStatus("success");
        setResultMessage(data.message || "Diagnostic report request sent successfully.");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-white p-6 md:p-10 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#e9af88] font-semibold">
            Interactive Diagnostic Tool
          </span>
          <h3 className="font-serif text-2xl md:text-3xl text-primary font-medium mt-1">
            Estimate your {actTitle} Pipeline Impact
          </h3>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-background-soft border border-border text-xs font-mono text-text-muted self-start sm:self-center">
          Real-time Model
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 items-start">
        {/* INPUT CONTROLS */}
        <div className="lg:col-span-6 space-y-6">
          {actSlug === "ui-ux" && (
            <>
              <div>
                <div className="flex justify-between text-sm font-medium text-primary mb-2">
                  <span>Monthly Unique Visitors</span>
                  <span className="font-mono text-accent font-semibold">{valA.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="100000"
                  step="1000"
                  value={valA}
                  onChange={(e) => setValA(Number(e.target.value))}
                  className="w-full accent-[#0C1E2E] cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm font-medium text-primary mb-2">
                  <span>Current Funnel Conv. Rate (%)</span>
                  <span className="font-mono text-accent font-semibold">{valB}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="5.0"
                  step="0.1"
                  value={valB}
                  onChange={(e) => setValB(Number(e.target.value))}
                  className="w-full accent-[#0C1E2E] cursor-pointer"
                />
              </div>
            </>
          )}

          {actSlug === "development" && (
            <>
              <div>
                <div className="flex justify-between text-sm font-medium text-primary mb-2">
                  <span>Current Page Load Time (Seconds)</span>
                  <span className="font-mono text-accent font-semibold">{valA}s</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="8.0"
                  step="0.1"
                  value={valA}
                  onChange={(e) => setValA(Number(e.target.value))}
                  className="w-full accent-[#0C1E2E] cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm font-medium text-primary mb-2">
                  <span>Core Waterfall Layers</span>
                  <span className="font-mono text-accent font-semibold">{valB} Layers</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={valB}
                  onChange={(e) => setValB(Number(e.target.value))}
                  className="w-full accent-[#0C1E2E] cursor-pointer"
                />
              </div>
            </>
          )}

          {actSlug === "seo" && (
            <>
              <div>
                <div className="flex justify-between text-sm font-medium text-primary mb-2">
                  <span>Target High-Intent Keyword Clusters</span>
                  <span className="font-mono text-accent font-semibold">{valA}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={valA}
                  onChange={(e) => setValA(Number(e.target.value))}
                  className="w-full accent-[#0C1E2E] cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm font-medium text-primary mb-2">
                  <span>Target Buyer Search Intent (%)</span>
                  <span className="font-mono text-accent font-semibold">{valB}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="5"
                  value={valB}
                  onChange={(e) => setValB(Number(e.target.value))}
                  className="w-full accent-[#0C1E2E] cursor-pointer"
                />
              </div>
            </>
          )}

          {actSlug === "lead-generation" && (
            <>
              <div>
                <div className="flex justify-between text-sm font-medium text-primary mb-2">
                  <span>Target Annual Contract Value (ACV)</span>
                  <span className="font-mono text-accent font-semibold">${valA.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="250000"
                  step="5000"
                  value={valA}
                  onChange={(e) => setValA(Number(e.target.value))}
                  className="w-full accent-[#0C1E2E] cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm font-medium text-primary mb-2">
                  <span>Current Lead-to-Opportunity Rate (%)</span>
                  <span className="font-mono text-accent font-semibold">{valB}%</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="40"
                  step="1"
                  value={valB}
                  onChange={(e) => setValB(Number(e.target.value))}
                  className="w-full accent-[#0C1E2E] cursor-pointer"
                />
              </div>
            </>
          )}

          <div className="p-4 rounded-lg bg-background-soft border border-border">
            <div className="text-xs uppercase font-mono tracking-widest text-text-muted font-semibold">
              Diagnostic Finding
            </div>
            <p className="text-sm text-primary font-normal leading-relaxed mt-1">
              {diagnostics.recommendation}
            </p>
          </div>
        </div>

        {/* OUTPUT RESULTS & FORM REQUEST */}
        <div className="lg:col-span-6 p-6 rounded-xl bg-primary text-white space-y-6">
          <div className="grid grid-cols-2 gap-4 pb-6 border-b border-white/15">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-white/60">
                {diagnostics.metric1Label}
              </div>
              <div className="font-serif text-2xl md:text-3xl text-white font-medium mt-1">
                {diagnostics.metric1Val}
              </div>
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-[#e9af88]">
                {diagnostics.metric2Label}
              </div>
              <div className="font-serif text-2xl md:text-3xl text-[#e9af88] font-medium mt-1">
                {diagnostics.metric2Val}
              </div>
            </div>
          </div>

          <div className="text-sm text-white/80 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#e9af88]" aria-hidden />
            <span>{diagnostics.metricHighlight}</span>
          </div>

          {status === "success" ? (
            <div className="p-4 rounded-lg bg-white/10 border border-white/20 text-white text-sm">
              <div className="font-medium text-[#e9af88] mb-1">Diagnostic Report Requested</div>
              <p className="text-white/80">{resultMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 pt-2">
              <div className="text-xs font-mono uppercase tracking-widest text-white/70">
                Receive Custom {actTitle} Technical Brief
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="email"
                  required
                  placeholder="work.email@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-3.5 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#e9af88]"
                />
                <input
                  type="text"
                  placeholder="Company Name (optional)"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="px-3.5 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#e9af88]"
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-3 px-4 rounded-lg bg-[#e9af88] hover:bg-[#d89870] text-[#0C1E2E] font-semibold text-sm transition-colors duration-200 disabled:opacity-50"
              >
                {status === "loading" ? "Analyzing..." : `Request Free ${actTitle} Executive Brief`}
              </button>
              <div className="text-[11px] text-white/50 text-center">
                Direct engineer feedback within 4 hours. No sales spam.
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
