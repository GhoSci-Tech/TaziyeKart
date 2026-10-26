import { Router, type Request } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole } from '../lib/auth';
import { AppError, asyncHandler } from '../lib/errors';
import { toHome, toPanelCard, toPanelMessage } from '../lib/serializers';
import { checkCardCreation, getPlanLimit } from '../lib/plans';
import { makeCardSlug, randomToken } from '../lib/slug';
import { enforceRateLimit } from '../lib/rateLimit';
import {
  cardCreateSchema,
  cardUpdateSchema,
  checkoutSchema,
  homeUpdateSchema,
  moderationSchema,
} from '../schemas';

export const panelRouter = Router();

panelRouter.use(requireAuth, requireRole('FUNERAL_HOME'));

function currentHomeId(req: Request): string {
  const homeId = req.user?.homeId;
  if (!homeId) {
    throw new AppError(403, 'FORBIDDEN', 'Cenaze evi hesabı bulunamadı.');
  }
  return homeId;
}

async function getHome(homeId: string) {
  const home = await prisma.funeralHome.findUnique({ where: { id: homeId } });
  if (!home) {
    throw new AppError(401, 'UNAUTHORIZED', 'Cenaze evi bulunamadı.');
  }
  return home;
}

panelRouter.get(
  '/overview',
  asyncHandler(async (req, res) => {
    const homeId = currentHomeId(req);
    const home = await getHome(homeId);

    const [cards, messagesPending, recentCards] = await Promise.all([
      prisma.card.count({ where: { funeralHomeId: homeId } }),
      prisma.condolence.count({
        where: { card: { funeralHomeId: homeId }, status: 'PENDING' },
      }),
      prisma.card.findMany({
        where: { funeralHomeId: homeId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          deceasedName: true,
          slug: true,
          funeralDate: true,
          funeralTime: true,
          published: true,
        },
      }),
    ]);

    const limit = home.status === 'SUSPENDED' ? 0 : getPlanLimit(home.plan);

    res.json({
      home: toHome(home),
      usage: { cards, limit, messagesPending },
      recentCards,
    });
  }),
);

panelRouter.get(
  '/home',
  asyncHandler(async (req, res) => {
    const home = await getHome(currentHomeId(req));
    res.json({ home: toHome(home) });
  }),
);

panelRouter.patch(
  '/home',
  asyncHandler(async (req, res) => {
    const homeId = currentHomeId(req);
    const home = await getHome(homeId);
    const parsed = homeUpdateSchema.parse(req.body);

    const data: Prisma.FuneralHomeUpdateInput = {};
    if (parsed.name !== undefined) data.name = parsed.name;
    if (parsed.phone !== undefined) data.phone = parsed.phone.trim() || null;

    if (Object.keys(data).length === 0) {
      res.json({ home: toHome(home) });
      return;
    }

    const updated = await prisma.funeralHome.update({ where: { id: homeId }, data });
    res.json({ home: toHome(updated) });
  }),
);

panelRouter.get(
  '/cards',
  asyncHandler(async (req, res) => {
    const homeId = currentHomeId(req);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const publishedParam = typeof req.query.published === 'string' ? req.query.published : undefined;
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);

    const where: Prisma.CardWhereInput = { funeralHomeId: homeId };
    if (search) {
      where.OR = [
        { deceasedName: { contains: search } },
        { slug: { contains: search } },
        { funeralPlace: { contains: search } },
      ];
    }
    if (publishedParam === 'true' || publishedParam === 'false') {
      where.published = publishedParam === 'true';
    }

    const cards = await prisma.card.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        _count: {
          select: {
            condolences: { where: { status: 'PENDING' } },
          },
        },
      },
    });

    res.json({ cards: cards.map(toPanelCard) });
  }),
);

panelRouter.post(
  '/cards',
  asyncHandler(async (req, res) => {
    const homeId = currentHomeId(req);
    enforceRateLimit(`card-create:${homeId}`, 30, 60 * 60 * 1000);

    const parsed = cardCreateSchema.parse(req.body);
    const home = await getHome(homeId);
    const count = await prisma.card.count({ where: { funeralHomeId: homeId } });
    const check = checkCardCreation(home, count);

    if (!check.allowed) {
      const status = check.code === 'PLAN_LIMIT' ? 402 : 403;
      throw new AppError(
        status,
        check.code ?? 'PLAN_LIMIT',
        check.message ?? 'Yeni kart oluşturulamaz.',
      );
    }

    const card = await prisma.card.create({
      data: {
        funeralHomeId: homeId,
        slug: makeCardSlug(parsed.deceasedName),
        editToken: randomToken(32),
        ...parsed,
      },
    });

    res.status(201).json({ card: toPanelCard(card) });
  }),
);

