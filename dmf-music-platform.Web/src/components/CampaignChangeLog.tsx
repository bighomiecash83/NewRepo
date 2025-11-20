import React, { useEffect, useState } from "react";
import { getCampaignChangeLogs, AdCampaignChangeLog } from "../services/adOrchestrationService";

interface CampaignChangeLogProps {
  campaignId?: string;
  artistId?: string;
  limit?: number;
}

export const CampaignChangeLog: React.FC<CampaignChangeLogProps> = ({
  campaignId,
  artistId,
  limit = 50,
}) => {
  const [logs, setLogs] = useState<AdCampaignChangeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCampaignChangeLogs({ campaignId, artistId, limit });
      setLogs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch change logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [campaignId, artistId, limit]);

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded p-4 text-gray-300">
        Loading change history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 border border-red-700 rounded p-4 text-red-400">
        <div className="font-semibold mb-2">Error Loading Change Log</div>
        <div className="text-sm">{error}</div>
        <button
          onClick={fetchLogs}
          className="mt-2 px-3 py-1 bg-red-700 hover:bg-red-600 rounded text-sm text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded p-4 text-gray-300">
        <div className="text-center py-6">No changes recorded</div>
      </div>
    );
  }

  const formatBudget = (val?: number | null) => {
    if (val === null || val === undefined) return "—";
    return `$${val.toFixed(2)}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded overflow-hidden">
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
        <h3 className="text-white font-semibold">Campaign Change Log</h3>
        <button
          onClick={fetchLogs}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm text-white transition"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <table className="w-full text-sm text-gray-300">
          <thead className="sticky top-0 bg-gray-800 border-b border-gray-700">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-gray-200">When</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-200">Campaign</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-200">Budget</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-200">Status</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-200">Source</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-200">Reason</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr
                key={log.id}
                className={`border-b border-gray-700 hover:bg-gray-800 transition ${
                  idx % 2 === 0 ? "bg-gray-900" : "bg-gray-850"
                }`}
              >
                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-400">
                  {formatDate(log.changedAt)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-mono text-blue-300">
                  {log.campaignId.substring(0, 8)}...
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  {log.oldDailyBudgetUsd !== null && log.newDailyBudgetUsd !== null ? (
                    <span>
                      {formatBudget(log.oldDailyBudgetUsd)} →{" "}
                      <span className={log.newDailyBudgetUsd > (log.oldDailyBudgetUsd || 0) ? "text-green-400" : "text-red-400"}>
                        {formatBudget(log.newDailyBudgetUsd)}
                      </span>
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  {log.oldStatus && log.newStatus ? (
                    <span>
                      <span className="text-gray-400">{log.oldStatus}</span>
                      {" → "}
                      <span
                        className={
                          log.newStatus === "Paused"
                            ? "text-red-400 font-semibold"
                            : log.newStatus === "Active"
                            ? "text-green-400 font-semibold"
                            : "text-gray-300"
                        }
                      >
                        {log.newStatus}
                      </span>
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  <span
                    className={
                      log.changeSource === "Bot"
                        ? "px-2 py-1 bg-purple-900 text-purple-200 rounded text-xs"
                        : log.changeSource === "Manual"
                        ? "px-2 py-1 bg-blue-900 text-blue-200 rounded text-xs"
                        : "px-2 py-1 bg-gray-700 text-gray-200 rounded text-xs"
                    }
                  >
                    {log.changeSource}
                  </span>
                </td>
                <td className="px-4 py-2 text-xs text-gray-400">
                  <div className="max-w-xs">
                    {log.reasons && log.reasons.length > 0 ? (
                      log.reasons.map((reason, i) => (
                        <div key={i} className="py-0.5">
                          • {reason}
                        </div>
                      ))
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-800 px-4 py-2 border-t border-gray-700 text-xs text-gray-400">
        Showing {logs.length} recent changes
      </div>
    </div>
  );
};
