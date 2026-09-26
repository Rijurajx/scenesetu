"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, SocialAdapter, AdapterCreateInput, AdapterTestResult } from "@/lib/api";
import {
  Plug,
  CheckCircle2,
  AlertCircle,
  Radio,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Server,
  Key
} from "lucide-react";
import { InstagramIcon, YouTubeIcon, XTwitterIcon } from "@/components/common/PlatformIcons";

export const AdaptersWorkspace: React.FC = () => {
  const [adapters, setAdapters] = useState<SocialAdapter[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTestingId, setIsTestingId] = useState<string | null>(null);
  const [isTestingDraft, setIsTestingDraft] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<AdapterTestResult | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [platform, setPlatform] = useState<string>("x_twitter");
  const [adapterName, setAdapterName] = useState<string>("");
  const [configType, setConfigType] = useState<string>("api_keys");
  const [apiKey, setApiKey] = useState<string>("");
  const [apiSecret, setApiSecret] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string>("");
  const [accessTokenSecret, setAccessTokenSecret] = useState<string>("");
  const [accountId, setAccountId] = useState<string>("");
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [showSecrets, setShowSecrets] = useState<boolean>(false);

  const fetchAdapters = async () => {
    setIsLoading(true);
    try {
      const data = await api.listAdapters();
      setAdapters(data);
    } catch (err: any) {
      setMessage({ type: "error", text: `Failed to load adapters: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdapters();
  }, []);

  const handleTestExisting = async (id: string) => {
    setIsTestingId(id);
    setTestResult(null);
    try {
      const res = await api.testAdapter(id);
      setTestResult(res);
      await fetchAdapters();
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Failed to reach adapter endpoint.",
        platform: "unknown",
      });
    } finally {
      setIsTestingId(null);
    }
  };

  const handleTestDraft = async () => {
    setIsTestingDraft(true);
    setTestResult(null);
    try {
      const payload: AdapterCreateInput = {
        platform,
        adapter_name: adapterName || `${getPlatformName(platform)} Adapter`,
        config_type: configType,
        api_key: apiKey || undefined,
        api_secret: apiSecret || undefined,
        access_token: accessToken || undefined,
        access_token_secret: accessTokenSecret || undefined,
        account_id: accountId || undefined,
        webhook_url: webhookUrl || undefined,
      };
      const res = await api.testDraftAdapter(payload);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Connection test failed.",
        platform,
      });
    } finally {
      setIsTestingDraft(false);
    }
  };

  const handleSaveAdapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adapterName.trim()) {
      setMessage({ type: "error", text: "Please provide an adapter name." });
      return;
    }

    setIsSaving(true);
    setMessage(null);
    try {
      const payload: AdapterCreateInput = {
        platform,
        adapter_name: adapterName.trim(),
        config_type: configType,
        api_key: apiKey.trim() || undefined,
        api_secret: apiSecret.trim() || undefined,
        access_token: accessToken.trim() || undefined,
        access_token_secret: accessTokenSecret.trim() || undefined,
        account_id: accountId.trim() || undefined,
        webhook_url: webhookUrl.trim() || undefined,
      };

      await api.createAdapter(payload);
      setMessage({ type: "success", text: `✓ Successfully saved and connected ${adapterName}!` });
      setShowAddForm(false);
      resetForm();
      await fetchAdapters();
    } catch (err: any) {
      setMessage({ type: "error", text: `Failed to save adapter: ${err.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove the "${name}" adapter?`)) return;
    try {
      await api.deleteAdapter(id);
      setMessage({ type: "success", text: `Removed adapter "${name}".` });
      await fetchAdapters();
    } catch (err: any) {
      setMessage({ type: "error", text: `Failed to delete adapter: ${err.message}` });
    }
  };

  const handleToggleActive = async (adapter: SocialAdapter) => {
    try {
      await api.updateAdapter(adapter.id, { is_active: !adapter.is_active });
      await fetchAdapters();
    } catch (err: any) {
      setMessage({ type: "error", text: `Failed to update status: ${err.message}` });
    }
  };

  const resetForm = () => {
    setAdapterName("");
    setApiKey("");
    setApiSecret("");
    setAccessToken("");
    setAccessTokenSecret("");
    setAccountId("");
    setWebhookUrl("");
    setTestResult(null);
  };

  const getPlatformIcon = (plat: string) => {
    switch (plat.toLowerCase()) {
      case "instagram":
        return <InstagramIcon className="w-5 h-5 text-pink-400" />;
      case "youtube":
        return <YouTubeIcon className="w-5 h-5 text-red-500" />;
      case "x_twitter":
      case "x":
      case "twitter":
        return <XTwitterIcon className="w-5 h-5 text-white" />;
      case "webhook":
        return <Globe className="w-5 h-5 text-emerald-400" />;
      default:
        return <Radio className="w-5 h-5 text-zinc-400" />;
    }
  };

  const getPlatformName = (plat: string) => {
    switch (plat.toLowerCase()) {
      case "instagram":
        return "Instagram (Meta Graph)";
      case "youtube":
        return "YouTube Data API";
      case "x_twitter":
      case "x":
      case "twitter":
        return "X (Twitter API v2)";
      case "webhook":
        return "Universal Webhook (Zapier / Buffer / n8n)";
      default:
        return plat;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-zinc-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Plug className="w-3.5 h-3.5 text-white" />
            <span>Integrations & Channel Connectors</span>
          </div>
          <h1 className="text-2xl font-normal text-white tracking-tight">
            Personal Social Channel Adapters
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed max-w-2xl">
            Configure live credentials for your real personal accounts (X API, Instagram Graph API, YouTube Data API, or Universal Webhooks). When active, Step 4 Publisher dispatches directly to your channels with fallback simulation.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setShowAddForm(!showAddForm);
            setTestResult(null);
          }}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white text-black hover:bg-zinc-200 font-medium text-xs shadow-md transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>{showAddForm ? "Close Form" : "Connect New Adapter"}</span>
        </motion.button>
      </div>

      {/* Message Banner */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3.5 rounded-xl border text-xs font-mono flex items-center justify-between ${
            message.type === "success"
              ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/30"
              : "bg-red-950/40 text-red-300 border-red-500/30"
          }`}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="text-zinc-400 hover:text-white text-xs ml-3 cursor-pointer"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Add New Adapter Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleSaveAdapter}
              className="p-6 rounded-2xl bg-[#0C0C0C] border border-white/20 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-3">
                <div className="flex items-center space-x-2">
                  <Key className="w-4 h-4 text-white" />
                  <h3 className="text-sm font-medium text-white">Configure Social Adapter</h3>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">
                  Real-life Live Dispatch Enabled
                </span>
              </div>

              {/* Platform Selector Buttons */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-zinc-300 uppercase">
                  Select Channel Platform
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: "x_twitter", label: "X (Twitter)", icon: <XTwitterIcon className="w-4 h-4 text-white" /> },
                    { id: "instagram", label: "Instagram", icon: <InstagramIcon className="w-4 h-4 text-pink-400" /> },
                    { id: "youtube", label: "YouTube", icon: <YouTubeIcon className="w-4 h-4 text-red-500" /> },
                    { id: "webhook", label: "Webhook (Zapier)", icon: <Globe className="w-4 h-4 text-emerald-400" /> },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setPlatform(item.id);
                        if (item.id === "webhook") setConfigType("webhook");
                        else setConfigType("api_keys");
                      }}
                      className={`p-3 rounded-xl border text-xs font-medium flex items-center space-x-2.5 transition-all cursor-pointer ${
                        platform === item.id
                          ? "bg-white/10 border-white text-white shadow-sm"
                          : "bg-[#141414] border-[#242424] text-zinc-400 hover:text-white hover:border-[#383838]"
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Adapter Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-zinc-300 uppercase">
                  Adapter Friendly Name
                </label>
                <input
                  type="text"
                  required
                  value={adapterName}
                  onChange={(e) => setAdapterName(e.target.value)}
                  placeholder={`e.g. My Official ${getPlatformName(platform)} Account`}
                  className="w-full bg-[#141414] border border-[#262626] focus:border-white rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none"
                />
              </div>

              {/* Dynamic Credentials depending on platform */}
              {platform === "webhook" ? (
                /* Universal Webhook */
                <div className="space-y-3 p-4 rounded-xl bg-[#111111] border border-[#222222]">
                  <div>
                    <label className="block text-xs font-mono text-zinc-300 uppercase mb-1">
                      Live Webhook URL (Zapier, Buffer, Discord, n8n, Make)
                    </label>
                    <input
                      type="url"
                      required
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://hooks.zapier.com/hooks/catch/..."
                      className="w-full bg-[#181818] border border-[#2A2A2A] focus:border-white rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-600 font-mono focus:outline-none"
                    />
                    <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                      SceneSetu will POST the complete post copy, media public URL, hashtags, and CTA directly to this live endpoint.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-300 uppercase mb-1">
                      Optional Webhook Secret / Bearer Token
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Authorization header token (optional)"
                      className="w-full bg-[#181818] border border-[#2A2A2A] focus:border-white rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-600 font-mono focus:outline-none"
                    />
                  </div>
                </div>
              ) : platform === "x_twitter" ? (
                /* X (Twitter) API */
                <div className="space-y-3 p-4 rounded-xl bg-[#111111] border border-[#222222]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-300 uppercase">
                      X (Twitter) API v2 Credentials
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSecrets(!showSecrets)}
                      className="text-[11px] font-mono text-zinc-400 hover:text-white flex items-center space-x-1 cursor-pointer"
                    >
                      {showSecrets ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showSecrets ? "Hide Secrets" : "Reveal Secrets"}</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      Bearer Token / OAuth 2.0 User Token (Required for Posting)
                    </label>
                    <input
                      type={showSecrets ? "text" : "password"}
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      placeholder="e.g. AAAAAAAAAAAAAAAAAAAAA..."
                      className="w-full bg-[#181818] border border-[#2A2A2A] focus:border-white rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-600 font-mono focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                        API Key (Consumer Key)
                      </label>
                      <input
                        type={showSecrets ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Optional Consumer Key"
                        className="w-full bg-[#181818] border border-[#2A2A2A] focus:border-white rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-600 font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                        API Secret (Consumer Secret)
                      </label>
                      <input
                        type={showSecrets ? "text" : "password"}
                        value={apiSecret}
                        onChange={(e) => setApiSecret(e.target.value)}
                        placeholder="Optional Consumer Secret"
                        className="w-full bg-[#181818] border border-[#2A2A2A] focus:border-white rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-600 font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : platform === "instagram" ? (
                /* Instagram Graph API */
                <div className="space-y-3 p-4 rounded-xl bg-[#111111] border border-[#222222]">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      Instagram Business Account ID
                    </label>
                    <input
                      type="text"
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      placeholder="e.g. 17841400000000000"
                      className="w-full bg-[#181818] border border-[#2A2A2A] focus:border-white rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-600 font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      User / Page Access Token (with instagram_content_publish scope)
                    </label>
                    <input
                      type="password"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      placeholder="EAAG..."
                      className="w-full bg-[#181818] border border-[#2A2A2A] focus:border-white rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-600 font-mono focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                /* YouTube Data API */
                <div className="space-y-3 p-4 rounded-xl bg-[#111111] border border-[#222222]">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      YouTube Channel ID
                    </label>
                    <input
                      type="text"
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      placeholder="e.g. UC_x5XG1OV2P6uZZ5FSM9Ttw"
                      className="w-full bg-[#181818] border border-[#2A2A2A] focus:border-white rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-600 font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      OAuth Access Token or API Key
                    </label>
                    <input
                      type="password"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      placeholder="AIzaSy... or OAuth2 token"
                      className="w-full bg-[#181818] border border-[#2A2A2A] focus:border-white rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-600 font-mono focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Test Draft Result Feedback */}
              {testResult && (
                <div
                  className={`p-3 rounded-lg border text-xs font-mono flex items-start space-x-2 ${
                    testResult.success
                      ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/30"
                      : "bg-red-950/40 text-red-300 border-red-500/30"
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <p className="font-medium">{testResult.message}</p>
                    {testResult.latency_ms && (
                      <span className="text-[10px] text-zinc-400">
                        Response time: {testResult.latency_ms}ms
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2 border-t border-[#1C1C1C]">
                <button
                  type="button"
                  onClick={handleTestDraft}
                  disabled={isTestingDraft}
                  className="px-4 py-2 rounded-full bg-[#181818] hover:bg-[#222222] text-zinc-300 text-xs font-mono font-medium border border-[#2E2E2E] transition-colors cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Zap className={`w-3.5 h-3.5 text-white ${isTestingDraft ? "animate-spin" : ""}`} />
                  <span>{isTestingDraft ? "Testing..." : "Test Connection"}</span>
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-medium transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  <span>{isSaving ? "Connecting..." : "Save Adapter"}</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Configured Adapters Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-zinc-300">
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-white" />
            <h2 className="text-xs font-mono font-medium uppercase tracking-wider">
              Connected Personal Adapters ({adapters.length})
            </h2>
          </div>
          <button
            onClick={fetchAdapters}
            className="text-xs font-mono text-zinc-500 hover:text-white flex items-center space-x-1 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {adapters.length === 0 ? (
          <div className="p-12 text-center bg-[#0C0C0C] rounded-2xl border border-[#1E1E1E] space-y-3">
            <Plug className="w-10 h-10 text-zinc-600 mx-auto" />
            <div>
              <h3 className="text-sm font-medium text-zinc-300">No Personal Adapters Connected</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto leading-relaxed">
                Connect your real social accounts or webhooks (Zapier, Buffer, Discord, n8n) above. Without personal adapters, SceneSetu automatically uses high-fidelity simulation adapters as fallback.
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-2 px-5 py-2 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-medium cursor-pointer"
            >
              Connect First Adapter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adapters.map((adapter) => {
              const isTesting = isTestingId === adapter.id;
              const isConnected = adapter.last_status === "connected";

              return (
                <motion.div
                  key={adapter.id}
                  whileHover={{ y: -2 }}
                  className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 bg-[#0A0A0A] shadow-lg transition-all ${
                    adapter.is_active
                      ? isConnected
                        ? "border-emerald-500/40"
                        : "border-red-500/30"
                      : "border-[#1E1E1E] opacity-60"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-xl bg-[#141414] border border-[#242424]">
                          {getPlatformIcon(adapter.platform)}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-white">{adapter.adapter_name}</h4>
                          <span className="text-[10px] font-mono text-zinc-400 capitalize">
                            {getPlatformName(adapter.platform)}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                          isConnected
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-950/60 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {isConnected ? (
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-2.5 h-2.5 text-red-400" />
                        )}
                        <span>{isConnected ? "CONNECTED" : "ATTENTION"}</span>
                      </span>
                    </div>

                    {/* Adapter Details */}
                    <div className="p-3 rounded-xl bg-[#111111] border border-[#1E1E1E] text-xs font-mono space-y-1.5 text-zinc-400">
                      {adapter.webhook_url && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-zinc-500">Webhook:</span>
                          <span className="truncate max-w-[200px] text-zinc-200">
                            {adapter.webhook_url}
                          </span>
                        </div>
                      )}
                      {adapter.account_id && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-zinc-500">Account ID:</span>
                          <span className="text-zinc-200">{adapter.account_id}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500">Credentials:</span>
                        <span className="text-zinc-300">
                          {adapter.has_access_token ? "Bearer Token ✓" : adapter.has_api_key ? "API Key ✓" : "Configured ✓"}
                        </span>
                      </div>
                      {adapter.last_tested_at && (
                        <div className="flex items-center justify-between text-[10px] text-zinc-500">
                          <span>Last Verified:</span>
                          <span>{new Date(adapter.last_tested_at).toLocaleTimeString()}</span>
                        </div>
                      )}
                    </div>

                    {adapter.last_error && (
                      <p className="text-[11px] font-mono text-red-400 bg-red-950/30 p-2 rounded-lg border border-red-500/20">
                        ⚠️ {adapter.last_error}
                      </p>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-[#181818] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(adapter)}
                      className={`text-[11px] font-mono font-medium px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                        adapter.is_active
                          ? "bg-white/10 text-white border-white/20 hover:bg-white/20"
                          : "bg-transparent text-zinc-500 border-zinc-700 hover:text-white"
                      }`}
                    >
                      {adapter.is_active ? "Active" : "Disabled"}
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleTestExisting(adapter.id)}
                        disabled={isTesting}
                        className="p-1.5 rounded-lg bg-[#141414] hover:bg-[#202020] text-zinc-300 hover:text-white border border-[#282828] text-xs font-mono transition-colors cursor-pointer flex items-center space-x-1"
                        title="Ping and test live connection"
                      >
                        <Zap className={`w-3.5 h-3.5 text-white ${isTesting ? "animate-spin" : ""}`} />
                        <span className="text-[10px]">{isTesting ? "Testing..." : "Test"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(adapter.id, adapter.adapter_name)}
                        className="p-1.5 rounded-lg bg-[#141414] hover:bg-red-950/50 text-zinc-500 hover:text-red-400 border border-[#282828] hover:border-red-500/30 transition-colors cursor-pointer"
                        title="Remove adapter"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
