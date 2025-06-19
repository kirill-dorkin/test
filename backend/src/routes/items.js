const express = require('express');
const { readFile, writeFile } = require('fs').promises;
const path = require('path');

const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

async function readData() {
  const raw = await readFile(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

async function writeData(data) {
  await writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// GET /api/items?q=&page=&limit=
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    const q = (req.query.q || '').toLowerCase();
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    let results = data;
    if (q) {
      results = results.filter(item =>
        item.name.toLowerCase().includes(q)
      );
    }

    const total = results.length;
    const items = results.slice(offset, offset + limit);

    res.json({ items, total, page, limit });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      const err = new Error('Invalid ID');
      err.status = 400;
      throw err;
    }

    const data = await readData();
    const item = data.find(i => i.id === id);
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }

    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    const item = req.body;
    const data = await readData();

    const newItem = {
      id: Date.now(),
      ...item
    };

    data.push(newItem);
    await writeData(data);

    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
