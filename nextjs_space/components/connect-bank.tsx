'use client';

import { useCallback, useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2 } from 'lucide-react';

interface ConnectBankProps {
  onSuccess?: () => void;
}

export function ConnectBank({ onSuccess }: ConnectBankProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [linkToken, setLinkToken] = useState<string | null>(null);

  const fetchLinkToken = useCallback(async () => {
    if (!session?.user?.email) {
      toast({
        title: 'Error',
        description: 'Please log in to connect a bank account',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/plaid/link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.email,
          userName: session.user.name || 'User',
          userEmail: session.user.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch link token (${response.status})`);
      }

      const data = await response.json();
      setLinkToken(data.link_token);
    } catch (error: any) {
      console.error('Error fetching link token:', error);
      toast({
        title: 'Connection Error',
        description: error.message || 'Failed to initialize bank connection. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [session, toast]);

  const handlePlaidSuccess = useCallback(
    async (public_token: string) => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/plaid/exchange-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_token }),
        });

        if (!response.ok) {
          throw new Error('Failed to link bank account');
        }

        const data = await response.json();
        toast({
          title: 'Bank Connected!',
          description: `Successfully connected to ${data.institutionName}`,
        });
        setLinkToken(null);
        onSuccess?.();
        router.refresh();
      } catch (error: any) {
        console.error('Error exchanging token:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to link bank account',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast, onSuccess, router]
  );

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: handlePlaidSuccess,
  });

  // Auto-open Plaid Link once the token is ready
  useEffect(() => {
    if (linkToken && ready) {
      open();
    }
  }, [linkToken, ready, open]);

  const handleConnect = async () => {
    if (linkToken && ready) {
      open();
    } else {
      await fetchLinkToken();
    }
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Building2 className="mr-2 h-4 w-4" />
          Connect Bank Account
        </>
      )}
    </Button>
  );
}
