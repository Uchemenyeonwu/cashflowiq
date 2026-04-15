'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiKey {
  id: string;
  name: string;
  description?: string;
  lastUsedAt?: string;
  createdAt: string;
  isActive: boolean;
  rateLimit: number;
}

export function ApiStatusCard() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealing, setRevealing] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchApiKeys();
  }, []);

  async function fetchApiKeys() {
    try {
      const response = await fetch('/api/api-keys');
      const data = await response.json();
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch API keys',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function createApiKey() {
    if (!newKeyName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an API key name',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });

      if (!response.ok) throw new Error('Failed to create API key');

      const result = await response.json();
      
      toast({
        title: 'API Key Created',
        description: 'Copy and save your key - you will not see it again!',
      });

      setNewKeyName('');
      fetchApiKeys();

      // Show the full key temporarily
      const fullKey = result.key;
      navigator.clipboard.writeText(fullKey);
      toast({
        title: 'Key Copied',
        description: 'API key has been copied to clipboard',
      });
    } catch (error) {
      console.error('Error creating API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to create API key',
        variant: 'destructive',
      });
    }
  }

  async function deleteApiKey(keyId: string) {
    if (!confirm('Are you sure? This cannot be undone.')) return;

    try {
      const response = await fetch(`/api/api-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete API key');

      toast({
        title: 'API Key Deleted',
        description: 'The API key has been revoked',
      });

      fetchApiKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete API key',
        variant: 'destructive',
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Public API</CardTitle>
        <CardDescription>
          Manage API keys and integrate CashFlowIQ with your applications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Documentation Link */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">API Documentation</h4>
              <p className="text-sm text-blue-800 mb-3">
                View complete API documentation with code examples and endpoints
              </p>
              <a
                href="/api-docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Read Docs <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Rate Limits Info */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Free Tier</p>
            <p className="text-sm font-semibold">10 req/min</p>
            <p className="text-xs text-gray-500">1,000 req/day</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-xs text-blue-600 mb-1">Pro Tier</p>
            <p className="text-sm font-semibold text-blue-900">100 req/min</p>
            <p className="text-xs text-blue-700">50,000 req/day</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-xs text-purple-600 mb-1">Team Tier</p>
            <p className="text-sm font-semibold text-purple-900">5,000 req/min</p>
            <p className="text-xs text-purple-700">2M req/day</p>
          </div>
        </div>

        {/* Create New API Key */}
        <div className="border-t pt-6">
          <h4 className="font-semibold mb-3">Create API Key</h4>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter API key name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <Button onClick={createApiKey} size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Create
            </Button>
          </div>
        </div>

        {/* API Keys List */}
        <div className="border-t pt-6">
          <h4 className="font-semibold mb-3">Your API Keys</h4>
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : apiKeys.length === 0 ? (
            <p className="text-sm text-gray-500">No API keys yet. Create one to get started.</p>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key: any) => (
                <div key={key.id} className="border rounded-lg p-3 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{key.name}</p>
                    {key.description && (
                      <p className="text-xs text-gray-500">{key.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Created {new Date(key.createdAt).toLocaleDateString()}
                      {key.lastUsedAt && ` • Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!key.isActive && (
                      <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                        Revoked
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteApiKey(key.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
