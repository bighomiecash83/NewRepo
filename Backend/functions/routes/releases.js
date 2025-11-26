// Backend/functions/routes/releases.js
const admin = require('firebase-admin');
const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { publishRelease } = require('../services/pubsubClient');

const router = Router();

// Initialize Firestore if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// POST /releases/create - Create a new release (async via Pub/Sub)
router.post('/create', async (req, res) => {
  try {
    const { title, artistId, releaseDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Release title is required' });
    }

    if (!artistId || !artistId.trim()) {
      return res.status(400).json({ error: 'Artist ID is required' });
    }

    // Verify artist exists
    const artistDoc = await db.collection('artists').doc(artistId).get();
    if (!artistDoc.exists) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    const releaseId = uuidv4();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    // Create release record with 'queued' status
    await db.collection('releases').doc(releaseId).set({
      title: title.trim(),
      artistId,
      artistName: artistDoc.data().name,
      releaseDate: releaseDate || null,
      status: 'queued',
      createdAt: timestamp,
    });

    // Publish job to Pub/Sub for processing (non-blocking)
    try {
      await publishRelease({
        releaseId,
        title: title.trim(),
        artistId,
        artistName: artistDoc.data().name,
        releaseDate: releaseDate || null,
        createdBy: req.user?.uid || 'anonymous',
      });
    } catch (pubsubError) {
      console.error('Pub/Sub publish failed:', pubsubError);
      // Don't fail the request - release is created, job will be retried
    }

    return res.json({
      id: releaseId,
      title: title.trim(),
      artistId,
      releaseDate: releaseDate || null,
      status: 'queued',
      createdAt: new Date().toISOString(),
      message: 'Release queued for distribution processing',
    });
  } catch (error) {
    console.error('Release create error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to create release',
    });
  }
});

// GET /releases - List all releases
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('releases')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const releases = snapshot.docs.map((doc) => ({
      id: doc.id,
      _id: doc.id,
      ...doc.data(),
    }));

    return res.json({ releases });
  } catch (error) {
    console.error('Releases list error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to list releases',
    });
  }
});

// GET /releases/:id - Get a specific release
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('releases').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Release not found' });
    }

    return res.json({
      id: doc.id,
      ...doc.data(),
    });
  } catch (error) {
    console.error('Release get error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to get release',
    });
  }
});

// PUT /releases/:id - Update a release
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, releaseDate, status } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (releaseDate !== undefined) updateData.releaseDate = releaseDate;
    if (status !== undefined) updateData.status = status;
    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await db.collection('releases').doc(id).update(updateData);

    const updated = await db.collection('releases').doc(id).get();

    return res.json({
      id: updated.id,
      ...updated.data(),
    });
  } catch (error) {
    console.error('Release update error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to update release',
    });
  }
});

// POST /releases/:id/publish - Publish a release
router.post('/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const { platforms } = req.body;

    const updateData = {
      status: 'published',
      platforms: platforms || [],
      publishedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('releases').doc(id).update(updateData);

    const updated = await db.collection('releases').doc(id).get();

    return res.json({
      id: updated.id,
      ...updated.data(),
    });
  } catch (error) {
    console.error('Release publish error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to publish release',
    });
  }
});

// DELETE /releases/:id - Delete a release
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('releases').doc(id).delete();

    return res.json({ success: true, id });
  } catch (error) {
    console.error('Release delete error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to delete release',
    });
  }
});

module.exports = router;
