import supertest from 'supertest';
import { app } from '../../src/app';
import { db } from '../../src/config/db';

const request = supertest(app);

describe('Auth API', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  let accessToken: string;
  let refreshToken: string;

  afterAll(async () => {
    await db('users').where('email', testEmail).delete();
    await db.destroy();
  });

  describe('POST /api/v1/auth/register', () => {
    it('returns 201 with user, access_token, refresh_token, expires_in', async () => {
      const res = await request.post('/api/v1/auth/register').send({
        email: testEmail,
        password: testPassword,
      });
      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe(testEmail);
      expect(res.body.access_token).toBeTruthy();
      expect(res.body.refresh_token).toBeTruthy();
      expect(res.body.expires_in).toBe(3600);
      accessToken = res.body.access_token;
      refreshToken = res.body.refresh_token;
    });

    it('returns 409 EMAIL_IN_USE for duplicate email', async () => {
      const res = await request.post('/api/v1/auth/register').send({
        email: testEmail,
        password: testPassword,
      });
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('EMAIL_IN_USE');
    });

    it('returns 422 VALIDATION_ERROR for invalid email', async () => {
      const res = await request.post('/api/v1/auth/register').send({
        email: 'not-an-email',
        password: testPassword,
      });
      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('returns 200 with access_token, refresh_token, expires_in', async () => {
      const res = await request.post('/api/v1/auth/login').send({
        email: testEmail,
        password: testPassword,
      });
      expect(res.status).toBe(200);
      expect(res.body.access_token).toBeTruthy();
      expect(res.body.refresh_token).toBeTruthy();
      expect(res.body.expires_in).toBe(3600);
    });

    it('returns 401 UNAUTHORIZED for wrong password', async () => {
      const res = await request.post('/api/v1/auth/login').send({
        email: testEmail,
        password: 'WrongPassword!',
      });
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns 401 UNAUTHORIZED for non-existent email', async () => {
      const res = await request.post('/api/v1/auth/login').send({
        email: 'nobody@example.com',
        password: testPassword,
      });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('returns 200 with new access_token and expires_in', async () => {
      const res = await request.post('/api/v1/auth/refresh').send({
        refresh_token: refreshToken,
      });
      expect(res.status).toBe(200);
      expect(res.body.access_token).toBeTruthy();
      expect(res.body.expires_in).toBe(3600);
    });

    it('returns 401 for invalid refresh_token', async () => {
      const res = await request.post('/api/v1/auth/refresh').send({
        refresh_token: 'invalid.token.here',
      });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('returns 204 with valid access token', async () => {
      const res = await request
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(204);
    });

    it('returns 401 without token', async () => {
      const res = await request.post('/api/v1/auth/logout');
      expect(res.status).toBe(401);
    });
  });
});
