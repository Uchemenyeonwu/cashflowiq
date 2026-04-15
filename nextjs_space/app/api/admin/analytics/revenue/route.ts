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

    // Get subscription stats by tier
    const subscriptionsByTier = await prisma.stripeSubscription.groupBy({
      by: ['tier', 'status'],
      _count: { id: true },
    });

    // Get monthly revenue
    const paidInvoices = await prisma.stripeInvoice.findMany({
      where: { status: 'paid' },
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const monthlyRevenue: Record<string, number> = {};
    paidInvoices.forEach((invoice: any) => {
      const month = invoice.createdAt.toISOString().substring(0, 7); // YYYY-MM
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + invoice.amount / 100;
    });

    // Get churn rate
    const canceledThisMonth = await prisma.stripeSubscription.count({
      where: {
        canceledAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    const activeSubscriptions = await prisma.stripeSubscription.count({
      where: { status: 'active' },
    });

    const mrrBreakdown = await prisma.stripeSubscription.groupBy({
      by: ['tier'],
      _count: { id: true },
    });

    // Estimate MRR based on tier counts
    const tierPrices: Record<string, number> = {
      solo: 19,
      pro: 59,
      team: 149,
    };

    let totalMRR = 0;
    const mrrByTier: Record<string, number> = {};

    mrrBreakdown.forEach((item: any) => {
      const tierMRR = (tierPrices[item.tier] || 0) * item._count.id;
      mrrByTier[item.tier] = tierMRR;
      totalMRR += tierMRR;
    });

    return NextResponse.json({
      mrrByTier,
      totalMRR,
      monthlyRevenue: Object.entries(monthlyRevenue)
        .sort()
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
      churnRate: activeSubscriptions > 0 ? (canceledThisMonth / activeSubscriptions) * 100 : 0,
      activeSubscriptions,
      subscriptionsByTier: subscriptionsByTier.map((item: any) => ({
        tier: item.tier,
        status: item.status,
        count: item._count.id,
      })),
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
