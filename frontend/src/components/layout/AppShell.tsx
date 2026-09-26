"use client";

import React, { useState, ReactNode } from "react";
import { useCampaign, WorkspaceTab } from "@/context/CampaignContext";
import {
  FileText,
  Sliders,
  CheckCircle2,
  Send,
  BarChart3,
  Lightbulb,
  Plus,
  Layers,
  PanelLeftClose,
  PanelLeft,
  BookOpen,
  ArrowUpRight,
  Home,
  User,
  MoreVertical
} from "lucide-react";
import { PixelBridgeIcon } from "@/components/common/PixelBridgeIcon";

interface AppShellProps {
  children: ReactNode;
  onReturnToLanding: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({ children, onReturnToLanding }) => {
  const {
    campaigns,
    activeCampaignId,
    activeCampaign,
    activeTab,
    systemReady,
    setActiveTab,
    setActiveCampaignId,
  } = useCampaign();

  // Collapsible sidebar state (matching Screenshots 3 & 4)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true);

  const pendingReviewCount =
    activeCampaign?.posts?.filter((p) => p.status === "pending_review").length || 0;
  const approvedCount =
    activeCampaign?.posts?.filter(
      (p) => p.status === "approved" || p.status === "scheduled"
    ).length || 0;

  const navItems: { id: WorkspaceTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "brief", label: "Brief Studio", icon: <FileText className="w-4 h-4" /> },
    { id: "studio", label: "AI Studio", icon: <Sliders className="w-4 h-4" /> },
    {
      id: "review",
      label: "Review Gate",
      icon: <CheckCircle2 className="w-4 h-4" />,
      badge: pendingReviewCount > 0 ? pendingReviewCount : undefined,
    },
    {
      id: "publisher",
      label: "Publisher",
      icon: <Send className="w-4 h-4" />,
      badge: approvedCount > 0 ? approvedCount : undefined,
    },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "insights", label: "Closed Loop", icon: <Lightbulb className="w-4 h-4" /> },
  ];

  const getTabTitle = (tab: WorkspaceTab) => {
    switch (tab) {
      case "brief":
        return "Campaign Brief & Ingestion";
      case "studio":
        return "AI Multi-Platform Studio";
      case "review":
        return "Human Review & Deterministic QC";
      case "publisher":
        return "Multi-Channel Publisher";
      case "analytics":
        return "Like-for-Like Cross-Platform Analytics";
      case "insights":
        return "Evidence-Backed Insights & Next Brief Loop";
    }
  };

  return (
    <div className="h-screen w-screen bg-black text-white flex overflow-hidden font-sans select-none antialiased">
      {/* Sidebar: Supports Collapsed (Screenshot 3) and Expanded (Screenshot 4) */}
      <aside
        className={`h-full bg-black flex flex-col justify-between py-4 px-3 border-r border-[#161922] transition-all duration-300 ease-in-out shrink-0 z-20 ${
          isSidebarExpanded ? "w-56" : "w-16"
        }`}
      >
        {/* Top Header & Toggle */}
        <div className="space-y-6">
          {isSidebarExpanded ? (
            <div className="flex items-center justify-between px-1">
              <div
                onClick={onReturnToLanding}
                className="flex items-center space-x-2.5 cursor-pointer group"
                title="Return to Overview"
              >
                <PixelBridgeIcon className="w-6 h-6 rounded" />
                <div className="flex flex-col">
                  <span className="font-bold text-sm tracking-tight text-white font-mono lowercase">
                    scenesetu
                  </span>
                  <span className="text-[9px] text-zinc-500 font-mono">hoichoi '26</span>
                </div>
              </div>

              {/* Collapse Button */}
              <button
                onClick={() => setIsSidebarExpanded(false)}
                className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Collapse Sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* When Closed: The Open Button is ONLY our Logo! */
            <div className="flex justify-center pt-1">
              <button
                onClick={() => setIsSidebarExpanded(true)}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm group"
                title="Open Sidebar"
              >
                <PixelBridgeIcon className="w-6 h-6 rounded group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={item.label}
                  className={`w-full flex items-center rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isSidebarExpanded
                      ? "px-3 py-2 justify-between"
                      : "p-2.5 justify-center"
                  } ${
                    isActive
                      ? "bg-[#181818] text-white shadow-sm border border-white/10"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className={isActive ? "text-white" : "text-zinc-400"}>
                      {item.icon}
                    </span>
                    {isSidebarExpanded && <span>{item.label}</span>}
                  </div>

                  {isSidebarExpanded && item.badge !== undefined && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-white text-black">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section (Matching Screenshots 3 & 4) */}
        <div className="space-y-2.5 pt-4 border-t border-[#161616] text-xs">
          {/* Landing page link */}
          <button
            onClick={onReturnToLanding}
            className={`w-full flex items-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer ${
              isSidebarExpanded ? "px-3 py-2 space-x-2.5" : "p-2.5 justify-center"
            }`}
            title="Landing Page Overview"
          >
            <Home className="w-4 h-4 text-zinc-400" />
            {isSidebarExpanded && <span>Overview</span>}
          </button>

          {/* Docs link */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className={`w-full flex items-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors ${
              isSidebarExpanded ? "px-3 py-2 justify-between" : "p-2.5 justify-center"
            }`}
            title="Architecture Docs"
          >
            <div className="flex items-center space-x-2.5">
              <BookOpen className="w-4 h-4 text-zinc-400" />
              {isSidebarExpanded && <span>Docs</span>}
            </div>
            {isSidebarExpanded && <ArrowUpRight className="w-3 h-3 text-zinc-500" />}
          </a>

          {/* System Status */}
          <div
            className={`flex items-center rounded-lg ${
              isSidebarExpanded ? "px-3 py-1.5 justify-between" : "p-2 justify-center"
            } text-[11px] text-zinc-400`}
            title={systemReady ? "AI Pipeline Connected" : "Connecting..."}
          >
            <div className="flex items-center space-x-2">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  systemReady ? "bg-white shadow-[0_0_6px_#ffffff]" : "bg-zinc-500"
                }`}
              />
              {isSidebarExpanded && <span>Engine</span>}
            </div>
            {isSidebarExpanded && (
              <span className="font-mono text-[10px] text-zinc-300 font-semibold">
                ONLINE
              </span>
            )}
          </div>

          {/* User Profile Footer */}
          <div
            className={`flex items-center rounded-lg pt-1 ${
              isSidebarExpanded ? "px-3 py-2 justify-between" : "p-2 justify-center"
            } hover:bg-white/5 cursor-pointer`}
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300">
                <User className="w-3.5 h-3.5" />
              </div>
              {isSidebarExpanded && (
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-zinc-200 leading-tight">
                    Content Lead
                  </span>
                  <span className="text-[10px] text-zinc-500 leading-tight font-mono">
                    hoichoi Studio
                  </span>
                </div>
              )}
            </div>
            {isSidebarExpanded && <MoreVertical className="w-3.5 h-3.5 text-zinc-500" />}
          </div>
        </div>
      </aside>

      {/* Main Workspace Outer Area (Framed Canvas matching Screenshots 3 & 4) */}
      <div className="flex-1 p-3 bg-black flex flex-col overflow-hidden">
        {/* The Inner Rounded Card Container */}
        <div className="flex-1 rounded-2xl bg-[#080808] border border-[#1A1A1A] flex flex-col overflow-hidden shadow-2xl">
          {/* Inner Header Bar */}
          <div className="h-16 px-6 border-b border-[#161616] bg-[#0A0A0A] flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                {getTabTitle(activeTab)}
              </h2>
            </div>

            {/* Campaign Selector & New Brief Action */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[11px] text-zinc-500 uppercase font-semibold font-mono">
                  Campaign:
                </span>
                <select
                  value={activeCampaignId || ""}
                  onChange={(e) => setActiveCampaignId(e.target.value)}
                  className="bg-[#141414] border border-[#262626] rounded-md px-3 py-1.5 text-xs font-medium text-zinc-200 focus:outline-none focus:border-white/50 max-w-[220px] truncate"
                >
                  {campaigns.length === 0 && <option value="">No campaigns yet</option>}
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setActiveTab("brief")}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-black" />
                <span>New Brief</span>
              </button>
            </div>
          </div>

          {/* Inner Scrollable Workspace */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-6xl mx-auto">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
