# CashFlowIQ Sage Support Knowledge Base

This is the comprehensive knowledge base for Sage, the 24/7 AI support chatbot for CashFlowIQ users.

---

## 1. Product Overview

### What is CashFlowIQ?

CashFlowIQ is a SaaS platform designed for small business operations, specifically focused on **cash flow forecasting** and **financial intelligence**. It helps business owners, freelancers, shop owners, bookkeepers, and contractors make data-driven financial decisions.

### Target Users
- Freelancers and contractors managing irregular income
- Shop owners tracking seasonal cash flow
- Startup founders planning runway and burn rates
- Bookkeepers managing client finances
- Small business owners needing cash flow visibility

### Core Features
1. **Cash Flow Forecasting**: 90-day projection with confidence metrics
2. **Bank Account Sync**: Automatic transaction import via Plaid
3. **Transaction Management**: Manual entry and categorization
4. **Financial Reports**: Category breakdowns and monthly comparisons
5. **Analytics Dashboard**: Real-time metrics and trend analysis
6. **API Access**: For developers and integrations
7. **Subscription Management**: Flexible pricing tiers

---

## 2. Getting Started

### Creating an Account
1. Visit CashFlowIQ and click "Sign Up"
2. Enter your name, email, and password
3. Enter your business name and business type
4. Click "Create Account"
5. You'll be logged in and directed to your dashboard

### First Steps After Sign-Up
1. **Complete Your Profile**: Update your business details in Settings
2. **Connect a Bank Account** (optional but recommended): Link via Plaid for automatic transaction syncing
3. **Add Transactions**: Manually enter income and expenses, or they'll sync from your bank
4. **View Your Dashboard**: See your cash flow forecast and key metrics
5. **Explore Reports**: Understand your spending patterns and trends

### The Dashboard
Your dashboard shows:
- **Current Cash Balance**: Your available funds
- **30-Day Cash Flow**: Income minus expenses for the next month
- **Monthly Burn Rate**: How fast you're spending through cash
- **Runway**: How many months of operations your cash will cover
- **90-Day Forecast**: Projected cash balance with confidence levels
- **Upcoming Transactions**: Scheduled income and expenses

---

## 3. Bank Account Connection (Plaid)

### Why Connect Your Bank?
- **Automatic Syncing**: Transactions import automatically without manual entry
- **Real-Time Data**: Your forecast updates with actual spending patterns
- **Accuracy**: Reduces manual data entry errors
- **Time Saving**: No more copying transactions from your bank statement

### How to Connect Your Bank
1. Go to **Settings → Bank Connections**
2. Click **"Connect Bank Account"**
3. Search for your bank in the Plaid interface
4. Log in with your banking credentials
5. Select which accounts to sync
6. Grant permission for transaction access
7. Your bank is now linked!

### Supported Banks
Plaid supports **12,000+ financial institutions** worldwide, including:
- Major banks (Chase, Bank of America, Wells Fargo, etc.)
- Regional banks and credit unions
- Online banks (Ally, Charles Schwab, etc.)
- European and international banks

**Note**: Your banking credentials are never stored. Plaid uses secure OAuth connections.

### Transaction Sync Explained
- **Initial Sync**: Can take 24 hours to fetch all historical transactions
- **Ongoing Sync**: New transactions appear within a few minutes to a few hours
- **Manual Sync**: Click the refresh icon to trigger an immediate sync
- **Sync Status**: Check the status badge on your linked account card

### Common Plaid Issues

#### Bank Not Found
- Ensure you're searching by bank name, not branch name
- Try searching for the holding company name (e.g., "Wells Fargo" instead of "Wells Fargo - Downtown Branch")
- Check if the bank is supported (rare for very small regional banks)

#### "Invalid Credentials" Error
- Verify your online banking username/password are correct
- Check if your bank has 2FA enabled and follow their prompts
- Some banks require a one-time setup code sent to your phone
- If recently changed your password, use the new one

#### Transactions Not Syncing
- Initial sync can take 24 hours
- Click refresh to trigger manual sync
- Check sync status badge on the linked account
- Some banks delay transaction posting by 2-3 days

#### "This Account is Already Connected" Error
- You may have already linked this account
- Check your Bank Connections list
- Disconnect the duplicate and try again

#### "Plaid Link Closed" or Timeout
- Ensure you have a stable internet connection
- Try a different browser
- Clear browser cookies and cache
- Try connecting on a different device

#### Transactions Missing from Your Period
- Plaid may not have access to full historical data for that period
- Some banks limit how far back transactions can be synced
- You can manually add transactions for that period

