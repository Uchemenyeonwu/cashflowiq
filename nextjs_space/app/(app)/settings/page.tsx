import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SettingsForm from "./_components/settings-form";

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
  });

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
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Current Plan</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {user?.subscriptionTier || "Free"}
              </p>
            </div>

            {stripeCustomer?.renewalDate && (
              <div>
                <p className="text-sm text-gray-600">Next Billing Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(stripeCustomer.renewalDate).toLocaleDateString()}
                </p>
              </div>
            )}

            <button className="w-full border border-gray-300 rounded px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              Manage Billing Portal
            </button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Upgrade Plan</h4>
              <p className="text-sm text-blue-700 mb-4">
                Unlock more features and increase your limits
              </p>
              <button className="w-full bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700 transition">
                Upgrade Now
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Plaid</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Connect your bank account for automatic transaction sync
                </p>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition cursor-not-allowed opacity-50">
                  Coming Soon
                </button>
              </div>

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
                <h4 className="font-semibold text-gray-900 mb-2">Stripe</h4>
                <p className="text-sm text-gray-600 mb-4">
                  View your Stripe payment transactions
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
