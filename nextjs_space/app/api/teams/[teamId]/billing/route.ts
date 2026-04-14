import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getTeamBillingInfo } from '@/lib/team-billing';
import { hasTeamPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await hasTeamPermission(
      session.user.id,
      params.teamId,
      'manage_team'
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const billingInfo = await getTeamBillingInfo(params.teamId);
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        stripeCustomer: {
          include: {
            subscriptions: {
              where: { status: 'active' },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    const subscription = user?.stripeCustomer?.subscriptions[0];
    const tier = subscription?.tier || 'free';

    return NextResponse.json({
      ...billingInfo,
      subscriptionTier: tier,
    });
  } catch (error) {
    console.error('Error fetching team billing info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team billing info' },
      { status: 500 }
    );
  }
}