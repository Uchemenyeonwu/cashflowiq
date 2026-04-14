'use client';

import { useCallback, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ConnectBankProps {
  onSuccess?: () => void;
}

export function ConnectBank({ onSuccess }: ConnectBankProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [linkToken, setLinkToken] = useState<string | null>(null);

  const fetchLinkToken = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/plaid/link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user?.email,
          userName: session?.user?.name || 'User',
          userEmail: session?.user?.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch link token');
      }

      const data = await response.json();
      setLinkToken(data.link_token);
    } catch (error: any) {
      console.error('Error fetching link token:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize bank connection',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [session, toast]);

  const handlePlaidSuccess = useCallback(
    async (public_token: string) => {
      try {
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
          title: 'Success',
          description: `Connected to ${data.institutionName}`,
        });
        setLinkToken(null);
        onSuccess?.();
      } catch (error: any) {
        console.error('Error exchanging token:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to link bank account',
          variant: 'destructive',
        });
      }
    },
    [toast, onSuccess]
  );

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: handlePlaidSuccess,
  });

  const handleConnect = async () => {
    if (!linkToken) {
      await fetchLinkToken();
    } else {
      open();
    }
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={isLoading || !ready}
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        'Connect Bank Account'
      )}
    </Button>
  );
}
