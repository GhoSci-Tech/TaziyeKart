import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';

const app = createApp();

describe('auth', () => {
  it('registers a funeral home, sets a session and returns a safe user', async () => {
    const agent = request.agent(app);

    const response = await agent.post('/api/auth/register').send({
      homeName: 'Auth Test Cenaze Evi',
      contactName: 'Auth Yetkili',
      email: 'auth-test@example.com',
      password: 'Test1234!',
      phone: '0212 111 11 11',
    });

    expect(response.status).toBe(201);
    expect(response.body.user).toMatchObject({
      email: 'auth-test@example.com',
      role: 'FUNERAL_HOME',
      funeralHome: {
        name: 'Auth Test Cenaze Evi',
        plan: 'TRIAL',
        status: 'ACTIVE',
      },
    });
    expect(response.body.user.passwordHash).toBeUndefined();
    expect((response.headers['set-cookie'] ?? []).join('; ')).toContain('taziye_session=');

    const me = await agent.get('/api/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe('auth-test@example.com');
  });

  it('rejects duplicate email and invalid input', async () => {
    const duplicate = await request(app).post('/api/auth/register').send({
      homeName: 'Another Home',
      contactName: 'Another Yetkili',
      email: 'auth-test@example.com',
      password: 'Test1234!',
    });

    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe('CONFLICT');

    const invalid = await request(app).post('/api/auth/register').send({
      homeName: 'X',
      contactName: 'Y',
      email: 'not-an-email',
      password: '123',
    });

    expect(invalid.status).toBe(400);
    expect(invalid.body.error.code).toBe('VALIDATION_ERROR');
    expect(invalid.body.error.fields.email).toBeTruthy();
    expect(invalid.body.error.fields.password).toBeTruthy();
  });

  it('logs in, rejects a wrong password and logs out', async () => {
    const agent = request.agent(app);

    const wrong = await agent
      .post('/api/auth/login')
      .send({ email: 'auth-test@example.com', password: 'wrong-password' });
    expect(wrong.status).toBe(401);
    expect(wrong.body.error.message).toBe('E-posta veya şifre hatalı.');

    const login = await agent
      .post('/api/auth/login')
      .send({ email: 'auth-test@example.com', password: 'Test1234!' });
    expect(login.status).toBe(200);

    const me = await agent.get('/api/auth/me');
    expect(me.status).toBe(200);

    const logout = await agent.post('/api/auth/logout');
    expect(logout.status).toBe(204);

    const after = await agent.get('/api/auth/me');
    expect(after.status).toBe(401);
  });

  it('starts demo funeral home and demo admin sessions when DEMO_MODE is on', async () => {
    const home = await request(app).post('/api/auth/demo-home');
    expect(home.status).toBe(200);
    expect(home.body.user.role).toBe('FUNERAL_HOME');
    expect(home.body.user.funeralHome.name).toBe('Örnek Cenaze Evi');

    const admin = await request(app).post('/api/auth/demo-admin');
    expect(admin.status).toBe(200);
    expect(admin.body.user.role).toBe('SUPERADMIN');
  });

  it('returns 401 for /me without a session', async () => {
    const response = await request(app).get('/api/auth/me');
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });
});
