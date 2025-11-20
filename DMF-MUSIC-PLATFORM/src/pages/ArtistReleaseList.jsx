import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ArtistReleaseList() {
  const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReleases();
  }, []);

  const fetchReleases = async () => {
    try {
      const token = localStorage.getItem('dmf_token');
      const artistId = localStorage.getItem('artist_id') || 'demo_artist';
      
      const response = await axios.get(
        `${API_BASE}/api/releases?artistId=${artistId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReleases(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch releases');
    } finally {
      setLoading(false);
    }
  };

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
  if (error) return <div style={styles.container}><div style={styles.error}>{error}</div></div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>My Releases</h1>
        <Link to="/releases/new" style={styles.createButton}>+ New Release</Link>
      </div>

      {releases.length === 0 ? (
        <div style={styles.empty}>
          <p>No releases yet. Create your first release to get started!</p>
        </div>
      ) : (
        <div style={styles.releaseGrid}>
          {releases.map(release => (
            <div key={release.id} style={styles.releaseCard}>
              {release.coverArtUrl && (
                <img src={release.coverArtUrl} alt={release.title} style={styles.coverArt} />
              )}
              <div style={styles.cardContent}>
                <h3>{release.title}</h3>
                <p style={styles.artist}>{release.primaryArtist}</p>
                <p style={styles.type}>{release.releaseType}</p>
                <div style={styles.meta}>
                  <span>{release.tracks?.length || 0} tracks</span>
                  <span style={{ ...styles.status, color: getStatusColor(release.status) }}>
                    {release.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                {release.qcResult && (
                  <div style={styles.qcScore}>
                    QC Score: {release.qcResult.score}/100
                  </div>
                )}
                <p style={styles.date}>
                  {new Date(release.releaseDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  },
  createButton: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '14px'
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    color: '#666'
  },
  releaseGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px'
  },
  releaseCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    ':hover': {
      transform: 'translateY(-2px)'
    }
  },
  coverArt: {
    width: '100%',
    height: '200px',
    objectFit: 'cover'
  },
  cardContent: {
    padding: '15px'
  },
  artist: {
    fontSize: '14px',
    color: '#666',
    margin: '5px 0'
  },
  type: {
    fontSize: '12px',
    color: '#999',
    margin: '5px 0',
    textTransform: 'uppercase'
  },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    margin: '10px 0',
    color: '#666'
  },
  status: {
    fontWeight: 'bold'
  },
  qcScore: {
    padding: '8px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    fontSize: '12px',
    margin: '10px 0'
  },
  date: {
    fontSize: '12px',
    color: '#999',
    margin: '5px 0'
  },
  error: {
    padding: '10px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '4px'
  }
};
