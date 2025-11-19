import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001/api";

/**
 * DMF Control Center
 * Main dashboard - boots to system status snapshot
 * Shows: artist count, division count, engine count, active engines, system health
 * Route: / (home)
 */
export default function ControlCenterPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE}/status`);
        if (!res.ok) throw new Error("Status API error");

        const json = await res.json();
        setStatus(json.data || null);
        setLastUpdate(new Date());
      } catch (err) {
        console.error("[DMF Control Center] Load error:", err);
        setError("Failed to load system status. Check API connection.");
      } finally {
        setLoading(false);
      }
    }

    load();
    // Auto-refresh every 30 seconds
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !status) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white flex items-center justify-center">
        <div className="text-center animate-pulse space-y-4">
          <div className="text-3xl font-bold text-blue-400">??</div>
          <div className="text-xl font-semibold">DMF Control Center</div>
          <div className="text-sm text-zinc-400">Initializing systems...</div>
          <div className="h-2 w-64 bg-zinc-800 rounded-full mx-auto mt-4" />
        </div>
      </div>
    );
  }

  const artistsCount = status?.artists ?? 0;
  const divisionsCount = status?.divisions ?? 0;
  const enginesCount = status?.engines ?? 0;
  const activeEngines = status?.active_engines || [];
  const timeString = lastUpdate.toLocaleTimeString();

  if (error && !status) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-3xl font-bold text-red-400 mb-3">??</div>
          <h1 className="text-2xl font-bold mb-2">Connection Error</h1>
          <p className="text-sm text-zinc-400 mb-4">{error}</p>
          <p className="text-xs text-zinc-500 mb-6">
            Make sure MongoDB is seeded and the backend API is running on{" "}
            <code className="bg-zinc-900 px-2 py-1 rounded">{API_BASE}</code>
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm transition"
          >
            ? Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white">
      {/* Header */}
      <header className="border-b border-blue-900/30 bg-gradient-to-r from-blue-950/30 to-transparent px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-blue-400 mb-1">
              ?? DMF Control Center
            </h1>
            <p className="text-sm text-zinc-400">
              Central command for DMF-MUSIC-PLATFORM infrastructure
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/roster"
              className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm transition"
            >
              ?? Roster
            </Link>
          </div>
        </div>
        <p className="text-xs text-zinc-500">
          Last update: {timeString} • Auto-refresh every 30 seconds
        </p>
      </header>

      <main className="px-6 py-8 max-w-7xl mx-auto space-y-8">
        {/* System Metrics Tile Grid */}
        <section className="grid gap-4 md:grid-cols-4">
          <MetricTile
            icon="??"
            label="Artists"
            value={artistsCount}
            description="Active roster members"
            color="blue"
          />
          <MetricTile
            icon="??"
            label="Divisions"
            value={divisionsCount}
            description="DMF internal divisions"
            color="gold"
          />
          <MetricTile
            icon="??"
            label="Engines"
            value={enginesCount}
            description="AI & tech systems"
            color="purple"
          />
          <MetricTile
            icon="?"
            label="Active"
            value={activeEngines.length}
            description="Engines operational"
            color="green"
          />
        </section>

        {/* System Health Status */}
        <section className="rounded-xl border border-green-900/30 bg-green-950/20 backdrop-blur p-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-lg font-bold text-green-300">?? System Health</h2>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-green-400">Online</span>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <StatusItem label="API Service" status="operational" />
            <StatusItem label="MongoDB" status="connected" />
            <StatusItem label="Roster Service" status="ready" />
            <StatusItem label="StreamGod Brain" status="available" />
          </div>
        </section>

        {/* Active Engines */}
        {activeEngines.length > 0 && (
          <section className="rounded-xl border border-purple-900/30 bg-purple-950/20 backdrop-blur p-6">
            <h2 className="text-lg font-bold text-purple-300 mb-4">
              ?? Active Engines ({activeEngines.length})
            </h2>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {activeEngines.map((engine) => (
                <Link
                  key={engine.slug}
                  to={`/divisions/${engine.slug}`}
                  className="p-4 rounded-lg border border-purple-700/50 bg-purple-900/20 hover:bg-purple-900/40 hover:border-purple-600 transition"
                >
                  <p className="font-semibold text-purple-300 text-sm mb-1">
                    {engine.name}
                  </p>
                  <p className="text-xs text-zinc-400 capitalize">
                    {engine.type} • {engine.status}
                  </p>
                  <p className="text-xs text-zinc-600 mt-2">? View Details</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Quick Access Panels */}
        <section className="grid gap-4 md:grid-cols-3">
          <QuickAccessPanel
            icon="??"
            title="Roster Management"
            description="View all artists, divisions, and organizational structure"
            link="/roster"
            linkLabel="Open Roster"
            color="blue"
          />

          <QuickAccessPanel
            icon="??"
            title="StreamGod AI"
            description="Catalog analysis, metadata scoring, distribution readiness"
            link="/divisions/streamgod-ai"
            linkLabel="View Division"
            color="purple"
          />

          <QuickAccessPanel
            icon="??"
            title="The Gavel Syndicate"
            description="Legal/IP management, contracts, copyright, enforcement"
            link="/divisions/the-gavel-syndicate"
            linkLabel="View Division"
            color="red"
          />
        </section>

        {/* Metrics Placeholder */}
        <section className="rounded-xl border border-blue-900/30 bg-blue-950/20 backdrop-blur p-6">
          <h2 className="text-lg font-bold text-blue-300 mb-4">
            ?? Metrics & Analytics (Future Hook)
          </h2>
          <p className="text-sm text-zinc-400 mb-4">
            This section is wired to accept real-time data from:
          </p>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mb-4">
            <MetricsPlaceholder label="Stream Volume" endpoint="/api/metrics/streams" />
            <MetricsPlaceholder label="Fraud Detection" endpoint="/api/metrics/fraud" />
            <MetricsPlaceholder label="Release Throughput" endpoint="/api/metrics/releases" />
            <MetricsPlaceholder label="Revenue & Royalties" endpoint="/api/metrics/revenue" />
          </div>
          <p className="text-xs text-zinc-500">
            Charts, graphs, and real-time dashboards can be integrated here without changing the layout.
            Ready for Recharts, Plotly, or any charting library.
          </p>
        </section>

        {/* Footer */}
        <section className="border-t border-zinc-800 pt-6 pb-6 text-center text-xs text-zinc-500 space-y-2">
          <p>DMF-MUSIC-PLATFORM Control Center v1.0</p>
          <p>
            API Base: <code className="bg-zinc-900 px-2 py-0.5 rounded text-zinc-400">{API_BASE}</code>
          </p>
          <p>Last Sync: {lastUpdate.toISOString()}</p>
        </section>
      </main>
    </div>
  );
}

/**
 * MetricTile Component
 * Displays a single metric (count + description)
 */
function MetricTile({ icon, label, value, description, color }) {
  const colorClasses = {
    blue: "border-blue-900/30 bg-blue-950/20 text-blue-300",
    gold: "border-gold-900/30 bg-gold-950/20 text-gold-300",
    purple: "border-purple-900/30 bg-purple-950/20 text-purple-300",
    green: "border-green-900/30 bg-green-950/20 text-green-300",
  };

  return (
    <div className={`rounded-xl border ${colorClasses[color]} backdrop-blur p-6 hover:border-opacity-100 transition`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-zinc-400 mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <span className="text-3xl opacity-70">{icon}</span>
      </div>
      <p className="text-xs text-zinc-500">{description}</p>
    </div>
  );
}

/**
 * StatusItem Component
 * Displays a single status indicator
 */
function StatusItem({ label, status }) {
  const statusColor = status === "operational" || status === "connected" || status === "ready" || status === "available"
    ? "text-green-400"
    : "text-yellow-400";

  return (
    <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
      <p className="text-xs text-zinc-400 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-green-500" />
        <p className={`text-xs font-semibold capitalize ${statusColor}`}>{status}</p>
      </div>
    </div>
  );
}

/**
 * QuickAccessPanel Component
 * Quick navigation to major sections
 */
function QuickAccessPanel({ icon, title, description, link, linkLabel, color }) {
  const colorClasses = {
    blue: "border-blue-900/30 bg-blue-950/20 hover:bg-blue-950/40 hover:border-blue-600",
    purple: "border-purple-900/30 bg-purple-950/20 hover:bg-purple-950/40 hover:border-purple-600",
    red: "border-red-900/30 bg-red-950/20 hover:bg-red-950/40 hover:border-red-600",
  };

  return (
    <Link
      to={link}
      className={`rounded-xl border ${colorClasses[color]} backdrop-blur p-6 transition block`}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
      <p className="text-xs text-zinc-400 mb-4">{description}</p>
      <div className="text-xs text-blue-300 font-semibold">
        {linkLabel} ?
      </div>
    </Link>
  );
}

/**
 * MetricsPlaceholder Component
 * Placeholder for future analytics
 */
function MetricsPlaceholder({ label, endpoint }) {
  return (
    <div className="p-4 rounded-lg border border-dashed border-blue-700/30 bg-blue-900/10 text-center">
      <p className="text-xs font-semibold text-blue-300 mb-1">{label}</p>
      <code className="text-[10px] text-zinc-500 block">{endpoint}</code>
      <p className="text-[10px] text-zinc-600 mt-2">Ready for data</p>
    </div>
  );
}
