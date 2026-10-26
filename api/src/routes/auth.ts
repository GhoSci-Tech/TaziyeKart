import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../lib/auth';
import { AppError, asyncHandler } from '../lib/errors';

export const authRouter = Router();

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        funeralHomeId: true,
        funeralHome: {
          select: {
            id: true,
            name: true,
            phone: true,
            plan: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Kullanıcı bulunamadı.');
    }

    res.json({ user });
  }),
);
