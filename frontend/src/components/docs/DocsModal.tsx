"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  FileText,
  Sliders,
  CheckCircle2,
  Send,
  BarChart3,
  Lightbulb,
  ArrowRight,
  ExternalLink,
  Upload,
  RefreshCw,
  Trash2,
  Check,
  ChevronRight,
  Terminal,
  Database,
  Globe,
  HelpCircle,
  Hash,
} from "lucide-react";
import { PixelBridgeIcon } from "@/components/common/PixelBridgeIcon";
import { InstagramIcon, YouTubeIcon, XTwitterIcon } from "@/components/common/PlatformIcons";

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DocSectionId =
  | "overview"
  | "tech-stack"
  | "operating-guide"
  | "features"
  | "qc-rules"
  | "closed-loop"
  | "faq";

export const DocsModal: React.FC<DocsModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<DocSectionId>("overview");

  if (!isOpen) return null;

  const navPoints: { id: DocSectionId; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "1. Mission & Overview", icon: <PixelBridgeIcon className="w-4 h-4 rounded" /> },
    { id: "tech-stack", label: "2. Tech Stack", icon: <Cpu className="w-4 h-4 text-white" /> },
    { id: "operating-guide", label: "3. Operating Guide (6 Steps)", icon: <Terminal className="w-4 h-4 text-white" /> },
    { id: "features", label: "4. Deep-Dive Features", icon: <Sliders className="w-4 h-4 text-white" /> },
    { id: "qc-rules", label: "5. Deterministic QC Rules", icon: <ShieldCheck className="w-4 h-4 text-white" /> },
    { id: "closed-loop", label: "6. Closed-Loop Feedback", icon: <Lightbulb className="w-4 h-4 text-white" /> },
    { id: "faq", label: "7. FAQ & Troubleshooting", icon: <HelpCircle className="w-4 h-4 text-white" /> },
  ];

  const scrollToSection = (id: DocSectionId) => {
    setActiveSection(id);
    const element = document.getElementById(`doc-section-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-[#0C0C0C] border border-[#262626] rounded-2xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans"
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#1E1E1E] bg-[#111111] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <PixelBridgeIcon className="w-8 h-8 rounded-lg" />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  SceneSetu • Official Documentation
                </h2>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
                  v1.0.0 Production
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                AI-Native Content Operations & Closed-Loop Campaign Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href="https://github.com/Rijurajx/scenesetu"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] text-zinc-300 text-xs font-mono transition-colors"
            >
              <span>GitHub Repo</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Documentation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Sticky Point Navigation Bar */}
        <div className="bg-[#141414] border-b border-[#222222] px-4 py-2.5 overflow-x-auto no-scrollbar shrink-0 flex items-center space-x-2">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider shrink-0 mr-1">
            Jump To:
          </span>
          {navPoints.map((point) => {
            const isSelected = activeSection === point.id;
            return (
              <button
                key={point.id}
                onClick={() => scrollToSection(point.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-white text-black shadow-md font-semibold"
                    : "bg-[#1C1C1C] hover:bg-[#282828] text-zinc-400 hover:text-white border border-[#2E2E2E]"
                }`}
              >
                <span>{point.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Documentation Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-12 leading-relaxed text-zinc-300 text-sm">
          {/* 1. Mission & Overview */}
          <section id="doc-section-overview" className="space-y-4 scroll-mt-6">
            <div className="flex items-center space-x-2 text-white border-b border-[#222] pb-2">
              <PixelBridgeIcon className="w-5 h-5 rounded" />
              <h3 className="text-lg font-semibold text-white tracking-tight">
                1. Mission & Executive Overview
              </h3>
            </div>

            <p>
              <strong>SceneSetu</strong> ("The Bridge of Scenes") is an enterprise-grade AI content orchestration engine engineered for entertainment studios, OTT networks, and production houses — purpose-built for the <strong>hoichoi Hackathon 2026 (Problem Statement 3: AI-Powered Content Creation and Marketing Workflow)</strong>.
            </p>

            <div className="p-4 rounded-xl bg-[#141414] border border-[#242424] space-y-2">
              <h4 className="text-xs font-mono uppercase text-white font-semibold tracking-wider">
                The Core Problem We Solve
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                OTT networks launch dozens of original web series, films, and trailers monthly. Marketing teams are forced to manually fragment a single creative brief into distinct adaptations for YouTube, Instagram, and X (Twitter). This manual workflow causes:
              </p>
              <ul className="text-xs text-zinc-400 space-y-1 list-disc pl-5">
                <li>Loss of cultural authenticity and tone in native regional languages like Bengali.</li>
                <li>Frequent platform rule violations (character cap overflows, wrong thumbnail aspect ratios, missing CTAs).</li>
                <li>Zero closed-loop feedback: Past post performance metrics are never fed back into subsequent creative briefs.</li>
              </ul>
            </div>

            <p className="text-xs text-zinc-300">
              SceneSetu automates the entire lifecycle: from brief ingestion, strategic narrative extraction, culturally grounded copywriting, and FLUX visual rendering, through deterministic rule validation, human editorial sign-off, simulated publishing, cross-platform analytics, and closed-loop intelligence.
            </p>
          </section>

          {/* 2. Tech Stack */}
          <section id="doc-section-tech-stack" className="space-y-4 scroll-mt-6">
            <div className="flex items-center space-x-2 text-white border-b border-[#222] pb-2">
              <Cpu className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white tracking-tight">
                2. Technology Stack & Infrastructure
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#121212] border border-[#222] space-y-2">
                <div className="flex items-center space-x-2 text-white font-medium text-xs">
                  <Globe className="w-4 h-4 text-white" />
                  <span>Frontend Architecture</span>
                </div>
                <ul className="text-xs text-zinc-400 space-y-1 list-disc pl-4 font-mono">
                  <li>Framework: Next.js 16.3 (Turbopack Engine)</li>
                  <li>Runtime: React 19, TypeScript</li>
                  <li>Styling: Vanilla Tailwind CSS (Pure Dark Monochrome)</li>
                  <li>Animation: Framer Motion for micro-interactions</li>
                  <li>Hosting: Vercel Edge Global Network</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#121212] border border-[#222] space-y-2">
                <div className="flex items-center space-x-2 text-white font-medium text-xs">
                  <Terminal className="w-4 h-4 text-white" />
                  <span>Backend & API Architecture</span>
                </div>
                <ul className="text-xs text-zinc-400 space-y-1 list-disc pl-4 font-mono">
                  <li>Framework: FastAPI (Python 3.11 asynchronous)</li>
                  <li>Validation: Pydantic v2 schemas</li>
                  <li>ORM: SQLAlchemy 2.0 with asyncpg</li>
                  <li>Server: Uvicorn ASGI with auto-reload</li>
                  <li>Hosting: Render Cloud Web Service</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#121212] border border-[#222] space-y-2">
                <div className="flex items-center space-x-2 text-white font-medium text-xs">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Dual AI Engine</span>
                </div>
                <ul className="text-xs text-zinc-400 space-y-1 list-disc pl-4 font-mono">
                  <li>Language: Gemini 2.5 Flash (Google GenAI SDK)</li>
                  <li>Bengali Translation & Cultural Adaptation</li>
                  <li>Image Model: Pixazo FLUX Schnell (SOTA 12B DiT)</li>
                  <li>Multi-Aspect Framing: 16:9, 1:1, 4:5, 9:16</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#121212] border border-[#222] space-y-2">
                <div className="flex items-center space-x-2 text-white font-medium text-xs">
                  <Database className="w-4 h-4 text-white" />
                  <span>Database & Asset Storage</span>
                </div>
                <ul className="text-xs text-zinc-400 space-y-1 list-disc pl-4 font-mono">
                  <li>Relational DB: Supabase PostgreSQL</li>
                  <li>Cloud Storage: Supabase S3 Storage Bucket</li>
                  <li>Bucket: scenesetu-assets (Public CDN)</li>
                  <li>Cascading Deletion: Full referential integrity</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. Operating Guide */}
          <section id="doc-section-operating-guide" className="space-y-4 scroll-mt-6">
            <div className="flex items-center space-x-2 text-white border-b border-[#222] pb-2">
              <Terminal className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white tracking-tight">
                3. Step-by-Step Operating Guide (How to Use SceneSetu)
              </h3>
            </div>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-[#121212] border border-[#222] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-white font-medium text-xs font-mono">
                    <FileText className="w-4 h-4 text-white" />
                    <span>STEP 1: GENERATE CAMPAIGNS</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">Ingestion</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Enter your show or film title (e.g. <em>নিশীথ রাতের ডাক</em>), a rich creative synopsis, target audience, and primary language (Bengali, English, or Bilingual).
                </p>
                <div className="bg-[#181818] p-3 rounded-lg text-xs font-mono text-zinc-300 space-y-1">
                  <div>• <strong>Preset Buttons:</strong> Click <em>"Bengali Thriller"</em> or <em>"Romance Web Series"</em> to auto-populate high-stakes entertainment briefs.</div>
                  <div>• <strong>Custom Aspect Ratios:</strong> Customize image framing per channel (e.g. YouTube 16:9, Instagram 1:1, X 16:9).</div>
                  <div>• <strong>Copy Limits:</strong> Optionally set hard caps on maximum words and characters.</div>
                  <div>• <strong>Closed-Loop Insight Injection:</strong> Check prior verified insights to guide the AI with historical audience takeaways.</div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-[#121212] border border-[#222] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-white font-medium text-xs font-mono">
                    <Sliders className="w-4 h-4 text-white" />
                    <span>STEP 2: EDIT CAMPAIGN</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">Generation & Adaptation</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  The studio displays all active campaigns in collapsible accordions. Inside each campaign, Gemini extracts the <strong>Core Hook</strong>, <strong>Central Theme</strong>, and <strong>Emotional Resonance</strong>, while Pixazo FLUX synthesizes channel-specific visual assets in parallel.
                </p>
                <div className="bg-[#181818] p-3 rounded-lg text-xs font-mono text-zinc-300 space-y-1">
                  <div>• <strong>Edit Manually:</strong> Directly modify headlines, primary Bengali copy, secondary translations, hashtags, and CTA.</div>
                  <div>• <strong>Regen Copy:</strong> Feed custom refinement instructions or target word limits to Gemini.</div>
                  <div>• <strong>Regen Image:</strong> Re-synthesize artwork with Pixazo FLUX with customized visual prompts.</div>
                  <div>• <strong>Upload Image:</strong> Replace the AI visual with your studio's official photography.</div>
                  <div>• <strong>Delete Post:</strong> Safely delete individual platform cards.</div>
                  <div>• <strong>Universal Review Button:</strong> Click <em>"Send Campaign to Review Gate"</em> to transition all posts to Step 3.</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-[#121212] border border-[#222] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-white font-medium text-xs font-mono">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>STEP 3: HUMAN APPROVAL & DETERMINISTIC QC GATE</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">Quality Control</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Before any post can be scheduled, SceneSetu’s deterministic engine inspects platform character caps, hashtag saturation, CTA presence, and aspect ratios. The editorial lead holds final authority.
                </p>
                <div className="bg-[#181818] p-3 rounded-lg text-xs font-mono text-zinc-300 space-y-1">
                  <div>• <strong>Sign Off / Approve:</strong> Permanently signs off the post for production publishing (locked when QC fails).</div>
                  <div>• <strong>Reject:</strong> Flags content requiring creative rework.</div>
                  <div>• <strong>Send Back to Edit Campaign:</strong> Returns the campaign to Step 2 for prompt adjustments.</div>
                </div>
              </div>

              {/* Steps 4, 5, 6 */}
              <div className="p-4 rounded-xl bg-[#121212] border border-[#222] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-white font-medium text-xs font-mono">
                    <Send className="w-4 h-4 text-white" />
                    <span>STEPS 4 - 6: PUBLISHER, ANALYTICS & CLOSED-LOOP INSIGHTS</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">Execution & Loop</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Approved content is dispatched through the Multi-Channel Publisher. As simulated audience impressions, views, and clicks are recorded, the <strong>Like-for-Like Cross-Platform Analytics</strong> engine determines the winning platform. Finally, the <strong>Closed Loop Engine</strong> extracts concrete strategic recommendations tied to exact post IDs and injects them into future briefs.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Deep-Dive Features */}
          <section id="doc-section-features" className="space-y-4 scroll-mt-6">
            <div className="flex items-center space-x-2 text-white border-b border-[#222] pb-2">
              <Sliders className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white tracking-tight">
                4. Deep-Dive Feature Breakdown
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-lg bg-[#141414] border border-[#242424] space-y-1">
                <span className="font-semibold text-white text-sm">Multi-Campaign Collapsible Architecture</span>
                <p className="text-zinc-400">
                  Manage multiple OTT campaigns concurrently without screen clutter. Both the Edit Campaign and Review Gate workspaces support independent accordion collapsing, per-campaign regeneration, and universal batch routing.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#141414] border border-[#242424] space-y-1">
                <span className="font-semibold text-white text-sm">Custom Image Upload & S3 Storage</span>
                <p className="text-zinc-400">
                  Don't want to use AI images? Any platform card in Edit Campaign or Review Gate features an <em>Upload Img</em> button that uploads user files directly to Supabase Storage and re-validates aspect ratios automatically.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#141414] border border-[#242424] space-y-1">
                <span className="font-semibold text-white text-sm">In-Place Editorial Engine</span>
                <p className="text-zinc-400">
                  Full inline editing allows marketing leads to fine-tune copy, fix typos, adjust hashtags, or change CTAs with instant saving and live character and word counters.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#141414] border border-[#242424] space-y-1">
                <span className="font-semibold text-white text-sm">Universal Review Gate Dispatch</span>
                <p className="text-zinc-400">
                  Each campaign header features a single-click <em>"Send Campaign to Review Gate"</em> button that moves all non-approved draft posts into the pending review queue and navigates the user directly to QC.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#141414] border border-[#242424] space-y-1">
                <span className="font-semibold text-white text-sm">Cascading Deletion Engine</span>
                <p className="text-zinc-400">
                  Deleting a post cleans up all foreign key child records (validation results, approvals, schedules, metrics) before safely removing the post from the database.
                </p>
              </div>
            </div>
          </section>

          {/* 5. Deterministic QC Rules */}
          <section id="doc-section-qc-rules" className="space-y-4 scroll-mt-6">
            <div className="flex items-center space-x-2 text-white border-b border-[#222] pb-2">
              <ShieldCheck className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white tracking-tight">
                5. Deterministic Platform QC Rules Reference
              </h3>
            </div>

            <p className="text-xs text-zinc-400">
              Unlike subjective LLM reviews, SceneSetu enforces strict deterministic validation rules based on official social network specifications:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#222]">
                <thead className="bg-[#141414] text-zinc-300 font-mono uppercase text-[11px]">
                  <tr>
                    <th className="p-3 border-b border-[#222]">Platform</th>
                    <th className="p-3 border-b border-[#222]">Aspect Ratio</th>
                    <th className="p-3 border-b border-[#222]">Copy Length Limits</th>
                    <th className="p-3 border-b border-[#222]">Hashtag Policy</th>
                    <th className="p-3 border-b border-[#222]">Required CTA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1F1F] font-mono text-[11px] text-zinc-400">
                  <tr>
                    <td className="p-3 text-white flex items-center space-x-2">
                      <InstagramIcon className="w-3.5 h-3.5" />
                      <span>Instagram</span>
                    </td>
                    <td className="p-3">1:1 Square, 4:5 Portrait</td>
                    <td className="p-3">5 - 2,200 characters</td>
                    <td className="p-3">Max 30 hashtags</td>
                    <td className="p-3 text-emerald-400">Mandatory</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-white flex items-center space-x-2">
                      <YouTubeIcon className="w-3.5 h-3.5" />
                      <span>YouTube Community</span>
                    </td>
                    <td className="p-3">16:9 Landscape</td>
                    <td className="p-3">Title: 3 - 100 chars<br />Body: &le; 5,000 chars</td>
                    <td className="p-3">Max 15 hashtags</td>
                    <td className="p-3 text-emerald-400">Mandatory</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-white flex items-center space-x-2">
                      <XTwitterIcon className="w-3.5 h-3.5" />
                      <span>X (Twitter)</span>
                    </td>
                    <td className="p-3">16:9 Landscape, 1:1</td>
                    <td className="p-3">&le; 280 characters</td>
                    <td className="p-3">Max 4 hashtags</td>
                    <td className="p-3 text-emerald-400">Mandatory</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 6. Closed-Loop Feedback */}
          <section id="doc-section-closed-loop" className="space-y-4 scroll-mt-6">
            <div className="flex items-center space-x-2 text-white border-b border-[#222] pb-2">
              <Lightbulb className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white tracking-tight">
                6. Evidence-Backed Closed-Loop Feedback
              </h3>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              The core innovation of SceneSetu is solving the <strong>"Open Loop" failure</strong> of modern marketing tech. Typically, analytics dashboards remain isolated from creative tools.
            </p>

            <div className="p-4 rounded-xl bg-[#141414] border border-[#242424] space-y-3 text-xs">
              <h4 className="font-semibold text-white">How the Closed Loop Functions:</h4>
              <div className="space-y-2 text-zinc-400">
                <div className="flex items-start space-x-2">
                  <span className="text-white font-mono font-bold">1.</span>
                  <span><strong>Traceable Citations:</strong> Every insight generated cites exact database post IDs (e.g. <code>post_id: eb95b337...</code>) and concrete metrics (engagement rate, click counts).</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-white font-mono font-bold">2.</span>
                  <span><strong>Recommendation Synthesis:</strong> The engine translates post performance into an actionable creative directive for the next brief (e.g. <em>"Bengali suspense copy that opens with an emotional riddle drove 3.4x higher shares on Instagram"</em>).</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-white font-mono font-bold">3.</span>
                  <span><strong>Prompt Injection:</strong> When creating a new brief in Step 1, selected prior insights are injected directly into the Gemini generation context, ensuring creative intelligence compounds over time.</span>
                </div>
              </div>
            </div>
          </section>

          {/* 7. FAQ & Troubleshooting */}
          <section id="doc-section-faq" className="space-y-4 scroll-mt-6 pb-6">
            <div className="flex items-center space-x-2 text-white border-b border-[#222] pb-2">
              <HelpCircle className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white tracking-tight">
                7. Frequently Asked Questions & Troubleshooting
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-lg bg-[#141414] border border-[#222]">
                <h5 className="font-medium text-white mb-1">
                  Q: Why is the "Sign Off / Approve" button disabled in the Review Gate?
                </h5>
                <p className="text-zinc-400">
                  The button is disabled if the post fails deterministic platform validation checks (e.g., copy exceeds 280 characters on X) or if there are unsaved edits in the editor. Fix the copy or replace the asset and click "Save" to enable approval.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#141414] border border-[#222]">
                <h5 className="font-medium text-white mb-1">
                  Q: Where are the generated visual assets stored?
                </h5>
                <p className="text-zinc-400">
                  All AI-generated images (from Pixazo FLUX) and user-uploaded custom images are stored in the Supabase S3 storage bucket (<code>scenesetu-assets</code>) with public CDN URLs.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#141414] border border-[#222]">
                <h5 className="font-medium text-white mb-1">
                  Q: Can I send a campaign back to Edit Campaign if revisions are needed?
                </h5>
                <p className="text-zinc-400">
                  Yes! In the Review Gate, each campaign header includes a <em>"Send Back to Edit Campaign"</em> button that resets posts to draft status and transitions your workspace back to Step 2 for prompt tweaks or re-generation.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#141414] border border-[#222]">
                <h5 className="font-medium text-white mb-1">
                  Q: How is Bengali script handled without corrupting formatting?
                </h5>
                <p className="text-zinc-400">
                  Gemini 2.5 Flash is instructed with strict UTF-8 Bengali linguistic constraints, preventing broken conjuncts and ensuring authentic regional Kolkata colloquialisms.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1E1E1E] bg-[#111111] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0 text-xs font-mono text-zinc-500">
          <span>hoichoi Hackathon 2026 • Problem Statement 3</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-semibold font-sans transition-colors cursor-pointer self-end sm:self-auto"
          >
            Close Documentation
          </button>
        </div>
      </motion.div>
    </div>
  );
};
