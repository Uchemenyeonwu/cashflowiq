'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface SageWidgetProps {
  enabled?: boolean;
}

export function SageFloatingWidget({ enabled = true }: SageWidgetProps) {
  const { data: session, status } = useSession() || {};
  const [userTier, setUserTier] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchUserTier = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch('/api/user/tier');
        if (response.ok) {
          const data = await response.json();
          setUserTier(data.tier);
        }
      } catch (error) {
        console.error('Failed to fetch user tier:', error);
      }
    };

    if (status === 'authenticated' && session?.user?.id) {
      fetchUserTier();
    }
  }, [session?.user?.id, status]);

  // Load Sage widget SDK if user is authenticated (available to all tiers)
  useEffect(() => {
    const hasAccess = userTier && ['free', 'pro', 'team'].includes(userTier);
    const shouldShow = enabled && mounted && status === 'authenticated' && hasAccess;

    if (shouldShow) {
      // Load the Sage widget SDK script
      const script = document.createElement('script');
      script.src = 'https://api.abacus.ai/api/v0/getChatBotWidgetSDKLink?externalApplicationId=15cb001078';
      script.async = true;
      document.head.appendChild(script);

      return () => {
        // Cleanup script if component unmounts
        if (script.parentNode === document.head) {
          document.head.removeChild(script);
        }
      };
    }
  }, [enabled, mounted, status, userTier]);

  return null;
}
