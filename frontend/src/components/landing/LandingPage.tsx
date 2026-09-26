"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Compass,
  Moon,
  ChevronDown,
  Layers,
  Sparkles,
  ExternalLink,
  Check,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { PixelBridgeIcon } from "@/components/common/PixelBridgeIcon";
import { InstagramIcon, YouTubeIcon, XTwitterIcon } from "@/components/common/PlatformIcons";

interface LandingPageProps {
  onOpenApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenApp }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  const testimonials = [
    {
      quote:
        "SceneSetu turned our content operations from fragmented manual chaos into an autonomous closed-loop studio. Having verified post-ID citations feed directly into our next briefs reduced turnaround time by 75%!",
      author: "Abir Chatterjee",
      role: "Creative Director",
      company: "hoichoi",
      logo: "hoichoi",
    },
    {
      quote:
        "The deterministic QC engine guarantees our 16:9 cinema visuals and native Bengali copy pass every strict channel constraint before human editors sign off. Flawless execution.",
      author: "Devi Sen",
      role: "Head of Marketing",
      company: "SVF Media",
      logo: "SVF",
    },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans selection:bg-white/20 antialiased overflow-x-hidden">
      {/* Top Floating Pill Navigation (Matching Wafer.ai Screenshot) */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-5 inset-x-0 z-50 max-w-3xl mx-auto px-4"
      >
        <div className="bg-[#1C2220]/75 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2 flex items-center justify-between shadow-2xl shadow-black/80">
          {/* Left: Pixelated App Icon & Nav Dropdowns */}
          <div className="flex items-center space-x-5 text-[13px] text-white/90">
            <div
              onClick={onOpenApp}
              className="flex items-center justify-center cursor-pointer p-0.5 rounded-full hover:scale-105 transition-transform"
              title="SceneSetu"
            >
              <PixelBridgeIcon className="w-5 h-5 rounded-full" />
            </div>

            <div className="hidden sm:flex items-center space-x-5 text-white/80 font-normal text-xs">
              <button className="flex items-center space-x-1 hover:text-white transition-colors cursor-pointer">
                <span>Product</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>
              <button className="flex items-center space-x-1 hover:text-white transition-colors cursor-pointer">
                <span>Company</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>
              <a href="#features" className="hover:text-white transition-colors">
                Blog
              </a>
            </div>
          </div>

          {/* Center: Clean lowercase wordmark */}
          <div className="font-bold text-xs tracking-wider text-white font-mono lowercase opacity-90 hidden md:block">
            scenesetu
          </div>

          {/* Right: Theme Moon Toggle & Open App Pill Button */}
          <div className="flex items-center space-x-3">
            <button
              aria-label="Toggle theme"
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenApp}
              className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-medium hover:bg-zinc-200 transition-all shadow-md cursor-pointer"
            >
              Open App
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with Light-Colored Pixelated Bridge Cloudscape Background */}
      <section className="relative pt-28 pb-20 px-6 overflow-hidden flex flex-col items-center justify-between min-h-[92vh]">
        {/* Light Colored Pixelated Bridge Background (Crisp & Authentic to Screenshot) */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-1000 scale-100"
          style={{
            backgroundImage: "url('/hero_bridge.jpg')",
          }}
        />

        {/* Subtle Top & Bottom Vignette for Legibility and Seamless Dark Transition */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#182320]/45 via-transparent to-[#000000] z-0" />
        <div className="absolute inset-0 bg-[#0E1513]/15 backdrop-blur-[0.3px] z-0" />

        {/* Top Hero Text / Content */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center space-y-4 pt-8"
        >
          {/* Telemetry Tag */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[11px] font-mono text-white/95">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="tracking-wide">HOICHOI HACKATHON '26 • PROBLEM 3</span>
          </div>

          {/* Hero Title (Exact Typography & Size from Screenshot) */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-normal text-white max-w-3xl leading-[1.08] tracking-[-0.035em]">
            Content operations that{" "}
            <span className="font-medium text-white">
              keeps getting better
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-white/90 max-w-[560px] leading-relaxed font-normal drop-shadow-sm">
            SceneSetu transforms a single content brief into platform-native campaigns across Instagram, YouTube, and X, strictly enforces deterministic QC, and feeds verified post-ID performance insights into future briefs.
          </p>
        </motion.div>

        {/* Trajectory Wave Curve Across the Sky (Exact Style from Screenshot) */}
        <div className="relative z-10 w-full max-w-5xl my-6">
          <div className="relative h-28 w-full flex items-center justify-between px-6 sm:px-12">
            {/* The Smooth White Curve */}
            <svg
              className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
              viewBox="0 0 1000 120"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M 20 85 C 220 95, 340 50, 520 40 C 700 30, 820 12, 980 18"
                stroke="rgba(255, 255, 255, 0.95)"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>

            {/* Waypoint 1: Ingested */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative z-20 flex flex-col items-center group cursor-default"
            >
              <span className="text-[10px] font-mono text-white/80 lowercase">brief ingested</span>
              <span className="text-[11px] font-mono font-medium text-white mb-2">1 BRIEF</span>
              <div className="w-3 h-3 rounded-full bg-white border-2 border-black/80 shadow-md group-hover:scale-125 transition-transform" />
              <div className="w-0.5 h-3 bg-white/60 -mt-0.5" />
            </motion.div>

            {/* Waypoint 2: Adaptations */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="relative z-20 flex flex-col items-center group cursor-default"
            >
              <span className="text-[10px] font-mono text-white/80 lowercase">platform adaptations</span>
              <span className="text-[11px] font-mono font-medium text-white mb-2">3 CHANNELS</span>
              <div className="w-3 h-3 rounded-full bg-white border-2 border-black/80 shadow-md group-hover:scale-125 transition-transform" />
              <div className="w-0.5 h-3 bg-white/60 -mt-0.5" />
            </motion.div>

            {/* Waypoint 3: Deterministic QC */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="relative z-20 flex flex-col items-center group cursor-default"
            >
              <span className="text-[10px] font-mono text-white/80 lowercase">qc verified</span>
              <span className="text-[11px] font-mono font-medium text-white mb-2">100% PASS</span>
              <div className="w-3 h-3 rounded-full bg-white border-2 border-black/80 shadow-md group-hover:scale-125 transition-transform" />
              <div className="w-0.5 h-3 bg-white/60 -mt-0.5" />
            </motion.div>

            {/* Waypoint 4: The Closed Loop */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="relative z-20 flex flex-col items-center group cursor-default"
            >
              <span className="text-[10px] font-mono text-white/80 lowercase">closed-loop feedback</span>
              <span className="text-[11px] font-mono font-medium text-white mb-2">NEXT BRIEF ↺</span>
              <div className="w-3 h-3 rounded-full bg-white border-2 border-black/80 shadow-md group-hover:scale-125 transition-transform" />
              <div className="w-0.5 h-3 bg-white/60 -mt-0.5" />
            </motion.div>
          </div>
        </div>

        {/* Frosted Testimonial Showcase Card (Exact Card from Wafer.ai Screenshot) */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center space-y-4"
        >
          <div className="w-full p-6 sm:p-7 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/25 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 text-left relative overflow-hidden group">
            {/* Subtle card grid lines */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative z-10 space-y-4 flex-1">
              <p className="text-xs sm:text-sm text-white/95 font-normal leading-relaxed">
                “ {testimonials[activeSlide].quote} ”
              </p>
              <div className="flex items-center space-x-3 pt-1">
                <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-xs text-white uppercase">
                  {testimonials[activeSlide].author.charAt(0)}
                </div>
                <div>
                  <span className="text-xs font-medium text-white block">
                    {testimonials[activeSlide].author}
                  </span>
                  <span className="text-[11px] text-white/70 block font-normal">
                    {testimonials[activeSlide].role} • {testimonials[activeSlide].company}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative z-10 shrink-0 text-right sm:border-l sm:border-white/15 sm:pl-6">
              <span className="text-3xl font-bold tracking-tight text-white font-sans lowercase">
                {testimonials[activeSlide].logo}
              </span>
            </div>
          </div>

          {/* Testimonial Controls (< || > Pill buttons) */}
          <div className="flex items-center space-x-2 pt-1">
            <button
              onClick={() =>
                setActiveSlide((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
              }
              aria-label="Previous quote"
              className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 border border-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label="Pause or play carousel"
              className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 border border-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs transition-colors cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
            </button>
            <button
              onClick={() =>
                setActiveSlide((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
              }
              aria-label="Next quote"
              className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 border border-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Dark Feature Bento Grid Section (Matching Screenshot 2 - Pure Monochrome) */}
      <section id="features" className="py-24 px-6 bg-[#000000] border-t border-[#1C1C1C]">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="max-w-xl space-y-2">
            <span className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-widest block">
              DEDICATED PIPELINE
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal text-white tracking-[-0.03em]">
              The content operations pipeline your studio actually needs
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Bring us the single brief, language, and audience context. SceneSetu builds the tailored multi-platform campaign around them—and keeps optimizing after publication.
            </p>
          </div>

          {/* 3-Column Pure Monochrome Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Channel-Tailored Content */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="p-6 rounded-2xl bg-[#080808] border border-[#1A1A1A] hover:border-[#333333] transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                {/* Visual Graphic */}
                <div className="h-44 rounded-xl bg-black border border-white/10 p-4 flex flex-col justify-center items-center relative overflow-hidden">
                  <div className="flex items-center space-x-4 mb-3 text-white">
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                      <InstagramIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                      <YouTubeIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                      <XTwitterIcon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400 text-center">
                    <span>1:1 Square</span> • <span>16:9 Cinema</span> • <span>≤280 Chars</span>
                  </div>
                </div>

                <h3 className="font-medium text-base text-white">Tailored to every channel</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Distinct visual composition and authentic native Bengali and English copy for Instagram, YouTube, and X. Zero crop, resize, or relabel shortcuts.
                </p>
              </div>

              <div className="pt-3 border-t border-[#1C1C1C] flex items-center text-[11px] text-zinc-400 font-mono">
                <span>Native Bengali & English</span>
              </div>
            </motion.div>

            {/* Card 2: Deterministic QC Engine */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="p-6 rounded-2xl bg-[#080808] border border-[#1A1A1A] hover:border-[#333333] transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                {/* Visual Graphic */}
                <div className="h-44 rounded-xl bg-black border border-white/10 p-4 flex flex-col justify-center space-y-2 relative overflow-hidden font-mono text-[10px]">
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                    <span className="text-zinc-300">Aspect Ratio Check</span>
                    <span className="text-white font-medium">✓ PASSED</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                    <span className="text-zinc-300">Caption Length Bound</span>
                    <span className="text-white font-medium">✓ PASSED</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                    <span className="text-zinc-300">X Tweet ≤ 280 chars</span>
                    <span className="text-white font-medium">✓ 214 CHARS</span>
                  </div>
                </div>

                <h3 className="font-medium text-base text-white">Deterministic QC engine</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  AI proposes, but system code strictly validates. Platform violations are rejected deterministically before any post touches the human review queue.
                </p>
              </div>

              <div className="pt-3 border-t border-[#1C1C1C] flex items-center text-[11px] text-zinc-400 font-mono">
                <span>Hard Rule Enforcement</span>
              </div>
            </motion.div>

            {/* Card 3: Reliable By Design / Closed Loop */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="p-6 rounded-2xl bg-[#080808] border border-[#1A1A1A] hover:border-[#333333] transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                {/* Visual Graphic */}
                <div className="h-44 rounded-xl bg-black border border-white/10 p-4 flex flex-col justify-center items-center relative overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white mb-2">
                    <Compass className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-white font-mono">FEED TO NEXT BRIEF</span>
                  <span className="text-[10px] text-zinc-400 font-mono mt-1">Citing Post #id_128</span>
                </div>

                <h3 className="font-medium text-base text-white">Reliable by design</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Human approval is mandatory before publishing. Post-performance claims cite real post IDs, feeding directly into the creation of the next brief.
                </p>
              </div>

              <div className="pt-3 border-t border-[#1C1C1C] flex items-center text-[11px] text-zinc-400 font-mono">
                <span>The Closed Loop</span>
              </div>
            </motion.div>
          </div>

          {/* Bottom Callout CTA */}
          <div className="pt-8 text-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenApp}
              className="px-8 py-3 rounded-full bg-white text-black font-medium text-sm hover:bg-zinc-200 transition-all shadow-xl cursor-pointer inline-flex items-center space-x-2"
            >
              <span>Enter SceneSetu Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* Bottom Footer */}
      <footer className="py-12 px-6 border-t border-[#1C1C1C] text-center text-xs text-zinc-500 font-mono">
        SceneSetu • hoichoi Hackathon '26 (Problem 3) • AI-Native Content Operations Platform
      </footer>
    </div>
  );
};
