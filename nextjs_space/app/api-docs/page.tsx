'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/docs/spec')
      .then((res) => res.json())
      .then((data) => {
        setSpec(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading API spec:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">CashFlowIQ API Documentation</h1>
          <p className="text-gray-600 text-lg">
            Complete REST API for integrating CashFlowIQ financial data
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                All requests require an API key in the X-API-Key header
              </p>
              <code className="bg-gray-100 p-2 rounded text-xs block break-all">
                X-API-Key: your_key
              </code>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rate Limiting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Standard: 100 req/min<br />
                Pro: 1,000 req/min<br />
                Team: 5,000 req/min
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Base URL</CardTitle>
            </CardHeader>
            <CardContent>
              <code className="bg-gray-100 p-2 rounded text-xs block">
                https://api.cashflowiq.com
              </code>
            </CardContent>
          </Card>
        </div>

        {spec && (
          <Card>
            <CardHeader>
              <CardTitle>Available Endpoints</CardTitle>
              <CardDescription>Version {spec.info?.version}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(spec.paths || {}).map(([path, methods]: [string, any]) => (
                  <div key={path} className="border-b pb-6 last:border-b-0">
                    <h3 className="text-lg font-semibold font-mono mb-2">{path}</h3>
                    {Object.entries(methods).map(([method, details]: [string, any]) => (
                      method !== 'parameters' && (
                        <div key={method} className="ml-4 mb-4">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`px-3 py-1 rounded text-white text-sm font-bold ${
                                method === 'get'
                                  ? 'bg-blue-500'
                                  : method === 'post'
                                  ? 'bg-green-500'
                                  : 'bg-yellow-500'
                              }`}
                            >
                              {method.toUpperCase()}
                            </span>
                            <span className="text-gray-600">{details.summary}</span>
                          </div>
                          <p className="text-sm text-gray-500 ml-4">
                            {details.description}
                          </p>
                        </div>
                      )
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Code Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">JavaScript</h4>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto">
{`const response = await fetch(
  'https://api.cashflowiq.com/api/public/data?type=summary',
  { headers: { 'X-API-Key': 'your_key' } }
);
const data = await response.json();`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
