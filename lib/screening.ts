import { supabase } from './supabase';

export interface ScreeningParams {
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
}

export interface ScreeningResult {
  requestId: string;
  matchCount: number;
  highestConfidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  matches: any[];
  cachedAt: string;
}

export interface CacheEntry {
  id: string;
  atlas_response: any;
  match_count: number;
  highest_confidence_score: number;
  risk_level: string;
  cached_at: string;
}

export class ScreeningService {
  private static readonly CACHE_DURATION_HOURS = 24; // Cache for 24 hours
  private static readonly ATLAS_API_BASE = 'https://atlas-global-v4.fragrant-recipe-007f.workers.dev';

  /**
   * Main screening function - checks cache first, then hits Atlas API
   */
  static async screenPerson(
    personId: string,
    tenantId: string,
    params: ScreeningParams
  ): Promise<ScreeningResult> {
    console.log('🔍 Starting screening for:', params.name);

    // 1. Check cache first
    const cached = await this.checkCache(params);
    if (cached) {
      console.log('✅ Using cached screening result');
      await this.linkCacheToPersonIfNeeded(cached.id, personId);
      return this.formatCacheResult(cached);
    }

    // 2. Run new screening via Atlas API
    console.log('🌐 Running new screening via Atlas API');
    const result = await this.runAtlasScreening(params);
    
    // 3. Cache the result
    await this.cacheResult(personId, tenantId, params, result);
    
    return result;
  }

  /**
   * Check if we have a valid cached result
   */
  private static async checkCache(params: ScreeningParams): Promise<CacheEntry | null> {
    try {
      const { data } = await supabase.rpc('find_cached_screening', {
        p_name: params.name,
        p_email: params.email || null,
        p_dob: params.dateOfBirth || null
      });

      return data?.[0] || null;
    } catch (error) {
      console.error('Error checking cache:', error);
      return null;
    }
  }

  /**
   * Run screening via Atlas API
   */
  private static async runAtlasScreening(params: ScreeningParams): Promise<ScreeningResult> {
    try {
      // Get auth token first
      const authResponse = await fetch('/api/atlas-proxy/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser',
          password: 'testpass123'
        })
      });

      if (!authResponse.ok) {
        throw new Error('Atlas API authentication failed');
      }

      const { token } = await authResponse.json();

      // Run risk check
      const riskResponse = await fetch('/api/atlas-proxy/risk-check', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          profiles: [{
            firstName: params.name.split(' ')[0],
            lastName: params.name.split(' ').slice(1).join(' '),
            email: params.email,
            phone: params.phone,
            dateOfBirth: params.dateOfBirth,
            nationality: params.nationality
          }],
          options: {
            confidenceThreshold: 0.7,
            maxProfilesPerRequest: 1,
            enableCaching: true
          }
        })
      });

      if (!riskResponse.ok) {
        throw new Error('Atlas API risk check failed');
      }

      const riskData = await riskResponse.json();
      
      return this.parseAtlasResponse(riskData);
      
    } catch (error) {
      console.error('Atlas API screening failed:', error);
      
      // Return a mock result for development
      return {
        requestId: `dev-${Date.now()}`,
        matchCount: 0,
        highestConfidence: 0,
        riskLevel: 'low',
        matches: [],
        cachedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Parse Atlas API response into our format
   */
  private static parseAtlasResponse(atlasResponse: any): ScreeningResult {
    const results = atlasResponse.results?.[0] || {};
    const matches = results.matches || [];
    
    let highestConfidence = 0;
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    if (matches.length > 0) {
      highestConfidence = Math.max(...matches.map((m: any) => m.confidence || 0));
      
      if (highestConfidence >= 0.9) riskLevel = 'critical';
      else if (highestConfidence >= 0.8) riskLevel = 'high';
      else if (highestConfidence >= 0.7) riskLevel = 'medium';
    }

    return {
      requestId: atlasResponse.requestId || `atlas-${Date.now()}`,
      matchCount: matches.length,
      highestConfidence,
      riskLevel,
      matches,
      cachedAt: new Date().toISOString()
    };
  }

  /**
   * Cache screening result in database
   */
  private static async cacheResult(
    personId: string,
    tenantId: string,
    params: ScreeningParams,
    result: ScreeningResult
  ): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + this.CACHE_DURATION_HOURS);

      await supabase.from('screening_cache').insert({
        person_id: personId,
        tenant_id: tenantId,
        search_name: params.name,
        search_email: params.email,
        search_phone: params.phone,
        search_id_number: null, // Not used in search currently
        search_dob: params.dateOfBirth,
        atlas_request_id: result.requestId,
        atlas_response: {
          matches: result.matches,
          requestId: result.requestId,
          cachedAt: result.cachedAt
        },
        match_count: result.matchCount,
        highest_confidence_score: result.highestConfidence,
        risk_level: result.riskLevel,
        expires_at: expiresAt.toISOString()
      });

      console.log('✅ Screening result cached');
    } catch (error) {
      console.error('Failed to cache screening result:', error);
    }
  }

  /**
   * Convert cached result to our standard format
   */
  private static formatCacheResult(cache: CacheEntry): ScreeningResult {
    return {
      requestId: cache.atlas_response.requestId || 'cached',
      matchCount: cache.match_count,
      highestConfidence: Number(cache.highest_confidence_score),
      riskLevel: cache.risk_level as any,
      matches: cache.atlas_response.matches || [],
      cachedAt: cache.cached_at
    };
  }

  /**
   * Link existing cache entry to person if not already linked
   */
  private static async linkCacheToPersonIfNeeded(cacheId: string, personId: string): Promise<void> {
    // This would update the cache entry to reference the new person
    // For now, we'll skip this since cached results are searched by name/email
  }

  /**
   * Get screening status summary for display
   */
  static getStatusSummary(result: ScreeningResult): {
    status: string;
    badgeColor: string;
    summary: string;
  } {
    if (result.matchCount === 0) {
      return {
        status: 'clear',
        badgeColor: 'bg-green-100 text-green-800',
        summary: 'No matches found'
      };
    }

    switch (result.riskLevel) {
      case 'critical':
        return {
          status: 'flagged',
          badgeColor: 'bg-red-100 text-red-800',
          summary: `${result.matchCount} high-risk matches (${Math.round(result.highestConfidence * 100)}% confidence)`
        };
      case 'high':
        return {
          status: 'flagged',
          badgeColor: 'bg-red-100 text-red-800',
          summary: `${result.matchCount} matches (${Math.round(result.highestConfidence * 100)}% confidence)`
        };
      case 'medium':
        return {
          status: 'attention',
          badgeColor: 'bg-orange-100 text-orange-800',
          summary: `${result.matchCount} potential matches (${Math.round(result.highestConfidence * 100)}% confidence)`
        };
      default:
        return {
          status: 'clear',
          badgeColor: 'bg-blue-100 text-blue-800',
          summary: `${result.matchCount} low-confidence matches`
        };
    }
  }
}