// tests/api/health.test.js
const request = require('supertest');
const express = require('express');

// Dummy app for demonstrating API test structure
// In a real test, we would import the configured Express app
const app = express();
app.get('/health/readiness', (req, res) => res.status(200).json({ status: 'ok' }));

describe('API Health Checks (API)', () => {
  it('should return 200 OK on readiness probe', async () => {
    const res = await request(app).get('/health/readiness');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
