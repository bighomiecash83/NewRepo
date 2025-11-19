import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminReleaseBoard() {
  const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
  const [statusFilter, setStatusFilter] = useState('draft');
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRelease, setSelectedRelease] = useState(null);

  useEffect(() => {
    fetchReleasesByStatus(statusFilter);
  }, [statusFilter]);

  const fetchReleasesByStatus = async (status) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('dmf_token');
      const response = await axios.get(
        `${API_BASE}/api/releases?status=${status}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReleases(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch releases');
    } finally {
      setLoading(false);
    }
  };

  const updateReleaseStatus = async (releaseId, newStatus) => {
    try {
      const token = localStorage.getItem('dmf_token');
      await axios.patch(
        `${API_BASE}/api/releases/${releaseId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refetch releases
      await fetchReleasesByStatus(statusFilter);
      setSelectedRelease(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const statuses = ['draft', 'qc_in_progress', 'qc_failed', 'ready_for_delivery', 'delivered'];

  const getStatusColor = (status) => {
    const colors = {
      draft: '#999',
      qc_in_progress: '#ff9800',
      qc_failed: '#f44336',
      ready_for_delivery: '#4CAF50',
      delivered: '#2196F3'
    };
    return colors[status] || '#999';
  };

  if (loading) return <div style={styles.container}><p>Loading...</p></div>;

  return (
    <div style={styles.container}>
      <h1>Release Board</h1>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.filterBar}>
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              ...styles.filterButton,
              backgroundColor: statusFilter === status ? getStatusColor(status) : '#ddd',
              color: statusFilter === status ? 'white' : '#333'
            }}
          >
            {status.replace(/_/g, ' ').toUpperCase()}
          </button>
        ))}
      </div>

      <div style={styles.releaseTable}>
        <div style={styles.tableHeader}>
          <div style={styles.col20}>Title</div>
          <div style={styles.col20}>Artist</div>
          <div style={styles.col15}>Tracks</div>
          <div style={styles.col15}>Status</div>
          <div style={styles.col15}>QC Score</div>
          <div style={styles.col15}>Actions</div>
        </div>

        {releases.length === 0 ? (
          <div style={styles.empty}>No releases in this status</div>
        ) : (
          releases.map(release => (
            <div key={release.id} style={styles.tableRow}>
              <div style={styles.col20}>{release.title}</div>
              <div style={styles.col20}>{release.primaryArtist}</div>
              <div style={styles.col15}>{release.tracks?.length || 0}</div>
              <div style={styles.col15}>
                <span style={{ ...styles.statusBadge, backgroundColor: getStatusColor(release.status) }}>
                  {release.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div style={styles.col15}>
                {release.qcResult ? `${release.qcResult.score}/100` : '-'}
              </div>
              <div style={styles.col15}>
                <button
                  onClick={() => setSelectedRelease(release)}
                  style={styles.detailsButton}
                >
                  Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedRelease && (
        <div style={styles.modal} onClick={() => setSelectedRelease(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2>{selectedRelease.title}</h2>
            <p><strong>Artist:</strong> {selectedRelease.primaryArtist}</p>
            <p><strong>Release Type:</strong> {selectedRelease.releaseType}</p>
            <p><strong>Tracks:</strong> {selectedRelease.tracks?.length || 0}</p>
            
            {selectedRelease.qcResult && (
              <div style={styles.qcDetails}>
                <h3>QC Findings</h3>
                <p>Score: {selectedRelease.qcResult.score}/100</p>
                {selectedRelease.qcResult.findings.length > 0 ? (
                  <ul>
                    {selectedRelease.qcResult.findings.map((finding, idx) => (
                      <li key={idx}>
                        <strong>{finding.code}</strong> ({finding.severity}): {finding.message}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>✅ No issues found</p>
                )}
              </div>
            )}

            <div style={styles.actions}>
              <h3>Status Management</h3>
              {statuses.map(status => (
                <button
                  key={status}
                  onClick={() => updateReleaseStatus(selectedRelease.id, status)}
                  style={{
                    ...styles.actionButton,
                    backgroundColor: getStatusColor(status)
                  }}
                >
                  Set to {status.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <button onClick={() => setSelectedRelease(null)} style={styles.closeButton}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  error: {
    padding: '10px',
    margin: '20px 0',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '4px'
  },
  filterBar: {
    display: 'flex',
    gap: '10px',
    margin: '20px 0',
    flexWrap: 'wrap'
  },
  filterButton: {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  releaseTable: {
    border: '1px solid #ddd',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  tableHeader: {
    display: 'flex',
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #ddd',
    fontWeight: 'bold'
  },
  tableRow: {
    display: 'flex',
    borderBottom: '1px solid #ddd',
    alignItems: 'center',
    padding: '10px 0',
    backgroundColor: 'white',
    ':hover': {
      backgroundColor: '#f9f9f9'
    }
  },
  col20: {
    flex: '0 0 20%',
    padding: '10px',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  col15: {
    flex: '0 0 15%',
    padding: '10px'
  },
  statusBadge: {
    color: 'white',
    padding: '4px 8px',
    borderRadius: '3px',
    fontSize: '12px',
    display: 'inline-block'
  },
  detailsButton: {
    padding: '5px 10px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  empty: {
    padding: '20px',
    textAlign: 'center',
    color: '#999'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflow: 'auto'
  },
  qcDetails: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px'
  },
  actions: {
    marginTop: '20px'
  },
  actionButton: {
    padding: '8px 15px',
    margin: '5px',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  closeButton: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#999',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};
