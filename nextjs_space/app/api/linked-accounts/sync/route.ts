import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { syncPlaidTransactions } from '@/lib/plaid-sync';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { linkedAccountId } = await req.json();

    if (!linkedAccountId) {
      return NextResponse.json(
        { error: 'Missing linkedAccountId' },
        { status: 400 }
      );
    }

    // Verify the linked account belongs to the user
    const linkedAccount = await prisma.linkedAccount.findFirst({
      where: {
        id: linkedAccountId,
        userId: user.id,
      },
    });

    if (!linkedAccount) {
      return NextResponse.json(
        { error: 'Linked account not found' },
        { status: 404 }
      );
    }

    // Trigger sync
    await syncPlaidTransactions(linkedAccountId);

    const updated = await prisma.linkedAccount.findUnique({
      where: { id: linkedAccountId },
    });

    return NextResponse.json({
      success: true,
      syncStatus: updated?.syncStatus,
      lastSyncedAt: updated?.lastSyncedAt,
    });
  } catch (error: any) {
    console.error('Error syncing linked account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync account' },
      { status: 500 }
    );
  }
}
