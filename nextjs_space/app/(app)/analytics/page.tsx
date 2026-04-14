import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AnalyticsDashboard } from './_components/analytics-dashboard';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
        <p className="text-gray-600 mt-2">
          Deep insights into your cash flow, forecasts, and business segments
        </p>
      </div>

      <AnalyticsDashboard />
    </div>
  );
}
