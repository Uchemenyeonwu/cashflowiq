require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

(async () => {
  try {
    const hashedPassword = await bcrypt.hash('Dikeoha042$100%', 10);

    const updatedUser = await prisma.user.update({
      where: { email: 'uchemenyeonwuekwe@gmail.com' },
      data: {
        password: hashedPassword,
        name: 'App Owner',
        businessName: 'CashFlowIQ',
        businessType: 'SaaS',
        subscriptionTier: 'pro'
      }
    });

    console.log('✅ User credentials updated successfully!');
    console.log('   Email: uchemenyeonwuekwe@gmail.com');
    console.log('   Password: Dikeoha042$100%');
    console.log('   Name:', updatedUser.name);
    console.log('   Business: CashFlowIQ');
    console.log('   Subscription: Pro (Free)');

    // Check if admin role exists
    const adminRole = await prisma.adminRole.findUnique({
      where: { userId: updatedUser.id }
    });

    if (adminRole) {
      console.log('   Admin: ✅ Yes (Super Admin)');
    } else {
      console.log('   Admin: ❌ No admin role found - creating one...');
      await prisma.adminRole.create({
        data: {
          userId: updatedUser.id,
          role: 'super_admin',
          permissions: [
            'view_analytics',
            'manage_users',
            'export_data',
            'manage_billing',
            'system_settings',
          ],
          grantedBy: updatedUser.id,
        },
      });
      console.log('   Admin: ✅ Yes (Super Admin - just created)');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
