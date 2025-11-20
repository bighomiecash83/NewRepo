// src/services/adOrchestrationService.ts
import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT token interceptor if using authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AdSystemSummary {
  activeBots: number;
  activeCampaigns: number;
  activeCreatives: number;
  lastBotRunAt?: string | null;
}

export interface AdOrchestrationResult {
  botsRun: number;
  actionsCount: number;
  errorsCount: number;
  botIds: string[];
}

export type AdBotActionType =
  | "RecommendScale"
  | "RecommendPause"
  | "RecommendDuplicateToNewAudience"
  | "RecommendNewCreative"
  | "RecommendBudgetCut";

export interface AdBotAction {
  type: AdBotActionType;
  campaignId?: string | null;
  creativeId?: string | null;
  reason: string;
  suggestedBudgetIncreasePercent?: number | null;
  suggestedBudgetCutPercent?: number | null;
}

export interface AdBotRun {
  id: string;
  botId: string;
  playbookId?: string | null;
  artistIds: string[];
  platform: string | number;
  startedAt: string;
  finishedAt: string;
  actions: AdBotAction[];
  status: string;
  errors: string[];
}

/**
 * Get high-level ad system status.
 * Shows active bots, campaigns, creatives, and last run time.
 */
export async function getAdSystemSummary(): Promise<AdSystemSummary> {
  const res = await api.get<AdSystemSummary>("/ad-orchestration/summary");
  return res.data;
}

/**
 * Trigger the bot orchestrator to run due bots.
 * @param maxBots Maximum number of bots to run (default 50, max 500)
 * @returns Result showing how many bots ran, actions produced, errors
 */
export async function runDueBots(
  maxBots: number = 50
): Promise<AdOrchestrationResult> {
  const res = await api.post<AdOrchestrationResult>(
    `/ad-orchestration/run-due?maxBots=${maxBots}`
  );
  return res.data;
}

/**
 * Get recent bot runs and their actions.
 * @param params Optional filters: artistId, limit
 */
export async function getRecentBotRuns(params?: {
  artistId?: string;
  limit?: number;
}): Promise<AdBotRun[]> {
  const search = new URLSearchParams();
  if (params?.artistId) search.append("artistId", params.artistId);
  if (params?.limit) search.append("limit", String(params.limit));

  const query = search.toString();
  const res = await api.get<AdBotRun[]>(
    `/ad-orchestration/runs${query ? `?${query}` : ""}`
  );
  return res.data;
}
