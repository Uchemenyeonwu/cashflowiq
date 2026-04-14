# CashFlowIQ Mobile App - Developer Guide

## Overview
The CashFlowIQ mobile app is built with React Native and Expo, sharing the same backend APIs and database as the web application. This guide provides setup instructions and architectural decisions.

## Technology Stack
- **Framework**: Expo (React Native)
- **State Management**: Redux Toolkit
- **API Client**: Axios with shared service layer
- **Database Sync**: SQLite + AsyncStorage for offline mode
- **UI Components**: React Native Paper
- **Authentication**: JWT tokens + device tokens for push notifications
- **Analytics**: Firebase Analytics

## Project Structure

```
cashflowiq-mobile/
├── app/
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignupScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardScreen.tsx
│   │   ├── transactions/
│   │   │   ├── TransactionListScreen.tsx
│   │   │   ├── TransactionDetailScreen.tsx
│   │   │   └── AddTransactionScreen.tsx
│   │   ├── analytics/
│   │   │   └── AnalyticsScreen.tsx
│   │   └── settings/
│   │       └── SettingsScreen.tsx
│   ├── navigation/
│   │   └── RootNavigator.tsx
│   ├── services/
│   │   ├── api.ts (shared API client)
│   │   ├── auth.ts (authentication service)
│   │   ├── transactions.ts
│   │   ├── forecasts.ts
│   │   └── sync.ts (offline sync)
│   ├── store/
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── transactionsSlice.ts
│   │   │   └── forecastSlice.ts
│   │   └── index.ts (store configuration)
│   ├── utils/
│   │   ├── storage.ts (AsyncStorage wrapper)
│   │   ├── database.ts (SQLite wrapper)
│   │   └── formatter.ts (currency, date formatting)
│   ├── types/
│   │   └── index.ts (TypeScript definitions)
│   ├── App.tsx
│   └── app.json
├── assets/
│   ├── images/
│   └── fonts/
├── tests/
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator
- Device for testing (optional)

### Installation

```bash
# Create new Expo project
npx create-expo-app cashflowiq-mobile
cd cashflowiq-mobile

# Install dependencies
npm install

# Install required packages
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install @react-native-async-storage/async-storage
npm install react-native-paper
npm install redux @reduxjs/toolkit react-redux
npm install axios
npm install react-native-sqlite-storage
npm install zustand (alternative to Redux)
npm install @react-native-firebase/app
npm install @react-native-firebase/analytics
npm install expo-secure-store (for secure token storage)
npm install expo-notifications (for push notifications)

# Development dependencies
npm install -D typescript @types/react-native @types/react-native-paper
```

### Environment Variables

Create `.env` file:
```
API_BASE_URL=https://api.cashflowiq.com
API_TIMEOUT=30000
LOG_LEVEL=info
FIREBASE_API_KEY=...
FIREBASE_APP_ID=...
```

## Key Features

### 1. Authentication Flow
- Email/password login and signup
- JWT token storage in secure storage (Expo SecureStore)
- Refresh token mechanism for long-lived sessions
- Device token registration for push notifications
- Biometric authentication support (optional)

### 2. Offline-First Architecture
- SQLite database stores all user data locally
- Background sync queue for pending transactions
- Conflict resolution when reconnecting
- Smart caching strategy

### 3. Dashboard Screen
- Real-time cash flow overview (with offline data)
- 90-day forecast chart
- Key metrics cards
- Quick action buttons
- Pull-to-refresh

### 4. Transaction Management
- List view with filtering and sorting
- Quick add via floating action button
- Transaction detail view
- Inline editing
- Delete with confirmation
- Automatic sync to server

### 5. Analytics
- Cohort analysis on mobile
- Seasonality charts
- Forecast accuracy display
- Anomaly alerts with notifications

### 6. Settings
- Account management
- Notification preferences
- Offline mode toggle
- Clear cache option
- Logout

## API Client

### Shared Service Layer
```typescript
// services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: process.env.API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors with refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token logic
    }
    return Promise.reject(error);
  }
);

export default api;
```

## Database Schema (SQLite)

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  subscriptionTier TEXT,
  lastSyncedAt DATETIME,
  syncedAt DATETIME
);

CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  amount DECIMAL(10, 2),
  type TEXT, -- 'income' or 'expense'
  category TEXT,
  date DATETIME,
  description TEXT,
  status TEXT, -- 'synced', 'pending', 'failed'
  createdAt DATETIME,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE forecasts (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  date DATETIME,
  projectedCashFlow DECIMAL(10, 2),
  confidence INTEGER,
  isAnomaly BOOLEAN,
  createdAt DATETIME,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE syncQueue (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT, -- 'transaction', 'delete', etc
  data TEXT, -- JSON
  status TEXT, -- 'pending', 'processing', 'failed'
  createdAt DATETIME,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

## Offline Sync Strategy

1. **Write Operations**: Queue locally, sync when online
2. **Read Operations**: Serve from SQLite, fetch fresh data in background
3. **Conflict Resolution**: Server wins, with user notification
4. **Sync Status**: Show sync indicators in UI
5. **Retry Logic**: Exponential backoff with max retries

## Testing Strategy

### Unit Tests
- API service methods
- Redux slices
- Utility functions
- Database operations

### Integration Tests
- Auth flow (login, logout, refresh)
- Transaction CRUD operations
- Offline/online transitions
- Sync queue processing

### E2E Tests
- User registration and login
- Add transaction flow
- View dashboard and analytics
- Offline functionality

## Build and Deployment

### Development
```bash
expo start
# Scan QR code with Expo Go app (iOS/Android)
```

### Testing on Physical Device
```bash
# iOS
expo run:ios

# Android
expo run:android
```

### Production Builds
```bash
# Configure app.json with version and build info

# iOS
eas build --platform ios

# Android
eas build --platform android

# Submit to App Stores
eas submit --platform ios
eas submit --platform android
```

## Security Considerations

1. **Token Storage**: Use Expo SecureStore, not AsyncStorage
2. **API Keys**: Never hardcode, use environment variables
3. **Data Encryption**: Encrypt sensitive data at rest
4. **Certificate Pinning**: Implement for API calls
5. **Biometric Auth**: Use React Native Biometrics
6. **HTTPS Only**: Enforce in production
7. **Code Obfuscation**: Enable for production builds

## Performance Optimization

1. **List Virtualization**: Use FlatList with getItemLayout
2. **Image Optimization**: Compress and cache images
3. **Memory Management**: Cleanup subscriptions and timers
4. **Bundle Size**: Monitor and optimize
5. **SQLite Indexes**: Index frequently queried columns
6. **Background Tasks**: Use Expo TaskManager

## Roadmap

### Phase 1 (MVP)
- Basic auth and dashboard
- Transaction CRUD
- Offline mode

### Phase 2
- Push notifications
- Advanced analytics
- Biometric auth

### Phase 3
- Plaid integration (mobile)
- Banking features
- Team mode (viewing shared dashboards)

### Phase 4
- Wearable integration
- Voice-activated transaction entry
- AI-powered insights

## Support and Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [CashFlowIQ API Docs](/api-docs)
- [Design System Figma Link](https://figma.com/cashflowiq)

## Development Team Guidelines

- Follow React Native best practices
- Use TypeScript for type safety
- Keep components small and focused
- Test before committing
- Document complex logic
- Use meaningful commit messages