#### Deleting/Unlinking an Account
1. Go to **Settings → Bank Connections**
2. Find the account in your linked accounts list
3. Click the trash icon
4. Confirm deletion
5. Transactions from that account won't auto-sync, but your history remains

---

## 4. Transaction Management

### Manual Transaction Entry

#### Add a Transaction
1. Click **"Transactions"** in the main menu
2. Click **"Add Transaction"** button
3. Fill in the details:
   - **Date**: When the transaction occurred
   - **Description**: What the transaction is for (e.g., "Office Supplies", "Client Payment")
   - **Category**: Select from predefined categories
   - **Type**: Choose **Income** or **Expense**
   - **Amount**: Enter the dollar amount
4. Click **"Save"**

#### Edit a Transaction
1. Go to **Transactions**
2. Find the transaction you want to edit
3. Click the **edit icon** on the right
4. Update the fields
5. Click **"Save"**

#### Delete a Transaction
1. Go to **Transactions**
2. Find the transaction
3. Click the **delete icon** (trash can)
4. Confirm the deletion

### Transaction Categories

**Expense Categories:**
- Advertising & Marketing
- Office Supplies
- Utilities
- Equipment
- Professional Services
- Rent
- Payroll
- Taxes
- Insurance
- Travel
- Meals & Entertainment
- Subscriptions
- Other Expenses

**Income Categories:**
- Product Sales
- Service Revenue
- Consulting
- Investment Income
- Refunds
- Other Income

### Automatic Categorization
- When you sync with Plaid, transactions are automatically categorized
- You can recategorize if the automatic assignment is incorrect
- Over time, CashFlowIQ learns your spending patterns and improves categorization

---

## 5. Cash Flow Forecasting

### How the Forecast Works

CashFlowIQ uses advanced analytics to project your cash balance 90 days into the future:

1. **Historical Analysis**: Examines your past 90 days of transactions
2. **Pattern Recognition**: Identifies recurring income and expenses
3. **Seasonality Detection**: Accounts for seasonal variations in your business
4. **Trend Analysis**: Adjusts for growth or decline trends
5. **Projection**: Estimates future cash balance based on these patterns
6. **Confidence Level**: Shows how confident the forecast is (higher = more reliable)

### Forecast Confidence Levels
- **High (90%+)**: You have consistent, predictable cash flow
- **Medium (70-89%)**: Your business has some variability
- **Low (<70%)**: Your cash flow is highly irregular or the forecast needs more historical data

### Improving Your Forecast Accuracy
1. **More Historical Data**: 90 days of data minimum; 6+ months is better
2. **Consistent Tracking**: Log all transactions, even small ones
3. **Upcoming Transactions**: Mark known future expenses (invoices, subscriptions)
4. **Regular Updates**: Keep your forecast updated with new transactions

### Interpreting Your Forecast
- **Green Zone**: Healthy cash balance, no immediate concerns
- **Yellow Zone**: Cash flow is tightening; monitor closely
- **Red Zone**: Cash crisis possible within the forecast period; take action
- **Dashed Line**: Confidence interval showing the range of possible outcomes

### Understanding the Metrics
- **Current Cash Balance**: Your available funds today
- **30-Day Cash Flow**: Income minus expenses for next 30 days
- **Monthly Burn Rate**: How much cash you spend per month
- **Runway**: How many months of operations your cash covers at current burn rate

### Common Forecast Questions

**"Why is my forecast showing a cash crisis?"**
- You may have large upcoming expenses
- Your recurring expenses exceed your recurring income
- Seasonal business with low-revenue periods
- Action: Increase revenue targets or reduce expenses

**"My forecast seems inaccurate"**
- Ensure all transactions are logged
- Add any recurring transactions you might have missed
- Check for one-time vs. recurring items
- Initial forecasts improve with more historical data

**"How do I add future transactions to the forecast?"**
- Manually add known future expenses (invoices, subscriptions)
- Use realistic dates when you expect to pay
- The forecast will immediately incorporate them

---

## 6. Financial Reports

### Understanding Your Reports

CashFlowIQ provides detailed financial insights:

#### Dashboard Summary
- **Total Income**: Sum of all income in the selected period
- **Total Expenses**: Sum of all expenses
- **Net Cash Flow**: Income minus expenses

#### Category Breakdown
- **Pie Chart**: Shows percentage of spending by category
- **Identifies**: Where your money goes
- **Use Case**: Find cost-cutting opportunities

#### Monthly Comparison
- **Bar Chart**: Shows income vs. expenses by month
- **Trend Visualization**: See if you're spending more/less over time
- **Identifies**: Seasonal patterns and growth trends

