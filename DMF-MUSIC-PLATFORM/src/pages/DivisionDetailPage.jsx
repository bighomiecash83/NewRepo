import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001/api";

/**
 * DivisionDetailPage
 * DMF Division control panel with ops status and service integration
 * Routes: /divisions/:slug
 */
export default function DivisionDetailPage() {
  const { slug } = useParams();
  const [division, setDivision] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE}/divisions/${slug}`);
        if (res.status === 404) {
          setError("Division not found.");
          setDivision(null);
          return;
        }
        if (!res.ok) throw new Error("API error");

        const json = await res.json();
        setDivision(json.data || null);
        setMeta(json.meta || null);
      } catch (err) {
        console.error("[DMF] DivisionDetail load error:", err);
        setError("Failed to load division.");
      } finally {
        setLoading(false);
      }
    }

    if (slug) load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="text-xl font-semibold mb-4 text-gold-400">
            ?? Loading Division...
          </div>
          <div className="h-2 w-48 bg-zinc-800 rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  if (error || !division) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-3 text-gold-400">?? DMF Division</h1>
          <p className="text-sm text-red-400 mb-4">{error || "Division not found."}</p>
          <Link
            to="/roster"
            className="inline-flex items-center px-4 py-2 rounded-full border border-gold-500 text-sm text-gold-300 hover:bg-gold-500/10 transition"
          >
            ? Back to Roster
          </Link>
        </div>
      </div>
    );
  }

  const services = division.services || [];
  const apiEndpoints = division.api_endpoints || [];
  const statusMeta = meta?.status || "online";
  const loadFactor = meta?.load_factor ?? "—";

  // Map division type to icon & color
  const typeConfig = {
    technology: { icon: "??", color: "blue", label: "Technology" },
    legal: { icon: "??", color: "purple", label: "Legal & IP" },
    distribution: { icon: "??", color: "green", label: "Distribution" },
    production: { icon: "??", color: "orange", label: "Production" },
    security: { icon: "???", color: "red", label: "Security" },
    education: { icon: "??", color: "cyan", label: "Education" },
    finance: { icon: "??", color: "emerald", label: "Finance" },
    research: { icon: "??", color: "indigo", label: "Research" },
    administration: { icon: "??", color: "amber", label: "Administration" },
  };

  const config = typeConfig[division.type] || { icon: "??", color: "gray", label: "Service" };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className={`border-b border-${config.color}-900/30 bg-gradient-to-r from-${config.color}-950/50 to-transparent px-6 py-6`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-4xl font-bold text-${config.color}-400 mb-1`}>
              {config.icon} {division.name}
            </h1>
            <p className="text-sm text-zinc-400">
              {config.label} • {division.category}
            </p>
          </div>
          <Link
            to="/roster"
            className="text-sm text-zinc-400 hover:text-gold-300 border border-zinc-700 px-4 py-2 rounded-full transition"
          >
            ? Roster
          </Link>
        </div>
      </header>

      <main className="px-6 py-8 max-w-7xl mx-auto space-y-8">
        {/* Mission & Overview */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className={`rounded-xl border border-${config.color}-900/30 bg-${config.color}-950/20 backdrop-blur p-6`}>
              <h2 className={`text-lg font-bold text-${config.color}-300 mb-4`}>
                ?? Mission & Scope
              </h2>
              
              {division.description && (
                <p className="text-sm text-zinc-300 mb-4">{division.description}</p>
              )}

              <p className="text-xs text-zinc-400 mb-4">
                {division.name} is a core operational unit of DMF Records. All systems, 
                automations, and services under this division route through this entity in the database.
              </p>

              {division.integrated && (
                <div className="p-3 rounded-lg bg-green-900/20 border border-green-700/30 mb-4">
                  <p className="text-xs text-green-300">
                    ? Fully integrated with DMF-MUSIC-PLATFORM
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>Status: <span className="text-zinc-200 font-semibold uppercase">{division.status || "active"}</span></span>
                <span>Visible: {division.visible_in_app ? "Yes" : "Internal Only"}</span>
              </div>
            </div>
          </div>

          {/* Runtime Status Panel */}
          <div>
            <div className={`rounded-xl border border-${config.color}-900/30 bg-${config.color}-950/20 backdrop-blur p-6`}>
              <h2 className={`text-lg font-bold text-${config.color}-300 mb-4`}>? Runtime Status</h2>
              
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-zinc-900/50">
                  <p className="text-xs text-zinc-400 mb-1">Service Status</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${statusMeta === "online" ? "bg-green-500" : "bg-yellow-500"}`} />
                    <p className="text-sm font-semibold capitalize text-zinc-200">
                      {statusMeta}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/50">
                  <p className="text-xs text-zinc-400 mb-1">Load Factor</p>
                  <p className="text-sm font-semibold text-zinc-200">{loadFactor}</p>
                </div>

                <p className="text-xs text-zinc-500 pt-3 border-t border-zinc-800">
                  ?? Ready for: queue depth, error rate, uptime, last deployment, 
                  response time when monitoring integrates.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        {services.length > 0 && (
          <section className={`rounded-xl border border-${config.color}-900/30 bg-${config.color}-950/20 backdrop-blur p-6`}>
            <h2 className={`text-lg font-bold text-${config.color}-300 mb-4`}>
              ?? Services Provided
            </h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <div
                  key={service}
                  className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition"
                >
                  <p className="text-sm font-semibold text-zinc-200">? {service}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* API Endpoints */}
        {apiEndpoints.length > 0 && (
          <section className={`rounded-xl border border-${config.color}-900/30 bg-${config.color}-950/20 backdrop-blur p-6`}>
            <h2 className={`text-lg font-bold text-${config.color}-300 mb-4`}>
              ?? API Endpoints
            </h2>
            <div className="space-y-2">
              {apiEndpoints.map((endpoint) => (
                <div
                  key={endpoint}
                  className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 font-mono text-xs text-zinc-400"
                >
                  <code className="text-blue-300">{endpoint}</code>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Integration Roadmap */}
        <section className={`rounded-xl border border-${config.color}-900/30 bg-${config.color}-950/20 backdrop-blur p-6`}>
          <h2 className={`text-lg font-bold text-${config.color}-300 mb-4`}>
            ??? Integration Roadmap
          </h2>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-zinc-900/30 border border-zinc-800">
              <p className="text-sm font-semibold text-zinc-200 mb-2">
                Planned Integrations
              </p>
              <p className="text-xs text-zinc-400">
                Linked workflows, partner services, queue management, and real-time metrics 
                for {division.name} will appear here once additional modules are deployed.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
