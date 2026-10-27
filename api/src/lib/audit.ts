import { prisma } from './prisma';

type AuditInput = {
  actorUserId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  meta?: Record<string, unknown>;
};

export async function recordAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId: input.actorUserId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        meta: input.meta ? JSON.stringify(input.meta) : null,
      },
    });
  } catch (error) {
    console.error('[audit] failed to record action', error);
  }
}
