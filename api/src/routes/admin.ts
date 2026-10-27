import { Router } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole } from '../lib/auth';
import { AppError, asyncHandler } from '../lib/errors';
import { toAdminCard, toAdminHome, toAdminMessage } from '../lib/serializers';
import { getPlanPrice } from '../lib/plans';
import {
  adminCardUpdateSchema,
  adminHomeUpdateSchema,
  moderationSchema,
} from '../schemas';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole('SUPERADMIN'));

const homeInclude = {
  _count: { select: { cards: true, users: true } },
} satisfies Prisma.FuneralHomeInclude;

const cardInclude = {
  funeralHome: { select: { id: true, name: true } },
  _count: {
    select: { condolences: { where: { status: 'PENDING' } } },
  },
} satisfies Prisma.CardInclude;

const messageInclude = {
  card: {
    select: {
      id: true,
      deceasedName: true,
      slug: true,
      funeralHome: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.CondolenceInclude;

async function pendingCount(homeId: string): Promise<number> {
  return prisma.condolence.count({
    where: { card: { funeralHomeId: homeId }, status: 'PENDING' },
  });
}

adminRouter.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const [
      totalHomes,
      activeHomes,
      suspendedHomes,
      totalCards,
      publishedCards,
      pending,
      approved,
      rejected,
      activePlans,
    ] = await Promise.all([
      prisma.funeralHome.count(),
      prisma.funeralHome.count({ where: { status: 'ACTIVE' } }),
      prisma.funeralHome.count({ where: { status: 'SUSPENDED' } }),
      prisma.card.count(),
      prisma.card.count({ where: { published: true } }),
      prisma.condolence.count({ where: { status: 'PENDING' } }),
      prisma.condolence.count({ where: { status: 'APPROVED' } }),
      prisma.condolence.count({ where: { status: 'REJECTED' } }),
      prisma.funeralHome.findMany({
        where: { status: 'ACTIVE' },
        select: { plan: true },
      }),
    ]);

    const demoMrrTry = activePlans.reduce(
      (sum, home) => sum + (home.plan === 'MONTHLY' ? getPlanPrice('MONTHLY') : 0),
      0,
    );

    res.json({
      homes: { total: totalHomes, active: activeHomes, suspended: suspendedHomes },
      cards: {
        total: totalCards,
        published: publishedCards,
        unpublished: totalCards - publishedCards,
      },
      messages: { pending, approved, rejected },
      demoMrrTry,
    });
  }),
);

adminRouter.get(
  '/homes',
  asyncHandler(async (req, res) => {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const planParam = typeof req.query.plan === 'string' ? req.query.plan : undefined;
    const statusParam = typeof req.query.status === 'string' ? req.query.status : undefined;
    const plan =
      planParam && ['TRIAL', 'SINGLE', 'MONTHLY'].includes(planParam) ? planParam : undefined;
    const status =
      statusParam && ['ACTIVE', 'SUSPENDED'].includes(statusParam) ? statusParam : undefined;
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);

    const where: Prisma.FuneralHomeWhereInput = {};
    if (search) {
      where.OR = [{ name: { contains: search } }, { phone: { contains: search } }];
    }
    if (plan) where.plan = plan;
    if (status) where.status = status;

    const homes = await prisma.funeralHome.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: homeInclude,
    });
    const pending = await Promise.all(homes.map((home) => pendingCount(home.id)));

    res.json({
      homes: homes.map((home, index) =>
        toAdminHome({ ...home, pendingMessages: pending[index] }),
      ),
    });
  }),
);

