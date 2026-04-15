import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SettingsForm from "./_components/settings-form";
import { SubscriptionCard } from "./_components/subscription-card";
import { ApiStatusCard } from "./_components/api-status-card";
import { ConnectBank } from "@/components/connect-bank";
import { LinkedAccountsList } from "@/components/linked-accounts-list";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return <div>Unauthorized</div>;
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  const stripeCustomer = await prisma.stripeCustomer.findUnique({
    where: { userId },
    include: {
      subscriptions: {
        where: { status: { in: ['active', 'past_due'] } },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  const activeSubscription = stripeCustomer?.subscriptions?.[0];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            {user && (
              <SettingsForm user={user} />
            )}
          </CardContent>
        </Card>

        {/* Subscription */}
        <SubscriptionCard
          subscriptionTier={user?.subscriptionTier || "free"}
          activeSubscription={activeSubscription}
          stripeCustomerId={stripeCustomer?.stripeCustomerId}
        />

        {/* Bank Connections */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Bank Connections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Connect Your Bank</h3>
              <p className="text-sm text-gray-600 mb-4">
                Connect your bank account to automatically sync transactions and get real-time cash flow insights.
              </p>
              <ConnectBank />
            </div>

            <div className="border-t pt-6">
              <LinkedAccountsList />
            </div>
          </CardContent>
        </Card>

        {/* Public API */}
        <div className="lg:col-span-3">
          <ApiStatusCard />
        </div>

        {/* Other Integrations */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Other Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">QuickBooks</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Sync your accounting data with QuickBooks Online
                </p>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition cursor-not-allowed opacity-50">
                  Coming Soon
                </button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Xero</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Connect your Xero accounting platform
                </p>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition cursor-not-allowed opacity-50">
                  Coming Soon
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
