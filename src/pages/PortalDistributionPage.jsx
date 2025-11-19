import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

const PORTAL_API_BASE =
  import.meta.env.VITE_PORTAL_API_BASE || "http://localhost:5001/api/portal";

/**
 * PortalDistributionPage
 * Release submission, distribution status, DSP tracking
 */
export default function PortalDistributionPage() {
  const { me } = useOutletContext();
  const [distribution, setDistribution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("dmf_token") || "";

        const res = await fetch(`${PORTAL_API_BASE}/distribution`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 403) {
          setError("You do not have permission to manage distributions");
          return;
        }

        if (!res.ok) throw new Error("Failed to load distribution");

        const json = await res.json();
        setDistribution(json.data || null);
      } catch (err) {
        console.error("[DMF Portal] Distribution load error:", err);
        setError("Failed to load distribution data");
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
          Loading distribution...
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
          ?? Distribution
        </h1>
        <p className="text-sm text-zinc-400">
          Submit releases, track DSP delivery, and monitor worldwide distribution
          through DMF Distributor Worldwide.
        </p>
      </section>

      {/* Status Overview */}
      <section className="grid gap-4 md:grid-cols-3">
        <StatusCard
          label="Pending"
          value={distribution?.pending || 0}
          color="yellow"
        />
        <StatusCard label="Live" value={distribution?.live || 0} color="green" />
        <StatusCard
          label="Rejected"
          value={distribution?.rejected || 0}
          color="red"
        />
      </section>

      {/* Action Bar */}
      <section className="rounded-xl border border-blue-900/30 bg-blue-950/20 p-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white mb-1">
            Ready to Submit a Release?
          </h3>
          <p className="text-xs text-zinc-400">
            Upload your music, add metadata, and submit to global DSPs instantly.
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
          disabled
        >
          New Release (Coming Soon)
        </button>
      </section>

      {/* Releases List Placeholder */}
      <section>
        <h3 className="text-sm font-semibold text-white mb-3">
          Your Releases
        </h3>
        {(distribution?.releases || []).length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-6 text-center">
            <p className="text-sm text-zinc-400">
              No releases submitted yet. Submit your first release to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Releases will render here */}
          </div>
        )}
      </section>

      {/* DSP Coverage */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">
          ?? Supported DSPs
        </h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[
            "Spotify",
            "Apple Music",
            "YouTube Music",
            "Amazon Music",
            "TikTok",
            "Instagram",
            "SoundCloud",
            "Bandcamp",
          ].map((dsp) => (
            <div
              key={dsp}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-center text-xs font-semibold text-zinc-300"
            >
              {dsp}
            </div>
          ))}
        </div>
      </section>

      {/* Coming Soon Features */}
      <section className="rounded-xl border border-green-900/30 bg-green-950/20 p-6">
        <h3 className="text-sm font-semibold text-green-300 mb-3">
          ?? Coming Soon
        </h3>
        <ul className="space-y-2 text-xs text-zinc-400">
          <li>? One-click release submission wizard</li>
          <li>? Metadata templates and validation</li>
          <li>? Real-time DSP delivery tracking</li>
          <li>? Pre-save links and playlist pitching</li>
          <li>? Release scheduling (scheduled releases)</li>
          <li>? Takedown and dispute management</li>
          <li>? Territory and exclusivity controls</li>
          <li>
            ? AI-powered metadata optimization (StreamGod Brain)
          </li>
        </ul>
      </section>
    </div>
  );
}

function StatusCard({ label, value, color }) {
  const colorClasses = {
    yellow: "border-yellow-900/30 bg-yellow-950/20",
    green: "border-green-900/30 bg-green-950/20",
    red: "border-red-900/30 bg-red-950/20",
  };

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color] || ""}`}>
      <p className="text-xs text-zinc-400 mb-2 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
