export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Configuration, PlaidApi, PlaidEnvironments, CountryCode, Products } from 'plaid';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate Plaid credentials exist
    const clientId = process.env.PLAID_CLIENT_ID;
    const secret = process.env.PLAID_SECRET;

    if (!clientId || !secret || clientId.startsWith('{{') || secret.startsWith('{{')) {
      console.error('Plaid credentials not configured. PLAID_CLIENT_ID:', clientId ? 'SET' : 'MISSING', 'PLAID_SECRET:', secret ? 'SET' : 'MISSING');
      return NextResponse.json(
        { error: 'Plaid integration is not configured. Please add PLAID_CLIENT_ID and PLAID_SECRET to your environment variables.' },
        { status: 503 }
      );
    }

    const { userId, userName, userEmail } = await req.json();

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Plaid client inline to ensure fresh credentials
    const configuration = new Configuration({
      basePath: PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': clientId,
          'PLAID-SECRET': secret,
        },
      },
    });
    const plaidClient = new PlaidApi(configuration);

    // Get the app URL for webhook
    const baseUrl = process.env.NEXTAUTH_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const webhookUrl = `${baseUrl}/api/plaid/webhook`;

    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: userId,
      },
      client_name: 'CashFlowIQ',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
      webhook: webhookUrl,
    });

    return NextResponse.json({ link_token: response.data.link_token });
  } catch (error: any) {
    console.error('Error creating link token:', error?.response?.data || error.message || error);
    const plaidError = error?.response?.data;
    const message = plaidError?.error_message || error.message || 'Failed to create link token';
    return NextResponse.json(
      { error: message, plaid_error_code: plaidError?.error_code },
      { status: 500 }
    );
  }
}
