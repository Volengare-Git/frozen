const express = require('express');
const db = require('../db/schema');
const router = express.Router();

router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const logs = db.prepare(`
    SELECT * FROM logs ORDER BY created_at DESC LIMIT ?
  `).all(limit);
  res.json(logs);
});

module.exports = router;
