export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { CountryCode } from 'plaid';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { public_token } = await req.json();

    if (!public_token) {
      return NextResponse.json(
        { error: 'Missing public token' },
        { status: 400 }
      );
    }

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Get institution details
    const itemResponse = await plaidClient.itemGet({
      access_token: accessToken,
    });

    const institutionId = itemResponse.data.item.institution_id;
    let institutionName = 'Unknown Bank';

    if (institutionId) {
      try {
        const institutionResponse = await plaidClient.institutionsGetById({
          institution_id: institutionId,
          country_codes: [CountryCode.Us],
        });
        institutionName = institutionResponse.data.institution.name;
      } catch (err) {
        console.warn('Could not fetch institution details');
      }
    }

    // Get account details
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accounts = accountsResponse.data.accounts;
    if (accounts.length === 0) {
      return NextResponse.json(
        { error: 'No accounts found' },
        { status: 400 }
      );
    }

    // Use the first account
    const account = accounts[0];

    // Store the linked account in database
    const linkedAccount = await prisma.linkedAccount.create({
      data: {
        userId: user.id,
        plaidItemId: itemId,
        plaidAccessToken: accessToken,
        plaidInstitutionId: institutionId,
        institutionName,
        accountName: account.name,
        accountType: account.type,
        accountSubtype: account.subtype || undefined,
        accountMask: account.mask || undefined,
        currentBalance: account.balances.current
          ? parseFloat(account.balances.current.toString())
          : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      linkedAccountId: linkedAccount.id,
      institutionName,
      accountName: account.name,
    });
  } catch (error: any) {
    console.error('Error exchanging token:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to exchange token' },
      { status: 500 }
    );
  }
}
