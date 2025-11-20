import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

const PORTAL_API_BASE =
  import.meta.env.VITE_PORTAL_API_BASE || "http://localhost:5001/api/portal";

/**
 * PortalHomePage
 * Dashboard for authenticated portal users
 * Shows metrics tailored to their role/plan
 */
export default function PortalHomePage() {
  const { me } = useOutletContext();
  const [overview, setOverview] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("dmf_token") || "";

        const [overviewRes, rosterRes] = await Promise.all([
          fetch(`${PORTAL_API_BASE}/overview`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${PORTAL_API_BASE}/roster`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!overviewRes.ok || !rosterRes.ok) {
          throw new Error("Failed to load portal data");
        }

        const overviewJson = await overviewRes.json();
        const rosterJson = await rosterRes.json();

        setOverview(overviewJson.data || null);
        setRoster(rosterJson.data || []);
      } catch (err) {
        console.error("[DMF Portal] Home load error:", err);
        setError("Failed to load dashboard");
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
          Loading your dashboard...
        </div>
        <div className="h-2 w-32 bg-zinc-800 rounded-full mx-auto" />
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

  const role = me.role;
  const isArtist = role === "ARTIST";
  const isClient = role === "CLIENT" || role === "LABEL_MANAGER";
  const isInvestor = role === "INVESTOR";
  const isViewOnly = role === "VIEW_ONLY";

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <section>
        <h1 className="text-3xl font-bold text-blue-400 mb-2">
          Welcome Back ??
        </h1>
        <p className="text-sm text-zinc-400">
          This space is customized for your role and plan. You only see data
          and features you have permission to access.
        </p>
      </section>

      {/* Metrics Grid */}
      <section className="grid gap-4 md:grid-cols-3">
        <PortalMetricCard
          icon="??"
          label="Artists in Scope"
          value={overview?.artist_count ?? 0}
          color="blue"
        />
        <PortalMetricCard
          icon="??"
          label="Releases (Placeholder)"
          value={overview?.release_count ?? 0}
          color="gold"
        />
        <PortalMetricCard
          icon="??"
          label="Stream Estimate (Placeholder)"
          value={overview?.stream_estimate ?? 0}
          color="green"
        />
      </section>

      {/* Roster Section (conditional based on role) */}
      {!isViewOnly && (
        <section>
          <h2 className="text-lg font-bold text-white mb-4">Your Roster</h2>

          {roster.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-6 text-center">
              <p className="text-sm text-zinc-400">
                No artists visible under this account yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roster.map((artist) => (
                <div
                  key={artist._id}
                  className="rounded-xl border border-blue-900/30 bg-blue-950/20 hover:border-blue-600 transition p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm">
                        {artist.stage_name || artist.name}
                      </h3>
                      {artist.imprint && (
                        <p className="text-xs text-zinc-400 mt-1">
                          {artist.imprint}
                        </p>
                      )}
                    </div>
                    {artist.verified && (
                      <span className="text-xs text-green-400 font-semibold">
                        ?
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-800">
                    <span
                      className={[
                        "text-xs px-2 py-1 rounded-full font-semibold uppercase",
                        artist.status === "active"
                          ? "bg-green-900/30 text-green-300"
                          : "bg-yellow-900/30 text-yellow-300",
                      ].join(" ")}
                    >
                      {artist.status || "active"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Read-Only Notice */}
      {isViewOnly && (
        <section className="rounded-xl border border-blue-900/30 bg-blue-950/20 p-6">
          <h3 className="text-sm font-semibold text-blue-300 mb-2">
            ?? Read-Only Access
          </h3>
          <p className="text-xs text-zinc-400">
            This is a limited preview account. To submit releases, access
            analytics, or manage artists, contact DMF Records to upgrade your
            plan.
          </p>
        </section>
      )}

      {/* Quick Links */}
      <section className="grid gap-4 md:grid-cols-2">
        <QuickLink
          title="View Analytics"
          description="Stream data, territories, playlist performance"
          href="/portal/analytics"
          disabled={isViewOnly}
        />
        <QuickLink
          title="Distribution Status"
          description="Submit releases, track DSP delivery"
          href="/portal/distribution"
          disabled={isViewOnly}
        />
      </section>
    </div>
  );
}

function PortalMetricCard({ icon, label, value, color }) {
  const colorClasses = {
    blue: "border-blue-900/30 bg-blue-950/20",
    gold: "border-gold-900/30 bg-gold-950/20",
    green: "border-green-900/30 bg-green-950/20",
  };

  return (
    <div
      className={[
        "rounded-xl border p-6",
        colorClasses[color] || colorClasses.blue,
      ].join(" ")}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-zinc-400 uppercase tracking-wide">{label}</p>
        <span className="text-3xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function QuickLink({ title, description, href, disabled }) {
  return (
    <a
      href={href}
      className={[
        "rounded-xl border p-4 transition",
        disabled
          ? "opacity-50 cursor-not-allowed border-zinc-800 bg-zinc-950/40"
          : "border-blue-900/30 bg-blue-950/20 hover:border-blue-600 hover:bg-blue-950/40",
      ].join(" ")}
      onClick={(e) => disabled && e.preventDefault()}
    >
      <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
      <p className="text-xs text-zinc-400">{description}</p>
      {!disabled && (
        <p className="text-xs text-blue-400 mt-2 font-semibold">? Open</p>
      )}
    </a>
  );
}