### How to Use Reports
1. Go to **"Reports"** in the main menu
2. View the default 90-day summary
3. Analyze category breakdown to identify spending patterns
4. Use monthly comparison to spot trends
5. Take action based on insights

### Report Insights
- **Spending Concentrated in One Category?** Consider ways to reduce in that area
- **Expenses Growing Faster Than Income?** You may have a burn rate problem
- **Seasonal Dips?** Plan ahead for low-revenue periods
- **Inconsistent Income?** Focus on customer acquisition in low months

---

## 7. Analytics & Insights

### Advanced Analytics Features

#### Cohort Analysis
- Groups transactions by time period
- Identifies patterns across different time frames
- Helps understand customer acquisition and retention

#### Seasonality Detection
- Automatically detects seasonal patterns in your cash flow
- Accounts for predictable variations
- Improves forecast accuracy

#### Anomaly Detection
- Flags unusual transactions or spending patterns
- Helps identify errors or fraud
- Alerts you to significant deviations from normal

#### Forecast Accuracy Metrics
- **MAE (Mean Absolute Error)**: Average difference between forecast and actual
- **RMSE (Root Mean Square Error)**: Penalizes larger errors more heavily
- Lower values = more accurate forecasts
- Improves over time as you accumulate more data

### Accessing Analytics
1. Go to **"Analytics"** in the main menu
2. View real-time metrics and trends
3. Export data for further analysis
4. Use insights to inform business decisions

---

## 8. Subscription & Billing

### Pricing Tiers

#### Solo - $19/month
- Best for: Solo freelancers and independent contractors
- **Includes:**
  - Up to 500 transactions/month
  - Manual transaction entry
  - Basic forecasting
  - 1 bank account connection
  - Limited API access
- **Not included:** Advanced analytics, team features, priority support

#### Pro - $59/month
- Best for: Growing freelancers and small business owners
- **Includes:**
  - Unlimited transactions
  - Unlimited bank accounts
  - Advanced forecasting
  - Full analytics suite
  - Limited API access (100 calls/day)
  - Email support
- **Not included:** Team features, priority support (Sage chatbot available)

#### Team - $149/month
- Best for: Small teams and agencies
- **Includes:**
  - Everything in Pro
  - Up to 5 team members
  - Role-based access control
  - Full API access (unlimited calls)
  - Priority support (24/7 Sage chatbot)
  - Webhook integrations
  - Advanced user management

### How to Upgrade Your Subscription
1. Go to **Settings → Subscription**
2. Click **"Upgrade"** next to your desired tier
3. You'll be directed to Stripe Checkout
4. Enter your payment information
5. Complete the purchase
6. Your account upgrades immediately
7. No refunds for partial months; you're charged the new tier's full amount

### How to Change or Cancel Your Subscription
1. Go to **Settings → Subscription**
2. Click **"Manage Subscription"** (opens Stripe Customer Portal)
3. **To upgrade/downgrade**: Change your plan
4. **To cancel**: Select "Cancel Subscription"
5. If canceling, choose to end immediately or at billing period end
6. Canceled accounts retain data for 30 days

### Billing Questions

**"When will I be charged?"**
- Monthly subscriptions renew on the same date each month
- Changes take effect immediately
- If upgrading, you'll be prorated and charged the difference

**"Can I get a refund?"**
- Monthly subscriptions don't offer refunds for used time
- If you cancel mid-month, you keep access through the billing date
- Contact support for special circumstances

**"What payment methods are accepted?"**
- Credit cards (Visa, MasterCard, American Express)
- Debit cards
- No PayPal, but Stripe supports all major payment methods

**"Will my data be deleted if I cancel?"**
- No, your account data is preserved for 30 days
- You can reactivate and restore your account within 30 days
- After 30 days, data may be permanently deleted

---

## 9. API Documentation

### Public API Overview

The CashFlowIQ Public API allows developers to:
- Read transaction data
- Retrieve forecasts
- Build custom integrations
- Automate workflows
- Access analytics data

### API Authentication

