jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}));

const request = require('supertest');
const express = require('express');
const itemsRouter = require('../items');
const { readFile, writeFile } = require('fs').promises;

const sampleData = [
  { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 },
  { id: 2, name: 'Noise Cancelling Headphones', category: 'Electronics', price: 399 },
  { id: 3, name: 'Ultra-Wide Monitor', category: 'Electronics', price: 999 },
];

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/items', itemsRouter);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: err.message });
  });
  return app;
}

beforeEach(() => {
  readFile.mockResolvedValue(JSON.stringify(sampleData));
  writeFile.mockResolvedValue();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('GET /api/items', () => {
  it('returns paginated items object with defaults', async () => {
    const app = createApp();
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      items: sampleData,
      total: sampleData.length,
      page: 1,
      limit: 10
    });
  });

  it('filters items by q query param', async () => {
    const app = createApp();
    const res = await request(app).get('/api/items?q=monitor');
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].name).toBe('Ultra-Wide Monitor');
    expect(res.body.total).toBe(1);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(10);
  });

  it('limits items by limit query param', async () => {
    const app = createApp();
    const res = await request(app).get('/api/items?limit=2');
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(2);
    expect(res.body.total).toBe(sampleData.length);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(2);
  });

  it('returns 500 if readData throws', async () => {
    readFile.mockRejectedValue(new Error('read error'));
    const app = createApp();
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('read error');
  });
});

describe('GET /api/items/:id', () => {
  it('returns the item with given id', async () => {
    const app = createApp();
    const res = await request(app).get('/api/items/2');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(2);
  });

  it('returns 404 if not found', async () => {
    const app = createApp();
    const res = await request(app).get('/api/items/999');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Item not found');
  });
});

describe('POST /api/items', () => {
  it('creates new item and returns it', async () => {
    const newItem = { name: 'Standing Desk', category: 'Furniture', price: 1199 };
    const app = createApp();
    const res = await request(app)
      .post('/api/items')
      .send(newItem)
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(newItem);
    expect(res.body.id).toBeDefined();

    const written = JSON.parse(writeFile.mock.calls[0][1]);
    expect(written).toHaveLength(sampleData.length + 1);
  });

  it('returns 500 if writeData throws', async () => {
    writeFile.mockRejectedValue(new Error('write error'));
    const app = createApp();
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'Test', category: 'Test', price: 1 })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('write error');
  });
});
