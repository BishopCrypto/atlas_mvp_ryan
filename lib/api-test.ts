// API Test Functions for Atlas Global V4
// Test login and name query functionality

// Use our Next.js API proxy to avoid CORS issues
const API_BASE_URL = '/api/atlas-proxy';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  token: string;
  supabase_token: string;
  refresh_token: string;
}

interface RiskCheckRequest {
  firstName: string;
  lastName: string;
  middleName?: string;
  birthday?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  checks: string[];
}

interface RiskCheckResponse {
  checksRequested: string[];
  results: {
    [key: string]: any;
  };
}

export class AtlasApiTest {
  private token: string | null = null;
  private credentials: LoginCredentials | null = null;

  /**
   * Login to Atlas API and store token
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('🔐 Attempting login to Atlas API...');
      
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
      }

      const data: LoginResponse = await response.json();
      this.token = data.token;
      this.credentials = credentials; // Store for auto-retry
      
      console.log('✅ Login successful!');
      console.log('Token preview:', data.token.substring(0, 50) + '...');
      
      return data;
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  /**
   * Generic method to handle authenticated API calls with auto-retry on token expiration
   */
  private async makeAuthenticatedRequest<T>(
    url: string,
    options: RequestInit,
    retryCount = 0
  ): Promise<T> {
    if (!this.token) {
      throw new Error('Not authenticated. Please login first.');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.token}`,
      },
    });

    // Handle token expiration (401 Unauthorized) with auto-retry
    if (response.status === 401 && retryCount === 0) {
      console.log('🔄 Token expired, attempting to re-authenticate...');
      
      if (!this.credentials) {
        throw new Error('Token expired and no stored credentials for re-authentication');
      }
      
      // Re-authenticate and retry once
      await this.login(this.credentials);
      console.log('🔄 Retrying request with new token...');
      
      return this.makeAuthenticatedRequest<T>(url, options, retryCount + 1);
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Perform a name query (risk check) using AtlasCompass V3
   * Automatically handles token expiration by re-authenticating
   */
  async performNameQuery(request: RiskCheckRequest): Promise<RiskCheckResponse> {
    try {
      console.log('🔍 Performing name query...');
      console.log('Search target:', `${request.firstName} ${request.lastName}`);
      
      const data = await this.makeAuthenticatedRequest<RiskCheckResponse>(
        `${API_BASE_URL}/risk-check`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );
      
      console.log('✅ Name query completed!');
      console.log('Checks requested:', data.checksRequested);
      
      return data;
    } catch (error) {
      console.error('❌ Name query error:', error);
      throw error;
    }
  }

  /**
   * Test the complete flow: login and perform a name search
   */
  async testCompleteFlow(
    credentials: LoginCredentials,
    searchRequest: RiskCheckRequest
  ): Promise<{ loginResult: LoginResponse; searchResult: RiskCheckResponse }> {
    try {
      console.log('🚀 Starting Atlas API test flow...');
      
      // Step 1: Login
      const loginResult = await this.login(credentials);
      
      // Step 2: Perform name query (auto-retry handled internally)
      const searchResult = await this.performNameQuery(searchRequest);
      
      console.log('🎉 Test flow completed successfully!');
      
      return { loginResult, searchResult };
    } catch (error) {
      console.error('💥 Test flow failed:', error);
      throw error;
    }
  }

  /**
   * Get current authentication status
   */
  isAuthenticated(): boolean {
    return this.token !== null;
  }

  /**
   * Clear stored token and credentials
   */
  logout(): void {
    this.token = null;
    this.credentials = null;
    console.log('🔓 Logged out - token and credentials cleared');
  }
}

// Example usage function
export async function runApiTest() {
  const apiTest = new AtlasApiTest();

  // Test credentials
  const credentials: LoginCredentials = {
    email: 'ryan11@thedevelopers.dev',
    password: 'ryan11@thedevelopers.dev'
  };

  // Example search request
  const searchRequest: RiskCheckRequest = {
    firstName: 'Ryan',
    lastName: 'Scott',
    birthday: '1969-09-03',
    city: 'New York',
    state: 'NY',
    country: 'US',
    checks: ['atlascompass_v3']
  };

  try {
    const results = await apiTest.testCompleteFlow(credentials, searchRequest);
    
    console.log('\n📊 RESULTS SUMMARY:');
    console.log('Login successful:', !!results.loginResult.token);
    console.log('Search completed:', !!results.searchResult.results);
    
    // Log search results summary if available
    if (results.searchResult.results.atlascompass_v3) {
      const atlasResult = results.searchResult.results.atlascompass_v3;
      if (atlasResult.summary) {
        console.log('Profiles found:', atlasResult.summary.totalProfilesFound);
        console.log('Risk level:', atlasResult.summary.overallRiskLevel);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
}

// Browser-friendly test function that can be called from console
if (typeof window !== 'undefined') {
  (window as any).testAtlasApi = runApiTest;
  console.log('💡 Atlas API test loaded! Call testAtlasApi() in console to run test.');
}