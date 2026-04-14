import { prisma } from './prisma';
import { Decimal } from '@prisma/client/runtime/library';

interface UserDataExport {
  user: any;
  transactions: any[];
  forecasts: any[];
  linkedAccounts: any[];
  teamMemberships: any[];
  subscription: any;
}

// Export user's personal data (GDPR)
export async function exportUserData(userId: string): Promise<UserDataExport> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        linkedAccounts: true,
        teamMemberships: true,
        stripeCustomer: {
          include: { subscriptions: true },
        },
      },
    });

    if (!user) throw new Error('User not found');

    const transactions = await prisma.transaction.findMany({
      where: { userId },
    });

    const forecasts = await prisma.forecast.findMany({
      where: { userId },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        businessName: user.businessName,
        businessType: user.businessType,
        subscriptionTier: user.subscriptionTier,
        createdAt: user.createdAt,
      },
      transactions,
      forecasts,
      linkedAccounts: user.linkedAccounts,
      teamMemberships: user.teamMemberships,
      subscription: user.stripeCustomer?.subscriptions || [],
    };
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw error;
  }
}

// Delete user and all associated data (GDPR right to be forgotten)
export async function deleteUserAndData(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        linkedAccounts: true,
        ownedTeams: true,
      },
    });

    if (!user) throw new Error('User not found');

    await prisma.$transaction(async (tx) => {
      await tx.transaction.deleteMany({ where: { userId } });
      await tx.forecast.deleteMany({ where: { userId } });
      await tx.linkedAccount.deleteMany({ where: { userId } });
      await tx.apiKey.deleteMany({ where: { userId } });
      await tx.reportExport.deleteMany({ where: { userId } });
      await tx.teamMember.deleteMany({ where: { userId } });

      for (const team of user.ownedTeams) {
        await tx.team.delete({ where: { id: team.id } });
      }

      await tx.user.delete({ where: { id: userId } });
    });

    return { success: true, message: 'User and all associated data deleted' };
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
}

// Create anonymized export for compliance
export async function createAnonymizedExport(userId: string) {
  try {
    const data = await exportUserData(userId);

    const anonymized = {
      exportDate: new Date().toISOString(),
      dataCategories: {
        userProfile: Boolean(data.user),
        transactions: data.transactions.length,
        forecasts: data.forecasts.length,
        linkedAccounts: data.linkedAccounts.length,
        teamMemberships: data.teamMemberships.length,
      },
      transactionsSummary: {
        total: data.transactions.length,
        dateRange: data.transactions.length > 0 ? {
          earliest: new Date(Math.min(...data.transactions.map((t) => new Date(t.date).getTime()))).toISOString(),
          latest: new Date(Math.max(...data.transactions.map((t) => new Date(t.date).getTime()))).toISOString(),
        } : null,
      },
    };

    return anonymized;
  } catch (error) {
    console.error('Error creating anonymized export:', error);
    throw error;
  }
}

// Verify data retention policy
export async function cleanupExpiredData() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deletedExports = await prisma.reportExport.deleteMany({
      where: {
        status: { not: 'completed' },
        createdAt: { lt: thirtyDaysAgo },
      },
    });

    const deletedExpiredExports = await prisma.reportExport.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    return {
      deletedIncompleteExports: deletedExports.count,
      deletedExpiredExports: deletedExpiredExports.count,
    };
  } catch (error) {
    console.error('Error cleaning up expired data:', error);
    throw error;
  }
}