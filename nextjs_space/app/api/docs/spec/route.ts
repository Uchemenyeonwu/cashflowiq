import { NextRequest, NextResponse } from 'next/server';
import { openApiSpec } from '@/lib/api-spec';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(openApiSpec, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error fetching API spec:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API specification' },
      { status: 500 }
    );
  }
}
