import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Users, DollarSign, Activity, AlertTriangle, TrendingUp, Database } from 'lucide-react';
import AdminDashboardClient from './_components/admin-dashboard-client';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect('/login');
  }

  // Check if user is admin
  const adminRole = await prisma.adminRole.findUnique({
    where: { userId: session.user.id },
  });

  if (!adminRole) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            System analytics, user management, and platform monitoring
          </p>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <AdminDashboardClient />
    </div>
  );
}