panelRouter.get(
  '/cards/:id',
  asyncHandler(async (req, res) => {
    const homeId = currentHomeId(req);
    const card = await prisma.card.findFirst({
      where: { id: req.params.id, funeralHomeId: homeId },
      include: {
        _count: {
          select: {
            condolences: { where: { status: 'PENDING' } },
          },
        },
      },
    });

    if (!card) {
      throw new AppError(404, 'NOT_FOUND', 'Kart bulunamadı.');
    }

    res.json({ card: toPanelCard(card) });
  }),
);

panelRouter.patch(
  '/cards/:id',
  asyncHandler(async (req, res) => {
    const homeId = currentHomeId(req);
    const parsed = cardUpdateSchema.parse(req.body);

    if (Object.keys(parsed).length === 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Güncellenecek alan yok.', {
        _: 'En az bir alan gönderin.',
      });
    }

    const existing = await prisma.card.findFirst({
      where: { id: req.params.id, funeralHomeId: homeId },
      select: { id: true },
    });
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Kart bulunamadı.');
    }

    const card = await prisma.card.update({
      where: { id: existing.id },
      data: parsed,
      include: {
        _count: {
          select: {
            condolences: { where: { status: 'PENDING' } },
          },
        },
      },
    });

    res.json({ card: toPanelCard(card) });
  }),
);

panelRouter.delete(
  '/cards/:id',
  asyncHandler(async (req, res) => {
    const homeId = currentHomeId(req);
    const existing = await prisma.card.findFirst({
      where: { id: req.params.id, funeralHomeId: homeId },
      select: { id: true },
    });
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Kart bulunamadı.');
    }

    await prisma.card.delete({ where: { id: existing.id } });
    res.status(204).send();
  }),
);

panelRouter.get(
  '/messages',
  asyncHandler(async (req, res) => {
    const homeId = currentHomeId(req);
    const statusParam = typeof req.query.status === 'string' ? req.query.status : undefined;
    const status =
      statusParam && ['PENDING', 'APPROVED', 'REJECTED'].includes(statusParam)
        ? statusParam
        : undefined;
    const cardId = typeof req.query.cardId === 'string' ? req.query.cardId : undefined;
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 200);

    const where: Prisma.CondolenceWhereInput = { card: { funeralHomeId: homeId } };
    if (status) where.status = status;
    if (cardId) where.cardId = cardId;

    const messages = await prisma.condolence.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        card: { select: { deceasedName: true, slug: true } },
      },
    });

    res.json({ messages: messages.map(toPanelMessage) });
  }),
);

panelRouter.patch(
  '/messages/:id',
  asyncHandler(async (req, res) => {
    const homeId = currentHomeId(req);
    const parsed = moderationSchema.parse(req.body);

    const existing = await prisma.condolence.findFirst({
      where: { id: req.params.id, card: { funeralHomeId: homeId } },
      select: { id: true },
    });
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Taziye mesajı bulunamadı.');
    }

    const approved = parsed.status === 'APPROVED';
    const message = await prisma.condolence.update({
      where: { id: existing.id },
      data: {
        status: parsed.status,
        approvedAt: approved ? new Date() : null,
        approvedByUserId: approved ? req.user!.id : null,
      },
      include: {
        card: { select: { deceasedName: true, slug: true } },
      },
    });

    res.json({ message: toPanelMessage(message) });
  }),
);

panelRouter.post(
  '/checkout',
  asyncHandler(async (req, res) => {
    if (process.env.DEMO_MODE !== 'true') {
      throw new AppError(404, 'DEMO_DISABLED', 'Demo ödeme kapalı.');
    }

    const homeId = currentHomeId(req);
    const parsed = checkoutSchema.parse(req.body);
    const home = await getHome(homeId);

    if (home.status === 'SUSPENDED') {
      throw new AppError(403, 'PLAN_SUSPENDED', 'Askıdaki hesap plan değiştiremez.');
    }

    const updated = await prisma.funeralHome.update({
      where: { id: homeId },
      data: { plan: parsed.plan },
    });

    res.json({
      home: toHome(updated),
      demo: true,
      message: 'Demo ödeme alındı; gerçek tahsilat yapılmadı.',
    });
  }),
);
