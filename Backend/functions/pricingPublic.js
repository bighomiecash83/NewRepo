const express = require('express');
const router = express.Router();
const dual = require('./db/dualWrite');

router.get('/plans', async (req, res) => {
  try {
    const plans = await dual.listPlans();
    res.json(plans);
  } catch(err){
    console.error('public plans error', err && err.message);
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;
