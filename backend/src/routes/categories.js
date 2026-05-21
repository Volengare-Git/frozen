const express = require('express');
const db = require('../db/schema');
const router = express.Router();

router.get('/', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
  res.json(categories);
});

module.exports = router;
