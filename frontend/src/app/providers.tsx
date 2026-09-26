"use client";

import React, { ReactNode } from "react";
import { CampaignProvider } from "@/context/CampaignContext";

export function Providers({ children }: { children: ReactNode }) {
  return <CampaignProvider>{children}</CampaignProvider>;
}
