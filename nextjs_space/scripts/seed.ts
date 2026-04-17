import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const testUser = await prisma.user.upsert({
    where: { email: "uchemenyeonwuekwe@gmail.com" },
    update: {
      password: await hash("Dikeoha042$100%", 10),
    },
    create: {
      email: "uchemenyeonwuekwe@gmail.com",
      name: "App Owner",
      password: await hash("Dikeoha042$100%", 10),
      businessName: "CashFlowIQ",
      businessType: "SaaS",
      subscriptionTier: "pro",
    },
  });

  console.log("Test user created:", testUser.email);

  // Create sample transactions for the test user
  const now = new Date();
  const sampleTransactions = [
    {
      date: new Date(now.getFullYear(), now.getMonth(), 1),
      description: "Monthly Salary",
      category: "salary",
      type: "income",
      amount: 5000,
    },
    {
      date: new Date(now.getFullYear(), now.getMonth(), 5),
      description: "Office Supplies",
      category: "supplies",
      type: "expense",
      amount: 250,
    },
    {
      date: new Date(now.getFullYear(), now.getMonth(), 8),
      description: "Client Project Payment",
      category: "client-payment",
      type: "income",
      amount: 3000,
    },
    {
      date: new Date(now.getFullYear(), now.getMonth(), 10),
      description: "Rent",
      category: "rent",
      type: "expense",
      amount: 2000,
    },
    {
      date: new Date(now.getFullYear(), now.getMonth(), 15),
      description: "Utilities",
      category: "utilities",
      type: "expense",
      amount: 500,
    },
    {
      date: new Date(now.getFullYear(), now.getMonth(), 20),
      description: "Client Invoice",
      category: "client-payment",
      type: "income",
      amount: 4500,
    },
    {
      date: new Date(now.getFullYear(), now.getMonth(), 25),
      description: "Payroll",
      category: "payroll",
      type: "expense",
      amount: 3500,
    },
  ];

  for (const transaction of sampleTransactions) {
    await prisma.transaction.upsert({
      where: {
        id: `${testUser.id}-${transaction.description}`,
      },
      update: {},
      create: {
        userId: testUser.id,
        ...transaction,
      },
    });
  }

  console.log("Sample transactions created");

  // Create sample forecasts for 90 days
  for (let i = 0; i < 90; i++) {
    const forecastDate = new Date(now);
    forecastDate.setDate(forecastDate.getDate() + i);

    // Simulate AI forecast with some variance
    const baseForecast = 5000 - i * 20 + Math.random() * 1000;

    await prisma.forecast.upsert({
      where: {
        id: `${testUser.id}-${forecastDate.toDateString()}`,
      },
      update: {},
      create: {
        userId: testUser.id,
        date: forecastDate,
        projectedCashFlow: baseForecast,
        confidence: Math.max(50, 95 - i * 0.3),
      },
    });
  }

  console.log("Sample forecasts created");

  // Grant admin privileges to test user
  const adminRole = await prisma.adminRole.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      role: "super_admin",
      permissions: [
        "view_analytics",
        "manage_users",
        "export_data",
        "manage_billing",
        "system_settings",
      ],
      grantedBy: testUser.id, // Self-granted for initial setup
    },
  });

  console.log("Admin privileges granted:", adminRole.role);
  console.log("\n✅ Setup Complete!");
  console.log("Login with:");
  console.log("  Email: uchemenyeonwuekwe@gmail.com");
  console.log("  Password: Dikeoha042$100%");
  console.log("  Tier: Pro (Free)");
  console.log("  Access: Admin Dashboard available at /admin");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
