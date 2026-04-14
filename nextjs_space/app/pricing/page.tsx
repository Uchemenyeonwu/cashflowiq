'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

const TIERS = [
  {
    name: 'Solo',
    price: 19,
    description: 'For freelancers and solo operators',
    cta: 'Start Free Trial',
    priceId: 'price_solo',
    tier: 'solo',
    features: [
      'Up to 5 bank connections',
      'Basic cash flow forecasting',
      '30 days historical data',
      'Transaction categorization',
      'Monthly reports',
      'Email support',
    ],
  },
  {
    name: 'Pro',
    price: 59,
    description: 'For growing small businesses',
    cta: 'Start Free Trial',
    priceId: 'price_pro',
    tier: 'pro',
    popular: true,
    features: [
      'Unlimited bank connections',
      'Advanced AI forecasting',
      '2 years historical data',
      'Smart categorization',
      'Weekly reports',
      'Priority email support',
      'Scenario planning',
      'Custom forecasting models',
      'API access',
    ],
  },
  {
    name: 'Team',
    price: 149,
    description: 'For teams and departments',
    cta: 'Start Free Trial',
    priceId: 'price_team',
    tier: 'team',
    features: [
      'Unlimited everything',
      'Multi-user accounts',
      'Custom user roles',
      'Advanced permissions',
      'Real-time sync',
      '24/7 phone support',
      'Dedicated account manager',
      'Custom integration',
      'Advanced analytics',
    ],
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (tier: string, priceId: string) => {
    if (!session) {
      router.push('/login');
      return;
    }

    setLoadingTier(tier);
    setError(null);

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier,
          priceId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      console.error('Checkout error:', err);
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose the plan that fits your business needs
          </p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
              {error}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {TIERS.map((tier) => (
            <Card
              key={tier.name}
              className={`relative flex flex-col ${
                tier.popular ? 'ring-2 ring-blue-500 shadow-lg scale-105' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <p className="text-gray-600 text-sm mt-2">{tier.description}</p>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      ${tier.price}
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Billed monthly. Cancel anytime.
                  </p>
                </div>

                <Button
                  onClick={() => handleCheckout(tier.tier, tier.priceId)}
                  disabled={loadingTier === tier.tier}
                  className={`w-full mb-8 ${
                    tier.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'border border-gray-300 hover:border-gray-400'
                  }`}
                  variant={tier.popular ? 'default' : 'outline'}
                >
                  {loadingTier === tier.tier ? 'Processing...' : tier.cta}
                </Button>

                <div className="space-y-4">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Can I change my plan later?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Do you offer discounts for annual billing?
              </h3>
              <p className="text-gray-600">
                Yes, we offer 20% off when you pay annually. Contact our sales team for details.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, Mastercard, American Express) and digital payment methods through Stripe.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                All plans come with a 14-day free trial. No credit card required to get started.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-16 pt-12 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-600 mb-8">
            Join hundreds of businesses already using CashFlowIQ
          </p>
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => {
                if (session) {
                  router.push('/dashboard');
                } else {
                  router.push('/signup');
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              Get Started Free
            </Button>
            <Button
              asChild
              variant="outline"
              className="px-8 py-3"
            >
              <Link href="/">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
