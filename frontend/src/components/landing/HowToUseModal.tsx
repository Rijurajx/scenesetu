"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Edit3,
  ShieldCheck,
  Send,
  BarChart3,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Upload,
  Layers,
  FileText,
  Clock,
  ChevronRight,
  Sliders,
  ExternalLink,
} from "lucide-react";
import { PixelBridgeIcon } from "@/components/common/PixelBridgeIcon";
import { InstagramIcon, YouTubeIcon, XTwitterIcon } from "@/components/common/PlatformIcons";

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNow: () => void;
}

interface StepData {
  number: number;
  title: string;
  shortDesc: string;
  timeEstimate: string;
  icon: React.ReactNode;
  overview: string;
  actionItems: string[];
  beginnerTip: string;
  uiHighlights: { label: string; detail: string }[];
}

export const HowToUseModal: React.FC<HowToUseModalProps> = ({
  isOpen,
  onClose,
  onStartNow,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const steps: StepData[] = [
    {
      number: 1,
      title: "Write or Pick Your Campaign Idea",
      shortDesc: "Tell SceneSetu what you want to promote in plain words",
      timeEstimate: "1-2 minutes",
      icon: <FileText className="w-5 h-5 text-white" />,
      overview:
        "You do not need any marketing or advertising background. Simply describe your web series, movie, festival, or product like you're telling a friend.",
      actionItems: [
        "Click the white 'Start Now' button to enter the SceneSetu Dashboard.",
        "Choose an existing sample brief (like 'Eken Babu Detective' or 'Panchayat Season 3') or click '+ New Campaign'.",
        "Select your preferred language (Bengali, English, or Hinglish) and primary genre (Drama, Thriller, Comedy, Romance).",
        "Click 'Save & Proceed' to prepare your brief for creation.",
      ],
      beginnerTip:
        "No complicated prompts needed! A simple sentence like 'Promote our upcoming monsoon crime thriller with an intriguing quote' is all the AI needs.",
      uiHighlights: [
        { label: "Brief Input", detail: "Simple text box for your story summary" },
        { label: "Tone Selector", detail: "Clickable chips (Dramatic, Quirky, Elegant)" },
        { label: "Language", detail: "Native Bengali support with authentic Kolkata phrasing" },
      ],
    },
    {
      number: 2,
      title: "Generate All Posts with 1 Click",
      shortDesc: "Watch the AI craft custom images and captions in parallel",
      timeEstimate: "30-45 seconds",
      icon: <Sparkles className="w-5 h-5 text-white" />,
      overview:
        "Once your brief is saved, SceneSetu automatically creates platform-ready marketing campaigns for Instagram, YouTube, and X simultaneously.",
      actionItems: [
        "Click the sparkling 'Generate Multi-Channel Campaign' button.",
        "A live progress bar will show you the exact stages: Strategy Formulation, Native Copywriting, Pixazo FLUX Artwork, and QC Verification.",
        "Helpful creative tips will rotate on your screen while our AI diffusion models render high-definition artwork.",
        "When complete, you will see tailored cards ready for review.",
      ],
      beginnerTip:
        "Generation takes around 30 to 45 seconds because it's generating unique, bespoke 12-billion parameter artwork for each channel rather than generic stock photos.",
      uiHighlights: [
        { label: "Progress Bar", detail: "Real-time timer and percentage display" },
        { label: "Three Channels", detail: "Instagram (1:1), YouTube (16:9), and X (16:9)" },
        { label: "Zero Effort", detail: "Generates hooks, captions, hashtags, and CTAs" },
      ],
    },
    {
      number: 3,
      title: "Review & Customize with Total Control",
      shortDesc: "Edit text easily or replace images with your own photos",
      timeEstimate: "2-3 minutes",
      icon: <Edit3 className="w-5 h-5 text-white" />,
      overview:
        "You are always in the driver's seat. If you want to change a headline, adjust a hashtag, or use your own production photos, you can do it right on the page.",
      actionItems: [
        "In the 'Edit Campaign' tab, click the Filter slider to switch between Instagram, YouTube, and X posts.",
        "Click 'Edit Content' to edit captions, headlines, or call-to-actions directly.",
        "Click 'Re-render Image' if you want the AI to generate a different scene based on your custom prompt.",
        "Click 'Upload Custom' to upload camera stills or promotional posters directly from your computer or phone.",
      ],
      beginnerTip:
        "You don't have to keep what the AI writes! You can edit any sentence, change hashtags, or upload custom photoshoot posters with a single click.",
      uiHighlights: [
        { label: "In-Place Editing", detail: "Pencil icon opens instant editable text areas" },
        { label: "Image Switcher", detail: "Re-render via AI prompt or upload your own file" },
        { label: "Filter Slider", detail: "Easily view only the platform you care about" },
      ],
    },
    {
      number: 4,
      title: "Automatic Quality Check (No Rejected Posts)",
      shortDesc: "SceneSetu validates character caps and rules for you",
      timeEstimate: "Automatic (0 sec)",
      icon: <ShieldCheck className="w-5 h-5 text-white" />,
      overview:
        "Ever had a tweet fail because it had 281 characters, or an Instagram post look cut-off because of wrong dimensions? SceneSetu runs an automated QC gate so that never happens.",
      actionItems: [
        "Head over to the 'Review & QC' tab in the top navigation.",
        "Green checkmarks confirm that character limits, hashtag counts, and image aspect ratios strictly conform to social network rules.",
        "A clear 'Ready for Release' seal confirms your campaign is safe to publish.",
        "Click 'Approve & Release' to hand off your verified campaign to the publisher.",
      ],
      beginnerTip:
        "You never have to count characters or memorize platform limits. If a caption is too long, the system highlights it immediately and suggests how to shorten it.",
      uiHighlights: [
        { label: "Rules Verified", detail: "Instagram (2,200 chars), X (280 chars), YouTube (100 chars)" },
        { label: "Aspect Ratios", detail: "Square 1:1, Landscape 16:9, Portrait 4:5" },
        { label: "Instant Status", detail: "Clear Pass / Warning badges on every card" },
      ],
    },
    {
      number: 5,
      title: "Connect Your Social Accounts or Use Simulator",
      shortDesc: "Publish directly to real accounts or practice risk-free",
      timeEstimate: "1 minute",
      icon: <Layers className="w-5 h-5 text-white" />,
      overview:
        "You can connect real social media accounts using Webhooks (like Zapier, Make, Slack, or Buffer) or Twitter/Instagram keys. If you don't have any keys, our built-in Simulator works instantly out-of-the-box!",
      actionItems: [
        "Go to the 'Adapters' tab on the left sidebar.",
        "To test with zero setup: Leave the built-in Simulator active. It lets you test the full publishing experience safely!",
        "To connect live accounts: Click '+ Connect Adapter', paste your Webhook URL or API key, and click 'Ping Test' to verify connection.",
        "Toggle which adapter is active with a simple switch.",
      ],
      beginnerTip:
        "If you don't have social API keys, don't worry! The built-in simulator mimics live social networks so you can test all features without risking your real accounts.",
      uiHighlights: [
        { label: "Ping Tester", detail: "Tests your webhook connection with 1 click" },
        { label: "Built-In Simulator", detail: "Safe playground for beginners" },
        { label: "Key Security", detail: "Secrets are masked and stored securely" },
      ],
    },
    {
      number: 6,
      title: "One-Click Publish & Performance Tracking",
      shortDesc: "Dispatch live posts and see which one wins the audience trophy",
      timeEstimate: "Ongoing",
      icon: <BarChart3 className="w-5 h-5 text-white" />,
      overview:
        "Release your campaign across your selected channels in seconds. Track real audience views, likes, and shares—and if you ever change your mind, hit 'Unpublish' anytime!",
      actionItems: [
        "In the 'Publish' workspace, select your approved campaign and click 'Publish to Channels'.",
        "If you notice an error later, click 'Unpublish' to immediately retract the release.",
        "Switch to the 'Analytics' tab to view engagement graphs, impressions, and click-through rates.",
        "Check the 'Algorithmic Winner' card to see which platform delivered the highest return, and read AI tips for your next brief.",
      ],
      beginnerTip:
        "Published the wrong post by accident? The 'Unpublish' button lets you retract it immediately with zero stress.",
      uiHighlights: [
        { label: "Single-Click Dispatch", detail: "Dispatches to all active channels at once" },
        { label: "Unpublish Toggle", detail: "Safe rollback capability anytime" },
        { label: "Trophy Badge", detail: "Celebrates the top performing post across channels" },
      ],
    },
  ];

  const currentStep = steps[activeStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full max-w-4xl bg-[#0D0D0D] border border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Modal Sticky Header */}
        <div className="p-4 sm:p-6 border-b border-[#222] bg-[#121212]/95 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <PixelBridgeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-medium text-white tracking-tight">
                  How to Use SceneSetu
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-medium uppercase tracking-wider">
                  Beginner Friendly
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-normal mt-0.5">
                A simple, non-technical step-by-step guide to building your first campaign
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Step Navigation Pill Slider (Mobile Responsive Scroll) */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-[#1C1C1C] bg-[#0A0A0A] shrink-0 overflow-x-auto no-scrollbar flex items-center space-x-2 sm:space-x-3">
          {steps.map((s, idx) => (
            <button
              key={s.number}
              onClick={() => setActiveStep(idx)}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                activeStep === idx
                  ? "bg-white text-black font-semibold shadow-md"
                  : "bg-[#161616] text-zinc-400 hover:text-white border border-[#262626] hover:bg-[#202020]"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                  activeStep === idx ? "bg-black text-white" : "bg-white/10 text-zinc-300"
                }`}
              >
                {s.number}
              </span>
              <span className="whitespace-nowrap">{s.title.split(" ")[0]} {s.title.split(" ")[1] || ""}</span>
            </button>
          ))}
        </div>

        {/* Scrollable Step Content Body */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6 sm:space-y-8 flex-1">
          {/* Step Header & Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-[#141414] border border-[#282828]">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/20 shrink-0 mt-0.5">
                {currentStep.icon}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">
                    Step {currentStep.number} of {steps.length}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-xs text-zinc-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    <span>Takes {currentStep.timeEstimate}</span>
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-white tracking-tight mt-1">
                  {currentStep.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 mt-1">
                  {currentStep.shortDesc}
                </p>
              </div>
            </div>
          </div>

          {/* Overview Paragraph */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">
              Overview
            </h4>
            <p className="text-sm text-zinc-200 leading-relaxed">
              {currentStep.overview}
            </p>
          </div>

          {/* Action Steps Checklist */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">
              What you need to do:
            </h4>
            <div className="space-y-2.5">
              {currentStep.actionItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start space-x-3 p-3 sm:p-3.5 rounded-xl bg-[#141414] border border-[#222]"
                >
                  <div className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono font-bold">
                    {i + 1}
                  </div>
                  <span className="text-xs sm:text-sm text-zinc-200 leading-snug">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Beginner Callout Tip */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-teal-950/20 border border-emerald-500/30 flex items-start space-x-3.5">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400">
              💡
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                Beginner Tip
              </span>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 leading-relaxed">
                {currentStep.beginnerTip}
              </p>
            </div>
          </div>

          {/* What to look for on screen */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">
              What to look for on screen
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {currentStep.uiHighlights.map((ui, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#121212] border border-[#242424] space-y-1"
                >
                  <span className="text-xs font-mono font-semibold text-white block">
                    {ui.label}
                  </span>
                  <span className="text-xs text-zinc-400 leading-snug block">
                    {ui.detail}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick FAQ Accordion for Non-Tech Users */}
          <div className="pt-4 border-t border-[#1C1C1C] space-y-3">
            <h4 className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider flex items-center space-x-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
              <span>Frequently Asked Questions</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#131313] border border-[#222] space-y-1">
                <span className="font-medium text-white block">Do I need coding or technical skills?</span>
                <p className="text-zinc-400">
                  Not at all. Everything works just like Canva, Buffer, or Instagram with simple buttons and inputs.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#131313] border border-[#222] space-y-1">
                <span className="font-medium text-white block">Can I post only to Instagram?</span>
                <p className="text-zinc-400">
                  Yes! Use the horizontal Filter slider at the top to select Instagram, edit its copy, and publish only that card.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#131313] border border-[#222] space-y-1">
                <span className="font-medium text-white block">Can I use photos from my phone?</span>
                <p className="text-zinc-400">
                  Yes, click the 'Upload Custom' button on any post card to upload your own camera photos directly.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#131313] border border-[#222] space-y-1">
                <span className="font-medium text-white block">What if I make a typo after publishing?</span>
                <p className="text-zinc-400">
                  Click 'Unpublish' in the Publisher workspace at any time to immediately pull the release back.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Sticky Footer with Step Controls & CTA */}
        <div className="p-4 sm:p-5 border-t border-[#222] bg-[#121212]/95 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Step Back / Forward Buttons */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
              disabled={activeStep === 0}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer ${
                activeStep === 0
                  ? "bg-[#181818] text-zinc-600 cursor-not-allowed"
                  : "bg-[#202020] hover:bg-[#282828] text-zinc-300 hover:text-white"
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Step</span>
            </button>

            <span className="text-xs font-mono text-zinc-500 sm:hidden">
              {activeStep + 1} / {steps.length}
            </span>

            <button
              onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
              disabled={activeStep === steps.length - 1}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer ${
                activeStep === steps.length - 1
                  ? "bg-[#181818] text-zinc-600 cursor-not-allowed"
                  : "bg-[#202020] hover:bg-[#282828] text-zinc-300 hover:text-white"
              }`}
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Primary Action Button: Start Now */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              onClose();
              onStartNow();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-white text-black font-semibold text-xs sm:text-sm hover:bg-zinc-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_28px_rgba(255,255,255,0.5)] cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>Ready? Open SceneSetu</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
