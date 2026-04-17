require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

(async () => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    });

    console.log('All users in database:');
    users.forEach(u => console.log(`  - ${u.email} (${u.name})`));
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
