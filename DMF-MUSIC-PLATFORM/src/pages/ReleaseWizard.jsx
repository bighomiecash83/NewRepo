import React, { useState } from 'react';
import axios from 'axios';

export default function ReleaseWizard() {
  const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

  const [step, setStep] = useState(1); // 1: basic info, 2: tracks, 3: review
  const [releaseId, setReleaseId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    primaryArtist: '',
    releaseDate: '',
    description: '',
    coverArtUrl: '',
    releaseType: 'single'
  });

  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState({
    title: '',
    audioUrl: '',
    duration: '',
    isrc: '',
    explicitFlag: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qcResult, setQcResult] = useState(null);

  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTrackChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentTrack(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addTrack = () => {
    if (!currentTrack.title || !currentTrack.audioUrl || !currentTrack.duration) {
      setError('Track title, URL, and duration are required');
      return;
    }
    setTracks([...tracks, { ...currentTrack, durationSeconds: parseInt(currentTrack.duration) }]);
    setCurrentTrack({
      title: '',
      audioUrl: '',
      duration: '',
      isrc: '',
      explicitFlag: false
    });
  };

  const removeTrack = (index) => {
    setTracks(tracks.filter((_, i) => i !== index));
  };

  const submitBasicInfo = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('dmf_token');
      const response = await axios.post(`${API_BASE}/api/releases`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReleaseId(response.data.id);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create release');
    } finally {
      setLoading(false);
    }
  };

  const submitTracks = async () => {
    if (tracks.length === 0) {
      setError('At least one track is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('dmf_token');
      await axios.post(
        `${API_BASE}/api/releases/${releaseId}/tracks`,
        { tracks },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add tracks');
    } finally {
      setLoading(false);
    }
  };

  const runQC = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('dmf_token');
      const response = await axios.post(
        `${API_BASE}/api/releases/${releaseId}/run-qc`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQcResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to run QC');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Release Wizard</h1>
      
      <div style={styles.steps}>
        <div style={step >= 1 ? styles.stepActive : styles.stepInactive}>Step 1: Basic Info</div>
        <div style={step >= 2 ? styles.stepActive : styles.stepInactive}>Step 2: Tracks</div>
        <div style={step >= 3 ? styles.stepActive : styles.stepInactive}>Step 3: QC</div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* STEP 1: Basic Info */}
      {step === 1 && (
        <div style={styles.formSection}>
          <h2>Release Details</h2>
          <input
            type="text"
            name="title"
            placeholder="Release Title"
            value={formData.title}
            onChange={handleBasicInfoChange}
            style={styles.input}
          />
          <input
            type="text"
            name="primaryArtist"
            placeholder="Primary Artist"
            value={formData.primaryArtist}
            onChange={handleBasicInfoChange}
            style={styles.input}
          />
          <input
            type="date"
            name="releaseDate"
            value={formData.releaseDate}
            onChange={handleBasicInfoChange}
            style={styles.input}
          />
          <textarea
            name="description"
            placeholder="Description (optional)"
            value={formData.description}
            onChange={handleBasicInfoChange}
            style={styles.textarea}
          />
          <input
            type="url"
            name="coverArtUrl"
            placeholder="Cover Art URL (optional)"
            value={formData.coverArtUrl}
            onChange={handleBasicInfoChange}
            style={styles.input}
          />
          <select name="releaseType" value={formData.releaseType} onChange={handleBasicInfoChange} style={styles.input}>
            <option>single</option>
            <option>ep</option>
            <option>album</option>
            <option>mixtape</option>
          </select>
          <button onClick={submitBasicInfo} disabled={loading} style={styles.button}>
            {loading ? 'Creating...' : 'Next: Add Tracks'}
          </button>
        </div>
      )}

      {/* STEP 2: Tracks */}
      {step === 2 && (
        <div style={styles.formSection}>
          <h2>Add Tracks ({tracks.length})</h2>
          
          <div style={styles.trackForm}>
            <input
              type="text"
              name="title"
              placeholder="Track Title"
              value={currentTrack.title}
              onChange={handleTrackChange}
              style={styles.input}
            />
            <input
              type="url"
              name="audioUrl"
              placeholder="Audio File URL"
              value={currentTrack.audioUrl}
              onChange={handleTrackChange}
              style={styles.input}
            />
            <input
              type="number"
              name="duration"
              placeholder="Duration (seconds)"
              value={currentTrack.duration}
              onChange={handleTrackChange}
              style={styles.input}
            />
            <input
              type="text"
              name="isrc"
              placeholder="ISRC Code (optional)"
              value={currentTrack.isrc}
              onChange={handleTrackChange}
              style={styles.input}
            />
            <label>
              <input
                type="checkbox"
                name="explicitFlag"
                checked={currentTrack.explicitFlag}
                onChange={handleTrackChange}
              />
              Mark as Explicit
            </label>
            <button onClick={addTrack} style={styles.button}>Add Track</button>
          </div>

          <div style={styles.trackList}>
            {tracks.map((track, index) => (
              <div key={index} style={styles.trackItem}>
                <span>{track.title} ({track.durationSeconds}s)</span>
                <button onClick={() => removeTrack(index)} style={styles.removeButton}>Remove</button>
              </div>
            ))}
          </div>

          <button
            onClick={submitTracks}
            disabled={loading || tracks.length === 0}
            style={styles.button}
          >
            {loading ? 'Saving...' : 'Next: Review & QC'}
          </button>
        </div>
      )}

      {/* STEP 3: QC */}
      {step === 3 && (
        <div style={styles.formSection}>
          <h2>Quality Control</h2>
          <p>Release ID: {releaseId}</p>
          <p>Tracks: {tracks.length}</p>

          {!qcResult ? (
            <button onClick={runQC} disabled={loading} style={styles.button}>
              {loading ? 'Running QC...' : 'Run Quality Check'}
            </button>
          ) : (
            <div style={styles.qcResult}>
              <h3>QC Result: {qcResult.status.toUpperCase()}</h3>
              <p>Score: {qcResult.score}/100</p>
              {qcResult.findings && qcResult.findings.length > 0 ? (
                <div>
                  <h4>Findings:</h4>
                  {qcResult.findings.map((finding, index) => (
                    <div key={index} style={styles[`finding_${finding.severity}`]}>
                      <strong>{finding.code}</strong>: {finding.message}
                    </div>
                  ))}
                </div>
              ) : (
                <p>✅ No issues found!</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  steps: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px'
  },
  stepActive: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    borderRadius: '4px'
  },
  stepInactive: {
    padding: '10px 20px',
    backgroundColor: '#ccc',
    color: '#666',
    borderRadius: '4px'
  },
  formSection: {
    border: '1px solid #ddd',
    padding: '20px',
    borderRadius: '4px'
  },
  input: {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '4px',
    border: '1px solid #ddd',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '4px',
    border: '1px solid #ddd',
    boxSizing: 'border-box',
    minHeight: '100px'
  },
  button: {
    padding: '10px 20px',
    margin: '10px 0',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  trackForm: {
    border: '1px solid #eee',
    padding: '15px',
    marginBottom: '20px',
    borderRadius: '4px'
  },
  trackList: {
    marginBottom: '20px'
  },
  trackItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    margin: '5px 0',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px'
  },
  removeButton: {
    padding: '5px 10px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  error: {
    padding: '10px',
    marginBottom: '20px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '4px'
  },
  qcResult: {
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px'
  },
  finding_critical: {
    padding: '10px',
    margin: '5px 0',
    backgroundColor: '#ffcdd2',
    borderLeft: '4px solid #f44336',
    borderRadius: '4px'
  },
  finding_error: {
    padding: '10px',
    margin: '5px 0',
    backgroundColor: '#ffe0b2',
    borderLeft: '4px solid #ff9800',
    borderRadius: '4px'
  },
  finding_warning: {
    padding: '10px',
    margin: '5px 0',
    backgroundColor: '#fff9c4',
    borderLeft: '4px solid #fbc02d',
    borderRadius: '4px'
  },
  finding_info: {
    padding: '10px',
    margin: '5px 0',
    backgroundColor: '#e3f2fd',
    borderLeft: '4px solid #2196F3',
    borderRadius: '4px'
  }
};
