import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test user
  const existingUser = await prisma.user.findUnique({ where: { email: 'john@doe.com' } });
  let user;
  if (existingUser) {
    user = existingUser;
    console.log('✅ User already exists: john@doe.com');
  } else {
    user = await prisma.user.create({
      data: {
        email: 'john@doe.com',
        name: 'John Doe',
        businessName: 'Acme Corp',
        businessType: 'consulting',
        password: await hash('johndoe123', 12),
        subscriptionTier: 'pro',
      },
    });
    console.log(`✅ Created user: ${user.name}`);
  }

  // Check if transactions already seeded
  const txCount = await prisma.transaction.count({ where: { userId: user.id } });
  if (txCount === 0) {
    await prisma.transaction.createMany({
      data: [
        { userId: user.id, date: new Date(2026, 3, 1), description: 'Monthly Salary', category: 'salary', type: 'income', amount: 5000.00 },
        { userId: user.id, date: new Date(2026, 3, 5), description: 'Client Invoice - Project Alpha', category: 'client-payment', type: 'income', amount: 7500.00 },
        { userId: user.id, date: new Date(2026, 3, 8), description: 'Payroll', category: 'payroll', type: 'expense', amount: 3000.00 },
        { userId: user.id, date: new Date(2026, 3, 10), description: 'Office Rent', category: 'rent', type: 'expense', amount: 2500.00 },
        { userId: user.id, date: new Date(2026, 3, 15), description: 'Electricity Bill', category: 'utilities', type: 'expense', amount: 250.00 },
        { userId: user.id, date: new Date(2026, 3, 20), description: 'Office Supplies', category: 'supplies', type: 'expense', amount: 500.00 },
        { userId: user.id, date: new Date(2026, 3, 25), description: 'Client Invoice - Project Beta', category: 'client-payment', type: 'income', amount: 5000.00 },
      ],
    });
    console.log('✅ Created 7 sample transactions');
  } else {
    console.log(`✅ Transactions already seeded (${txCount} found)`);
  }

  // Check if forecasts already seeded
  const fcCount = await prisma.forecast.count({ where: { userId: user.id } });
  if (fcCount === 0) {
    const forecasts = [];
    const startDate = new Date(2026, 3, 1);
    for (let i = 0; i < 90; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      forecasts.push({
        userId: user.id,
        date,
        projectedCashFlow: parseFloat(Math.max(2000, 6250 + Math.sin(i / 10) * 2000).toFixed(2)),
        confidence: 73,
      });
    }
    await prisma.forecast.createMany({ data: forecasts });
    console.log('✅ Created 90 forecast records');
  } else {
    console.log(`✅ Forecasts already seeded (${fcCount} found)`);
  }

  // Create admin role for test user
  const existingAdmin = await prisma.adminRole.findUnique({ where: { userId: user.id } });
  if (!existingAdmin) {
    await prisma.adminRole.create({
      data: {
        userId: user.id,
        role: 'super_admin',
      },
    });
    console.log('✅ Created admin role for test user');
  } else {
    console.log('✅ Admin role already exists');
  }

  console.log('✨ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
