import { NextRequest, NextResponse } from 'next/server';

const ATLAS_API_BASE = 'https://atlas-global-v4.fragrant-recipe-007f.workers.dev';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔐 Proxying login request to Atlas API...');
    
    const response = await fetch(`${ATLAS_API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Atlas API login failed:', data);
      return NextResponse.json(data, { status: response.status });
    }

    console.log('✅ Atlas API login successful');
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('❌ Proxy login error:', error);
    return NextResponse.json(
      { error: 'Internal proxy error' },
      { status: 500 }
    );
  }
}