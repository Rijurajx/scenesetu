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
  MoreVertical,
  Info,
  X,
  ShieldCheck,
  Sparkles,
  Cpu,
  ChevronDown,
} from "lucide-react";
import { PixelBridgeIcon } from "@/components/common/PixelBridgeIcon";
import { DocsModal } from "@/components/docs/DocsModal";

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

  // Collapsible sidebar state & Documentation Modal
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);

  const pendingReviewCount =
    activeCampaign?.posts?.filter((p) => p.status === "pending_review").length || 0;
  const approvedCount =
    activeCampaign?.posts?.filter(
      (p) => p.status === "approved" || p.status === "scheduled"
    ).length || 0;

  const navItems: { id: WorkspaceTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "brief", label: "Brief Studio", icon: <FileText className="w-5 h-5" /> },
    { id: "studio", label: "AI Studio", icon: <Sliders className="w-5 h-5" /> },
    {
      id: "review",
      label: "Review Gate",
      icon: <CheckCircle2 className="w-5 h-5" />,
      badge: pendingReviewCount > 0 ? pendingReviewCount : undefined,
    },
    {
      id: "publisher",
      label: "Publisher",
      icon: <Send className="w-5 h-5" />,
      badge: approvedCount > 0 ? approvedCount : undefined,
    },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-5 h-5" /> },
    { id: "insights", label: "Closed Loop", icon: <Lightbulb className="w-5 h-5" /> },
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
      {/* Sidebar: Border removed entirely, consistent icon positioning and enlarged typography */}
      <aside
        className={`h-full bg-black flex flex-col justify-between py-4 px-2.5 transition-all duration-300 ease-in-out shrink-0 z-20 overflow-hidden ${
          isSidebarExpanded ? "w-64" : "w-[72px]"
        }`}
      >
        {/* Top Header & Navigation */}
        <div className="space-y-6">
          {/* Header Row: Logo & Collapse/Expand Toggle */}
          <div className="h-11 flex items-center justify-between px-2">
            <div
              onClick={() => {
                if (!isSidebarExpanded) {
                  setIsSidebarExpanded(true);
                } else {
                  onReturnToLanding();
                }
              }}
              className="flex items-center space-x-3 cursor-pointer group shrink-0"
              title={isSidebarExpanded ? "Return to Overview" : "Expand Sidebar"}
            >
              <div className="w-7 h-7 flex items-center justify-center shrink-0">
                <PixelBridgeIcon className="w-7 h-7 rounded" />
              </div>

              {isSidebarExpanded && (
                <div className="flex flex-col overflow-hidden whitespace-nowrap">
                  <span className="font-bold text-base tracking-tight text-white font-mono lowercase leading-tight">
                    scenesetu
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono leading-tight">hoichoi '26</span>
                </div>
              )}
            </div>

            {/* Toggle Button */}
            {isSidebarExpanded ? (
              <button
                onClick={() => setIsSidebarExpanded(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                title="Collapse Sidebar"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => setIsSidebarExpanded(true)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-auto"
                title="Expand Sidebar"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={item.label}
                  className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors duration-150 cursor-pointer overflow-hidden ${
                    isActive
                      ? "bg-[#181818] text-white border-white/15 shadow-sm"
                      : "border-transparent text-zinc-400 hover:text-zinc-100 hover:bg-white/5 hover:border-white/5"
                  }`}
                >
                  {/* Fixed-size Icon anchor so positioning NEVER shifts between collapsed and expanded */}
                  <div
                    className={`w-6 h-6 flex items-center justify-center shrink-0 ${
                      isActive ? "text-white" : "text-zinc-400"
                    }`}
                  >
                    {item.icon}
                  </div>

                  {isSidebarExpanded && (
                    <div className="flex-1 flex items-center justify-between ml-3 overflow-hidden">
                      <span className="truncate text-sm font-medium">{item.label}</span>
                      {item.badge !== undefined && (
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white text-black shrink-0 ml-2">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="space-y-2 pt-4 border-t border-[#161616] text-sm">
          {/* Landing page link */}
          <button
            onClick={onReturnToLanding}
            className="w-full flex items-center px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer overflow-hidden"
            title="Landing Page Overview"
          >
            <div className="w-6 h-6 flex items-center justify-center shrink-0 text-zinc-400">
              <Home className="w-5 h-5" />
            </div>
            {isSidebarExpanded && (
              <span className="ml-3 truncate text-sm font-medium">Overview</span>
            )}
          </button>

          {/* Docs button (Replaced About App) */}
          <button
            onClick={() => setIsDocsOpen(true)}
            className="w-full flex items-center px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer overflow-hidden group"
            title="SceneSetu Official Documentation & User Guide"
          >
            <div className="w-6 h-6 flex items-center justify-center shrink-0 text-zinc-400 group-hover:text-white transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            {isSidebarExpanded && (
              <div className="flex-1 flex items-center justify-between ml-3 overflow-hidden">
                <span className="truncate text-sm font-medium">Docs</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 font-normal">Guide</span>
              </div>
            )}
          </button>

          {/* GitHub link */}
          <a
            href="https://github.com/Rijurajx/scenesetu"
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors overflow-hidden"
            title="GitHub Repository"
          >
            <div className="w-6 h-6 flex items-center justify-center shrink-0 text-zinc-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            {isSidebarExpanded && (
              <div className="flex-1 flex items-center justify-between ml-3 overflow-hidden">
                <span className="truncate text-sm font-medium">GitHub</span>
                <ArrowUpRight className="w-4 h-4 text-zinc-500 shrink-0 ml-1" />
              </div>
            )}
          </a>

          {/* System Status */}
          <div
            className="flex items-center px-3 py-2 rounded-xl text-xs text-zinc-400 overflow-hidden"
            title={systemReady ? "AI Pipeline Connected" : "Connecting..."}
          >
            <div className="w-6 h-6 flex items-center justify-center shrink-0">
              <span
                className={`w-2 h-2 rounded-full ${
                  systemReady ? "bg-white shadow-[0_0_8px_#ffffff]" : "bg-zinc-500"
                }`}
              />
            </div>
            {isSidebarExpanded && (
              <div className="flex-1 flex items-center justify-between ml-3">
                <span className="text-xs text-zinc-400">Engine</span>
                <span className="font-mono text-xs text-zinc-300 font-semibold tracking-wider">
                  ONLINE
                </span>
              </div>
            )}
          </div>

          {/* User Profile Footer */}
          <div
            className="flex items-center px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer overflow-hidden"
            title="Content Lead • hoichoi Studio"
          >
            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
              <User className="w-4 h-4" />
            </div>
            {isSidebarExpanded && (
              <div className="flex-1 flex items-center justify-between ml-3 overflow-hidden">
                <div className="flex flex-col text-left overflow-hidden">
                  <span className="text-sm font-semibold text-zinc-200 leading-tight truncate">
                    Content Lead
                  </span>
                  <span className="text-xs text-zinc-500 leading-tight font-mono truncate">
                    hoichoi Studio
                  </span>
                </div>
                <MoreVertical className="w-4 h-4 text-zinc-500 shrink-0 ml-1" />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Workspace Outer Area */}
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
                <Layers className="w-4 h-4 text-zinc-500" />
                <span className="text-xs text-zinc-500 uppercase font-semibold font-mono">
                  Campaign:
                </span>
                <div className="relative flex items-center">
                  <select
                    value={activeCampaignId || ""}
                    onChange={(e) => setActiveCampaignId(e.target.value)}
                    className="bg-[#141414] border border-[#262626] rounded-md pl-3 pr-8 py-1.5 text-xs font-medium text-zinc-200 focus:outline-none focus:border-white/50 max-w-[220px] truncate appearance-none cursor-pointer"
                  >
                    {campaigns.length === 0 && <option value="">No campaigns yet</option>}
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Documentation Button */}
              <button
                onClick={() => setIsDocsOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md border border-[#262626] bg-[#141414] hover:bg-[#202020] text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs font-mono"
                title="SceneSetu Comprehensive Documentation"
              >
                <BookOpen className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">Docs</span>
              </button>

              <button
                onClick={() => setActiveTab("brief")}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4 text-black" />
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

      {/* Official SceneSetu Documentation Modal */}
      <DocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
    </div>
  );
};
