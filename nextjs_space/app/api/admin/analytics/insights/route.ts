import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminRole = await prisma.adminRole.findUnique({
      where: { userId: session.user.id },
    });

    if (!adminRole) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get most used features (transaction categories)
    const topCategories = await prisma.transaction.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    // Get forecasting usage
    const usersWithForecasts = await prisma.user.count({
      where: {
        forecasts: {
          some: {},
        },
      },
    });

    // Get average forecast accuracy
    const forecasts = await prisma.forecast.findMany({
      where: {
        anomalyScore: { not: null },
      },
      select: { anomalyScore: true },
      take: 100,
    });

    const avgAnomalyScore =
      forecasts.length > 0
        ? forecasts.reduce((sum: any, f: any) => sum + (f.anomalyScore ? parseFloat(f.anomalyScore.toString()) : 0), 0) /
          forecasts.length
        : 0;

    // Get feature adoption
    const usersWithBankSync = await prisma.user.count({
      where: {
        linkedAccounts: {
          some: {},
        },
      },
    });

    const usersWithApiKeys = await prisma.user.count({
      where: {
        apiKeys: {
          some: {},
        },
      },
    });

    const totalUsers = await prisma.user.count();

    return NextResponse.json({
      features: {
        topCategories: topCategories.map((item: any) => ({
          category: item.category,
          count: item._count.id,
        })),
      },
      forecasting: {
        usersWithForecasts,
        adoptionRate: totalUsers > 0 ? (usersWithForecasts / totalUsers) * 100 : 0,
        avgAnomalyScore,
      },
      adoption: {
        bankSync: {
          users: usersWithBankSync,
          rate: totalUsers > 0 ? (usersWithBankSync / totalUsers) * 100 : 0,
        },
        api: {
          users: usersWithApiKeys,
          rate: totalUsers > 0 ? (usersWithApiKeys / totalUsers) * 100 : 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
