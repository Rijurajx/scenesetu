"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Compass,
  Layers,
  Sparkles,
  ExternalLink,
  Check,
  ChevronDown,
  BookOpen,
  ArrowUpRight,
  Sliders,
  Send,
  BarChart3,
  Lightbulb,
  Upload,
  RefreshCw,
  Cpu,
  Globe,
  Database,
} from "lucide-react";
import { PixelBridgeIcon } from "@/components/common/PixelBridgeIcon";
import { InstagramIcon, YouTubeIcon, XTwitterIcon } from "@/components/common/PlatformIcons";
import { DocsModal } from "@/components/docs/DocsModal";

interface LandingPageProps {
  onOpenApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenApp }) => {
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  const features = [
    {
      icon: <Sparkles className="w-5 h-5 text-white" />,
      title: "AI Creative Strategy Extraction",
      description:
        "Gemini 2.5 Flash analyzes your raw show brief to extract the central theme, core hook, and emotional resonance before writing a single word.",
      tag: "Gemini 2.5 Flash",
    },
    {
      icon: <Layers className="w-5 h-5 text-white" />,
      title: "Multi-Platform Campaign Creation & Adaptation",
      description:
        "Generates dedicated 1:1, 16:9, and 4:5 visual artwork with Pixazo FLUX alongside culturally authentic Bengali and English copy for YouTube, Instagram, and X.",
      tag: "Flux Schnell 12B",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-white" />,
      title: "Deterministic Platform QC Gate",
      description:
        "Evaluates hard channel rules (character limits, hashtag caps, aspect ratios, CTA presence) programmatically. LLMs never approve their own work.",
      tag: "Hard Rule Engine",
    },
    {
      icon: <Upload className="w-5 h-5 text-white" />,
      title: "Full In-Place Editorial & Custom Uploads",
      description:
        "Marketing teams can edit copy in-line, upload their own photography directly to Supabase Storage, or re-render copy and imagery with customized prompts.",
      tag: "Supabase S3 Storage",
    },
    {
      icon: <Sliders className="w-5 h-5 text-white" />,
      title: "Multi-Campaign Collapsible Batching",
      description:
        "Manage multiple ongoing web series or film launches simultaneously with collapsible UI panels and a single-click universal review gate dispatch.",
      tag: "Collapsible UI",
    },
    {
      icon: <Lightbulb className="w-5 h-5 text-white" />,
      title: "Closed-Loop Evidence-Backed Insights",
      description:
        "Audience engagement metrics cite exact post IDs and automatically synthesize concrete recommendations that seed the next campaign brief.",
      tag: "Closed-Loop Feedback",
    },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans selection:bg-white/20 antialiased overflow-x-hidden">
      {/* Top Floating Pill Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-5 inset-x-0 z-50 w-fit max-w-[92vw] mx-auto px-2"
      >
        <div className="bg-[#121614]/80 backdrop-blur-xl border border-white/20 rounded-full px-4 sm:px-5 py-2 flex items-center space-x-3.5 sm:space-x-5 shadow-2xl shadow-black/80">
          {/* Left: Pixelated App Icon & Logo */}
          <div
            onClick={onOpenApp}
            className="flex items-center space-x-2.5 cursor-pointer group"
            title="SceneSetu"
          >
            <PixelBridgeIcon className="w-6 h-6 rounded group-hover:scale-105 transition-transform" />
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-sm tracking-tight text-white font-mono lowercase">
                scenesetu
              </span>
              <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
                hoichoi '26
              </span>
            </div>
          </div>

          {/* Right: Docs, GitHub, and Emphasized Start Now Button */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Docs Button */}
            <button
              onClick={() => setIsDocsOpen(true)}
              className="text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center space-x-1.5 px-2 py-1 rounded-full hover:bg-white/5"
            >
              <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
              <span>Docs</span>
            </button>

            {/* GitHub Link */}
            <a
              href="https://github.com/Rijurajx/scenesetu"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-zinc-300 hover:text-white transition-colors flex items-center space-x-1.5 px-2 py-1 rounded-full hover:bg-white/5"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
              <span>GitHub</span>
            </a>

            {/* Emphasized Start Now CTA */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenApp}
              className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-100 transition-all shadow-[0_0_16px_rgba(255,255,255,0.25)] ring-1 ring-white/40 cursor-pointer flex items-center space-x-1.5 shrink-0"
            >
              <span>Start Now</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with Uplifted Pixelated Bridge Cloudscape Background */}
      <section className="relative pt-36 pb-24 px-6 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
        {/* Uplifted Background Image: repositioned higher with crisp contrast */}
        <div
          className="absolute inset-0 bg-cover bg-[position:50%_8%] z-0 scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: "url('/hero_bridge.jpg')",
          }}
        />

        {/* Enhanced Vignette Gradients for Legibility and Seamless Dark Blend */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-[#000000] z-0" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/70 z-0" />

        {/* Top Hero Text / Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center space-y-6"
        >
          {/* Telemetry Tag */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-mono text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="tracking-wide">HOICHOI HACKATHON '26 • PROBLEM STATEMENT 3</span>
          </div>

          {/* Hero Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-normal text-white max-w-3xl leading-[1.08] tracking-[-0.035em]">
            Content operations that{" "}
            <span className="font-semibold text-white">
              keeps getting better
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-zinc-200 max-w-2xl leading-relaxed font-normal drop-shadow-md">
            SceneSetu transforms a single creative brief into channel-native campaigns across Instagram, YouTube, and X, strictly enforces deterministic QC, and feeds verified post-ID performance insights into future briefs.
          </p>

          {/* Hero CTA Buttons: Start Now (Emphasized) + Know More */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-4">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenApp}
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-100 transition-all shadow-[0_0_24px_rgba(255,255,255,0.35)] ring-2 ring-white/40 cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Start Now</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </motion.button>

            <a
              href="#features"
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-black/50 hover:bg-black/80 border border-white/25 hover:border-white/45 text-white font-medium text-sm transition-all cursor-pointer flex items-center justify-center space-x-2 backdrop-blur-md"
            >
              <span>Know More</span>
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            </a>
          </div>
        </motion.div>
      </section>

      {/* Features & Services Section */}
      <section id="features" className="py-24 px-6 bg-[#000000] border-t border-[#1C1C1C]">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest block">
              SERVICES & CAPABILITIES
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal text-white tracking-[-0.03em]">
              The content operations pipeline your studio actually needs
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed font-normal">
              Bring us the single brief, language, and audience context. SceneSetu builds the tailored multi-platform campaign around them — and keeps optimizing after publication.
            </p>
          </div>

          {/* 6-Item Modern Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="p-6 rounded-2xl bg-[#090909] border border-[#1C1C1C] hover:border-[#333333] transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      {feat.icon}
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="font-medium text-base text-white">{feat.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#181818] flex items-center text-[11px] text-zinc-500 font-mono">
                  <span>Verified Channel Rule</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brief About Us Section */}
      <section id="about" className="py-24 px-6 bg-[#060606] border-t border-[#1C1C1C]">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-3">
            <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest block">
              ABOUT SCENESETU
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal text-white tracking-[-0.03em]">
              Bridging cinematic storytelling with algorithmic distribution
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-zinc-300 leading-relaxed font-sans">
            <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-[#1E1E1E] space-y-3">
              <h3 className="text-white font-medium text-base">The Regional OTT Challenge</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Marketing teams at regional entertainment networks like <strong>hoichoi</strong> produce dozens of high-stakes web series and original films. Manually fragmenting a single artistic brief into native Instagram carousels, YouTube Community updates, and X commentary inevitably loses regional nuances, breaks layout rules, and produces zero feedback data.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-[#1E1E1E] space-y-3">
              <h3 className="text-white font-medium text-base">The Autonomous Closed Loop</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                SceneSetu (<strong>"সেতু"</strong> or <strong>Bridge</strong>) was engineered to solve this end-to-end. By pairing Gemini 2.5 Flash for culturally fluent Bengali copywriting with Pixazo FLUX for dedicated cinematic framing, we ensure every post is deterministic, verified, and traced back to actual audience resonance.
              </p>
            </div>
          </div>

          {/* Interactive Tech Specs Banner */}
          <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-[#1E1E1E] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase text-zinc-400">Ready to explore?</span>
              <p className="text-white font-medium text-sm">
                Explore our full technical documentation, deterministic QC rules, and API specifications.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => setIsDocsOpen(true)}
                className="px-5 py-2.5 rounded-full bg-[#181818] hover:bg-[#252525] border border-[#333] text-white text-xs font-mono transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Read Full Docs</span>
              </button>

              <button
                onClick={onOpenApp}
                className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all shadow cursor-pointer flex items-center space-x-1.5"
              >
                <span>Launch App</span>
                <ArrowRight className="w-3.5 h-3.5 text-black" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Minimalistic Footer */}
      <footer className="py-14 px-6 border-t border-[#1C1C1C] bg-black">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-zinc-500 font-mono">
          <div className="flex items-center space-x-3">
            <PixelBridgeIcon className="w-6 h-6 rounded" />
            <div className="flex flex-col text-left">
              <span className="text-white font-bold tracking-tight lowercase">scenesetu</span>
              <span className="text-[10px] text-zinc-600">hoichoi Hackathon 2026 • Problem 3</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-zinc-400">
            <button
              onClick={() => setIsDocsOpen(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Docs
            </button>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#about" className="hover:text-white transition-colors">
              About
            </a>
            <a
              href="https://github.com/Rijurajx/scenesetu"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
            <button
              onClick={onOpenApp}
              className="text-white hover:underline transition-colors cursor-pointer"
            >
              Start Now →
            </button>
          </div>

          <div className="text-zinc-600 text-center sm:text-right text-[11px]">
            MIT License • Designed for hoichoi Studios
          </div>
        </div>
      </footer>

      {/* Official Documentation Modal */}
      <DocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
    </div>
  );
};
