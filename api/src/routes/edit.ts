import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { AppError, asyncHandler } from '../lib/errors';
import { toEditCard, toEditCondolence } from '../lib/serializers';
import { cardUpdateSchema, moderationSchema } from '../schemas';

export const editRouter = Router();

editRouter.get(
  '/cards/:token',
  asyncHandler(async (req, res) => {
    const card = await prisma.card.findUnique({
      where: { editToken: req.params.token },
      include: {
        funeralHome: { select: { name: true, phone: true } },
        condolences: {
          orderBy: { createdAt: 'desc' },
          select: { id: true, name: true, message: true, status: true, createdAt: true },
        },
      },
    });

    if (!card) {
      throw new AppError(404, 'NOT_FOUND', 'Düzenleme bağlantısı geçersiz.');
    }

    res.json({
      card: toEditCard(card),
      condolences: card.condolences.map(toEditCondolence),
    });
  }),
);

editRouter.patch(
  '/cards/:token',
  asyncHandler(async (req, res) => {
    const existing = await prisma.card.findUnique({
      where: { editToken: req.params.token },
      select: { id: true },
    });
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Düzenleme bağlantısı geçersiz.');
    }

    const parsed = cardUpdateSchema.parse(req.body);
    if (Object.keys(parsed).length === 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Güncellenecek alan yok.', {
        _: 'En az bir alan gönderin.',
      });
    }

    const card = await prisma.card.update({
      where: { id: existing.id },
      data: parsed,
      include: {
        funeralHome: { select: { name: true, phone: true } },
      },
    });

    res.json({ card: toEditCard(card) });
  }),
);

editRouter.delete(
  '/cards/:token',
  asyncHandler(async (req, res) => {
    const existing = await prisma.card.findUnique({
      where: { editToken: req.params.token },
      select: { id: true },
    });
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Düzenleme bağlantısı geçersiz.');
    }

    await prisma.card.delete({ where: { id: existing.id } });
    res.status(204).send();
  }),
);

editRouter.patch(
  '/cards/:token/condolences/:id',
  asyncHandler(async (req, res) => {
    const parsed = moderationSchema.parse(req.body);

    const existing = await prisma.condolence.findFirst({
      where: {
        id: req.params.id,
        card: { editToken: req.params.token },
      },
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
        approvedByUserId: null,
      },
      select: { id: true, name: true, message: true, status: true, createdAt: true },
    });

    res.json({ message: toEditCondolence(message) });
  }),
);
