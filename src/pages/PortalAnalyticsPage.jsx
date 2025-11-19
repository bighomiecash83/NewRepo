import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

const PORTAL_API_BASE =
  import.meta.env.VITE_PORTAL_API_BASE || "http://localhost:5001/api/portal";

/**
 * PortalAnalyticsPage
 * Stream analytics, territory breakdown, playlist performance
 */
export default function PortalAnalyticsPage() {
  const { me } = useOutletContext();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("dmf_token") || "";

        const res = await fetch(`${PORTAL_API_BASE}/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 403) {
          setError("You do not have permission to view analytics");
          return;
        }

        if (!res.ok) throw new Error("Failed to load analytics");

        const json = await res.json();
        setAnalytics(json.data || null);
      } catch (err) {
        console.error("[DMF Portal] Analytics load error:", err);
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="text-center space-y-2 animate-pulse">
        <div className="text-lg font-semibold text-zinc-400">
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-900/30 bg-red-950/20 p-6 text-center">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold text-blue-400 mb-2">
          ?? Analytics Dashboard
        </h1>
        <p className="text-sm text-zinc-400">
          Real-time stream data, territory breakdown, and playlist performance
          for your releases.
        </p>
      </section>

      {/* Metrics Preview */}
      <section className="grid gap-4 md:grid-cols-3">
        <AnalyticsCard
          label="Total Streams"
          value={analytics?.streams?.total || "—"}
          trend="?"
        />
        <AnalyticsCard
          label="Last 30 Days"
          value={analytics?.streams?.last_30_days || "—"}
          trend={analytics?.streams?.trend}
        />
        <AnalyticsCard
          label="Revenue (30d)"
          value={
            analytics?.revenue?.last_30_days
              ? `$${analytics.revenue.last_30_days.toFixed(2)}`
              : "—"
          }
          trend="?"
        />
      </section>

      {/* Placeholder for Charts */}
      <section className="rounded-xl border border-dashed border-blue-700/30 bg-blue-900/10 p-8 text-center">
        <p className="text-sm text-zinc-400 mb-4">
          ?? Advanced charts and visualizations coming soon
        </p>
        <p className="text-xs text-zinc-500">
          This page will include: territory heatmaps, playlist performance,
          playlist pitching tools, listener demographics, and real-time trend
          data.
        </p>
      </section>

      {/* Coming Soon Features */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-6">
        <h3 className="text-sm font-semibold text-white mb-3">
          ?? Coming Soon
        </h3>
        <ul className="space-y-2 text-xs text-zinc-400">
          <li>? Territory-by-territory breakdown (US, UK, EU, etc.)</li>
          <li>? Top playlist performers</li>
          <li>? Listener demographics and behavior</li>
          <li>? Playlist pitching tools</li>
          <li>? A/B testing for artwork and metadata</li>
          <li>? Forecasting models (powered by StreamGod Brain)</li>
        </ul>
      </section>
    </div>
  );
}

function AnalyticsCard({ label, value, trend }) {
  return (
    <div className="rounded-xl border border-blue-900/30 bg-blue-950/20 p-4">
      <p className="text-xs text-zinc-400 mb-2">{label}</p>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-white">{value}</p>
        {trend && (
          <span
            className={[
              "text-lg font-semibold",
              trend === "?" ? "text-green-400" : "text-yellow-400",
            ].join(" ")}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
