import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getArtistDashboard } from "../api/dashboardApi";

function formatCurrency(v = 0) {
  return `$${v.toFixed(2)}`;
}

function formatNumber(n = 0) {
  return n.toLocaleString();
}

export default function ArtistDashboard({ artistId: propArtistId }) {
  const params = useParams();
  const artistId = propArtistId || params.artistId || "ARTIST_DEMO_ID";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const d = await getArtistDashboard(artistId);
        if (!active) return;
        setData(d);
      } catch (e) {
        console.error(e);
        setError("Failed to load artist dashboard.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [artistId]);

  if (loading)
    return (
      <div style={styles.container}>
        <p>Loading artist dashboard...</p>
      </div>
    );

  if (error)
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
      </div>
    );

  if (!data)
    return (
      <div style={styles.container}>
        <p>No data.</p>
      </div>
    );

  return (
    <div style={styles.container}>
      <h1>📊 Performance – {data.artistId}</h1>
      <p style={styles.subtitle}>Your performance metrics for the last 30 days</p>

      <section style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Streams (30d)</div>
          <div style={styles.kpiValue}>{formatNumber(data.streamsLast30)}</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Revenue (30d)</div>
          <div style={styles.kpiValue} style={{ color: "#4CAF50" }}>
            {formatCurrency(data.revenueLast30)}
          </div>
        </div>
      </section>

      <section style={styles.releaseSection}>
        <h2>🎵 Your Top Releases</h2>
        {!data.topReleases || data.topReleases.length === 0 ? (
          <div style={styles.empty}>No releases yet.</div>
        ) : (
          <div style={styles.table}>
            <div style={styles.tableHeader}>
              <div style={styles.colRelease}>Release</div>
              <div style={styles.colNumber}>Streams</div>
              <div style={styles.colNumber}>Revenue</div>
            </div>

            {data.topReleases.map((r) => (
              <div key={r.releaseId} style={styles.tableRow}>
                <div style={styles.colRelease}>
                  <div style={styles.releaseTitle}>{r.title}</div>
                  <div style={styles.releaseId}>{r.releaseId}</div>
                </div>
                <div style={styles.colNumber}>{formatNumber(r.streamsLast30)}</div>
                <div style={styles.colNumber}>{formatCurrency(r.revenueLast30)}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {data.streamsOverTime && data.streamsOverTime.length > 0 && (
        <section style={styles.timeSeriesSection}>
          <h2>📈 Streaming Trend (Last 30d)</h2>
          <div style={styles.timeSeriesNote}>
            Showing daily aggregate streams and revenue
          </div>
          <div style={styles.timeSeriesTable}>
            <div style={styles.timeSeriesHeader}>
              <div style={styles.tsCol50}>Date</div>
              <div style={styles.tsCol25}>Streams</div>
              <div style={styles.tsCol25}>Revenue</div>
            </div>
            {data.streamsOverTime.slice(-7).map((point, idx) => (
              <div key={idx} style={styles.timeSeriesRow}>
                <div style={styles.tsCol50}>
                  {new Date(point.date).toLocaleDateString()}
                </div>
                <div style={styles.tsCol25}>{formatNumber(point.streams)}</div>
                <div style={styles.tsCol25}>{formatCurrency(point.revenue)}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section style={styles.footer}>
        <p style={styles.footerText}>
          💡 Data refreshes hourly. Go to /earnings for your full royalty statements and payouts.
        </p>
      </section>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "30px 20px",
    fontFamily: "Arial, sans-serif",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "30px",
  },
  error: {
    padding: "15px",
    backgroundColor: "#ffebee",
    color: "#c62828",
    borderRadius: "4px",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "40px",
  },
  kpiCard: {
    padding: "20px",
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
    border: "1px solid #ddd",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  kpiLabel: {
    fontSize: "11px",
    color: "#999",
    textTransform: "uppercase",
    marginBottom: "10px",
    fontWeight: "600",
    letterSpacing: "0.5px",
  },
  kpiValue: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#333",
  },
  releaseSection: {
    marginBottom: "40px",
  },
  table: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  tableHeader: {
    display: "flex",
    backgroundColor: "#f9f9f9",
    borderBottom: "2px solid #ddd",
    fontWeight: "bold",
    fontSize: "12px",
    textTransform: "uppercase",
    color: "#666",
  },
  tableRow: {
    display: "flex",
    borderBottom: "1px solid #eee",
    padding: "15px 0",
    alignItems: "center",
  },
  colRelease: {
    flex: "0 0 50%",
    padding: "0 15px",
  },
  colNumber: {
    flex: "0 0 25%",
    padding: "0 15px",
    textAlign: "right",
    fontSize: "13px",
  },
  releaseTitle: {
    fontWeight: "600",
    fontSize: "13px",
  },
  releaseId: {
    fontSize: "11px",
    color: "#999",
    marginTop: "4px",
  },
  empty: {
    padding: "40px",
    textAlign: "center",
    color: "#999",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
  },
  timeSeriesSection: {
    marginBottom: "40px",
  },
  timeSeriesNote: {
    fontSize: "12px",
    color: "#666",
    marginBottom: "15px",
  },
  timeSeriesTable: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "white",
  },
  timeSeriesHeader: {
    display: "flex",
    backgroundColor: "#f9f9f9",
    borderBottom: "2px solid #ddd",
    fontWeight: "bold",
    fontSize: "12px",
    textTransform: "uppercase",
    color: "#666",
  },
  timeSeriesRow: {
    display: "flex",
    borderBottom: "1px solid #eee",
    padding: "12px 0",
    alignItems: "center",
  },
  tsCol50: {
    flex: "0 0 50%",
    padding: "0 15px",
    fontSize: "13px",
  },
  tsCol25: {
    flex: "0 0 25%",
    padding: "0 15px",
    textAlign: "right",
    fontSize: "13px",
  },
  footer: {
    padding: "20px",
    backgroundColor: "#e8f5e9",
    borderLeft: "4px solid #4CAF50",
    borderRadius: "4px",
  },
  footerText: {
    fontSize: "12px",
    color: "#666",
    margin: "0",
  },
};
