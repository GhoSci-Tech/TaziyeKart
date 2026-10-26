import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required. Copy api/.env.example to api/.env and fill it.`);
  }
  return value;
}

async function main() {
  const adminEmail = required('ADMIN_EMAIL').toLowerCase();
  const adminPassword = required('ADMIN_PASSWORD');
  const adminName = process.env.ADMIN_NAME?.trim() || 'Süper Admin';
  const demoEmail = required('DEMO_EMAIL').toLowerCase();
  const demoPassword = required('DEMO_PASSWORD');

  const adminHash = await hash(adminPassword, 10);
  const demoHash = await hash(demoPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      role: 'SUPERADMIN',
      passwordHash: adminHash,
      funeralHomeId: null,
    },
    create: {
      email: adminEmail,
      name: adminName,
      role: 'SUPERADMIN',
      passwordHash: adminHash,
    },
  });

  const demoHome = await prisma.funeralHome.upsert({
    where: { id: 'demo-home' },
    update: {
      name: 'Örnek Cenaze Evi',
      phone: '0212 000 00 00',
      plan: 'MONTHLY',
      status: 'ACTIVE',
    },
    create: {
      id: 'demo-home',
      name: 'Örnek Cenaze Evi',
      phone: '0212 000 00 00',
      plan: 'MONTHLY',
      status: 'ACTIVE',
    },
  });

  await prisma.user.upsert({
    where: { email: demoEmail },
    update: {
      name: 'Demo Yetkili',
      role: 'FUNERAL_HOME',
      passwordHash: demoHash,
      funeralHomeId: demoHome.id,
    },
    create: {
      email: demoEmail,
      name: 'Demo Yetkili',
      role: 'FUNERAL_HOME',
      passwordHash: demoHash,
      funeralHomeId: demoHome.id,
    },
  });

  console.log(`[seed] superadmin: ${adminEmail}`);
  console.log(`[seed] demo home: ${demoHome.name} (${demoHome.plan})`);
  console.log(`[seed] demo user: ${demoEmail}`);
  console.log('[seed] no cards seeded; the panel starts empty.');
}

main()
  .catch((error) => {
    console.error('[seed] failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
