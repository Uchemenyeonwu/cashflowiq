import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
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
      include: {
        linkedAccounts: {
          select: {
            id: true,
            plaidItemId: true,
            institutionName: true,
            accountName: true,
            accountMask: true,
            currentBalance: true,
            isActive: true,
            syncStatus: true,
            lastSyncedAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ linkedAccounts: user.linkedAccounts });
  } catch (error: any) {
    console.error('Error fetching linked accounts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch linked accounts' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
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

    // Delete the linked account and its transactions
    await prisma.linkedAccount.delete({
      where: { id: linkedAccountId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting linked account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete linked account' },
      { status: 500 }
    );
  }
}
