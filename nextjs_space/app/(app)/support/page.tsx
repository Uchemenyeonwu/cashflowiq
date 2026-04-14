import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, MessageSquare, BookOpen, MailIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SupportPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect('/login');
  }

  // Fetch user to check subscription tier
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscriptionTier: true },
  });

  const tier = user?.subscriptionTier || 'free';
  const hasFullAccess = tier === 'pro' || tier === 'team';
  const hasSageAccess = ['pro', 'team'].includes(tier);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support & Help</h1>
        <p className="text-gray-600 mt-2">
          Get help with CashFlowIQ, troubleshoot issues, and learn best practices.
        </p>
      </div>

      {/* Sage Chatbot Access Card */}
      {hasSageAccess ? (
        <Card className="bg-gradient-to-br from-blue-50 to-green-50 border-blue-200 p-6">
          <div className="flex items-start gap-4">
            <MessageSquare className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-blue-900">Meet Sage - Your 24/7 AI Support Assistant</h2>
              <p className="text-blue-800 text-sm mt-1">
                Sage is an intelligent support chatbot available 24/7 to help you with product questions,
                Plaid troubleshooting, forecasting guidance, billing inquiries, and API documentation.
              </p>
              <div className="mt-4 flex gap-2">
                <a href="#sage-widget">
                  <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                    Start Chat with Sage
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-amber-900">Upgrade to Access Sage</h2>
              <p className="text-amber-800 text-sm mt-1">
                Sage, our 24/7 AI support assistant, is available to Pro and Team tier users. Upgrade your subscription
                to get instant access to expert help anytime.
              </p>
              <div className="mt-4 flex gap-2">
                <a href="/dashboard#pricing">
                  <Button variant="default" className="bg-amber-600 hover:bg-amber-700">
                    View Pricing Tiers
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Links Section */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6">
          <BookOpen className="w-6 h-6 text-blue-600 mb-3" />
          <h3 className="font-semibold mb-2">Knowledge Base</h3>
          <p className="text-sm text-gray-600 mb-4">
            Browse comprehensive guides and documentation on all CashFlowIQ features.
          </p>
          <a href="/api-docs">
            <Button variant="outline" className="w-full">
              View Documentation
            </Button>
          </a>
        </Card>

        <Card className="p-6">
          <MailIcon className="w-6 h-6 text-green-600 mb-3" />
          <h3 className="font-semibold mb-2">Email Support</h3>
          <p className="text-sm text-gray-600 mb-4">
            Can't find what you're looking for? Contact our support team.
          </p>
          <a href="mailto:support@cashflowiq.com">
            <Button variant="outline" className="w-full">
              Send Email
            </Button>
          </a>
        </Card>
      </div>

      {/* Help Topics */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Popular Help Topics</h2>
        <div className="space-y-3">
          <div className="border-b pb-3">
            <h4 className="font-medium text-sm mb-1">Getting Started</h4>
            <p className="text-sm text-gray-600">Create an account, connect your bank, and set up your first forecast.</p>
          </div>
          <div className="border-b pb-3">
            <h4 className="font-medium text-sm mb-1">Bank Connection Issues</h4>
            <p className="text-sm text-gray-600">Troubleshoot Plaid sync errors, authentication issues, and transaction delays.</p>
          </div>
          <div className="border-b pb-3">
            <h4 className="font-medium text-sm mb-1">Understanding Your Forecast</h4>
            <p className="text-sm text-gray-600">Learn how CashFlowIQ projects your cash flow and improves forecast accuracy.</p>
          </div>
          <div className="border-b pb-3">
            <h4 className="font-medium text-sm mb-1">Billing & Subscriptions</h4>
            <p className="text-sm text-gray-600">Upgrade, downgrade, or manage your subscription and payment methods.</p>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-1">API Integration</h4>
            <p className="text-sm text-gray-600">Build integrations using the CashFlowIQ Public API and webhooks.</p>
          </div>
        </div>
      </Card>

      {/* Sage Widget Embed */}
      {hasSageAccess && (
        <Card id="sage-widget" className="p-6 bg-blue-50 border-blue-200">
          <h2 className="text-lg font-semibold mb-4">Chat with Sage</h2>
          <div className="bg-white rounded-lg border border-blue-100">
            <iframe
              src="https://apps.abacus.ai/chatllm/?appId=15cb001078&hideTopBar=2"
              style={{
                width: '100%',
                height: '600px',
                border: 'none',
                borderRadius: '0.5rem',
              }}
              title="Sage Support Chatbot"
              allow="camera; microphone"
            />
          </div>
        </Card>
      )}
    </div>
  );
}