#### Getting an API Key
1. Go to **Settings → Public API**
2. Click **"Generate API Key"**
3. Copy your key (you won't see it again!)
4. Use it in the `Authorization` header: `Bearer YOUR_API_KEY`

#### API Key Management
- Each key is unique to your account
- Keys never expire
- Revoke a key by clicking the delete icon
- Generate multiple keys for different applications

### Rate Limiting

**Solo Tier:**
- 100 requests/day
- 10 requests/minute

**Pro Tier:**
- 100 requests/hour
- 10 requests/minute

**Team Tier:**
- Unlimited requests
- Designed for high-volume integrations

### Core API Endpoints

#### GET /api/v1/transactions
Retrieve all transactions
```json
Query Parameters:
- start_date: YYYY-MM-DD
- end_date: YYYY-MM-DD
- category: string
- type: "income" | "expense"
```

#### GET /api/v1/transactions/{id}
Retrieve a specific transaction

#### POST /api/v1/transactions
Create a new transaction (requires authentication)
```json
Body:
{
  "date": "2025-01-15",
  "description": "Office supplies",
  "category": "Office Supplies",
  "type": "expense",
  "amount": 150.00
}
```

#### GET /api/v1/forecast
Get the 90-day cash flow forecast
```json
Response includes:
- dates
- projected_balance
- confidence_level
- error_margin
```

#### GET /api/v1/analytics
Get detailed analytics and metrics
```json
Response includes:
- monthly_breakdown
- category_breakdown
- seasonality_patterns
- anomalies
- forecast_accuracy
```

#### GET /api/v1/linked-accounts
List connected bank accounts

#### POST /api/v1/webhooks
Set up webhook subscriptions for real-time updates
```json
Body:
{
  "url": "https://yoursite.com/webhook",
  "events": ["transaction.created", "forecast.updated"],
  "description": "My webhook"
}
```

### Webhook Events

**Available Events:**
- `transaction.created`: New transaction added
- `transaction.updated`: Transaction modified
- `transaction.deleted`: Transaction removed
- `forecast.updated`: New forecast calculated
- `account.connected`: Bank account linked
- `account.disconnected`: Bank account unlinked

### API Documentation Portal

Visit `/api-docs` to:
- View interactive API documentation
- Test endpoints in real-time
- See request/response examples
- View error codes and explanations
- Check API status and uptime

### Common API Questions

**"How often should I call the forecast endpoint?"**
- Forecasts update when new transactions are added
- Call daily or weekly depending on your needs
- Don't call more than necessary to avoid rate limits

**"Can I export all my data via API?"**
- Yes, use the transactions endpoint with date filters
- Paginate results for large datasets
- Pro and Team tiers have higher rate limits

**"How do I test my webhook?"**
- Use webhook testing tools like webhook.site
- Check the Webhooks Dashboard to see delivery attempts
- Review status codes and payload for debugging

---

## 10. Account Management

### Profile Settings

#### Update Your Information
1. Go to **Settings → Profile**
2. Update your name, email, business name, or business type
3. Click **"Save Changes"**
4. You'll receive a confirmation

#### Change Your Password
- Click the password change option in account settings
- Enter your current password
- Enter your new password
- Confirm the new password
- You'll be logged out and need to log back in

### Security

**Best Practices:**
- Use a strong password (12+ characters, mixed case, numbers, symbols)
- Don't share your login credentials
- Don't share your API keys
- Revoke unused API keys
- Log out on shared computers

### Two-Factor Authentication (2FA)
- Currently not offered but may be added in future
- Use a strong password as your primary security
- Keep your email account secure

### Account Deletion
1. Go to **Settings**
2. Scroll to bottom and click **"Delete Account"**
3. Confirm the action (this is irreversible)
4. Your data will be permanently deleted

---

## 11. Troubleshooting & Support

### General Troubleshooting

#### "I'm seeing an error on the dashboard"
1. Try refreshing your browser
2. Clear browser cache and cookies
3. Try a different browser
4. Check your internet connection
5. Contact Sage chatbot if problem persists

#### "My transactions aren't showing up"
1. Check if bank account is connected
2. Trigger a manual sync (click refresh)
3. Wait 24 hours for initial sync
4. Verify transactions are in the correct date range
5. Check your bank's transaction posting delays

#### "The forecast seems wrong"
1. Verify all your transactions are entered correctly
2. Ensure recurring transactions are included
3. Check for one-time vs. recurring items
4. Add any missing past transactions
5. Wait for more historical data to improve accuracy

#### "I can't log in"
1. Double-check your email address
2. Verify your password (passwords are case-sensitive)
3. Use "Forgot Password" to reset
4. Clear browser cookies
5. Try a different browser

#### "Page is loading slowly"
1. Check your internet connection
2. Try closing unnecessary browser tabs
3. Clear your browser cache
4. Try a different browser
5. Contact support if consistently slow

### Getting Help

**For Immediate Support:**
- Use **Sage Chatbot** (available 24/7 for Pro/Team users)
- Ask questions about features, billing, API, Plaid, or forecasting
- Sage provides instant answers and guidance

**For Account Issues:**
- Contact support via the Settings page
- Include account email and detailed description
- Support team responds within 24 hours

**For Billing Issues:**
- Check your Stripe Customer Portal
- Review charge history and payment methods
- Contact support with invoice number or transaction date

**For API Issues:**
- Check `/api-docs` for endpoint documentation
- Review API status dashboard
- Test endpoints in the interactive documentation
- Contact support with API request details

---

## 12. FAQ

### General Questions

**Q: Is CashFlowIQ suitable for my business type?**
A: CashFlowIQ works for any business with regular income and expenses, including freelancers, shops, startups, agencies, and more. If you have cash flow, CashFlowIQ can help you forecast and manage it.

**Q: Is my banking information secure?**
A: Yes, we use Plaid for bank connections. Your actual banking credentials are never stored by CashFlowIQ—Plaid handles all authentication securely.

**Q: Can I have multiple bank accounts connected?**
A: Yes, all tiers support multiple connected accounts. Team tier has no limit.

**Q: Is CashFlowIQ GDPR compliant?**
A: We take data privacy seriously and comply with major data protection regulations.

**Q: Can I export my data?**
A: Yes, via API (Pro and Team tiers) or contact support for bulk export.

### Feature Questions

**Q: How far ahead can I forecast?**
A: The standard forecast covers 90 days. Advanced forecasting available in Pro/Team tiers.

**Q: How often does the forecast update?**
A: Forecasts update whenever new transactions are added or bank data syncs.

**Q: Can I manually adjust the forecast?**
A: Add upcoming transactions manually to influence the forecast. The system recalculates automatically.

**Q: Are there limits to how many transactions I can have?**
A: Solo: 500/month. Pro/Team: Unlimited. Older transactions don't count toward limits.

**Q: Does CashFlowIQ do tax calculations?**
A: CashFlowIQ categorizes transactions to make tax prep easier, but doesn't do tax calculations. Consult a tax professional.

### Billing Questions

**Q: What happens at the end of my free trial?**
A: You can continue with the Solo plan free (limited features) or upgrade to Pro/Team.

**Q: Can I upgrade or downgrade anytime?**
A: Yes, changes take effect immediately. You're prorated for the difference.

**Q: Do you offer annual billing discounts?**
A: Currently monthly only, but annual plans may be added. Contact support for bulk discounts.

**Q: What if I no longer need CashFlowIQ?**
A: You can cancel anytime with no penalty. Your data is retained for 30 days.

---

## 13. Best Practices

### Cash Flow Management

1. **Log Transactions Consistently**
   - Daily or weekly updates prevent information loss
   - Timely entry improves forecast accuracy
   - Use bank sync to automate this process

2. **Monitor Your Metrics**
   - Review dashboard weekly
   - Check forecast confidence levels
   - Track burn rate trends
   - Address cash flow issues early

3. **Plan for Seasonality**
   - Identify your seasonal patterns
   - Build cash reserves in high-revenue periods
   - Plan expenses for low-revenue periods
   - Use forecasts to plan ahead

4. **Separate Business and Personal**
   - Create separate business accounts
   - Simplifies bookkeeping
   - Makes transactions easier to categorize
   - Improves forecast accuracy

5. **Regular Reviews**
   - Review reports monthly
   - Compare forecasts to actuals
   - Adjust categories as needed
   - Refine your business strategy

### Using Forecasts Effectively

1. **Understand Your Runway**
   - Know how many months of cash you have
   - Plan to increase runway before it gets critical
   - Build emergency reserves

2. **Plan for Growth**
   - Project the impact of hiring
   - Estimate new equipment costs
   - Forecast revenue increases
   - Test scenarios with manual entries

3. **Manage Burn Rate**
   - Identify your monthly cash outflow
   - Find ways to reduce unnecessary spending
   - Increase revenue to improve cash position
   - Monitor trends over time

4. **Prepare for Uncertainties**
   - Plan for slower revenue periods
   - Build an emergency fund
   - Review low-confidence forecasts carefully
   - Update forecasts with new information

---

## 14. Contact & Support

### Getting Help

**For Pro & Team Users:**
- **Sage Chatbot**: Available 24/7 within the app for instant support
- Ask about features, billing, API, Plaid, or forecasting

**For All Users:**
- **Support Page**: Go to Settings → Support
- **API Documentation**: Visit `/api-docs` for technical guidance
- **Status Page**: Check `/api/status` for uptime information

### Feedback & Feature Requests
- We value your feedback!
- Submit feature requests through the support page
- Vote on requested features
- Help us improve CashFlowIQ

---

## Document Version
- **Last Updated**: 2025
- **Knowledge Base Version**: 1.0
- **For**: CashFlowIQ Sage Support Chatbot
