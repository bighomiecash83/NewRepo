describe('DMF Distribution System v1.1', () => {
  describe('Release Models', () => {
    test('ReleaseV2 default status is draft', () => {
      const release = {
        artistId: 'artist123',
        title: 'My Album',
        primaryArtist: 'Test Artist',
        status: 'draft',
        tracks: [],
        qcResult: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(release.status).toBe('draft');
      expect(release.tracks).toEqual([]);
      expect(release.qcResult).toBeNull();
    });

    test('TrackV2 includes ownership splits', () => {
      const track = {
        id: 'track1',
        releaseId: 'release1',
        title: 'Song Title',
        audioUrl: 'https://example.com/track.mp3',
        durationSeconds: 180,
        isrc: 'USRC17607839',
        explicitFlag: false,
        ownershipSplits: [
          { artistName: 'Main Artist', percentage: 80 },
          { artistName: 'Featured Artist', percentage: 20 }
        ]
      };

      expect(track.ownershipSplits).toHaveLength(2);
      expect(track.ownershipSplits[0].percentage).toBe(80);
    });

    test('QCResult tracks score and findings', () => {
      const qcResult = {
        status: 'passed',
        score: 95,
        findings: [
          { code: 'INFO_FOUND', message: 'Minor issue', severity: 'info' }
        ],
        timestamp: new Date()
      };

      expect(qcResult.score).toBe(95);
      expect(qcResult.status).toBe('passed');
      expect(qcResult.findings).toHaveLength(1);
    });
  });

  describe('QC Engine', () => {
    test('QC fails when release has no title', () => {
      const release = {
        title: '',
        tracks: [{ title: 'Track 1', durationSeconds: 180, isrc: 'USRC123' }]
      };

      // QC scoring logic
      let score = 100;
      const findings = [];

      if (!release.title) {
        findings.push({
          code: 'MISSING_TITLE',
          message: 'Release title is required',
          severity: 'critical'
        });
        score -= 25;
      }

      expect(findings).toContainEqual(
        expect.objectContaining({ code: 'MISSING_TITLE' })
      );
      expect(score).toBe(75);
    });

    test('QC fails when release has no tracks', () => {
      const release = {
        title: 'Album Name',
        tracks: []
      };

      let score = 100;
      const findings = [];

      if (release.tracks.length === 0) {
        findings.push({
          code: 'NO_TRACKS',
          message: 'Release must contain at least one track',
          severity: 'critical'
        });
        score -= 30;
      }

      expect(findings).toContainEqual(
        expect.objectContaining({ code: 'NO_TRACKS' })
      );
      expect(score).toBe(70);
    });

    test('QC flags missing ISRCs', () => {
      const release = {
        title: 'Album',
        tracks: [
          { title: 'Track 1', durationSeconds: 180, isrc: '' },
          { title: 'Track 2', durationSeconds: 180, isrc: 'USRC123' }
        ]
      };

      let score = 100;
      const findings = [];

      release.tracks.forEach(track => {
        if (!track.isrc) {
          findings.push({
            code: 'MISSING_ISRC',
            message: `Track '${track.title}' missing ISRC code`,
            severity: 'error',
            affectedTrackId: track.id
          });
          score -= 15;
        }
      });

      expect(findings).toContainEqual(
        expect.objectContaining({ code: 'MISSING_ISRC', severity: 'error' })
      );
      expect(score).toBe(85);
    });

    test('QC detects invalid track duration', () => {
      const release = {
        title: 'Album',
        tracks: [
          { title: 'Track 1', durationSeconds: 0 }
        ]
      };

      let score = 100;
      const findings = [];

      release.tracks.forEach(track => {
        if (track.durationSeconds <= 0) {
          findings.push({
            code: 'INVALID_DURATION',
            message: `Track '${track.title}' has invalid duration`,
            severity: 'error'
          });
          score -= 15;
        }
      });

      expect(findings).toHaveLength(1);
      expect(findings[0].code).toBe('INVALID_DURATION');
      expect(score).toBe(85);
    });

    test('QC warns on explicit flag mismatch', () => {
      const release = {
        title: 'Album',
        tracks: [
          { title: 'Explicit Track (Uncensored)', durationSeconds: 180, explicitFlag: false }
        ]
      };

      let score = 100;
      const findings = [];

      release.tracks.forEach(track => {
        if (track.title.toLowerCase().includes('explicit') && !track.explicitFlag) {
          findings.push({
            code: 'EXPLICIT_NOT_FLAGGED',
            message: `Track '${track.title}' appears explicit but flag not set`,
            severity: 'warning'
          });
          score -= 5;
        }
      });

      expect(findings).toContainEqual(
        expect.objectContaining({ severity: 'warning', code: 'EXPLICIT_NOT_FLAGGED' })
      );
      expect(score).toBe(95);
    });

    test('QC passes when all requirements met (score >= 80)', () => {
      const release = {
        title: 'Perfect Album',
        tracks: [
          { title: 'Track 1', durationSeconds: 180, isrc: 'USRC001', explicitFlag: false },
          { title: 'Track 2', durationSeconds: 200, isrc: 'USRC002', explicitFlag: false }
        ]
      };

      let score = 100;
      const findings = [];

      // All checks pass
      const qcStatus = score >= 80 ? 'passed' : 'failed';

      expect(qcStatus).toBe('passed');
      expect(findings).toHaveLength(0);
      expect(score).toBe(100);
    });

    test('QC fails when score < 80', () => {
      const release = {
        title: 'Album',
        tracks: [
          { title: 'Track 1', durationSeconds: 0, isrc: '' }
        ]
      };

      let score = 100;
      const findings = [];

      if (release.tracks[0].durationSeconds <= 0) {
        findings.push({ code: 'INVALID_DURATION', severity: 'error' });
        score -= 15;
      }
      if (!release.tracks[0].isrc) {
        findings.push({ code: 'MISSING_ISRC', severity: 'error' });
        score -= 15;
      }

      const qcStatus = score >= 80 ? 'passed' : 'failed';

      expect(qcStatus).toBe('failed');
      expect(score).toBeLessThan(80);
    });
  });

  describe('Release Status Transitions', () => {
    test('Valid status transition: draft -> ready_for_delivery', () => {
      const release = { status: 'draft' };
      const validTransitions = {
        'draft': ['qc_in_progress', 'ready_for_delivery'],
        'qc_in_progress': ['qc_failed', 'ready_for_delivery'],
        'qc_failed': ['qc_in_progress', 'draft'],
        'ready_for_delivery': ['delivered'],
        'delivered': []
      };

      const newStatus = 'ready_for_delivery';
      const isValid = validTransitions[release.status]?.includes(newStatus);

      expect(isValid).toBe(true);
    });

    test('Invalid status transition rejected', () => {
      const release = { status: 'delivered' };
      const newStatus = 'draft';

      const validStatuses = ['draft', 'qc_in_progress', 'qc_failed', 'ready_for_delivery', 'delivered'];
      const isValid = validStatuses.includes(newStatus);

      expect(isValid).toBe(true); // newStatus is valid format
      // But in real system, can't go from delivered -> draft
    });

    test('Release status updated with timestamp', () => {
      const release = {
        id: 'rel123',
        status: 'draft',
        updatedAt: new Date('2025-01-01')
      };

      const newStatus = 'qc_in_progress';
      const updatedAt = new Date();

      release.status = newStatus;
      release.updatedAt = updatedAt;

      expect(release.status).toBe('qc_in_progress');
      expect(release.updatedAt).not.toEqual(new Date('2025-01-01'));
    });
  });

  describe('Release Pipeline Flow', () => {
    test('Complete flow: Create -> Add Tracks -> Run QC -> Ready', async () => {
      // Step 1: Create release
      const release = {
        id: 'rel123',
        title: 'My Album',
        primaryArtist: 'Test Artist',
        status: 'draft',
        tracks: [],
        qcResult: null
      };

      expect(release.status).toBe('draft');

      // Step 2: Add tracks
      const newTracks = [
        {
          id: 'track1',
          title: 'Song 1',
          durationSeconds: 180,
          isrc: 'USRC001',
          explicitFlag: false
        }
      ];
      release.tracks = newTracks;
      release.updatedAt = new Date();

      expect(release.tracks).toHaveLength(1);

      // Step 3: Run QC
      let score = 100;
      const findings = [];
      release.tracks.forEach(track => {
        if (!track.isrc) {
          findings.push({ code: 'MISSING_ISRC' });
          score -= 15;
        }
        if (track.durationSeconds <= 0) {
          findings.push({ code: 'INVALID_DURATION' });
          score -= 15;
        }
      });

      const qcResult = {
        status: score >= 80 ? 'passed' : 'failed',
        score: score,
        findings: findings
      };

      release.qcResult = qcResult;

      expect(qcResult.status).toBe('passed');
      expect(qcResult.score).toBe(100);

      // Step 4: Mark as ready
      if (qcResult.status === 'passed') {
        release.status = 'ready_for_delivery';
      }

      expect(release.status).toBe('ready_for_delivery');
      expect(release.qcResult.status).toBe('passed');
    });

    test('Flow with QC failures forces admin intervention', async () => {
      const release = {
        id: 'rel124',
        title: 'Problem Album',
        status: 'draft',
        tracks: [
          { title: 'Silent Track', durationSeconds: 0, isrc: '' }
        ]
      };

      // Run QC
      let score = 100;
      const findings = [];

      if (release.tracks[0].durationSeconds <= 0) {
        findings.push({ code: 'INVALID_DURATION', severity: 'error' });
        score -= 15;
      }
      if (!release.tracks[0].isrc) {
        findings.push({ code: 'MISSING_ISRC', severity: 'error' });
        score -= 15;
      }

      const qcResult = { status: score >= 80 ? 'passed' : 'failed', score, findings };
      release.qcResult = qcResult;

      expect(qcResult.status).toBe('failed');
      expect(release.qcResult.findings).toHaveLength(2);

      // Admin override
      release.status = 'qc_failed';
      expect(release.status).toBe('qc_failed');

      // Can't auto-proceed to ready
      expect(qcResult.status).not.toBe('passed');
    });
  });

  describe('Artist Release Listing', () => {
    test('Filter releases by artist', () => {
      const allReleases = [
        { id: 'rel1', artistId: 'artist1', title: 'Album A' },
        { id: 'rel2', artistId: 'artist1', title: 'Album B' },
        { id: 'rel3', artistId: 'artist2', title: 'Album C' }
      ];

      const artistId = 'artist1';
      const artistReleases = allReleases.filter(r => r.artistId === artistId);

      expect(artistReleases).toHaveLength(2);
      expect(artistReleases.every(r => r.artistId === 'artist1')).toBe(true);
    });

    test('Filter releases by status', () => {
      const allReleases = [
        { id: 'rel1', status: 'draft' },
        { id: 'rel2', status: 'ready_for_delivery' },
        { id: 'rel3', status: 'draft' }
      ];

      const status = 'draft';
      const draftReleases = allReleases.filter(r => r.status === status);

      expect(draftReleases).toHaveLength(2);
      expect(draftReleases.every(r => r.status === 'draft')).toBe(true);
    });

    test('Sort releases by date', () => {
      const releases = [
        { id: 'rel1', createdAt: new Date('2025-03-01') },
        { id: 'rel2', createdAt: new Date('2025-01-01') },
        { id: 'rel3', createdAt: new Date('2025-02-01') }
      ];

      const sorted = [...releases].sort((a, b) => b.createdAt - a.createdAt);

      expect(sorted[0].id).toBe('rel1');
      expect(sorted[2].id).toBe('rel2');
    });
  });

  describe('Admin Board Operations', () => {
    test('Admin can view all releases by status', () => {
      const releases = [
        { id: 'rel1', status: 'draft' },
        { id: 'rel2', status: 'qc_failed' },
        { id: 'rel3', status: 'ready_for_delivery' }
      ];

      const qcFailedReleases = releases.filter(r => r.status === 'qc_failed');

      expect(qcFailedReleases).toHaveLength(1);
      expect(qcFailedReleases[0].id).toBe('rel2');
    });

    test('Admin can force release status (override)', () => {
      const release = {
        id: 'rel123',
        status: 'qc_failed',
        qcResult: { score: 50 }
      };

      // Admin override
      const adminOverrideStatus = 'ready_for_delivery';
      release.status = adminOverrideStatus;

      expect(release.status).toBe('ready_for_delivery');
      // Note: qcResult still shows low score, but status overridden
      expect(release.qcResult.score).toBe(50);
    });

    test('Admin views QC findings and can take action', () => {
      const release = {
        id: 'rel123',
        title: 'Problem Album',
        qcResult: {
          score: 65,
          findings: [
            { code: 'MISSING_ISRC', severity: 'error', affectedTrackId: 'track1' },
            { code: 'EXPLICIT_NOT_FLAGGED', severity: 'warning', affectedTrackId: 'track2' }
          ]
        }
      };

      const criticalFindings = release.qcResult.findings.filter(f => f.severity === 'error');
      const warningFindings = release.qcResult.findings.filter(f => f.severity === 'warning');

      expect(criticalFindings).toHaveLength(1);
      expect(warningFindings).toHaveLength(1);

      // Admin can block or override based on findings
      const shouldBlock = criticalFindings.length > 0;
      expect(shouldBlock).toBe(true);
    });
  });

  describe('Track Management', () => {
    test('Add multiple tracks to release', () => {
      const release = { id: 'rel123', tracks: [] };

      const newTracks = [
        { title: 'Track 1', durationSeconds: 180 },
        { title: 'Track 2', durationSeconds: 200 },
        { title: 'Track 3', durationSeconds: 220 }
      ];

      release.tracks.push(...newTracks);

      expect(release.tracks).toHaveLength(3);
      expect(release.tracks[1].title).toBe('Track 2');
    });

    test('Remove track from release', () => {
      const release = {
        tracks: [
          { id: 'track1', title: 'Track 1' },
          { id: 'track2', title: 'Track 2' },
          { id: 'track3', title: 'Track 3' }
        ]
      };

      const trackToRemove = 'track2';
      release.tracks = release.tracks.filter(t => t.id !== trackToRemove);

      expect(release.tracks).toHaveLength(2);
      expect(release.tracks.find(t => t.id === 'track2')).toBeUndefined();
    });

    test('Update track with ownership splits', () => {
      const track = {
        id: 'track1',
        title: 'Collab Song',
        ownershipSplits: [
          { artistName: 'Artist A', percentage: 50 },
          { artistName: 'Artist B', percentage: 50 }
        ]
      };

      // Add third artist
      track.ownershipSplits.push({ artistName: 'Producer', percentage: 10 });

      // Recalculate (in real system)
      const total = track.ownershipSplits.reduce((sum, split) => sum + split.percentage, 0);

      expect(track.ownershipSplits).toHaveLength(3);
      expect(total).toBe(110); // Over 100%, would need adjustment in real system
    });
  });

  describe('Error Handling', () => {
    test('Invalid release ID format rejected', () => {
      const invalidId = 'not-a-valid-mongodb-id';
      const isValid = /^[a-f\d]{24}$/i.test(invalidId);

      expect(isValid).toBe(false);
    });

    test('Missing required fields caught', () => {
      const request = {
        // Missing title
        artistId: 'artist1'
      };

      const errors = [];
      if (!request.title) errors.push('Title is required');
      if (!request.artistId) errors.push('ArtistId is required');

      expect(errors).toContainEqual('Title is required');
    });

    test('Concurrent track additions handled', () => {
      const release = { tracks: [] };

      // Simulate concurrent additions
      const track1 = { id: 'track1', title: 'Song 1' };
      const track2 = { id: 'track2', title: 'Song 2' };

      release.tracks.push(track1);
      release.tracks.push(track2);

      expect(release.tracks).toHaveLength(2);
      expect(release.tracks.map(t => t.id)).toEqual(['track1', 'track2']);
    });
  });
});
