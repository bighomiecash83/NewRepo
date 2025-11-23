const express = require('express');
const router = express.Router();
const dual = require('./db/dualWrite');

router.post('/plans', async (req, res) => {
  try {
    const payload = req.body;
    const result = await dual.createPlan(payload);
    res.status(201).json(result);
  } catch(err){
    console.error('create plan error', err && err.message);
    res.status(500).json({ error: 'internal' });
  }
});

router.put('/plans/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const result = await dual.updatePlan(id, body);
    res.json(result);
  } catch(err){
    console.error('update plan error', err && err.message);
    res.status(500).json({ error: 'internal' });
  }
});

router.delete('/plans/:id', async (req, res) => {
  try {
    await dual.deletePlan(req.params.id);
    res.status(204).send();
  } catch(err){
    console.error('delete plan error', err && err.message);
    res.status(500).json({ error: 'internal' });
  }
});

router.get('/plans', async (req, res) => {
  try {
    const plans = await dual.listPlans();
    res.json(plans);
  } catch(err){
    console.error('admin list error', err && err.message);
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;
