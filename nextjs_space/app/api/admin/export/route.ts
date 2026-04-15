import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const exportType = searchParams.get('type') || 'users';
    const format = searchParams.get('format') || 'json';

    let data: any = {};

    // Collect data based on export type
    if (exportType === 'users' || exportType === 'all') {
      data.users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          businessName: true,
          subscriptionTier: true,
          createdAt: true,
          lastLoginAt: true,
        },
      });
    }

    if (exportType === 'revenue' || exportType === 'all') {
      data.subscriptions = await prisma.stripeSubscription.findMany({
        select: {
          id: true,
          tier: true,
          status: true,
          currentPeriodEnd: true,
          createdAt: true,
        },
      });
    }

    if (exportType === 'api' || exportType === 'all') {
      data.apiUsage = await prisma.apiKey.findMany({
        select: {
          id: true,
          name: true,
          requestCount: true,
          createdAt: true,
          lastUsedAt: true,
        },
      });
    }

    if (format === 'csv') {
      // Convert to CSV
      const csvContent = convertToCSV(data, exportType);
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="admin-export-${exportType}-${Date.now()}.csv"`,
        },
      });
    }

    // Return JSON
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function convertToCSV(data: any, type: string): string {
  if (type === 'users' || type === 'all') {
    const users = data.users || [];
    if (users.length === 0) return 'No users to export';

    const headers = ['ID', 'Email', 'Name', 'Business Name', 'Tier', 'Created At', 'Last Login'];
    const rows = users.map((u: any) => [
      u.id,
      u.email,
      u.name || '',
      u.businessName || '',
      u.subscriptionTier,
      u.createdAt,
      u.lastLoginAt || '',
    ]);

    return [
      headers.join(','),
      ...rows.map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(',')),
    ].join('\n');
  }

  return JSON.stringify(data, null, 2);
}
