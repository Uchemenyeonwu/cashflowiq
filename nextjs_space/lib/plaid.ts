import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox, // Use 'sandbox' for testing, switch to 'production' for live
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
      'PLAID-SECRET': process.env.PLAID_SECRET!,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

export interface LinkTokenRequest {
  userId: string;
  userName: string;
  userEmail: string;
}

export interface ExchangeTokenRequest {
  userId: string;
  publicToken: string;
}
