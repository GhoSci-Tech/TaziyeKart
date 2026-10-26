import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { AppError, asyncHandler } from '../lib/errors';
import { toPublicCard } from '../lib/serializers';
import { condolenceCreateSchema } from '../schemas';
import { enforceRateLimit } from '../lib/rateLimit';

export const publicRouter = Router();

publicRouter.get(
  '/cards/:slug',
  asyncHandler(async (req, res) => {
    const card = await prisma.card.findUnique({
      where: { slug: req.params.slug },
      include: {
        funeralHome: { select: { name: true, phone: true } },
        condolences: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          take: 50,
          select: { id: true, name: true, message: true, createdAt: true },
        },
      },
    });

    if (!card) {
      throw new AppError(404, 'NOT_FOUND', 'Taziye kartı bulunamadı.');
    }
    if (!card.published) {
      throw new AppError(404, 'CARD_NOT_PUBLISHED', 'Bu taziye kartı yayında değil.');
    }

    res.json({ card: toPublicCard(card) });
  }),
);

publicRouter.post(
  '/cards/:slug/condolences',
  asyncHandler(async (req, res) => {
    enforceRateLimit(`condolence:${req.ip}:${req.params.slug}`, 5, 60 * 60 * 1000);

    const card = await prisma.card.findUnique({
      where: { slug: req.params.slug },
      select: { id: true, published: true },
    });

    if (!card) {
      throw new AppError(404, 'NOT_FOUND', 'Taziye kartı bulunamadı.');
    }
    if (!card.published) {
      throw new AppError(404, 'CARD_NOT_PUBLISHED', 'Bu taziye kartı yayında değil.');
    }

    const parsed = condolenceCreateSchema.parse(req.body);

    if (parsed.website && parsed.website.trim().length > 0) {
      res.status(201).json({
        message: 'Mesajınız aile onayına gönderildi.',
        status: 'PENDING',
      });
      return;
    }

    await prisma.condolence.create({
      data: {
        cardId: card.id,
        name: parsed.name,
        message: parsed.message,
        status: 'PENDING',
      },
    });

    res.status(201).json({
      message: 'Mesajınız aile onayına gönderildi.',
      status: 'PENDING',
    });
  }),
);
