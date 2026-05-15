import supertest from 'supertest';
import { app } from '../../src/app';
import { db } from '../../src/config/db';

const request = supertest(app);

// Helper to register a test user and get access token
async function createTestUser(suffix: string = '') {
  const email = `wines-test-${Date.now()}${suffix}@example.com`;
  const password = 'Password123!';
  const res = await request.post('/api/v1/auth/register').send({ email, password });
  return { userId: res.body.user.id, token: res.body.access_token, email };
}

describe('Wines API', () => {
  let token: string;
  let userId: string;
  let otherToken: string;
  let otherUserId: string;

  beforeAll(async () => {
    const user = await createTestUser('a');
    token = user.token;
    userId = user.userId;
    const other = await createTestUser('b');
    otherToken = other.token;
    otherUserId = other.userId;
  });

  afterAll(async () => {
    await db('wines').where('user_id', userId).delete();
    await db('wines').where('user_id', otherUserId).delete();
    await db('users').where('id', userId).delete();
    await db('users').where('id', otherUserId).delete();
    await db.destroy();
  });

  describe('POST /api/v1/wines', () => {
    it('creates a wine with only name (quick-add), returns 201', async () => {
      const res = await request
        .post('/api/v1/wines')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Quick Add Wine' });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Quick Add Wine');
      expect(res.body.id).toBeTruthy();
      expect(res.body.bottle_count).toBe(1);
      expect(res.body.status).toBe('active');
    });

    it('creates a wine with all fields', async () => {
      const res = await request
        .post('/api/v1/wines')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Caymus Cabernet',
          producer: 'Caymus Vineyards',
          vintage: 2018,
          varietal: 'Cabernet Sauvignon',
          region: 'Napa Valley',
          bottle_count: 3,
          rating: 4,
        });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Caymus Cabernet');
      expect(res.body.producer).toBe('Caymus Vineyards');
      expect(res.body.vintage).toBe(2018);
      expect(res.body.varietal).toBe('Cabernet Sauvignon');
      expect(res.body.region).toBe('Napa Valley');
      expect(res.body.bottle_count).toBe(3);
      expect(res.body.rating).toBe(4);
    });

    it('returns 422 for missing name', async () => {
      const res = await request
        .post('/api/v1/wines')
        .set('Authorization', `Bearer ${token}`)
        .send({ producer: 'Someone' });
      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 422 for whitespace-only name', async () => {
      const res = await request
        .post('/api/v1/wines')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '   ' });
      expect(res.status).toBe(422);
    });

    it('returns 422 for rating > 5', async () => {
      const res = await request
        .post('/api/v1/wines')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test', rating: 6 });
      expect(res.status).toBe(422);
    });

    it('returns 401 without token', async () => {
      const res = await request.post('/api/v1/wines').send({ name: 'Test' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/wines', () => {
    let wineId: string;

    beforeAll(async () => {
      const res = await request
        .post('/api/v1/wines')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'List Test Wine', varietal: 'Pinot Noir', vintage: 2020 });
      wineId = res.body.id;
    });

    it('returns paginated list for authenticated user', async () => {
      const res = await request
        .get('/api/v1/wines')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.results)).toBe(true);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBeGreaterThan(0);
    });

    it('returns correct pagination metadata', async () => {
      const res = await request
        .get('/api/v1/wines?page=1&per_page=2')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.per_page).toBe(2);
      expect(typeof res.body.pagination.total_pages).toBe('number');
    });

    it('filters by status=all returns all wines', async () => {
      const res = await request
        .get('/api/v1/wines?status=all')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    it('does not return wines from another user', async () => {
      const res = await request
        .get('/api/v1/wines')
        .set('Authorization', `Bearer ${otherToken}`);
      expect(res.status).toBe(200);
      const ids = res.body.results.map((w: { id: string }) => w.id);
      expect(ids).not.toContain(wineId);
    });
  });

  describe('GET /api/v1/wines/:wine_id', () => {
    let wineId: string;

    beforeAll(async () => {
      const res = await request
        .post('/api/v1/wines')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Detail Test Wine' });
      wineId = res.body.id;
    });

    it('returns full wine record', async () => {
      const res = await request
        .get(`/api/v1/wines/${wineId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(wineId);
      expect(res.body.name).toBe('Detail Test Wine');
    });

    it('returns 404 for non-existent wine', async () => {
      const res = await request
        .get('/api/v1/wines/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('returns 403 for wine belonging to another user', async () => {
      const res = await request
        .get(`/api/v1/wines/${wineId}`)
        .set('Authorization', `Bearer ${otherToken}`);
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('returns 400 for invalid UUID', async () => {
      const res = await request
        .get('/api/v1/wines/not-a-uuid')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_ID');
    });
  });

  describe('PATCH /api/v1/wines/:wine_id', () => {
    let wineId: string;

    beforeAll(async () => {
      const res = await request
        .post('/api/v1/wines')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Update Test Wine', vintage: 2015 });
      wineId = res.body.id;
    });

    it('updates specified fields and returns updated wine', async () => {
      const res = await request
        .patch(`/api/v1/wines/${wineId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name', vintage: 2016 });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Name');
      expect(res.body.vintage).toBe(2016);
    });

    it('treats tasting_notes="" as null', async () => {
      const res = await request
        .patch(`/api/v1/wines/${wineId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ tasting_notes: '' });
      expect(res.status).toBe(200);
      expect(res.body.tasting_notes).toBeNull();
    });

    it('cannot change status via PATCH', async () => {
      // status field is not in updateWineSchema — Zod strips unknown fields
      // With an empty payload (after stripping status), returns 422
      const res = await request
        .patch(`/api/v1/wines/${wineId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'consumed' });
      // Either 422 (empty body after strip) or 200 (with status unchanged)
      if (res.status === 200) {
        expect(res.body.status).toBe('active');
      } else {
        expect(res.status).toBe(422);
      }
    });

    it('returns 403 when updating another user wine', async () => {
      const res = await request
        .patch(`/api/v1/wines/${wineId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ name: 'Stolen' });
      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/v1/wines/:wine_id', () => {
    it('deletes wine and returns 204', async () => {
      const create = await request
        .post('/api/v1/wines')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'To Be Deleted' });
      const wineId = create.body.id;

      const del = await request
        .delete(`/api/v1/wines/${wineId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(del.status).toBe(204);

      // Verify gone
      const get = await request
        .get(`/api/v1/wines/${wineId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(get.status).toBe(404);
    });

    it('returns 403 when deleting another user wine', async () => {
      const create = await request
        .post('/api/v1/wines')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Protected Wine' });
      const wineId = create.body.id;

      const del = await request
        .delete(`/api/v1/wines/${wineId}`)
        .set('Authorization', `Bearer ${otherToken}`);
      expect(del.status).toBe(403);
    });
  });

  describe('PATCH /api/v1/wines/:wine_id/bottle-count', () => {
    let wineId: string;

    beforeAll(async () => {
      const res = await request
        .post('/api/v1/wines')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Bottle Count Test', bottle_count: 2 });
      wineId = res.body.id;
    });

    it('increments bottle count and returns updated state', async () => {
      const res = await request
        .patch(`/api/v1/wines/${wineId}/bottle-count`)
        .set('Authorization', `Bearer ${token}`)
        .send({ action: 'increment' });
      expect(res.status).toBe(200);
      expect(res.body.bottle_count).toBe(3);
      expect(res.body.zero_bottle_flag).toBe(false);
    });

    it('decrements bottle count', async () => {
      const res = await request
        .patch(`/api/v1/wines/${wineId}/bottle-count`)
        .set('Authorization', `Bearer ${token}`)
        .send({ action: 'decrement' });
      expect(res.status).toBe(200);
      expect(res.body.bottle_count).toBe(2);
    });

    it('returns 422 COUNT_BELOW_ZERO when decrementing at 0', async () => {
      // Set bottle count to 0 first via PATCH
      await request
        .patch(`/api/v1/wines/${wineId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ bottle_count: 0 });

      const res = await request
        .patch(`/api/v1/wines/${wineId}/bottle-count`)
        .set('Authorization', `Bearer ${token}`)
        .send({ action: 'decrement' });
      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('COUNT_BELOW_ZERO');
    });

    it('returns zero_bottle_flag=true when count reaches 0', async () => {
      // Set to 1 first
      await request
        .patch(`/api/v1/wines/${wineId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ bottle_count: 1 });

      const res = await request
        .patch(`/api/v1/wines/${wineId}/bottle-count`)
        .set('Authorization', `Bearer ${token}`)
        .send({ action: 'decrement' });
      expect(res.status).toBe(200);
      expect(res.body.bottle_count).toBe(0);
      expect(res.body.zero_bottle_flag).toBe(true);
    });

    it('returns 422 for invalid action', async () => {
      const res = await request
        .patch(`/api/v1/wines/${wineId}/bottle-count`)
        .set('Authorization', `Bearer ${token}`)
        .send({ action: 'multiply' });
      expect(res.status).toBe(422);
    });
  });
});
