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

    // Get latest health metric
    const latestHealth = await prisma.systemHealthMetric.findFirst({
      orderBy: { timestamp: 'desc' },
    });

    // Get Plaid sync metrics
    const totalSyncs = await prisma.plaidSyncMetric.count();
    const failedSyncs = await prisma.plaidSyncMetric.count({
      where: { syncStatus: 'failed' },
    });

    const recentSyncs = await prisma.plaidSyncMetric.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get sync status by user
    const activeSyncErrors = await prisma.linkedAccount.count({
      where: { syncStatus: 'error' },
    });

    const totalLinkedAccounts = await prisma.linkedAccount.count();
    const successfulSyncs = totalSyncs - failedSyncs;

    return NextResponse.json({
      system: {
        status: latestHealth?.status || 'unknown',
        cpuUsage: latestHealth?.cpuUsage || null,
        memoryUsage: latestHealth?.memoryUsage || null,
        avgResponseTimeMs: latestHealth?.avgResponseTimeMs || null,
        lastUpdated: latestHealth?.timestamp || new Date(),
      },
      plaidSync: {
        totalSyncs,
        successfulSyncs,
        failedSyncs,
        syncErrorRate: totalSyncs > 0 ? (failedSyncs / totalSyncs) * 100 : 0,
        activeSyncErrors,
        totalLinkedAccounts,
        recentSyncMetrics: recentSyncs.slice(0, 5),
      },
    });
  } catch (error) {
    console.error('Error fetching health metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
