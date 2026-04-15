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

    // Get user statistics
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: { lastLoginAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    });
    
    const tierBreakdown = await prisma.user.groupBy({
      by: ['subscriptionTier'],
      _count: { id: true },
    });

    const tierCounts = tierBreakdown.reduce(
      (acc: Record<string, number>, tier) => {
        acc[tier.subscriptionTier] = tier._count.id;
        return acc;
      },
      {}
    );

    // Get revenue statistics
    const activeSubscriptions = await prisma.stripeSubscription.count({
      where: { status: 'active' },
    });

    const totalRevenue = await prisma.stripeInvoice.aggregate({
      where: { status: 'paid' },
      _sum: { amount: true },
    });

    // Get recent registrations
    const newUsersThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    return NextResponse.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        newThisMonth: newUsersThisMonth,
        byTier: tierCounts,
      },
      revenue: {
        activeSubscriptions,
        totalRevenue: totalRevenue._sum.amount ? totalRevenue._sum.amount / 100 : 0, // Convert cents to dollars
      },
    });
  } catch (error) {
    console.error('Error fetching admin overview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
