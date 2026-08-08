"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { WORKSHOP } from "@/components/pavel/workshopDetails";
import { Container } from "@/components/pavel/ui/Container";
import { Button } from "@/components/pavel/ui/Button";
import {
  CheckCircle2,
  Calendar,
  Video,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Send,
  Loader2,
  Layers,
  FileSpreadsheet,
  ShieldCheck,
} from "lucide-react";

export const ThankYouContent: React.FC = () => {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const nameParam = searchParams.get("name") || "";
  const ticketParam = searchParams.get("ticket") || "TK-042";

  const [copiedZoom, setCopiedZoom] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  // Form state for Perk 2: Live Audit Submission
  const [auditForm, setAuditForm] = useState({
    name: nameParam,
    email: emailParam,
    websiteUrl: "",
    targetKeyword: "",
    biggestChallenge: "",
  });
  const [auditSubmitting, setAuditSubmitting] = useState(false);
  const [auditSubmitted, setAuditSubmitted] = useState(false);
  const [auditError, setAuditError] = useState("");

  const zoomUrl = "https://zoom.us/j/pavel-semantic-seo-workshop";
  const zoomPasscode = "SEMANTIC2026";
  const notionTemplateUrl =
    "https://fynixdigital.notion.site/Pavel-Topical-Authority-Entity-Mapping-Template-Framework-1029384849";

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const createGoogleCalendarLink = () => {
    const title = encodeURIComponent("Semantic SEO Workshop with Pavel Klimakov");
    const details = encodeURIComponent(
      `Zoom Link: ${zoomUrl}\nPasscode: ${zoomPasscode}\n\nAttendee Ticket: ${ticketParam}\nNotion Template: ${notionTemplateUrl}`
    );
    const location = encodeURIComponent("Zoom Live Stream");
    const dates = "20260831T043000Z/20260831T073000Z";
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  };

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuditError("");
    setAuditSubmitting(true);

    try {
      const res = await fetch("/api/pavel/audit-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(auditForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit website for audit.");
      }

      setAuditSubmitted(true);
    } catch (err: unknown) {
      setAuditError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setAuditSubmitting(false);
    }
  };

  const firstName = nameParam ? nameParam.split(" ")[0] : "there";

  return (
    <Container>
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Top Header / Confirmation Banner */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-[2.25rem] sm:text-[3.25rem] lg:text-[4rem] leading-[1.04] font-medium tracking-[-0.028em] text-primary">
            You&apos;re officially in,{" "}
            <span className="font-serif italic font-medium whitespace-nowrap">
              {firstName}.
            </span>
          </h1>

          <p className="text-[1.15rem] sm:text-[1.25rem] text-text-muted leading-[1.6] max-w-xl mx-auto">
            Your seat for Pavel Klimakov&apos;s 3-hour live workshop is confirmed. A confirmation email with Zoom access details has been sent to{" "}
            <span className="text-primary font-medium underline decoration-border">{emailParam || "your email"}</span>.
          </p>
        </div>

        {/* Card 1: Core Zoom Access & Ticket Details */}
        <div className="bg-white border border-border rounded-2xl p-6 sm:p-9 shadow-sm space-y-6 pv-seam">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
            <div>
              <span className="text-xs uppercase tracking-[0.14em] text-text-muted font-semibold">
                EVENT SCHEDULE &amp; VENUE
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-primary mt-1">
                {WORKSHOP.dateLabel} &middot; {WORKSHOP.time} ({WORKSHOP.timezone})
              </h2>
              <p className="text-sm text-text-muted mt-1.5 flex items-center gap-2">
                <Video className="w-4 h-4 text-primary shrink-0" />
                3 Hours Live on {WORKSHOP.platform} &middot; Interactive Session
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={createGoogleCalendarLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button variant="outline" size="md">
                  <Calendar className="w-4 h-4 text-primary" />
                  Add to Google Calendar
                </Button>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-background-soft border border-border space-y-2">
              <span className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">
                Zoom Meeting Access
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-mono text-primary font-medium truncate">
                  {zoomUrl}
                </span>
                <button
                  onClick={() => copyToClipboard(zoomUrl, setCopiedZoom)}
                  className="p-1.5 text-text-muted hover:text-primary rounded-lg hover:bg-white transition-colors shrink-0 border border-transparent hover:border-border"
                  title="Copy Zoom Link"
                >
                  {copiedZoom ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-background-soft border border-border space-y-2">
              <span className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">
                Passcode
              </span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-primary font-semibold tracking-wider">
                  {zoomPasscode}
                </span>
                <span className="text-[11px] text-primary bg-white px-2 py-0.5 rounded border border-border font-medium">
                  Required on Join
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: PERK #1 — Instant Notion Template Access */}
        <div id="perk-1" className="bg-white border border-border rounded-2xl p-6 sm:p-9 shadow-sm space-y-6 pv-seam relative overflow-hidden">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs uppercase tracking-[0.14em] text-text-muted font-semibold">
              ATTENDEE RESOURCE &middot; INSTANT DELIVERABLE
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 text-primary text-[11px] font-semibold border border-border">
              <Sparkles className="w-3.5 h-3.5" /> Ready Now
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-primary">
              Pavel’s Topical Authority &amp; Entity Mapping Framework
            </h2>
            <p className="text-sm sm:text-base text-text-muted leading-[1.65] max-w-2xl">
              Don’t wait until the live session. Get immediate access to the exact Notion blueprint Pavel uses to structure entity trees, map content clusters, and determine topical coverage before writing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-background-soft border border-border flex items-center gap-3">
              <Layers className="w-5 h-5 text-primary shrink-0" />
              <span className="text-xs text-primary font-medium">Entity Hierarchy Builder</span>
            </div>
            <div className="p-4 rounded-xl bg-background-soft border border-border flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-primary shrink-0" />
              <span className="text-xs text-primary font-medium">Context Vector Matrix</span>
            </div>
            <div className="p-4 rounded-xl bg-background-soft border border-border flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
              <span className="text-xs text-primary font-medium">Internal Link Mesh Rules</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href={notionTemplateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button variant="primary" size="md">
                Access Notion Template
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>

            <Button
              variant="outline"
              size="md"
              onClick={() => copyToClipboard(notionTemplateUrl, setCopiedTemplate)}
            >
              {copiedTemplate ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-primary" />}
              {copiedTemplate ? "Link Copied!" : "Copy Template Link"}
            </Button>
          </div>
        </div>

        {/* Card 3: PERK #2 — VIP Live Site Audit Submission Queue */}
        <div id="audit-queue" className="bg-white border border-border rounded-2xl p-6 sm:p-9 shadow-sm space-y-6 pv-seam relative overflow-hidden">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs uppercase tracking-[0.14em] text-text-muted font-semibold">
              LIVE SITE AUDIT &middot; STAGE QUEUE
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 text-primary text-[11px] font-semibold border border-border">
              <Sparkles className="w-3.5 h-3.5" /> Priority Queue
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-primary">
              Submit Your Website for Pavel’s Live On-Stage Audit
            </h2>
            <p className="text-sm sm:text-base text-text-muted leading-[1.65] max-w-2xl">
              During the 3-hour live workshop, Pavel will pick real attendee websites to dissect live on screen. Submit your domain and target keyword below to get in the priority queue.
            </p>
          </div>

          {auditSubmitted ? (
            <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
              <div className="flex items-center gap-3 text-emerald-900 font-semibold text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                Website Queued for Pavel’s Live Audit!
              </div>
              <p className="text-sm text-text-muted">
                We received <span className="text-primary font-mono font-medium">{auditForm.websiteUrl}</span>. Attend live on Zoom to hear Pavel analyze your topical architecture!
              </p>
            </div>
          ) : (
            <form onSubmit={handleAuditSubmit} className="space-y-4 pt-2">
              {auditError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-700 text-xs font-medium">
                  {auditError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-primary">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={auditForm.name}
                    onChange={(e) => setAuditForm({ ...auditForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background-soft border border-border text-primary placeholder-text-muted/60 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-primary">
                    Your Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={auditForm.email}
                    onChange={(e) => setAuditForm({ ...auditForm, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background-soft border border-border text-primary placeholder-text-muted/60 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-primary">
                    Website URL to Audit
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. https://mybrand.com"
                    value={auditForm.websiteUrl}
                    onChange={(e) => setAuditForm({ ...auditForm, websiteUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background-soft border border-border text-primary placeholder-text-muted/60 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-primary">
                    Primary Target Keyword / Niche
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Enterprise SaaS Analytics"
                    value={auditForm.targetKeyword}
                    onChange={(e) => setAuditForm({ ...auditForm, targetKeyword: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background-soft border border-border text-primary placeholder-text-muted/60 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-primary flex items-center justify-between">
                  <span>Main SEO Challenge / Bottleneck (Optional)</span>
                  <span className="text-[11px] text-text-muted">e.g. Stuck on page 2</span>
                </label>
                <input
                  type="text"
                  placeholder="What is your biggest frustration with ranking right now?"
                  value={auditForm.biggestChallenge}
                  onChange={(e) => setAuditForm({ ...auditForm, biggestChallenge: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background-soft border border-border text-primary placeholder-text-muted/60 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={auditSubmitting}
                >
                  {auditSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting to Queue...
                    </>
                  ) : (
                    <>
                      Submit Website for Live Audit
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Support Note */}
        <div className="p-4 rounded-xl bg-white border border-border text-center text-xs text-text-muted">
          Need help or need to update your attendance details? Write to us anytime at{" "}
          <a href="mailto:hello@fynix.digital" className="text-primary font-medium underline decoration-border">
            hello@fynix.digital
          </a>
        </div>
      </div>
    </Container>
  );
};
