const express = require('express');
const db = require('../db/schema');
const router = express.Router();

router.get('/', (req, res) => {
  const items = db.prepare(`
    SELECT i.*, c.name as category_name
    FROM items i
    LEFT JOIN categories c ON i.category_id = c.id
    ORDER BY c.name, i.name
  `).all();
  res.json(items);
});

router.post('/', (req, res) => {
  const { name, quantity, unit, category_id, frozen_at, expires_at, barcode } = req.body;
  if (!name || quantity == null) {
    return res.status(400).json({ error: 'name et quantity sont requis' });
  }

  const result = db.prepare(`
    INSERT INTO items (name, quantity, unit, category_id, frozen_at, expires_at, barcode)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(name, quantity, unit || 'pièce', category_id || null, frozen_at || null, expires_at || null, barcode || null);

  db.prepare(`
    INSERT INTO logs (action, item_name, quantity, unit)
    VALUES ('ajout', ?, ?, ?)
  `).run(name, quantity, unit || 'pièce');

  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(item);
});

router.patch('/:id', (req, res) => {
  const { quantity, expires_at } = req.body;
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Article introuvable' });

  if (quantity !== undefined) {
    if (quantity <= 0) {
      db.prepare('DELETE FROM items WHERE id = ?').run(item.id);
      db.prepare(`INSERT INTO logs (action, item_name, quantity, unit) VALUES ('retrait', ?, ?, ?)`).run(item.name, item.quantity, item.unit);
      return res.json({ deleted: true });
    }

    const diff = item.quantity - quantity;
    if (diff > 0) {
      db.prepare(`INSERT INTO logs (action, item_name, quantity, unit) VALUES ('retrait', ?, ?, ?)`).run(item.name, diff, item.unit);
    }
  }

  db.prepare(`
    UPDATE items SET
      quantity = COALESCE(?, quantity),
      expires_at = COALESCE(?, expires_at)
    WHERE id = ?
  `).run(quantity ?? null, expires_at ?? null, item.id);

  const updated = db.prepare('SELECT * FROM items WHERE id = ?').get(item.id);
  res.json(updated);
});

router.put('/:id', (req, res) => {
  const { name, quantity, unit, category_id, frozen_at, expires_at, barcode } = req.body;
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Article introuvable' });
  if (!name || quantity == null) return res.status(400).json({ error: 'name et quantity sont requis' });

  db.prepare(`
    UPDATE items SET
      name = ?, quantity = ?, unit = ?, category_id = ?,
      frozen_at = ?, expires_at = ?, barcode = ?
    WHERE id = ?
  `).run(name, quantity, unit || 'pièce', category_id || null,
         frozen_at || null, expires_at || null, barcode || null, item.id);

  db.prepare(`INSERT INTO logs (action, item_name, quantity, unit) VALUES ('modification', ?, ?, ?)`)
    .run(name, quantity, unit || 'pièce');

  const updated = db.prepare('SELECT * FROM items WHERE id = ?').get(item.id);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Article introuvable' });

  db.prepare('DELETE FROM items WHERE id = ?').run(item.id);
  db.prepare(`INSERT INTO logs (action, item_name, quantity, unit) VALUES ('retrait', ?, ?, ?)`).run(item.name, item.quantity, item.unit);
  res.json({ deleted: true });
});

module.exports = router;
