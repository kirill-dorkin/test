const express = require('express');
const { readFile, stat } = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../data/items.json');

let statsCache = null;
let lastMtimeMs = 0;

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    const { mtimeMs } = await stat(DATA_PATH);
    if (!statsCache || mtimeMs > lastMtimeMs) {
      const raw = await readFile(DATA_PATH, 'utf8');
      const items = JSON.parse(raw);

      statsCache = {
        total: items.length,
        averagePrice: items.reduce((acc, cur) => acc + cur.price, 0) / items.length
      };
      lastMtimeMs = mtimeMs;
    }
    res.json(statsCache);
  } catch (err) {
    next(err);
  }
});

module.exports = router;