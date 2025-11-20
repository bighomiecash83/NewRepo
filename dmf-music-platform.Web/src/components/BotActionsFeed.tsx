import React, { useEffect, useState } from "react";
import {
  getRecentBotRuns,
  AdBotRun,
  AdBotAction,
} from "../services/adOrchestrationService";

interface BotActionsFeedProps {
  artistId?: string; // optional – pass to filter per-artist
  limit?: number;
}

const formatDateTime = (value: string) => {
  const d = new Date(value);
  return d.toLocaleString();
};

const actionBadgeClasses = (type: AdBotAction["type"]) => {
  switch (type) {
    case "RecommendScale":
      return "bg-emerald-900/60 border-emerald-500/60 text-emerald-200";
    case "RecommendPause":
      return "bg-red-900/60 border-red-500/60 text-red-200";
    case "RecommendBudgetCut":
      return "bg-orange-900/60 border-orange-500/60 text-orange-200";
    case "RecommendDuplicateToNewAudience":
      return "bg-blue-900/60 border-blue-500/60 text-blue-200";
    case "RecommendNewCreative":
      return "bg-purple-900/60 border-purple-500/60 text-purple-200";
    default:
      return "bg-gray-900/60 border-gray-700 text-gray-200";
  }
};

const readableActionType = (type: AdBotAction["type"]) => {
  switch (type) {
    case "RecommendScale":
      return "Scale Budget";
    case "RecommendPause":
      return "Pause";
    case "RecommendBudgetCut":
      return "Cut Budget";
    case "RecommendDuplicateToNewAudience":
      return "Duplicate to New Audience";
    case "RecommendNewCreative":
      return "New Creative";
    default:
      return type;
  }
};

export const BotActionsFeed: React.FC<BotActionsFeedProps> = ({
  artistId,
  limit = 50,
}) => {
  const [runs, setRuns] = useState<AdBotRun[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadRuns = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      const data = await getRecentBotRuns({ artistId, limit });
      setRuns(data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load bot actions right now.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRuns(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artistId, limit]);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#020617] to-[#020617]/90 border border-gray-800 shadow-lg p-5 text-white">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold">Bot Actions Feed</h3>
          <p className="text-xs text-gray-400">
            Latest decisions from your ad bots
            {artistId ? " (filtered by artist)" : ""}.
          </p>
        </div>
        <button
          onClick={() => loadRuns(true)}
          disabled={loading || refreshing}
          className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-700 text-xs font-semibold hover:bg-gray-800 disabled:opacity-60"
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {loading && (
        <p className="text-gray-400 text-sm">Loading bot runs…</p>
      )}

      {error && (
        <p className="text-red-400 text-sm mb-2">
          {error}
        </p>
      )}

      {!loading && !error && runs.length === 0 && (
        <p className="text-gray-400 text-sm">
          No bot runs logged yet. Trigger a run from the StreamGod Bot Control
          panel to see actions here.
        </p>
      )}

      {!loading && !error && runs.length > 0 && (
        <div className="mt-3 max-h-[420px] overflow-y-auto pr-1 space-y-3">
          {runs.map((run) => (
            <div
              key={run.id}
              className="rounded-2xl bg-black/40 border border-gray-800 p-3 text-xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-gray-900 border border-gray-700 text-[0.65rem]">
                    {run.botId}
                  </span>
                  {run.playbookId && (
                    <span className="px-2 py-0.5 rounded-full bg-gray-900 border border-gray-700 text-[0.65rem] text-gray-300">
                      {run.playbookId}
                    </span>
                  )}
                </div>
                <span className="text-[0.65rem] text-gray-400">
                  {formatDateTime(run.startedAt)}
                </span>
              </div>

              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[0.65rem] ${
                      run.status === "Failed"
                        ? "bg-red-900/60 border-red-500/60 text-red-200"
                        : "bg-emerald-900/60 border-emerald-500/60 text-emerald-200"
                    }`}
                  >
                    {run.status}
                  </span>
                  {run.artistIds && run.artistIds.length > 0 && (
                    <span className="text-[0.65rem] text-gray-400">
                      Artists: {run.artistIds.join(", ")}
                    </span>
                  )}
                </div>
                {run.errors && run.errors.length > 0 && (
                  <span className="text-[0.65rem] text-red-300">
                    {run.errors[0]}
                    {run.errors.length > 1 ? " (+more)" : ""}
                  </span>
                )}
              </div>

              {run.actions && run.actions.length > 0 ? (
                <div className="mt-2 space-y-1.5">
                  {run.actions.map((action, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-1 rounded-xl bg-gray-900/40 border border-gray-800 p-2"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[0.65rem] font-semibold ${actionBadgeClasses(
                            action.type
                          )}`}
                        >
                          {readableActionType(action.type)}
                        </span>
                        <div className="flex items-center gap-2 text-[0.65rem] text-gray-400">
                          {action.campaignId && (
                            <span>Camp: {action.campaignId}</span>
                          )}
                          {action.creativeId && (
                            <span>Creative: {action.creativeId}</span>
                          )}
                        </div>
                      </div>
                      <p className="text-[0.7rem] text-gray-300">
                        {action.reason}
                      </p>
                      {(action.suggestedBudgetIncreasePercent ||
                        action.suggestedBudgetCutPercent) && (
                        <p className="text-[0.7rem] text-gray-400">
                          {action.suggestedBudgetIncreasePercent && (
                            <span>
                              Suggested increase:{" "}
                              {action.suggestedBudgetIncreasePercent}%
                            </span>
                          )}
                          {action.suggestedBudgetCutPercent && (
                            <span>
                              {" "}
                              Suggested cut: {action.suggestedBudgetCutPercent}%
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-[0.7rem] text-gray-500">
                  No actions logged for this run.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
