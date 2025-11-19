import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ArtistEarningsDashboard() {
  const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
  const [summary, setSummary] = useState(null);
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const fetchEarningsData = async () => {
    try {
      const token = localStorage.getItem('dmf_token');
      const artistId = localStorage.getItem('artist_id') || 'artist1';

      const [summaryRes, statementsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/royalties/summary?artistId=${artistId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/api/royalties/statements?artistId=${artistId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setSummary(summaryRes.data);
      setStatements(statementsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch earnings data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.container}><p>Loading earnings data...</p></div>;

  return (
    <div style={styles.container}>
      <h1>Earnings Dashboard</h1>

      {error && <div style={styles.error}>{error}</div>}

      {summary && (
        <>
          <div style={styles.summaryGrid}>
            <div style={styles.card}>
              <div style={styles.label}>Lifetime Earnings</div>
              <div style={styles.value}>${summary.lifetimeEarnings.toFixed(2)}</div>
            </div>

            <div style={styles.card}>
              <div style={styles.label}>Current Period</div>
              <div style={styles.value}>${summary.currentPeriodEarnings.toFixed(2)}</div>
            </div>

            <div style={styles.card}>
              <div style={styles.label}>Pending Payouts</div>
              <div style={styles.value}>${summary.pendingPayouts.toFixed(2)}</div>
            </div>

            <div style={styles.card}>
              <div style={styles.label}>Total Statements</div>
              <div style={styles.value}>{summary.totalStatements}</div>
            </div>
          </div>

          <div style={styles.statementsSection}>
            <h2>Statement History</h2>

            {statements.length === 0 ? (
              <div style={styles.empty}>No statements yet</div>
            ) : (
              <div style={styles.table}>
                <div style={styles.tableHeader}>
                  <div style={styles.col25}>Period</div>
                  <div style={styles.col20}>Gross Revenue</div>
                  <div style={styles.col20}>DMF Cut</div>
                  <div style={styles.col20}>Net Earnings</div>
                  <div style={styles.col15}>Status</div>
                </div>

                {statements.map(stmt => (
                  <div key={stmt.id} style={styles.tableRow}>
                    <div style={styles.col25}>
                      {new Date(stmt.periodStart).toLocaleDateString()} to{' '}
                      {new Date(stmt.periodEnd).toLocaleDateString()}
                    </div>
                    <div style={styles.col20}>${stmt.grossRevenue.toFixed(2)}</div>
                    <div style={styles.col20}>${stmt.distributorCutAmount.toFixed(2)}</div>
                    <div style={styles.col20} style={{ fontWeight: 'bold', color: '#4CAF50' }}>
                      ${stmt.netToArtist.toFixed(2)}
                    </div>
                    <div style={styles.col15}>
                      <span style={styles[`status_${stmt.status.toLowerCase()}`]}>
                        {stmt.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  error: {
    padding: '15px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '4px',
    marginBottom: '20px'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '40px'
  },
  card: {
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    border: '1px solid #ddd'
  },
  label: {
    fontSize: '12px',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: '10px'
  },
  value: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333'
  },
  statementsSection: {
    marginTop: '40px'
  },
  table: {
    border: '1px solid #ddd',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  tableHeader: {
    display: 'flex',
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #ddd',
    fontWeight: 'bold',
    fontSize: '13px'
  },
  tableRow: {
    display: 'flex',
    borderBottom: '1px solid #eee',
    padding: '12px 0',
    alignItems: 'center'
  },
  col25: {
    flex: '0 0 25%',
    padding: '0 15px'
  },
  col20: {
    flex: '0 0 20%',
    padding: '0 15px'
  },
  col15: {
    flex: '0 0 15%',
    padding: '0 15px'
  },
  empty: {
    padding: '40px',
    textAlign: 'center',
    color: '#999',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px'
  },
  status_draft: {
    padding: '4px 8px',
    backgroundColor: '#ccc',
    color: '#333',
    borderRadius: '3px',
    fontSize: '11px',
    fontWeight: 'bold'
  },
  status_finalized: {
    padding: '4px 8px',
    backgroundColor: '#ffc107',
    color: '#333',
    borderRadius: '3px',
    fontSize: '11px',
    fontWeight: 'bold'
  },
  status_paid: {
    padding: '4px 8px',
    backgroundColor: '#4CAF50',
    color: 'white',
    borderRadius: '3px',
    fontSize: '11px',
    fontWeight: 'bold'
  }
};
