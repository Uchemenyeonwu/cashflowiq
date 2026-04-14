import { NextRequest, NextResponse } from 'next/server';
import { plaidClient, LinkTokenRequest } from '@/lib/plaid';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { CountryCode, Products } from 'plaid';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId, userName, userEmail } = (await req.json()) as LinkTokenRequest;

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the app URL for webhook
    const baseUrl =
      process.env.NEXTAUTH_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL || process.env.NEXTAUTH_URL}`
        : 'http://localhost:3000';
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
    console.error('Error creating link token:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create link token' },
      { status: 500 }
    );
  }
}
