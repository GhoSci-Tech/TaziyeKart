import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';

const app = createApp();
const admin = request.agent(app);
const home = request.agent(app);

let homeId = '';
let cardId = '';
let cardSlug = '';
let messageId = '';

describe('superadmin', () => {
  it('logs in as the seeded superadmin and returns stats', async () => {
    const login = await admin.post('/api/auth/login').send({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    });

    expect(login.status).toBe(200);
    expect(login.body.user.role).toBe('SUPERADMIN');

    const stats = await admin.get('/api/admin/stats');
    expect(stats.status).toBe(200);
    expect(stats.body.homes.total).toBeGreaterThanOrEqual(1);
    expect(stats.body.homes.active).toBeGreaterThanOrEqual(1);
    expect(stats.body.demoMrrTry).toBeGreaterThanOrEqual(0);

    const homes = await admin.get('/api/admin/homes?search=Örnek');
    expect(homes.status).toBe(200);
    expect(
      homes.body.homes.some((item: { name: string }) => item.name === 'Örnek Cenaze Evi'),
    ).toBe(true);

    const audit = await admin.get('/api/admin/audit');
    expect(audit.status).toBe(200);
    expect(
      audit.body.logs.some((log: { action: string }) => log.action === 'ADMIN_LOGIN'),
    ).toBe(true);
  });

  it('rejects a funeral home from admin routes', async () => {
    const register = await home.post('/api/auth/register').send({
      homeName: 'Admin Test Cenaze Evi',
      contactName: 'Admin Test Yetkili',
      email: 'admin-test@example.com',
      password: 'Test1234!',
    });

    expect(register.status).toBe(201);
    homeId = register.body.user.funeralHome.id;

    const response = await home.get('/api/admin/stats');
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('sees, moderates and deletes a card/message across tenants', async () => {
    const created = await home.post('/api/panel/cards').send({
      deceasedName: 'Admin Test Kart',
      funeralPlace: 'Admin Camii',
      funeralDate: '2026-11-02',
      funeralTime: '10:00',
    });

    expect(created.status).toBe(201);
    cardId = created.body.card.id;
    cardSlug = created.body.card.slug;

    const post = await request(app)
      .post(`/api/public/cards/${cardSlug}/condolences`)
      .send({ name: 'Admin Ziyaretçi', message: 'Başsağlığı dilerim.' });
    expect(post.status).toBe(201);

    const messages = await admin.get(`/api/admin/messages?status=PENDING&homeId=${homeId}`);
    expect(messages.status).toBe(200);
    expect(messages.body.messages).toHaveLength(1);
    messageId = messages.body.messages[0].id;

    const approved = await admin
      .patch(`/api/admin/messages/${messageId}`)
      .send({ status: 'APPROVED' });
    expect(approved.status).toBe(200);
    expect(approved.body.message.status).toBe('APPROVED');

    const publicCard = await request(app).get(`/api/public/cards/${cardSlug}`);
    expect(publicCard.body.card.condolences).toHaveLength(1);

    const unpublish = await admin
      .patch(`/api/admin/cards/${cardId}`)
      .send({ published: false });
    expect(unpublish.status).toBe(200);

    const hidden = await request(app).get(`/api/public/cards/${cardSlug}`);
    expect(hidden.status).toBe(404);

    const homeUpdate = await admin
      .patch(`/api/admin/homes/${homeId}`)
      .send({ plan: 'MONTHLY', status: 'SUSPENDED' });
    expect(homeUpdate.status).toBe(200);
    expect(homeUpdate.body.home.plan).toBe('MONTHLY');
    expect(homeUpdate.body.home.status).toBe('SUSPENDED');

    const homeDetail = await admin.get(`/api/admin/homes/${homeId}`);
    expect(homeDetail.status).toBe(200);
    expect(homeDetail.body.users[0].email).toBe('admin-test@example.com');
    expect(homeDetail.body.users[0].passwordHash).toBeUndefined();

    const cards = await admin.get(`/api/admin/cards?homeId=${homeId}`);
    expect(cards.body.cards).toHaveLength(1);

    const deleteMessage = await admin.delete(`/api/admin/messages/${messageId}`);
    expect(deleteMessage.status).toBe(204);

    const deleteCard = await admin.delete(`/api/admin/cards/${cardId}`);
    expect(deleteCard.status).toBe(204);

    const deleted = await admin.get(`/api/admin/cards?homeId=${homeId}`);
    expect(deleted.body.cards).toHaveLength(0);

    const audit = await admin.get('/api/admin/audit');
    const actions = audit.body.logs.map((log: { action: string }) => log.action);
    expect(actions).toEqual(
      expect.arrayContaining([
        'ADMIN_LOGIN',
        'HOME_UPDATE',
        'CARD_UNPUBLISH',
        'MESSAGE_APPROVE',
        'MESSAGE_DELETE',
        'CARD_DELETE',
      ]),
    );
  });

  it('rejects a state-changing request from a foreign origin', async () => {
    const foreign = await request(app)
      .post('/api/auth/login')
      .set('Origin', 'https://evil.example')
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      });

    expect(foreign.status).toBe(403);
    expect(foreign.body.error.code).toBe('FORBIDDEN');

    const allowed = await request(app)
      .post('/api/auth/logout')
      .set('Origin', 'http://localhost:3000');

    expect(allowed.status).toBe(204);
  });
});
