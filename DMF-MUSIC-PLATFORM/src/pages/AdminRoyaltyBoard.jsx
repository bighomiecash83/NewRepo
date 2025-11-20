import React, { useState } from 'react';
import axios from 'axios';

export default function AdminRoyaltyBoard() {
  const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [generatedStatements, setGeneratedStatements] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGenerateStatements = async () => {
    setError('');
    setSuccess('');

    if (!periodStart || !periodEnd) {
      setError('Please select both start and end dates');
      return;
    }

    if (new Date(periodStart) >= new Date(periodEnd)) {
      setError('End date must be after start date');
      return;
    }

    setGenerating(true);
    try {
      const token = localStorage.getItem('dmf_token');
      const response = await axios.post(
        `${API_BASE}/api/royalties/admin/generate`,
        {
          periodStart: periodStart,
          periodEnd: periodEnd
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setGeneratedStatements(response.data);
      setSuccess(`Successfully generated ${response.data.statementsCreated} statements`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate statements');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Admin Royalty Board</h1>

      {error && <div style={styles.errorBox}>{error}</div>}
      {success && <div style={styles.successBox}>{success}</div>}

      <div style={styles.generatorSection}>
        <h2>Generate Statements</h2>

        <div style={styles.formGroup}>
          <div style={styles.formField}>
            <label>Period Start</label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.formField}>
            <label>Period End</label>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              style={styles.input}
            />
          </div>

          <button
            onClick={handleGenerateStatements}
            disabled={generating}
            style={styles.generateButton}
          >
            {generating ? 'Generating...' : 'Generate Statements'}
          </button>
        </div>
      </div>

      {generatedStatements && (
        <div style={styles.resultsSection}>
          <h2>Generation Results</h2>

          <div style={styles.resultsSummary}>
            <div style={styles.resultCard}>
              <div style={styles.resultLabel}>Statements Created</div>
              <div style={styles.resultValue}>{generatedStatements.statementsCreated}</div>
            </div>

            <div style={styles.resultCard}>
              <div style={styles.resultLabel}>Total Gross Revenue</div>
              <div style={styles.resultValue}>
                ${generatedStatements.totalGrossRevenue.toFixed(2)}
              </div>
            </div>

            <div style={styles.resultCard}>
              <div style={styles.resultLabel}>DMF Cut (Total)</div>
              <div style={styles.resultValue} style={{ color: '#ff9800' }}>
                ${generatedStatements.totalDistributorCut.toFixed(2)}
              </div>
            </div>

            <div style={styles.resultCard}>
              <div style={styles.resultLabel}>Total to Artists</div>
              <div style={styles.resultValue} style={{ color: '#4CAF50' }}>
                ${generatedStatements.totalNetToArtists.toFixed(2)}
              </div>
            </div>
          </div>

          <div style={styles.artistsSection}>
            <h3>Artists Processed</h3>
            <div style={styles.artistList}>
              {generatedStatements.artistIds.map((artistId, index) => (
                <div key={index} style={styles.artistItem}>
                  ✓ {artistId}
                </div>
              ))}
            </div>
          </div>

          <div style={styles.actions}>
            <button style={styles.actionButton}>
              Export Report
            </button>
            <button style={styles.actionButton}>
              View Statements
            </button>
            <button style={styles.actionButton}>
              Finalize All
            </button>
          </div>
        </div>
      )}

      <div style={styles.infoSection}>
        <h2>Workflow</h2>
        <div style={styles.steps}>
          <div style={styles.step}>
            <div style={styles.stepNumber}>1</div>
            <div style={styles.stepContent}>
              <strong>Generate</strong>
              <p>Create royalty statements for artists for a given period</p>
            </div>
          </div>

          <div style={styles.step}>
            <div style={styles.stepNumber}>2</div>
            <div style={styles.stepContent}>
              <strong>Review</strong>
              <p>Check statement details, line items, and calculations</p>
            </div>
          </div>

          <div style={styles.step}>
            <div style={styles.stepNumber}>3</div>
            <div style={styles.stepContent}>
              <strong>Finalize</strong>
              <p>Approve statements and lock them for payout</p>
            </div>
          </div>

          <div style={styles.step}>
            <div style={styles.stepNumber}>4</div>
            <div style={styles.stepContent}>
              <strong>Payout</strong>
              <p>Schedule and process artist payments</p>
            </div>
          </div>
        </div>
      </div>
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
  errorBox: {
    padding: '15px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '4px',
    marginBottom: '20px'
  },
  successBox: {
    padding: '15px',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    borderRadius: '4px',
    marginBottom: '20px'
  },
  generatorSection: {
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    marginBottom: '30px'
  },
  formGroup: {
    display: 'flex',
    gap: '15px',
    alignItems: 'flex-end',
    flexWrap: 'wrap'
  },
  formField: {
    flex: '1',
    minWidth: '150px'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  generateButton: {
    padding: '10px 30px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  resultsSection: {
    marginBottom: '40px'
  },
  resultsSummary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '30px'
  },
  resultCard: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    border: '1px solid #ddd'
  },
  resultLabel: {
    fontSize: '12px',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: '8px'
  },
  resultValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333'
  },
  artistsSection: {
    marginBottom: '30px'
  },
  artistList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '10px',
    marginTop: '15px'
  },
  artistItem: {
    padding: '10px',
    backgroundColor: '#e8f5e9',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#2e7d32'
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  },
  actionButton: {
    padding: '10px 20px',
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  infoSection: {
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px'
  },
  steps: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '15px'
  },
  step: {
    display: 'flex',
    gap: '15px'
  },
  stepNumber: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    backgroundColor: '#2196F3',
    color: 'white',
    borderRadius: '50%',
    fontWeight: 'bold',
    fontSize: '16px',
    flexShrink: 0
  },
  stepContent: {
    flex: 1
  }
};
