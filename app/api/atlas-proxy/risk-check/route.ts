import { NextRequest, NextResponse } from 'next/server';

const ATLAS_API_BASE = 'https://atlas-global-v4.fragrant-recipe-007f.workers.dev';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    console.log('🔍 Proxying risk check request to Atlas API...');
    
    const response = await fetch(`${ATLAS_API_BASE}/api/risk-checks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Atlas API risk check failed:', data);
      return NextResponse.json(data, { status: response.status });
    }

    console.log('✅ Atlas API risk check successful');
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('❌ Proxy risk check error:', error);
    return NextResponse.json(
      { error: 'Internal proxy error' },
      { status: 500 }
    );
  }
}