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
  private static readonly GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  private static readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

  /**
   * Analyze Atlas screening results with Gemini AI
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
    const prompt = this.buildAnalysisPrompt(personData, atlasResults);
    
    try {
      const response = await fetch(`${this.GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3, // Lower temperature for more consistent analysis
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!analysisText) {
        throw new Error('No analysis text received from Gemini');
      }

      return this.parseAnalysisResponse(analysisText);
      
    } catch (error) {
      console.error('Gemini analysis failed:', error);
      
      // Fallback analysis
      return this.generateFallbackAnalysis(personData, atlasResults);
    }
  }

  /**
   * Build comprehensive analysis prompt for Gemini
   */
  private static buildAnalysisPrompt(personData: any, atlasResults: any): string {
    const profiles = atlasResults.results?.atlascompass_v3?.profiles || [];
    const hasMatches = profiles.length > 0;
    
    return `
You are an expert security analyst reviewing screening results for identity verification and risk assessment. Analyze the following data and provide detailed insights in JSON format.

**PERSON BEING SCREENED:**
- Name: ${personData.name}
- Email: ${personData.email || 'Not provided'}
- Date of Birth: ${personData.dateOfBirth || 'Not provided'}
- Nationality: ${personData.nationality || 'Not provided'}
- Context: ${personData.context || 'General screening'}

**ATLAS SCREENING RESULTS:**
${JSON.stringify(atlasResults, null, 2)}

**ANALYSIS REQUIREMENTS:**

Provide a comprehensive analysis in valid JSON format with these sections:

1. **Risk Assessment**: Overall risk level (low/medium/high/critical), confidence score (0-100), summary paragraph, and detailed reasoning points.

2. **Match Analysis**: 
   - If matches found: Analyze primary match significance, key concerns, and any positive factors
   - Additional matches summary and their relevance
   - Match confidence levels and reliability factors

3. **Miss Analysis** (CRITICAL - analyze why someone might NOT be flagged):
   - Possible reasons why dangerous individuals might not appear in results
   - Data gaps that could hide risks (name variations, recent activities, jurisdiction limits)
   - False negative scenarios to consider

4. **Actionable Insights**:
   - Immediate actions required (if any)
   - Ongoing monitoring recommendations
   - Additional documentation or verification needed

5. **Contextual Factors**:
   - Time-related considerations (age of records, recent vs historical)
   - Geographic factors (jurisdiction coverage, international considerations)
   - Industry-specific context for this type of screening

**IMPORTANT GUIDELINES:**
- Be specific about WHY risks exist or don't exist
- Consider both false positives AND false negatives
- Provide actionable recommendations, not just observations
- Consider the limitations of the screening data
- Think about what might be missing from the search
- Be concise but thorough

Return ONLY valid JSON in this exact structure:

{
  "riskAssessment": {
    "overallRisk": "low|medium|high|critical",
    "confidence": 85,
    "summary": "Concise risk summary paragraph",
    "reasoning": ["Specific reason 1", "Specific reason 2"]
  },
  "matchAnalysis": {
    "primaryMatch": {
      "significance": "Analysis of primary match relevance",
      "concerns": ["Concern 1", "Concern 2"],
      "positives": ["Positive factor 1"]
    },
    "additionalMatches": {
      "count": 2,
      "summary": "Summary of additional matches"
    }
  },
  "missAnalysis": {
    "whyNotFlagged": ["Reason 1", "Reason 2"],
    "dataGaps": ["Gap 1", "Gap 2"],
    "recommendations": ["Recommendation 1"]
  },
  "actionableInsights": {
    "immediateActions": ["Action 1"],
    "monitoringRecommendations": ["Monitor 1"],
    "documentationNeeded": ["Document 1"]
  },
  "contextualFactors": {
    "timeFactors": ["Factor 1"],
    "geographicFactors": ["Factor 1"],
    "industryContext": ["Context 1"]
  }
}
`;
  }

  /**
   * Parse Gemini's response into structured data
   */
  private static parseAnalysisResponse(responseText: string): GeminiAnalysisResult {
    try {
      // Extract JSON from response (Gemini might include extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      return JSON.parse(jsonMatch[0]);
      
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      throw new Error('Invalid JSON response from Gemini');
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