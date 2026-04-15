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

    // Get total API key usage
    const totalApiKeys = await prisma.apiKey.count();
    const activeApiKeys = await prisma.apiKey.count({
      where: { isActive: true },
    });

    // Get total API requests
    const totalRequests = await prisma.apiKey.aggregate({
      _sum: { requestCount: true },
    });

    // Get API usage by tier (from User subscription data)
    const apiUsageByTier = await prisma.apiKey.findMany({
      select: {
        user: {
          select: { subscriptionTier: true },
        },
        requestCount: true,
      },
    });

    const tierUsage: Record<string, { keys: number; requests: number }> = {};
    apiUsageByTier.forEach((item) => {
      const tier = item.user?.subscriptionTier || 'free';
      if (!tierUsage[tier]) {
        tierUsage[tier] = { keys: 0, requests: 0 };
      }
      tierUsage[tier].keys++;
      tierUsage[tier].requests += item.requestCount || 0;
    });

    // Get top endpoints
    const topEndpoints = await prisma.apiUsageLog.groupBy({
      by: ['endpoint'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    // Get error rates
    const totalApiCalls = await prisma.apiUsageLog.count();
    const errorCalls = await prisma.apiUsageLog.count({
      where: { statusCode: { gte: 400 } },
    });

    return NextResponse.json({
      apiKeys: {
        total: totalApiKeys,
        active: activeApiKeys,
      },
      requests: {
        total: totalRequests._sum.requestCount || 0,
        errorRate: totalApiCalls > 0 ? (errorCalls / totalApiCalls) * 100 : 0,
      },
      byTier: tierUsage,
      topEndpoints: topEndpoints.map((item) => ({
        endpoint: item.endpoint,
        count: item._count.id,
      })),
    });
  } catch (error) {
    console.error('Error fetching API usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
