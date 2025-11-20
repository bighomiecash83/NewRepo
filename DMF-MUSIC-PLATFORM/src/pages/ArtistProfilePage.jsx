import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001/api";

/**
 * ArtistProfilePage
 * High-tech artist profile with hooks for StreamGod analytics
 * Routes: /artists/:slug
 */
export default function ArtistProfilePage() {
  const { slug } = useParams();
  const [artist, setArtist] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE}/artists/${slug}`);
        if (res.status === 404) {
          setError("Artist not found.");
          setArtist(null);
          return;
        }
        if (!res.ok) throw new Error("API error");

        const json = await res.json();
        setArtist(json.data || null);
        setMeta(json.meta || null);
      } catch (err) {
        console.error("[DMF] ArtistProfile load error:", err);
        setError("Failed to load artist profile.");
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
          <div className="text-xl font-semibold mb-4 text-blue-400">
            ?? Loading Artist Profile...
          </div>
          <div className="h-2 w-48 bg-zinc-800 rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-3 text-blue-400">?? Artist Profile</h1>
          <p className="text-sm text-red-400 mb-4">{error || "Artist not found."}</p>
          <Link
            to="/roster"
            className="inline-flex items-center px-4 py-2 rounded-full border border-blue-500 text-sm text-blue-300 hover:bg-blue-500/10 transition"
          >
            ? Back to Roster
          </Link>
        </div>
      </div>
    );
  }

  const roles = artist.role || [];
  const imprint = artist.imprint || "Fly Hoolie ENT";
  const insights = meta?.insights || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-blue-900/30 bg-gradient-to-r from-blue-950/50 to-transparent px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-blue-400 mb-1">
              ?? {artist.name}
            </h1>
            <p className="text-sm text-zinc-400">
              {artist.real_name && `${artist.real_name} • `}
              {imprint} {artist.verified && "? Verified"}
            </p>
          </div>
          <Link
            to="/roster"
            className="text-sm text-zinc-400 hover:text-blue-300 border border-zinc-700 px-4 py-2 rounded-full transition"
          >
            ? Roster
          </Link>
        </div>
      </header>

      <main className="px-6 py-8 max-w-7xl mx-auto space-y-8">
        {/* Identity Section */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="rounded-xl border border-blue-900/30 bg-blue-950/20 backdrop-blur p-6">
              <h2 className="text-lg font-bold text-blue-300 mb-4">?? Artist Details</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                  <span className="text-sm text-zinc-400">Label</span>
                  <span className="text-sm font-semibold text-zinc-200">
                    {artist.label || "DMF Records"}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                  <span className="text-sm text-zinc-400">Imprint</span>
                  <span className="text-sm font-semibold text-zinc-200">{imprint}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                  <span className="text-sm text-zinc-400">Status</span>
                  <span className={`text-sm font-semibold uppercase tracking-wide ${
                    artist.status === "active" ? "text-green-400" : "text-yellow-400"
                  }`}>
                    {artist.status || "active"}
                  </span>
                </div>

                {roles.length > 0 && (
                  <div className="pt-3 border-t border-zinc-800">
                    <p className="text-sm text-zinc-400 mb-2">Roles</p>
                    <div className="flex flex-wrap gap-2">
                      {roles.map((role) => (
                        <span
                          key={role}
                          className="px-3 py-1 rounded-full bg-blue-900/40 text-blue-300 text-xs font-semibold"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {artist.bio && (
                  <div className="pt-3 border-t border-zinc-800">
                    <p className="text-sm text-zinc-400 mb-2">Bio</p>
                    <p className="text-sm text-zinc-300">{artist.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* StreamGod Insights Panel */}
          <div>
            <div className="rounded-xl border border-gold-900/30 bg-gold-950/20 backdrop-blur p-6">
              <h2 className="text-lg font-bold text-gold-400 mb-4">?? StreamGod Insights</h2>
              
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-zinc-900/50">
                  <p className="text-xs text-zinc-400 mb-1">Stream Score</p>
                  <p className="text-xl font-bold text-zinc-200">
                    {insights.stream_score ?? "—"}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/50">
                  <p className="text-xs text-zinc-400 mb-1">Fraud Risk</p>
                  <p className="text-xl font-bold text-zinc-200">
                    {insights.fraud_risk ?? "—"}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/50">
                  <p className="text-xs text-zinc-400 mb-1">Growth Index</p>
                  <p className="text-xl font-bold text-zinc-200">
                    {insights.growth_index ?? "—"}
                  </p>
                </div>

                <p className="text-xs text-zinc-500 pt-3 border-t border-zinc-800">
                  ?? This panel auto-syncs with StreamGod when real analytics go live.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Releases & Catalog Section */}
        <section className="rounded-xl border border-blue-900/30 bg-blue-950/20 backdrop-blur p-6">
          <h2 className="text-lg font-bold text-blue-300 mb-4">?? Releases & Catalog</h2>
          <p className="text-sm text-zinc-400">
            This section will display {artist.name}'s releases, ISRC codes, distribution status, 
            and royalty snapshots once the catalog integrates with DMF Distributor.
          </p>
          <div className="mt-4 p-4 rounded-lg bg-zinc-900/30 border border-zinc-800">
            <p className="text-xs text-zinc-500">
              Status: <span className="text-zinc-400 font-semibold">Awaiting catalog module</span>
            </p>
          </div>
        </section>

        {/* Social & External Links */}
        {artist.social_links && Object.keys(artist.social_links).length > 0 && (
          <section className="rounded-xl border border-blue-900/30 bg-blue-950/20 backdrop-blur p-6">
            <h2 className="text-lg font-bold text-blue-300 mb-4">?? Connect</h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(artist.social_links).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-blue-900/30 border border-blue-700 text-blue-300 text-sm hover:bg-blue-900/50 transition"
                >
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </a>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
