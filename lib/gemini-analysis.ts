// Gemini AI Analysis Service for Atlas Screening Results
// Processes raw Atlas data and provides intelligent insights

export interface GeminiAnalysisResult {
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    summary: string;
    reasoning: string[];
  };
  matchAnalysis: {
    primaryMatch?: {
      significance: string;
      concerns: string[];
      positives: string[];
    };
    additionalMatches: {
      count: number;
      summary: string;
    };
  };
  missAnalysis: {
    whyNotFlagged: string[];
    dataGaps: string[];
    recommendations: string[];
  };
  actionableInsights: {
    immediateActions: string[];
    monitoringRecommendations: string[];
    documentationNeeded: string[];
  };
  contextualFactors: {
    timeFactors: string[];
    geographicFactors: string[];
    industryContext: string[];
  };
}

export class GeminiAnalysisService {

  /**
   * Analyze Atlas screening results with Gemini AI via Next.js API route
   */
  static async analyzeScreeningResults(
    personData: {
      name: string;
      email?: string;
      dateOfBirth?: string;
      nationality?: string;
      context?: string; // e.g., "cruise passenger", "crew member", "vendor"
    },
    atlasResults: any
  ): Promise<GeminiAnalysisResult> {
    
    try {
      const response = await fetch('/api/gemini-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personData,
          atlasResults
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${errorData.error || response.status}`);
      }

      const data = await response.json();
      return data.analysis;
      
    } catch (error) {
      console.error('Gemini analysis failed:', error);
      
      // Fallback analysis
      return this.generateFallbackAnalysis(personData, atlasResults);
    }
  }


  /**
   * Generate fallback analysis if Gemini fails
   */
  private static generateFallbackAnalysis(personData: any, atlasResults: any): GeminiAnalysisResult {
    const profiles = atlasResults.results?.atlascompass_v3?.profiles || [];
    const hasMatches = profiles.length > 0;
    const primaryMatch = profiles[0];

    return {
      riskAssessment: {
        overallRisk: hasMatches ? 'medium' : 'low',
        confidence: hasMatches ? 70 : 85,
        summary: hasMatches 
          ? `${profiles.length} profile(s) found requiring review.`
          : 'No concerning profiles found in current screening databases.',
        reasoning: hasMatches 
          ? ['Profile matches detected', 'Requires manual review']
          : ['No database matches', 'Standard verification protocols apply']
      },
      matchAnalysis: {
        primaryMatch: primaryMatch ? {
          significance: `Primary match with ${primaryMatch.matchConfidence || 'unknown'}% confidence`,
          concerns: primaryMatch.riskAssessment?.riskFactors?.map((r: any) => r.description) || [],
          positives: primaryMatch.reliabilityReasons || []
        } : undefined,
        additionalMatches: {
          count: Math.max(0, profiles.length - 1),
          summary: profiles.length > 1 ? `${profiles.length - 1} additional profiles require review` : 'No additional matches'
        }
      },
      missAnalysis: {
        whyNotFlagged: [
          'Person may be using variations of their name not searched',
          'Recent activities may not yet appear in databases',
          'International records may have limited coverage'
        ],
        dataGaps: [
          'Alternative name spellings not checked',
          'Recent address changes not reflected',
          'International jurisdiction limitations'
        ],
        recommendations: [
          'Verify identity documents match provided information',
          'Consider additional reference checks if high-risk context'
        ]
      },
      actionableInsights: {
        immediateActions: hasMatches ? ['Review match details', 'Verify identity documents'] : [],
        monitoringRecommendations: ['Follow standard onboarding procedures'],
        documentationNeeded: ['Photo ID verification', 'Standard documentation per policy']
      },
      contextualFactors: {
        timeFactors: ['Screening reflects historical data only'],
        geographicFactors: ['Coverage varies by jurisdiction'],
        industryContext: [`Standard ${personData.context || 'general'} screening protocols apply`]
      }
    };
  }

  /**
   * Format analysis for UI display
   */
  static formatForDisplay(analysis: GeminiAnalysisResult): {
    summary: string;
    riskBadgeColor: string;
    keyInsights: string[];
    recommendations: string[];
  } {
    const riskColors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-orange-100 text-orange-800', 
      high: 'bg-red-100 text-red-800',
      critical: 'bg-red-200 text-red-900'
    };

    return {
      summary: analysis.riskAssessment.summary,
      riskBadgeColor: riskColors[analysis.riskAssessment.overallRisk],
      keyInsights: [
        ...analysis.riskAssessment.reasoning,
        ...analysis.missAnalysis.whyNotFlagged.slice(0, 2)
      ],
      recommendations: [
        ...analysis.actionableInsights.immediateActions,
        ...analysis.actionableInsights.documentationNeeded.slice(0, 2)
      ]
    };
  }
}