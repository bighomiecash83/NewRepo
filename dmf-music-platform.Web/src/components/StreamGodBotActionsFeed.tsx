import React, { useState, useEffect } from "react";
import {
  getBotRunHistory,
} from "../services/adOrchestrationService";

interface BotRun {
  _id: string;
  bot_id: string;
  division: string;
  campaign_id: string;
  actions: string[];
  timestamp: string;
  success: boolean;
  error?: string | null;
}

export const StreamGodBotActionsFeed: React.FC = () => {
  const [runs, setRuns] = useState<BotRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getBotRunHistory(15);
        setRuns(data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load bot actions feed.");
      } finally {
        setLoading(false);
      }
    };

    fetchRuns();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchRuns, 30000);
    return () => clearInterval(interval);
  }, []);

  const actionColor = (action: string): string => {
    if (action.includes("recommend_scale")) return "bg-emerald-900/40 text-emerald-300";
    if (action.includes("recommend_pause")) return "bg-yellow-900/40 text-yellow-300";
    if (action.includes("flag")) return "bg-red-900/40 text-red-300";
    if (action.includes("creative_fatigue")) return "bg-orange-900/40 text-orange-300";
    if (action.includes("budget")) return "bg-blue-900/40 text-blue-300";
    return "bg-gray-800/40 text-gray-300";
  };

  const divisionBadgeColor = (division: string): string => {
    switch (division?.toLowerCase()) {
      case "audience_intel":
        return "bg-purple-900/60 border-purple-500/40";
      case "creative_lab":
        return "bg-pink-900/60 border-pink-500/40";
      case "platform_commanders":
        return "bg-blue-900/60 border-blue-500/40";
      case "funnel_offer":
        return "bg-cyan-900/60 border-cyan-500/40";
      case "budget_optimization":
        return "bg-green-900/60 border-green-500/40";
      case "analytics":
        return "bg-indigo-900/60 border-indigo-500/40";
      case "community_amplifiers":
        return "bg-rose-900/60 border-rose-500/40";
      case "compliance_watchers":
        return "bg-amber-900/60 border-amber-500/40";
      default:
        return "bg-gray-800/60 border-gray-500/40";
    }
  };

  const formatTimestamp = (ts: string): string => {
    const date = new Date(ts);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return "just now";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-[#020617] to-[#020617]/90 border border-gray-800 shadow-lg p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Bot Actions Feed</h3>
        <p className="text-xs text-gray-500">Loading actions…</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#020617] to-[#020617]/90 border border-gray-800 shadow-lg p-5 text-white">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <span>Bot Actions Feed</span>
        <span className="text-xs text-gray-500">{runs.length} recent</span>
      </h3>

      {error && (
        <div className="text-xs text-red-400 mb-3">{error}</div>
      )}

      {runs.length === 0 ? (
        <p className="text-xs text-gray-500">No bot actions yet.</p>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-2">
          {runs.map((run) => (
            <div
              key={run._id}
              className={`p-3 rounded-lg border ${
                run.success
                  ? "border-gray-700/60 bg-gray-900/30"
                  : "border-red-700/40 bg-red-900/20"
              }`}
            >
              {/* Header: Division + Timestamp + Status */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[0.65rem] px-2 py-0.5 rounded-full border ${divisionBadgeColor(run.division)}`}
                >
                  {run.division || "Unknown"}
                </span>
                <span className="text-[0.65rem] text-gray-500">
                  {formatTimestamp(run.timestamp)}
                </span>
              </div>

              {/* Bot ID + Campaign */}
              <div className="text-xs mb-2">
                <span className="text-gray-400">
                  Bot:{" "}
                  <span className="font-mono text-gray-200 text-[0.7rem]">
                    {run.bot_id}
                  </span>
                </span>
                {run.campaign_id && (
                  <>
                    {" "}
                    · Campaign:{" "}
                    <span className="font-mono text-gray-200 text-[0.7rem]">
                      {run.campaign_id.slice(0, 8)}…
                    </span>
                  </>
                )}
              </div>

              {/* Actions */}
              {run.actions && run.actions.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {run.actions.map((action, idx) => (
                    <span
                      key={idx}
                      className={`text-[0.65rem] px-2 py-0.5 rounded-full ${actionColor(
                        action
                      )}`}
                    >
                      {action.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              )}

              {/* Error (if failed) */}
              {!run.success && run.error && (
                <div className="text-[0.65rem] text-red-300 mt-1">
                  Error: {run.error.slice(0, 60)}
                  {run.error.length > 60 ? "…" : ""}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="text-[0.65rem] text-gray-600 mt-3 border-t border-gray-800 pt-2">
        Updates every 30 seconds
      </div>
    </div>
  );
};