adminRouter.get(
  '/homes/:id',
  asyncHandler(async (req, res) => {
    const home = await prisma.funeralHome.findUnique({
      where: { id: req.params.id },
      include: {
        _count: { select: { cards: true, users: true } },
        users: {
          select: { id: true, name: true, email: true, role: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        },
        cards: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { condolences: { where: { status: 'PENDING' } } },
            },
          },
        },
      },
    });

    if (!home) {
      throw new AppError(404, 'NOT_FOUND', 'Cenaze evi bulunamadı.');
    }

    const [pending, approved, rejected] = await Promise.all([
      prisma.condolence.count({
        where: { card: { funeralHomeId: home.id }, status: 'PENDING' },
      }),
      prisma.condolence.count({
        where: { card: { funeralHomeId: home.id }, status: 'APPROVED' },
      }),
      prisma.condolence.count({
        where: { card: { funeralHomeId: home.id }, status: 'REJECTED' },
      }),
    ]);

    res.json({
      home: toAdminHome({ ...home, pendingMessages: pending }),
      users: home.users,
      cards: home.cards.map((card) =>
        toAdminCard({
          ...card,
          funeralHome: { id: home.id, name: home.name },
        }),
      ),
      messageCounts: { pending, approved, rejected },
    });
  }),
);

adminRouter.patch(
  '/homes/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.funeralHome.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Cenaze evi bulunamadı.');
    }

    const parsed = adminHomeUpdateSchema.parse(req.body);
    if (Object.keys(parsed).length === 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Güncellenecek alan yok.', {
        _: 'En az bir alan gönderin.',
      });
    }

    const home = await prisma.funeralHome.update({
      where: { id: existing.id },
      data: parsed,
      include: homeInclude,
    });
    const pending = await pendingCount(home.id);

    res.json({ home: toAdminHome({ ...home, pendingMessages: pending }) });
  }),
);

adminRouter.get(
  '/cards',
  asyncHandler(async (req, res) => {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const homeId = typeof req.query.homeId === 'string' ? req.query.homeId : undefined;
    const publishedParam =
      typeof req.query.published === 'string' ? req.query.published : undefined;
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);

    const where: Prisma.CardWhereInput = {};
    if (search) {
      where.OR = [
        { deceasedName: { contains: search } },
        { slug: { contains: search } },
        { funeralHome: { name: { contains: search } } },
      ];
    }
    if (homeId) where.funeralHomeId = homeId;
    if (publishedParam === 'true' || publishedParam === 'false') {
      where.published = publishedParam === 'true';
    }

    const cards = await prisma.card.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: cardInclude,
    });

    res.json({ cards: cards.map(toAdminCard) });
  }),
);

adminRouter.patch(
  '/cards/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.card.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Kart bulunamadı.');
    }

    const parsed = adminCardUpdateSchema.parse(req.body);
    const card = await prisma.card.update({
      where: { id: existing.id },
      data: parsed,
      include: cardInclude,
    });

    res.json({ card: toAdminCard(card) });
  }),
);

adminRouter.delete(
  '/cards/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.card.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Kart bulunamadı.');
    }

    await prisma.card.delete({ where: { id: existing.id } });
    res.status(204).send();
  }),
);

adminRouter.get(
  '/messages',
  asyncHandler(async (req, res) => {
    const statusParam = typeof req.query.status === 'string' ? req.query.status : undefined;
    const status =
      statusParam && ['PENDING', 'APPROVED', 'REJECTED'].includes(statusParam)
        ? statusParam
        : undefined;
    const homeId = typeof req.query.homeId === 'string' ? req.query.homeId : undefined;
    const cardId = typeof req.query.cardId === 'string' ? req.query.cardId : undefined;
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 200);

    const where: Prisma.CondolenceWhereInput = {};
    if (status) where.status = status;
    if (homeId) where.card = { funeralHomeId: homeId };
    if (cardId) where.cardId = cardId;

    const messages = await prisma.condolence.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: messageInclude,
    });

    res.json({ messages: messages.map(toAdminMessage) });
  }),
);

adminRouter.patch(
  '/messages/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.condolence.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Taziye mesajı bulunamadı.');
    }

    const parsed = moderationSchema.parse(req.body);
    const approved = parsed.status === 'APPROVED';
    const message = await prisma.condolence.update({
      where: { id: existing.id },
      data: {
        status: parsed.status,
        approvedAt: approved ? new Date() : null,
        approvedByUserId: approved ? req.user!.id : null,
      },
      include: messageInclude,
    });

    res.json({ message: toAdminMessage(message) });
  }),
);

adminRouter.delete(
  '/messages/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.condolence.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Taziye mesajı bulunamadı.');
    }

    await prisma.condolence.delete({ where: { id: existing.id } });
    res.status(204).send();
  }),
);
