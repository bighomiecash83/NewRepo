import React, { useEffect, useState } from "react";
import {
  getAdSystemSummary,
  AdSystemSummary,
} from "../services/adOrchestrationService";

const formatDateTime = (value?: string | null) => {
  if (!value) return "Never";
  const d = new Date(value);
  return d.toLocaleString();
};

export const StreamGodAdSummary: React.FC = () => {
  const [summary, setSummary] = useState<AdSystemSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAdSystemSummary();
        setSummary(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Unable to load StreamGod ads status.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#020617] to-[#020617]/90 border border-gray-800 shadow-lg p-5 text-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">StreamGod – Ad System</h3>
        <span className="text-xs px-2 py-1 rounded-full bg-blue-900/60 border border-blue-500/60">
          Ads Engine
        </span>
      </div>

      {loading && (
        <p className="text-gray-400 text-sm">Loading system status…</p>
      )}

      {error && (
        <p className="text-red-400 text-sm mb-2">
          {error}
        </p>
      )}

      {summary && !loading && !error && (
        <>
          <div className="grid grid-cols-3 gap-3 text-sm mb-4">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 mb-1">Active Bots</span>
              <span className="text-xl font-bold text-[#22c55e]">
                {summary.activeBots}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 mb-1">Active Campaigns</span>
              <span className="text-xl font-bold text-[#3b82f6]">
                {summary.activeCampaigns}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 mb-1">Active Creatives</span>
              <span className="text-xl font-bold text-[#eab308]">
                {summary.activeCreatives}
              </span>
            </div>
          </div>

          <div className="text-xs text-gray-400">
            <span className="font-semibold text-gray-300">
              Last Bot Run:
            </span>{" "}
            {formatDateTime(summary.lastBotRunAt)}
          </div>
        </>
      )}
    </div>
  );
};
