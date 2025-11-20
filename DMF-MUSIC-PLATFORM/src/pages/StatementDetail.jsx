import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export default function StatementDetail() {
  const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
  const { statementId } = useParams();
  const [statement, setStatement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatement();
  }, [statementId]);

  const fetchStatement = async () => {
    try {
      const token = localStorage.getItem('dmf_token');
      const response = await axios.get(`${API_BASE}/api/royalties/statements/${statementId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatement(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch statement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.container}><p>Loading statement...</p></div>;
  if (error) return <div style={styles.container}><div style={styles.error}>{error}</div></div>;
  if (!statement) return <div style={styles.container}><p>Statement not found</p></div>;

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();
  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

  return (
    <div style={styles.container}>
      <h1>Royalty Statement</h1>

      <div style={styles.header}>
        <div>
          <h2>Period: {formatDate(statement.periodStart)} to {formatDate(statement.periodEnd)}</h2>
          <p style={styles.statementId}>Statement ID: {statement.id}</p>
        </div>
        <div style={styles.statusBadge(statement.status)}>
          {statement.status.replace(/_/g, ' ').toUpperCase()}
        </div>
      </div>

      <div style={styles.summaryCards}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Gross Revenue</div>
          <div style={styles.summaryValue}>{formatCurrency(statement.grossRevenue)}</div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>
            DMF Cut ({statement.distributorCutPercent}%)
          </div>
          <div style={styles.summaryValue} style={{ color: '#ff9800' }}>
            {formatCurrency(statement.distributorCutAmount)}
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Your Earnings</div>
          <div style={styles.summaryValue} style={{ color: '#4CAF50' }}>
            {formatCurrency(statement.netToArtist)}
          </div>
        </div>

        {statement.payout && (
          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Payout Status</div>
            <div style={styles.summaryValue}>{statement.payout.status}</div>
            <p style={styles.payoutDate}>
              Scheduled: {formatDate(statement.payout.scheduledFor)}
            </p>
          </div>
        )}
      </div>

      <div style={styles.lineItemsSection}>
        <h2>Revenue Breakdown</h2>

        <div style={styles.lineItemTable}>
          <div style={styles.lineItemHeader}>
            <div style={styles.col20}>Release / Track</div>
            <div style={styles.col15}>Source</div>
            <div style={styles.col12}>Territory</div>
            <div style={styles.col12}>Streams</div>
            <div style={styles.col13}>Revenue</div>
            <div style={styles.col13}>Your Share</div>
          </div>

          {statement.lineItems && statement.lineItems.map((item, index) => (
            <div key={index} style={styles.lineItemRow}>
              <div style={styles.col20}>
                <div style={styles.trackTitle}>{item.trackTitle}</div>
                <div style={styles.trackId}>{item.releaseId}</div>
              </div>
              <div style={styles.col15}>{item.source}</div>
              <div style={styles.col12}>{item.territory}</div>
              <div style={styles.col12}>{item.streams.toLocaleString()}</div>
              <div style={styles.col13}>{formatCurrency(item.revenue)}</div>
              <div style={styles.col13} style={{ fontWeight: 'bold', color: '#4CAF50' }}>
                {formatCurrency(item.netToArtist)}
              </div>
            </div>
          ))}
        </div>

        <div style={styles.lineItemTotal}>
          <div style={styles.totalLabel}>Total</div>
          <div style={styles.totalValue}>{formatCurrency(statement.netToArtist)}</div>
        </div>
      </div>

      {statement.lineItems && statement.lineItems.some(item => item.splits && item.splits.length > 0) && (
        <div style={styles.splitsSection}>
          <h2>Ownership Splits</h2>
          <p style={styles.splitsNote}>
            For tracks with multiple artists, payments are distributed as follows:
          </p>

          {statement.lineItems
            .filter(item => item.splits && item.splits.length > 0)
            .map((item, index) => (
              <div key={index} style={styles.splitGroup}>
                <h4>{item.trackTitle}</h4>
                <div style={styles.splitTable}>
                  {item.splits.map((split, idx) => (
                    <div key={idx} style={styles.splitRow}>
                      <span>{split.participantName} ({split.sharePercent}%)</span>
                      <span style={{ fontWeight: 'bold' }}>
                        {formatCurrency(split.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      <div style={styles.footer}>
        <p style={styles.generatedAt}>
          Generated on {formatDate(statement.createdAt)}
          {statement.finalizedAt && (
            <> • Finalized on {formatDate(statement.finalizedAt)}</>
          )}
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  error: {
    padding: '15px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '4px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid #ddd'
  },
  statementId: {
    fontSize: '12px',
    color: '#999',
    margin: '5px 0 0 0'
  },
  statusBadge: (status) => ({
    padding: '10px 15px',
    backgroundColor: status === 'Paid' ? '#4CAF50' : status === 'Finalized' ? '#ffc107' : '#ccc',
    color: status === 'Paid' || status === 'Draft' ? 'white' : '#333',
    borderRadius: '4px',
    fontWeight: 'bold',
    fontSize: '14px'
  }),
  summaryCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '40px'
  },
  summaryCard: {
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    border: '1px solid #ddd'
  },
  summaryLabel: {
    fontSize: '12px',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: '8px'
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333'
  },
  payoutDate: {
    fontSize: '11px',
    color: '#999',
    margin: '5px 0 0 0'
  },
  lineItemsSection: {
    marginBottom: '40px'
  },
  lineItemTable: {
    border: '1px solid #ddd',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  lineItemHeader: {
    display: 'flex',
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #ddd',
    fontWeight: 'bold',
    fontSize: '12px',
    padding: '12px 0'
  },
  lineItemRow: {
    display: 'flex',
    borderBottom: '1px solid #eee',
    padding: '15px 0',
    alignItems: 'center'
  },
  col20: {
    flex: '0 0 20%',
    padding: '0 15px'
  },
  col15: {
    flex: '0 0 15%',
    padding: '0 15px',
    fontSize: '13px'
  },
  col12: {
    flex: '0 0 12%',
    padding: '0 15px',
    fontSize: '13px',
    textAlign: 'right'
  },
  col13: {
    flex: '0 0 13%',
    padding: '0 15px',
    fontSize: '13px',
    textAlign: 'right'
  },
  trackTitle: {
    fontWeight: 'bold',
    fontSize: '13px'
  },
  trackId: {
    fontSize: '11px',
    color: '#999'
  },
  lineItemTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '20px 15px',
    backgroundColor: '#f5f5f5',
    borderTop: '2px solid #ddd',
    fontWeight: 'bold'
  },
  totalLabel: {
    fontSize: '14px'
  },
  totalValue: {
    fontSize: '18px',
    color: '#4CAF50'
  },
  splitsSection: {
    marginBottom: '40px'
  },
  splitsNote: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '20px'
  },
  splitGroup: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px'
  },
  splitTable: {
    marginTop: '10px'
  },
  splitRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #eee',
    fontSize: '13px'
  },
  footer: {
    textAlign: 'center',
    paddingTop: '20px',
    borderTop: '1px solid #ddd'
  },
  generatedAt: {
    fontSize: '11px',
    color: '#999'
  }
};
