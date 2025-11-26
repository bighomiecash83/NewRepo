// Backend/functions/routes/artists.js
const admin = require('firebase-admin');
const { Router } = require('express');

const router = Router();

// Initialize Firestore if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// POST /artists/create - Create a new artist
router.post('/create', async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Artist name is required' });
    }

    const docRef = db.collection('artists').doc();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    await docRef.set({
      name: name.trim(),
      email: email || null,
      createdAt: timestamp,
      status: 'active',
    });

    return res.json({
      id: docRef.id,
      name: name.trim(),
      email: email || null,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Artist create error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to create artist',
    });
  }
});

// GET /artists - List all artists
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('artists')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const artists = snapshot.docs.map((doc) => ({
      id: doc.id,
      _id: doc.id,
      ...doc.data(),
    }));

    return res.json({ artists });
  } catch (error) {
    console.error('Artists list error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to list artists',
    });
  }
});

// GET /artists/:id - Get a specific artist
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('artists').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    return res.json({
      id: doc.id,
      ...doc.data(),
    });
  } catch (error) {
    console.error('Artist get error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to get artist',
    });
  }
});

// PUT /artists/:id - Update an artist
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, status } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (status !== undefined) updateData.status = status;
    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await db.collection('artists').doc(id).update(updateData);

    const updated = await db.collection('artists').doc(id).get();

    return res.json({
      id: updated.id,
      ...updated.data(),
    });
  } catch (error) {
    console.error('Artist update error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to update artist',
    });
  }
});

// DELETE /artists/:id - Delete an artist
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('artists').doc(id).delete();

    return res.json({ success: true, id });
  } catch (error) {
    console.error('Artist delete error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to delete artist',
    });
  }
});

module.exports = router;
