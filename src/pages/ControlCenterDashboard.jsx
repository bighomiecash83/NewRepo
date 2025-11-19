import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001/api";

/**
 * DMF Control Center Dashboard
 * High-level system snapshot for admins & ops
 * Shows: system status, artist count, division status, engine health, etc.
 * Route: /control-center or /dashboard
 */
export default function ControlCenterDashboard() {
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
        if (!res.ok) throw new Error("API error");

        const json = await res.json();
        setStatus(json.data || null);
        setLastUpdate(new Date());
      } catch (err) {
        console.error("[DMF Control Center] load error:", err);
        setError("Failed to load system status.");
      } finally {
        setLoading(false);
      }
    }

    load();
    // Auto-refresh every 30 seconds
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (loading && !status) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="text-2xl font-semibold mb-4 text-blue-400">
            ?? DMF Control Center Loading...
          </div>
          <div className="h-3 w-64 bg-zinc-800 rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-3 text-blue-400">?? DMF Control Center</h1>
          <p className="text-sm text-red-400 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
          >
            ? Retry
          </button>
        </div>
      </div>
    );
  }

  const artists = status?.artists || 0;
  const divisions = status?.divisions || 0;
  const engines = status?.engines || 0;
  const activeEngines = status?.active_engines || [];

  const timeString = lastUpdate.toLocaleTimeString();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-blue-900/30 bg-gradient-to-r from-blue-950/50 to-transparent px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-blue-400 mb-1">
              ?? DMF Control Center
            </h1>
            <p className="text-sm text-zinc-400">
              System Status & Operations Dashboard
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 rounded-full border border-blue-700 text-blue-300 text-sm hover:bg-blue-900/30 transition"
            >
              ? Refresh
            </button>
            <Link
              to="/roster"
              className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
            >
              ?? View Roster
            </Link>
          </div>
        </div>
        <p className="text-xs text-zinc-500">
          Last update: {timeString} • Auto-refresh every 30s
        </p>
      </header>

      <main className="px-6 py-8 max-w-7xl mx-auto space-y-8">
        {/* Top Metrics */}
        <section className="grid gap-6 md:grid-cols-4">
          {/* Artists Count */}
          <div className="rounded-xl border border-blue-900/30 bg-blue-950/20 backdrop-blur p-6 hover:border-blue-700/50 transition">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-400">Artists</h3>
              <span className="text-2xl">??</span>
            </div>
            <p className="text-3xl font-bold text-blue-300">{artists}</p>
            <p className="text-xs text-zinc-500 mt-2">Active roster members</p>
          </div>

          {/* Divisions Count */}
          <div className="rounded-xl border border-gold-900/30 bg-gold-950/20 backdrop-blur p-6 hover:border-gold-700/50 transition">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-400">Divisions</h3>
              <span className="text-2xl">??</span>
            </div>
            <p className="text-3xl font-bold text-gold-300">{divisions}</p>
            <p className="text-xs text-zinc-500 mt-2">Internal services</p>
          </div>

          {/* Engines Count */}
          <div className="rounded-xl border border-purple-900/30 bg-purple-950/20 backdrop-blur p-6 hover:border-purple-700/50 transition">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-400">Engines</h3>
              <span className="text-2xl">??</span>
            </div>
            <p className="text-3xl font-bold text-purple-300">{engines}</p>
            <p className="text-xs text-zinc-500 mt-2">AI & tech systems</p>
          </div>

          {/* Active Engines */}
          <div className="rounded-xl border border-green-900/30 bg-green-950/20 backdrop-blur p-6 hover:border-green-700/50 transition">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-400">Active</h3>
              <span className="text-2xl">?</span>
            </div>
            <p className="text-3xl font-bold text-green-300">{activeEngines.length}</p>
            <p className="text-xs text-zinc-500 mt-2">Engines operational</p>
          </div>
        </section>

        {/* System Health */}
        <section className="rounded-xl border border-blue-900/30 bg-blue-950/20 backdrop-blur p-6">
          <h2 className="text-lg font-bold text-blue-300 mb-4">?? System Health</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50">
              <span className="text-sm text-zinc-400">API Service</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-semibold text-green-300">Operational</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50">
              <span className="text-sm text-zinc-400">MongoDB Connection</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-semibold text-green-300">Connected</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50">
              <span className="text-sm text-zinc-400">Roster Service</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-semibold text-green-300">Ready</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50">
              <span className="text-sm text-zinc-400">StreamGod Brain</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm font-semibold text-blue-300">Available</span>
              </div>
            </div>
          </div>
        </section>

        {/* Active Engines Detail */}
        {activeEngines.length > 0 && (
          <section className="rounded-xl border border-purple-900/30 bg-purple-950/20 backdrop-blur p-6">
            <h2 className="text-lg font-bold text-purple-300 mb-4">?? Active Engines</h2>
            
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {activeEngines.map((engine) => (
                <Link
                  key={engine.slug}
                  to={`/divisions/${engine.slug}`}
                  className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-purple-700 hover:bg-purple-950/30 transition"
                >
                  <p className="font-semibold text-purple-300 text-sm mb-1">
                    {engine.name}
                  </p>
                  <p className="text-xs text-zinc-500">? View Details</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section className="rounded-xl border border-blue-900/30 bg-blue-950/20 backdrop-blur p-6">
          <h2 className="text-lg font-bold text-blue-300 mb-4">? Quick Actions</h2>
          
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/roster"
              className="p-4 rounded-lg bg-blue-900/30 border border-blue-700 text-blue-300 hover:bg-blue-900/50 transition text-center"
            >
              <p className="font-semibold text-sm">View Roster</p>
              <p className="text-xs text-zinc-400">Artists & divisions</p>
            </Link>

            <Link
              to="/catalog/health"
              className="p-4 rounded-lg bg-green-900/30 border border-green-700 text-green-300 hover:bg-green-900/50 transition text-center"
            >
              <p className="font-semibold text-sm">Catalog Health</p>
              <p className="text-xs text-zinc-400">Analyze releases</p>
            </Link>

            <button
              onClick={() => alert("StreamGod Analysis Coming Soon")}
              className="p-4 rounded-lg bg-purple-900/30 border border-purple-700 text-purple-300 hover:bg-purple-900/50 transition text-center"
            >
              <p className="font-semibold text-sm">AI Analysis</p>
              <p className="text-xs text-zinc-400">StreamGod brain</p>
            </button>

            <button
              onClick={() => alert("Advanced Metrics Coming Soon")}
              className="p-4 rounded-lg bg-gold-900/30 border border-gold-700 text-gold-300 hover:bg-gold-900/50 transition text-center"
            >
              <p className="font-semibold text-sm">Metrics</p>
              <p className="text-xs text-zinc-400">Real-time data</p>
            </button>
          </div>
        </section>

        {/* Footer Info */}
        <section className="text-center py-4 text-xs text-zinc-500 border-t border-zinc-800">
          <p>
            DMF Control Center v1.0 • System Status Auto-Refreshes Every 30 Seconds
          </p>
        </section>
      </main>
    </div>
  );
}
