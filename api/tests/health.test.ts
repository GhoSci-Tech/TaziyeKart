import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';

describe('GET /api/health', () => {
  it('returns the service health envelope', async () => {
    const response = await request(createApp()).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      ok: true,
      service: 'taziyekart-api',
    });
    expect(typeof response.body.time).toBe('string');
  });
});

describe('unknown route', () => {
  it('uses the shared error envelope', async () => {
    const response = await request(createApp()).get('/api/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'İstenen kaynak bulunamadı.',
      },
    });
  });
});
