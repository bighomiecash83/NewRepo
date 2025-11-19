/**
 * DMF Catalog Dashboard Example
 * 
 * This is a complete example React component for Google AI Studio
 * that demonstrates how to use the DMF API client to build a real dashboard.
 * 
 * Copy this component into your Google AI Studio project and adapt as needed.
 */

import { useState, useEffect } from "react";
import { dmfApi } from "../lib/dmf_api_client";

interface Release {
  id: string;
  title: string;
  type: "single" | "ep" | "album" | "mixtape";
  trackCount: number;
  releaseDate?: string;
  status: "draft" | "published";
}

interface ScoreResult {
  trackId: string;
  title: string;
  score: number;
  readiness: "high" | "medium" | "low";
  recommendation: string;
}

export function DMFCatalogDashboard() {
  // State Management
  const [releases, setReleases] = useState<Release[]>([]);
  const [scores, setScores] = useState<ScoreResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [activeTab, setActiveTab] = useState<"catalog" | "scores" | "details">(
    "catalog"
  );

  // ===== LOAD CATALOG ON MOUNT =====
  useEffect(() => {
    loadCatalog();
  }, []);

  // ===== API CALLS =====

  async function loadCatalog() {
    setLoading(true);
    setError(null);
    try {
      const data = await dmfApi.getCatalogReleases();
      setReleases(data || []);
      console.log("✅ Catalog loaded:", data);
    } catch (err: any) {
      const message = err.message || "Failed to load catalog";
      setError(message);
      console.error("❌ Catalog error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function scoreAllTracks() {
    if (releases.length === 0) {
      setError("No releases to score");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const newScores: ScoreResult[] = [];

      // Score each release (in real app, might batch this)
      for (const release of releases) {
        try {
          const score = await dmfApi.scoreTrack({
            trackId: release.id,
            title: release.title,
            duration: 180 // placeholder
          });

          newScores.push({
            trackId: release.id,
            title: release.title,
            score: score.score || 0,
            readiness: score.readiness || "medium",
            recommendation: score.recommendation || "Review and improve"
          });
        } catch (trackErr) {
          console.warn(`Failed to score ${release.title}:`, trackErr);
        }
      }

      setScores(newScores);
      console.log("✅ Scores loaded:", newScores);
    } catch (err: any) {
      setError(err.message);
      console.error("❌ Scoring error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function getPayoutEstimate(release: Release) {
    setLoading(true);
    setError(null);
    try {
      const quote = await dmfApi.getPayoutQuote({
        releaseType: release.type,
        trackCount: release.trackCount,
        estimatedStreams: 50000, // placeholder
        payoutTier: "indie_basic"
      });

      alert(
        `Payout Estimate for ${release.title}:\n` +
          `Artist Share: 90%\n` +
          `Estimated Payout at 50k streams: $${quote.estimatedArtistPayout || "0"}`
      );
    } catch (err: any) {
      setError(err.message);
      console.error("❌ Payout error:", err);
    } finally {
      setLoading(false);
    }
  }

  // ===== RENDER HELPERS =====

  function getReadinessColor(readiness: string): string {
    switch (readiness) {
      case "high":
        return "#4CAF50"; // green
      case "medium":
        return "#FFC107"; // amber
      case "low":
        return "#F44336"; // red
      default:
        return "#9E9E9E"; // gray
    }
  }

  function getReleaseTypeIcon(type: string): string {
    switch (type) {
      case "single":
        return "🎵";
      case "ep":
        return "💿";
      case "album":
        return "📀";
      case "mixtape":
        return "🎚️";
      default:
        return "📦";
    }
  }

  // ===== MAIN RENDER =====

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>DMF Catalog Dashboard</h1>
        <p style={styles.subtitle}>
          Connected to: {import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}
        </p>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div style={styles.errorBanner}>
          <strong>⚠️ Error:</strong> {error}
          <button
            style={styles.closeButton}
            onClick={() => setError(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* TABS */}
      <div style={styles.tabBar}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "catalog" ? styles.tabActive : {})
          }}
          onClick={() => setActiveTab("catalog")}
        >
          📚 Catalog ({releases.length})
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "scores" ? styles.tabActive : {})
          }}
          onClick={() => setActiveTab("scores")}
        >
          ⭐ Scores ({scores.length})
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "details" ? styles.tabActive : {})
          }}
          onClick={() => setActiveTab("details")}
        >
          📋 Details
        </button>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div style={styles.loadingBanner}>
          ⏳ Loading...
        </div>
      )}

      {/* CATALOG TAB */}
      {activeTab === "catalog" && (
        <div style={styles.tabContent}>
          <div style={styles.actionBar}>
            <button
              style={styles.button}
              onClick={loadCatalog}
              disabled={loading}
            >
              🔄 Refresh Catalog
            </button>
            <button
              style={styles.button}
              onClick={scoreAllTracks}
              disabled={loading || releases.length === 0}
            >
              ⭐ Score All Tracks
            </button>
          </div>

          {releases.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No releases yet. Click "Refresh Catalog" to load.</p>
            </div>
          ) : (
            <div style={styles.grid}>
              {releases.map((release) => (
                <div
                  key={release.id}
                  style={styles.card}
                  onClick={() => {
                    setSelectedRelease(release);
                    setActiveTab("details");
                  }}
                >
                  <div style={styles.cardIcon}>
                    {getReleaseTypeIcon(release.type)}
                  </div>
                  <h3 style={styles.cardTitle}>{release.title}</h3>
                  <p style={styles.cardMeta}>
                    Type: <strong>{release.type}</strong> ({release.trackCount} track
                    {release.trackCount !== 1 ? "s" : ""})
                  </p>
                  {release.releaseDate && (
                    <p style={styles.cardMeta}>
                      Released: {new Date(release.releaseDate).toLocaleDateString()}
                    </p>
                  )}
                  <p style={styles.cardStatus}>
                    Status:{" "}
                    <span
                      style={{
                        color: release.status === "published" ? "#4CAF50" : "#FFC107"
                      }}
                    >
                      {release.status}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SCORES TAB */}
      {activeTab === "scores" && (
        <div style={styles.tabContent}>
          {scores.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No scores yet. Click "Score All Tracks" in the Catalog tab.</p>
            </div>
          ) : (
            <div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Track</th>
                    <th style={styles.th}>Score</th>
                    <th style={styles.th}>Readiness</th>
                    <th style={styles.th}>Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {scores
                    .sort((a, b) => b.score - a.score)
                    .map((score) => (
                      <tr key={score.trackId} style={styles.tr}>
                        <td style={styles.td}>{score.title}</td>
                        <td style={styles.td}>
                          <strong>{(score.score * 100).toFixed(0)}%</strong>
                        </td>
                        <td style={styles.td}>
                          <span
                            style={{
                              backgroundColor: getReadinessColor(score.readiness),
                              color: "white",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              textTransform: "uppercase"
                            }}
                          >
                            {score.readiness}
                          </span>
                        </td>
                        <td style={styles.td}>{score.recommendation}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* DETAILS TAB */}
      {activeTab === "details" && (
        <div style={styles.tabContent}>
          {selectedRelease ? (
            <div>
              <button
                style={styles.backButton}
                onClick={() => setActiveTab("catalog")}
              >
                ← Back to Catalog
              </button>

              <div style={styles.detailCard}>
                <div style={styles.detailHeader}>
                  <h2 style={styles.detailTitle}>
                    {getReleaseTypeIcon(selectedRelease.type)} {selectedRelease.title}
                  </h2>
                </div>

                <div style={styles.detailSection}>
                  <p>
                    <strong>Type:</strong> {selectedRelease.type}
                  </p>
                  <p>
                    <strong>Tracks:</strong> {selectedRelease.trackCount}
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedRelease.status}
                  </p>
                  {selectedRelease.releaseDate && (
                    <p>
                      <strong>Release Date:</strong>{" "}
                      {new Date(selectedRelease.releaseDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Related Score */}
                {scores.find((s) => s.trackId === selectedRelease.id) && (
                  <div style={styles.detailSection}>
                    <h3>Readiness Score</h3>
                    {(() => {
                      const score = scores.find(
                        (s) => s.trackId === selectedRelease.id
                      );
                      return (
                        <div>
                          <div style={styles.scoreBar}>
                            <div
                              style={{
                                width: `${(score!.score || 0) * 100}%`,
                                height: "100%",
                                backgroundColor: getReadinessColor(score!.readiness),
                                transition: "width 0.3s ease"
                              }}
                            />
                          </div>
                          <p style={styles.scoreText}>
                            <strong>{((score!.score || 0) * 100).toFixed(0)}%</strong> -{" "}
                            {score!.readiness}
                          </p>
                          <p>{score!.recommendation}</p>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Actions */}
                <div style={styles.detailActions}>
                  <button
                    style={styles.button}
                    onClick={() => getPayoutEstimate(selectedRelease)}
                    disabled={loading}
                  >
                    💰 Get Payout Estimate
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <p>Select a release from the Catalog tab to see details.</p>
            </div>
          )}
        </div>
      )}

      {/* FOOTER */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          DMF Catalog Dashboard • {releases.length} releases • {scores.length} scored
        </p>
      </div>
    </div>
  );
}

// ===== STYLES =====

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: "#f5f5f5",
    minHeight: "100vh"
  },
  header: {
    marginBottom: "30px",
    textAlign: "center" as const
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "5px",
    color: "#1a1a1a"
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    fontFamily: "monospace"
  },
  errorBanner: {
    backgroundColor: "#ffebee",
    border: "1px solid #ef5350",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "20px",
    color: "#c62828",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  closeButton: {
    background: "none",
    border: "none",
    color: "#c62828",
    fontSize: "18px",
    cursor: "pointer"
  },
  loadingBanner: {
    backgroundColor: "#e3f2fd",
    border: "1px solid #1976d2",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "20px",
    color: "#0d47a1",
    textAlign: "center" as const
  },
  tabBar: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    borderBottom: "2px solid #ddd"
  },
  tab: {
    padding: "12px 20px",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    color: "#666",
    borderBottom: "3px solid transparent",
    transition: "all 0.2s"
  },
  tabActive: {
    color: "#1976d2",
    borderBottomColor: "#1976d2"
  },
  tabContent: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  actionBar: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px"
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background-color 0.2s"
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "40px",
    color: "#999"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px"
  },
  card: {
    backgroundColor: "#fafafa",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "20px",
    cursor: "pointer",
    transition: "all 0.2s",
    "& :hover": {
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
    }
  },
  cardIcon: {
    fontSize: "32px",
    marginBottom: "10px"
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#1a1a1a"
  },
  cardMeta: {
    fontSize: "13px",
    color: "#666",
    marginBottom: "5px"
  },
  cardStatus: {
    fontSize: "13px",
    marginTop: "10px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const
  },
  th: {
    textAlign: "left" as const,
    padding: "12px",
    backgroundColor: "#f5f5f5",
    borderBottom: "2px solid #ddd",
    fontWeight: "600",
    fontSize: "13px"
  },
  tr: {
    borderBottom: "1px solid #e0e0e0",
    "& :hover": {
      backgroundColor: "#f9f9f9"
    }
  },
  td: {
    padding: "12px",
    fontSize: "13px"
  },
  detailCard: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "30px",
    border: "1px solid #e0e0e0"
  },
  detailHeader: {
    marginBottom: "30px",
    borderBottom: "2px solid #f0f0f0",
    paddingBottom: "20px"
  },
  detailTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1a1a1a"
  },
  detailSection: {
    marginBottom: "20px",
    padding: "15px 0",
    borderBottom: "1px solid #f0f0f0"
  },
  scoreBar: {
    width: "100%",
    height: "30px",
    backgroundColor: "#e0e0e0",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "10px"
  },
  scoreText: {
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "5px"
  },
  detailActions: {
    display: "flex",
    gap: "10px",
    marginTop: "20px"
  },
  backButton: {
    padding: "8px 16px",
    backgroundColor: "#e0e0e0",
    color: "#1a1a1a",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    marginBottom: "20px"
  },
  footer: {
    textAlign: "center" as const,
    padding: "20px",
    color: "#999",
    fontSize: "12px"
  },
  footerText: {
    margin: 0
  }
};
