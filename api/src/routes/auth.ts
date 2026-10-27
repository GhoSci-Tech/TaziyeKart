import { Router, type Response } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import {
  clearSessionCookie,
  hashPassword,
  requireAuth,
  setSessionCookie,
  signSession,
  verifyPassword,
  type SessionUser,
} from '../lib/auth';
import { AppError, asyncHandler } from '../lib/errors';
import { recordAudit } from '../lib/audit';
import { toUser } from '../lib/serializers';
import { loginSchema, registerSchema } from '../schemas';
import { enforceRateLimit } from '../lib/rateLimit';
import type { Role } from '../lib/constants';

export const authRouter = Router();

const userSelect = {
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
} satisfies Prisma.UserSelect;

async function loadUser(id: string) {
  return prisma.user.findUnique({ where: { id }, select: userSelect });
}

type LoadedUser = NonNullable<Awaited<ReturnType<typeof loadUser>>>;

function signAndRespond(res: Response, user: LoadedUser, status = 200) {
  const session: SessionUser = {
    id: user.id,
    role: user.role as Role,
    homeId: user.funeralHomeId,
  };
  setSessionCookie(res, signSession(session));
  return res.status(status).json({ user: toUser(user) });
}

function assertDemoMode(): void {
  if (process.env.DEMO_MODE !== 'true') {
    throw new AppError(404, 'DEMO_DISABLED', 'Demo girişi kapalı.');
  }
}

async function loadDemoUser(emailEnv: string): Promise<LoadedUser> {
  const email = process.env[emailEnv]?.trim().toLowerCase();
  if (!email) {
    throw new AppError(404, 'DEMO_NOT_READY', 'Demo hesabı yapılandırılmamış.');
  }

  const found = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!found) {
    throw new AppError(
      404,
      'DEMO_NOT_READY',
      'Demo hesabı hazır değil. `npm run db:setup` çalıştırın.',
    );
  }

  const user = await loadUser(found.id);
  if (!user) {
    throw new AppError(404, 'DEMO_NOT_READY', 'Demo hesabı hazır değil.');
  }
  return user;
}

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    enforceRateLimit(`register:${req.ip}`, 10, 15 * 60 * 1000);
    const parsed = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({
      where: { email: parsed.email },
      select: { id: true },
    });
    if (existing) {
      throw new AppError(409, 'CONFLICT', 'Bu e-posta ile bir hesap zaten var.');
    }

    const passwordHash = await hashPassword(parsed.password);
    const phone = parsed.phone?.trim() ? parsed.phone.trim() : null;

    const created = await prisma.$transaction(async (tx) => {
      const home = await tx.funeralHome.create({
        data: {
          name: parsed.homeName,
          phone,
          plan: 'TRIAL',
          status: 'ACTIVE',
        },
      });

      return tx.user.create({
        data: {
          email: parsed.email,
          passwordHash,
          name: parsed.contactName,
          role: 'FUNERAL_HOME',
          funeralHomeId: home.id,
        },
      });
    });

    const user = await loadUser(created.id);
    if (!user) {
      throw new AppError(500, 'INTERNAL_ERROR', 'Kullanıcı oluşturulamadı.');
    }

    signAndRespond(res, user, 201);
  }),
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    enforceRateLimit(`login:${req.ip}`, 20, 15 * 60 * 1000);
    const parsed = loginSchema.parse(req.body);

    const found = await prisma.user.findUnique({
      where: { email: parsed.email },
      select: { id: true, passwordHash: true },
    });

    if (!found || !(await verifyPassword(parsed.password, found.passwordHash))) {
      throw new AppError(401, 'UNAUTHORIZED', 'E-posta veya şifre hatalı.');
    }

    const user = await loadUser(found.id);
    if (!user) {
      throw new AppError(401, 'UNAUTHORIZED', 'E-posta veya şifre hatalı.');
    }

    if (user.role === 'SUPERADMIN') {
      await recordAudit({
        actorUserId: user.id,
        action: 'ADMIN_LOGIN',
        entity: 'auth',
        meta: { email: user.email },
      });
    }

    signAndRespond(res, user);
  }),
);

authRouter.post('/logout', (_req, res) => {
  clearSessionCookie(res);
  res.status(204).send();
});

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await loadUser(req.user!.id);
    if (!user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Kullanıcı bulunamadı.');
    }
    res.json({ user: toUser(user) });
  }),
);

authRouter.post(
  '/demo-home',
  asyncHandler(async (req, res) => {
    assertDemoMode();
    enforceRateLimit(`demo-home:${req.ip}`, 10, 15 * 60 * 1000);
    const user = await loadDemoUser('DEMO_EMAIL');
    signAndRespond(res, user);
  }),
);

authRouter.post(
  '/demo-admin',
  asyncHandler(async (req, res) => {
    assertDemoMode();
    enforceRateLimit(`demo-admin:${req.ip}`, 10, 15 * 60 * 1000);
    const user = await loadDemoUser('ADMIN_EMAIL');
    await recordAudit({
      actorUserId: user.id,
      action: 'ADMIN_LOGIN',
      entity: 'auth',
      meta: { email: user.email, demo: true },
    });
    signAndRespond(res, user);
  }),
);
