import React, { useState } from "react";
import {
  runDueBots,
  AdOrchestrationResult,
} from "../services/adOrchestrationService";

export const StreamGodAdControlPanel: React.FC = () => {
  const [maxBots, setMaxBots] = useState<number>(50);
  const [result, setResult] = useState<AdOrchestrationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const data = await runDueBots(maxBots);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to run bot orchestration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#020617] to-[#020617]/90 border border-gray-800 shadow-lg p-5 text-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">StreamGod – Bot Control</h3>
        <span className="text-xs px-2 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/60">
          Owner Only
        </span>
      </div>

      <p className="text-xs text-gray-400 mb-4">
        Trigger the ad bot army to analyze campaigns, recommend scaling, and
        flag issues. This respects the{" "}
        <span className="font-semibold text-gray-200">max bots</span> limit
        below.
      </p>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex flex-col text-sm">
          <label className="text-gray-300 mb-1">Max Bots This Run</label>
          <input
            type="number"
            min={1}
            max={500}
            value={maxBots}
            onChange={(e) => setMaxBots(Number(e.target.value) || 1)}
            className="w-24 rounded-lg bg-gray-900 border border-gray-700 px-2 py-1 text-sm"
          />
        </div>

        <button
          disabled={loading}
          onClick={handleRun}
          className="mt-5 px-4 py-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-sm font-semibold shadow-md disabled:opacity-60"
        >
          {loading ? "Running…" : "Run Bots"}
        </button>
      </div>

      {error && (
        <div className="text-xs text-red-400 mb-2">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-3 text-xs text-gray-200 border-t border-gray-800 pt-3">
          <div className="flex justify-between mb-1">
            <span className="text-gray-400">Bots Run:</span>
            <span className="font-semibold">{result.botsRun}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-gray-400">Actions Produced:</span>
            <span className="font-semibold">{result.actionsCount}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-gray-400">Errors:</span>
            <span className={`font-semibold ${result.errorsCount > 0 ? "text-red-400" : "text-emerald-400"}`}>
              {result.errorsCount}
            </span>
          </div>

          {result.botIds.length > 0 && (
            <div className="mt-2">
              <span className="text-gray-400">Bots Involved:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {result.botIds.slice(0, 8).map((id) => (
                  <span
                    key={id}
                    className="px-2 py-0.5 rounded-full bg-gray-900 border border-gray-700 text-[0.65rem]"
                  >
                    {id}
                  </span>
                ))}
                {result.botIds.length > 8 && (
                  <span className="text-[0.65rem] text-gray-500">
                    +{result.botIds.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
