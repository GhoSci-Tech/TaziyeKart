import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';

const app = createApp();
const agent = request.agent(app);

let slug = '';
let editToken = '';
let cardId = '';
let messageId = '';

describe('panel, public card and edit flow', () => {
  it('registers a trial home and creates the first card', async () => {
    const register = await agent.post('/api/auth/register').send({
      homeName: 'Kart Test Cenaze Evi',
      contactName: 'Kart Yetkili',
      email: 'cards-test@example.com',
      password: 'Test1234!',
      phone: '0212 222 22 22',
    });
    expect(register.status).toBe(201);

    const response = await agent.post('/api/panel/cards').send({
      deceasedName: 'Ahmet Yılmaz',
      honorific: 'Merhum',
      funeralPlace: 'Merkez Camii',
      funeralAddress: 'Cumhuriyet Mah. 1',
      funeralDate: '2026-10-26',
      funeralTime: '14:30',
      cemeteryName: 'Şehir Mezarlığı',
      burialTime: '15:30',
      condolenceAddress: 'Taziye Çadırı',
      condolenceHours: '12:00-22:00',
      donationIban: 'TR00 0000 0000 0000 0000 0000 00',
      note: 'Çiçek yerine bağış rica ederiz.',
    });

    expect(response.status).toBe(201);
    expect(response.body.card.editToken).toBeTruthy();
    expect(response.body.card.publicPath).toContain('/k/');
    expect(response.body.card.editPath).toContain('/duzenle/');

    cardId = response.body.card.id;
    slug = response.body.card.slug;
    editToken = response.body.card.editToken;
  });

  it('serves the public card without private fields', async () => {
    const response = await request(app).get(`/api/public/cards/${slug}`);

    expect(response.status).toBe(200);
    expect(response.body.card.deceasedName).toBe('Ahmet Yılmaz');
    expect(response.body.card.home.name).toBe('Kart Test Cenaze Evi');
    expect(response.body.card.editToken).toBeUndefined();
    expect(response.body.card.funeralHomeId).toBeUndefined();
    expect(response.body.card.condolences).toEqual([]);
  });

  it('accepts a pending condolence and hides it until approval', async () => {
    const post = await request(app)
      .post(`/api/public/cards/${slug}/condolences`)
      .send({ name: 'Mehmet K.', message: 'Başsağlığı dilerim.' });

    expect(post.status).toBe(201);
    expect(post.body.status).toBe('PENDING');

    const publicBefore = await request(app).get(`/api/public/cards/${slug}`);
    expect(publicBefore.body.card.condolences).toHaveLength(0);

    const messages = await agent.get('/api/panel/messages?status=PENDING');
    expect(messages.status).toBe(200);
    expect(messages.body.messages).toHaveLength(1);

    messageId = messages.body.messages[0].id;
    const approve = await agent
      .patch(`/api/panel/messages/${messageId}`)
      .send({ status: 'APPROVED' });
    expect(approve.status).toBe(200);
    expect(approve.body.message.status).toBe('APPROVED');

    const publicAfter = await request(app).get(`/api/public/cards/${slug}`);
    expect(publicAfter.body.card.condolences).toHaveLength(1);
    expect(publicAfter.body.card.condolences[0].name).toBe('Mehmet K.');
  });

  it('lets the family edit via the secret token and update the public card', async () => {
    const get = await request(app).get(`/api/edit/cards/${editToken}`);
    expect(get.status).toBe(200);
    expect(get.body.card.publicPath).toBe(`/k/${slug}`);
    expect(get.body.card.editToken).toBeUndefined();
    expect(get.body.condolences).toHaveLength(1);

    const patch = await request(app)
      .patch(`/api/edit/cards/${editToken}`)
      .send({ funeralTime: '16:00' });
    expect(patch.status).toBe(200);

    const publicCard = await request(app).get(`/api/public/cards/${slug}`);
    expect(publicCard.body.card.funeralTime).toBe('16:00');
  });

  it('enforces the trial plan limit, then allows a second card after a demo upgrade', async () => {
    const second = await agent.post('/api/panel/cards').send({
      deceasedName: 'İkinci Kart',
      funeralPlace: 'Merkez Camii',
      funeralDate: '2026-10-27',
      funeralTime: '11:00',
    });
    expect(second.status).toBe(402);
    expect(second.body.error.code).toBe('PLAN_LIMIT');

    const checkout = await agent.post('/api/panel/checkout').send({ plan: 'MONTHLY' });
    expect(checkout.status).toBe(200);
    expect(checkout.body.home.plan).toBe('MONTHLY');

    const secondAfterUpgrade = await agent.post('/api/panel/cards').send({
      deceasedName: 'İkinci Kart',
      funeralPlace: 'Merkez Camii',
      funeralDate: '2026-10-27',
      funeralTime: '11:00',
    });
    expect(secondAfterUpgrade.status).toBe(201);
  });

  it('keeps tenants isolated', async () => {
    const other = request.agent(app);
    const register = await other.post('/api/auth/register').send({
      homeName: 'Diğer Cenaze Evi',
      contactName: 'Diğer Yetkili',
      email: 'other-test@example.com',
      password: 'Test1234!',
    });
    expect(register.status).toBe(201);

    const response = await other.get(`/api/panel/cards/${cardId}`);
    expect(response.status).toBe(404);

    const publicCard = await request(app).get(`/api/public/cards/${slug}`);
    expect(publicCard.status).toBe(200);
  });

  it('validates bad card input', async () => {
    const response = await agent.post('/api/panel/cards').send({
      deceasedName: '',
      funeralPlace: '',
      funeralDate: 'not-a-date',
      funeralTime: '99:99',
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.fields.deceasedName).toBeTruthy();
    expect(response.body.error.fields.funeralDate).toBeTruthy();
    expect(response.body.error.fields.funeralTime).toBeTruthy();
  });

  it('unpublishes, republishes and deletes via the family link', async () => {
    const unpublish = await request(app)
      .patch(`/api/edit/cards/${editToken}`)
      .send({ published: false });
    expect(unpublish.status).toBe(200);

    const hidden = await request(app).get(`/api/public/cards/${slug}`);
    expect(hidden.status).toBe(404);
    expect(hidden.body.error.code).toBe('CARD_NOT_PUBLISHED');

    const republish = await request(app)
      .patch(`/api/edit/cards/${editToken}`)
      .send({ published: true });
    expect(republish.status).toBe(200);

    const visible = await request(app).get(`/api/public/cards/${slug}`);
    expect(visible.status).toBe(200);

    const remove = await request(app).delete(`/api/edit/cards/${editToken}`);
    expect(remove.status).toBe(204);

    const gone = await request(app).get(`/api/public/cards/${slug}`);
    expect(gone.status).toBe(404);
    expect(gone.body.error.code).toBe('NOT_FOUND');
  });
});
