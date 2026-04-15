import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      name: 'John Doe',
      businessName: 'Acme Corp',
      businessType: 'consulting',
      password: await hash('johndoe123', 12),
      subscriptionTier: 'pro',
    },
  });

  console.log(`✅ Created user: ${user.name}`);

  // Create sample transactions for the current month
  const transactions = [
    {
      userId: user.id,
      date: new Date(2026, 3, 1),
      description: 'Monthly Salary',
      category: 'salary',
      type: 'income' as const,
      amount: new Decimal('5000.00'),
    },
    {
      userId: user.id,
      date: new Date(2026, 3, 5),
      description: 'Client Invoice - Project Alpha',
      category: 'client-payment',
      type: 'income' as const,
      amount: new Decimal('7500.00'),
    },
    {
      userId: user.id,
      date: new Date(2026, 3, 8),
      description: 'Payroll',
      category: 'payroll',
      type: 'expense' as const,
      amount: new Decimal('3000.00'),
    },
    {
      userId: user.id,
      date: new Date(2026, 3, 10),
      description: 'Office Rent',
      category: 'rent',
      type: 'expense' as const,
      amount: new Decimal('2500.00'),
    },
    {
      userId: user.id,
      date: new Date(2026, 3, 15),
      description: 'Electricity Bill',
      category: 'utilities',
      type: 'expense' as const,
      amount: new Decimal('250.00'),
    },
    {
      userId: user.id,
      date: new Date(2026, 3, 20),
      description: 'Office Supplies',
      category: 'supplies',
      type: 'expense' as const,
      amount: new Decimal('500.00'),
    },
    {
      userId: user.id,
      date: new Date(2026, 3, 25),
      description: 'Client Invoice - Project Beta',
      category: 'client-payment',
      type: 'income' as const,
      amount: new Decimal('5000.00'),
    },
  ];

  for (const transaction of transactions) {
    await prisma.transaction.upsert({
      where: {
        userId_date_description: {
          userId: transaction.userId,
          date: transaction.date,
          description: transaction.description,
        },
      },
      update: {},
      create: transaction,
    });
  }

  console.log(`✅ Created ${transactions.length} sample transactions`);

  // Create 90-day forecast data
  const forecasts = [];
  const startDate = new Date(2026, 3, 1);
  for (let i = 0; i < 90; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    forecasts.push({
      userId: user.id,
      date,
      projected: new Decimal(Math.max(2000, 6250 + Math.sin(i / 10) * 2000)),
      confidence: 0.73,
    });
  }

  for (const forecast of forecasts) {
    await prisma.forecast.upsert({
      where: {
        userId_date: {
          userId: forecast.userId,
          date: forecast.date,
        },
      },
      update: {},
      create: forecast,
    });
  }

  console.log(`✅ Created ${forecasts.length} forecast records`);

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
