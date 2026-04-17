require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

(async () => {
  try {
    const oldUser = await prisma.user.findUnique({
      where: { email: 'john@doe.com' }
    });

    if (!oldUser) {
      console.log('❌ Old user not found');
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash('Dikeoha042$100%', 10);

    const updatedUser = await prisma.user.update({
      where: { id: oldUser.id },
      data: {
        email: 'uchemenyeonwuekwe@gmail.com',
        password: hashedPassword,
        name: 'App Owner',
        businessName: 'CashFlowIQ',
        businessType: 'SaaS'
      }
    });

    console.log('✅ User migrated successfully!');
    console.log('   Old email: john@doe.com');
    console.log('   New email:', updatedUser.email);
    console.log('   Name:', updatedUser.name);
    console.log('   Subscription: Pro (Free)');
    console.log('   Admin: Yes');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
