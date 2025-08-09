import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const { personData, atlasResults } = await request.json();
    
    console.log('🤖 Running Gemini analysis for:', personData.name);
    
    const prompt = buildAnalysisPrompt(personData, atlasResults);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Gemini API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!analysisText) {
      throw new Error('No analysis text received from Gemini');
    }

    console.log('✅ Gemini analysis completed');
    
    // Parse the JSON response from Gemini
    const analysis = parseAnalysisResponse(analysisText);
    
    return NextResponse.json({ analysis });
    
  } catch (error) {
    console.error('Gemini analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze screening results' },
      { status: 500 }
    );
  }
}

function buildAnalysisPrompt(personData: any, atlasResults: any): string {
  const profiles = atlasResults.results?.atlascompass_v3?.profiles || [];
  
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

function parseAnalysisResponse(responseText: string): any {
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