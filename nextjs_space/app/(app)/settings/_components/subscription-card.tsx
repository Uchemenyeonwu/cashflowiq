'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SubscriptionCardProps {
  subscriptionTier: string;
  activeSubscription?: {
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    tier: string;
  } | null;
  stripeCustomerId?: string;
}

export function SubscriptionCard({
  subscriptionTier,
  activeSubscription,
  stripeCustomerId,
}: SubscriptionCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManageBilling = async () => {
    if (!stripeCustomerId) {
      router.push('/pricing');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to open billing portal');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      console.error('Portal error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Current Plan</p>
          <p className="text-lg font-semibold text-gray-900 capitalize">
            {subscriptionTier || 'Free'}
          </p>
        </div>

        {activeSubscription?.currentPeriodEnd && (
          <>
            <div>
              <p className="text-sm text-gray-600">Next Billing Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(activeSubscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>

            {activeSubscription.cancelAtPeriodEnd && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  Your subscription will be canceled on{' '}
                  {new Date(activeSubscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            )}
          </>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded px-3 py-2 text-red-700 text-sm">
            {error}
          </div>
        )}

        <Button
          onClick={handleManageBilling}
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          {loading ? 'Loading...' : 'Manage Billing Portal'}
        </Button>

        {subscriptionTier === 'free' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Upgrade Plan</h4>
            <p className="text-sm text-blue-700 mb-4">
              Unlock more features and increase your limits
            </p>
            <Button
              onClick={handleUpgrade}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              Upgrade Now
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
