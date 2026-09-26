"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCampaign } from "@/context/CampaignContext";
import { api, Insight, Report, EvidenceCitation } from "@/lib/api";
import {
  Lightbulb,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  Compass,
  CheckCircle2
} from "lucide-react";

export const InsightsWorkspace: React.FC = () => {
  const { activeCampaign, selectInsightForNextBrief, setActiveTab } = useCampaign();

  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    if (activeCampaign) {
      api.listInsights(activeCampaign.id)
        .then(setInsights)
        .catch(() => setInsights([]));
      api.listReports()
        .then(setReports)
        .catch(() => setReports([]));
    }
  }, [activeCampaign]);

  const handleGenerateInsights = async () => {
    if (!activeCampaign) return;
    setIsLoading(true);
    setMessage(null);
    try {
      const newInsights = await api.generateInsights(activeCampaign.id);
      setInsights(newInsights);
      setMessage("Synthesized verifiable strategic insights citing actual post IDs!");
    } catch (err: any) {
      setMessage(`Error synthesizing insights: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateWeeklyReport = async () => {
    setIsGeneratingReport(true);
    setMessage(null);
    try {
      const report = await api.generateWeeklyReport(
        "Week 38 - 2026",
        activeCampaign?.id
      );
      setReports((prev) => [report, ...prev]);
      setMessage(`Weekly Report generated with verified post-ID citations!`);
    } catch (err: any) {
      setMessage(`Error generating weekly report: ${err.message}`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (!activeCampaign) {
    return (
      <div className="p-12 text-center bg-[#0C0C0C] rounded-xl border border-[#1E1E1E]">
        <p className="text-xs text-zinc-400">Select an active campaign first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-zinc-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Lightbulb className="w-3.5 h-3.5 text-white" />
            <span>Step 6: Evidence-Backed Intelligence & The Closed Loop</span>
          </div>
          <h1 className="text-2xl font-normal text-white tracking-tight">
            AI Content Intelligence & Next-Brief Loop
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Strict judging rule: Claims cite verifiable post IDs. Insights must feed directly back into future brief creation.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerateInsights}
            disabled={isLoading}
            className="flex items-center space-x-2 px-5 py-2 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-medium transition-all shadow-md cursor-pointer whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span>{isLoading ? "Synthesizing Insights..." : "Synthesize AI Insights"}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerateWeeklyReport}
            disabled={isGeneratingReport}
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-[#141414] hover:bg-[#1E1E1E] border border-[#2B2B2B] text-zinc-200 text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <FileText className="w-3.5 h-3.5 text-white" />
            <span>{isGeneratingReport ? "Generating Report..." : "Generate Weekly Report"}</span>
          </motion.button>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-[#141414] border border-white/20 text-xs font-mono text-zinc-200">
          {message}
        </div>
      )}

      {/* The Closed Loop Banner */}
      <div className="p-5 rounded-xl bg-[#0D0D0D] border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#141414] border border-white/20 flex items-center justify-center shrink-0 mt-0.5">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-xs font-mono font-medium text-white uppercase tracking-wider block">
              The Closed Loop in Action
            </span>
            <p className="text-xs text-zinc-300 mt-0.5">
              Click <strong className="text-white font-medium">"Feed into Next Brief"</strong> on any insight below to immediately inject empirical strategic learnings into a new campaign brief.
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab("brief")}
          className="px-5 py-2 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-medium shrink-0 cursor-pointer shadow-md transition-all"
        >
          Create New Brief Now
        </motion.button>
      </div>

      {/* Evidence-Backed Insights Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-zinc-200">
          <Sparkles className="w-4 h-4 text-white" />
          <h2 className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-300">
            Evidence-Backed Strategic Insights ({insights.length})
          </h2>
        </div>

        {insights.length === 0 ? (
          <div className="p-10 text-center bg-[#0C0C0C] rounded-xl border border-[#1E1E1E]">
            <Lightbulb className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs text-zinc-400">
              No insights synthesized for this campaign yet. Click "Synthesize AI Insights" above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight: Insight) => (
              <motion.div
                key={insight.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="bg-[#0C0C0C] rounded-xl border border-[#1E1E1E] p-5 space-y-3.5 flex flex-col justify-between hover:border-zinc-500 transition-all shadow-lg"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-medium uppercase px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
                      {insight.category.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(insight.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-medium text-sm text-zinc-100">{insight.title}</h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">{insight.summary}</p>

                  {/* Traceable Post ID Evidence */}
                  <div className="p-3 rounded-lg bg-[#121212] border border-[#222222] space-y-1.5 text-xs">
                    <div className="flex items-center space-x-1.5 text-zinc-400 text-[10px] font-mono uppercase">
                      <ShieldCheck className="w-3.5 h-3.5 text-white" />
                      <span>Traceable Supporting Evidence:</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {insight.evidence_post_ids?.map((postId: string, idx: number) => (
                        <span
                          key={idx}
                          className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#181818] text-zinc-300 border border-[#2C2C2C]"
                        >
                          post: {postId}
                        </span>
                      ))}
                    </div>

                    {insight.metrics_evidence && (
                      <p className="text-[10px] font-mono text-zinc-400 pt-1">
                        Metrics: {JSON.stringify(insight.metrics_evidence)}
                      </p>
                    )}
                  </div>

                  {/* Recommendation */}
                  <div className="p-3 rounded-lg bg-[#141414] border border-[#242424] text-xs">
                    <span className="text-[10px] font-mono font-medium text-white uppercase tracking-wider block mb-1">
                      💡 Recommendation for Next Brief:
                    </span>
                    <p className="text-zinc-200 text-xs italic">
                      "{insight.recommendation_for_next_brief}"
                    </p>
                  </div>
                </div>

                {/* Closed Loop CTA */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    selectInsightForNextBrief(insight);
                    setActiveTab("brief");
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2 rounded-full bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 text-xs font-medium transition-all cursor-pointer"
                >
                  <span>Feed Insight into Next Brief</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Reports Section */}
      {reports.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#1C1C1C]">
          <div className="flex items-center space-x-2 text-zinc-200">
            <FileText className="w-4 h-4 text-white" />
            <h2 className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-300">
              Executive Weekly Performance Reports
            </h2>
          </div>

          <div className="space-y-4">
            {reports.map((report: Report) => (
              <div
                key={report.id}
                className="bg-[#0C0C0C] rounded-xl border border-[#1E1E1E] p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1A1A1A] pb-3">
                  <div>
                    <h3 className="font-medium text-base text-white">{report.title}</h3>
                    <span className="text-xs text-zinc-400 font-mono">Period: {report.reporting_period}</span>
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">
                    ID: {report.id.slice(0, 8)}
                  </span>
                </div>

                {/* Narrative Summary */}
                <div className="text-xs text-zinc-200 leading-relaxed bg-[#121212] p-4 rounded-lg border border-[#222222]">
                  <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Executive Narrative
                  </span>
                  <p>{report.narrative_summary}</p>
                </div>

                {/* Cross-Platform Analysis */}
                {report.cross_platform_analysis && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {Object.entries(report.cross_platform_analysis).map(([key, val], idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-[#141414] border border-[#242424]">
                        <span className="text-[10px] font-mono font-medium text-zinc-500 uppercase block mb-1">
                          {key.replace(/_/g, " ")}
                        </span>
                        <p className="text-zinc-300 text-xs">{String(val)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Citations */}
                {report.evidence_citations && report.evidence_citations.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider block">
                      Factual Performance Claims & Verified Evidence Citations:
                    </span>
                    <div className="space-y-1.5">
                      {report.evidence_citations.map((cite: EvidenceCitation, idx: number) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded bg-[#141414] border border-[#242424] flex items-center justify-between text-xs"
                        >
                          <span className="text-zinc-200 font-sans">"{cite.claim}"</span>
                          <span className="font-mono text-[10px] text-white">
                            Citing: {cite.supporting_post_ids?.join(", ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
