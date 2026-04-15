'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface LinkedAccount {
  id: string;
  institutionName: string;
  accountName: string;
  accountMask: string;
  currentBalance: number | null;
  isActive: boolean;
  syncStatus: string;
  lastSyncedAt: string | null;
  createdAt: string;
}

interface LinkedAccountsListProps {
  onAccountDeleted?: () => void;
}

export function LinkedAccountsList({ onAccountDeleted }: LinkedAccountsListProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/linked-accounts');
      if (!response.ok) throw new Error('Failed to fetch accounts');

      const data = await response.json();
      setAccounts(data.linkedAccounts);
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load linked accounts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchAccounts();
    }
  }, [session]);

  const handleSync = async (accountId: string) => {
    try {
      setSyncing(accountId);
      const response = await fetch('/api/linked-accounts/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedAccountId: accountId }),
      });

      if (!response.ok) throw new Error('Failed to sync account');

      toast({
        title: 'Success',
        description: 'Account synced successfully',
      });
      fetchAccounts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sync account',
        variant: 'destructive',
      });
    } finally {
      setSyncing(null);
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this account?')) return;

    try {
      const response = await fetch('/api/linked-accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedAccountId: accountId }),
      });

      if (!response.ok) throw new Error('Failed to delete account');

      toast({
        title: 'Success',
        description: 'Account disconnected',
      });
      fetchAccounts();
      onAccountDeleted?.();
      router.refresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to disconnect account',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connected Bank Accounts</CardTitle>
          <CardDescription>No bank accounts connected yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Connected Bank Accounts</h3>
      {accounts.map((account: any) => (
        <Card key={account.id}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium">{account.institutionName}</h4>
                <p className="text-sm text-gray-600">
                  {account.accountName} (****{account.accountMask})
                </p>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span className="text-gray-600">
                    Balance: {formatCurrency(account.currentBalance || 0)}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      account.syncStatus === 'success'
                        ? 'bg-green-100 text-green-800'
                        : account.syncStatus === 'syncing'
                        ? 'bg-blue-100 text-blue-800'
                        : account.syncStatus === 'error'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {account.syncStatus}
                  </span>
                </div>
                {account.lastSyncedAt && (
                  <p className="mt-1 text-xs text-gray-500">
                    Last synced: {new Date(account.lastSyncedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSync(account.id)}
                  disabled={syncing === account.id}
                >
                  {syncing === account.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(account.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
