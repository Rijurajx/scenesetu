"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCampaign } from "@/context/CampaignContext";
import { AppShell } from "@/components/layout/AppShell";
import { BriefForm } from "@/components/brief/BriefForm";
import { StudioWorkspace } from "@/components/studio/StudioWorkspace";
import { ReviewWorkspace } from "@/components/review/ReviewWorkspace";
import { PublisherWorkspace } from "@/components/publisher/PublisherWorkspace";
import { AnalyticsWorkspace } from "@/components/analytics/AnalyticsWorkspace";
import { InsightsWorkspace } from "@/components/insights/InsightsWorkspace";
import { AdaptersWorkspace } from "@/components/adapters/AdaptersWorkspace";

function WorkspaceRouter() {
  const { activeTab } = useCampaign();

  switch (activeTab) {
    case "brief":
      return <BriefForm />;
    case "studio":
      return <StudioWorkspace />;
    case "review":
      return <ReviewWorkspace />;
    case "publisher":
      return <PublisherWorkspace />;
    case "analytics":
      return <AnalyticsWorkspace />;
    case "insights":
      return <InsightsWorkspace />;
    case "adapters":
      return <AdaptersWorkspace />;
    default:
      return <BriefForm />;
  }
}

export default function DashboardPage() {
  const router = useRouter();

  return (
    <AppShell onReturnToLanding={() => router.push("/")}>
      <WorkspaceRouter />
    </AppShell>
  );
}
