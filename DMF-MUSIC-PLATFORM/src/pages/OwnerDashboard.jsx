import React, { useEffect, useState } from "react";
import { getOwnerKpis, getTopReleases } from "../api/dashboardApi";

function formatCurrency(v = 0) {
  return `$${v.toFixed(2)}`;
}

function formatNumber(n = 0) {
  return n.toLocaleString();
}

export default function OwnerDashboard() {
  const [kpis, setKpis] = useState(null);
  const [topReleases, setTopReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const [k, r] = await Promise.all([getOwnerKpis(), getTopReleases(5)]);
        if (!active) return;
        setKpis(k);
        setTopReleases(r);
      } catch (e) {
        console.error(e);
        setError("Failed to load StreamGod owner dashboard.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading)
    return (
      <div style={styles.container}>
        <p>Loading StreamGod dashboard...</p>
      </div>
    );

  if (error)
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
      </div>
    );

  if (!kpis)
    return (
      <div style={styles.container}>
        <p>No data yet.</p>
      </div>
    );

  return (
    <div style={styles.container}>
      <h1>🎯 StreamGod – Label Command Center</h1>
      <p style={styles.subtitle}>Real-time analytics for your label's performance</p>

      <section style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Streams (Last 30d)</div>
          <div style={styles.kpiValue}>{formatNumber(kpis.totalStreamsLast30)}</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Gross Revenue (30d)</div>
          <div style={styles.kpiValue}>{formatCurrency(kpis.grossRevenueLast30)}</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>DMF Cut (30d)</div>
          <div style={styles.kpiValue} style={{ color: "#ff9800" }}>
            {formatCurrency(kpis.dmfCutLast30)}
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Net to Artists (30d)</div>
          <div style={styles.kpiValue} style={{ color: "#4CAF50" }}>
            {formatCurrency(kpis.netToArtistsLast30)}
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Active Artists</div>
          <div style={styles.kpiValue}>{formatNumber(kpis.activeArtists)}</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Total Releases</div>
          <div style={styles.kpiValue}>{formatNumber(kpis.totalReleases)}</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Releases with QC Issues</div>
          <div
            style={styles.kpiValue}
            style={{
              color: kpis.releasesWithQcIssues > 0 ? "#f44336" : "#4CAF50",
            }}
          >
            {formatNumber(kpis.releasesWithQcIssues)}
          </div>
        </div>
      </section>

      <section style={styles.releaseSection}>
        <h2>🔥 Top Releases (Last 30d)</h2>
        {topReleases.length === 0 ? (
          <div style={styles.empty}>No releases yet.</div>
        ) : (
          <div style={styles.table}>
            <div style={styles.tableHeader}>
              <div style={styles.colTitle}>Title</div>
              <div style={styles.colArtist}>Artist</div>
              <div style={styles.colNumber}>Streams</div>
              <div style={styles.colNumber}>Revenue</div>
              <div style={styles.colNumber}>QC Score</div>
            </div>

            {topReleases.map((r) => (
              <div key={r.releaseId} style={styles.tableRow}>
                <div style={styles.colTitle}>{r.title}</div>
                <div style={styles.colArtist}>{r.artistId}</div>
                <div style={styles.colNumber}>{formatNumber(r.streamsLast30)}</div>
                <div style={styles.colNumber}>{formatCurrency(r.revenueLast30)}</div>
                <div style={styles.colNumber}>{r.qcScore?.toFixed(1) ?? "-"}%</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={styles.footer}>
        <p style={styles.footerText}>
          💡 StreamGod updates metrics from royalty imports and release data every hour.
          For manual refresh, reload the page.
        </p>
      </section>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "30px 20px",
    fontFamily: "Arial, sans-serif",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "30px",
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
    transition: "background-color 0.2s",
  },
  colTitle: {
    flex: "0 0 30%",
    padding: "0 15px",
    fontWeight: "600",
    fontSize: "13px",
  },
  colArtist: {
    flex: "0 0 20%",
    padding: "0 15px",
    fontSize: "13px",
    color: "#666",
  },
  colNumber: {
    flex: "0 0 16.66%",
    padding: "0 15px",
    textAlign: "right",
    fontSize: "13px",
  },
  empty: {
    padding: "40px",
    textAlign: "center",
    color: "#999",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
  },
  footer: {
    padding: "20px",
    backgroundColor: "#f0f7ff",
    borderLeft: "4px solid #2196F3",
    borderRadius: "4px",
  },
  footerText: {
    fontSize: "12px",
    color: "#666",
    margin: "0",
  },
};
