'use client';

import { useState } from 'react';
import { AtlasApiTest, runApiTest } from '@/lib/api-test';

export default function ApiTestPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log('🧪 Starting API test...');
      const testResults = await runApiTest();
      setResults(testResults);
      console.log('✅ Test completed successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ Test failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Atlas API Test
          </h1>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Test the Atlas Global V4 API login and name query functionality.
            </p>

            <button
              onClick={handleTest}
              disabled={loading}
              className={`px-6 py-3 rounded-md font-medium ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white transition-colors`}
            >
              {loading ? 'Testing...' : 'Run API Test'}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Test Failed
                </h3>
                <p className="text-red-700">{error}</p>
              </div>
            )}

{results && (
              <div className="space-y-6">
                {/* Executive Summary */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">📊 Atlas Risk Assessment Report</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      ✅ PASSED
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {results.searchResult.results.atlascompass_v3?.summary?.totalProfilesFound || 0}
                      </div>
                      <div className="text-sm text-gray-600">Profiles Found</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {results.searchResult.results.atlascompass_v3?.summary?.overallRiskLevel || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">Risk Level</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {results.searchResult.results.atlascompass_v3?.profiles?.[0]?.matchConfidence || 'N/A'}%
                      </div>
                      <div className="text-sm text-gray-600">Top Match</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {results.searchResult.results.atlascompass_v3?.decision || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">Decision</div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-700">
                    <strong>Search Target:</strong> Ryan Scott (DOB: 09-03-1969) • 
                    <strong> Request ID:</strong> {results.searchResult.results.atlascompass_v3?.requestId || 'N/A'}
                  </div>
                </div>

                {/* Primary Profile Match */}
                {results.searchResult.results.atlascompass_v3?.profiles?.[0] && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">👤 Primary Profile Match</h4>
                    
                    {(() => {
                      const profile = results.searchResult.results.atlascompass_v3.profiles[0];
                      return (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-bold text-lg">{profile.basicInfo?.fullName}</h5>
                              <p className="text-gray-600">
                                {profile.basicInfo?.alternateNames?.[0] && `Also known as: ${profile.basicInfo.alternateNames.join(', ')}`}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">{profile.matchConfidence}%</div>
                              <div className="text-sm text-gray-600">Match Confidence</div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                profile.reliabilityLevel === 'HIGH' ? 'bg-green-100 text-green-800' :
                                profile.reliabilityLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {profile.reliabilityLevel} RELIABILITY
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <div className="text-sm text-gray-500">Age</div>
                              <div className="font-medium">{profile.basicInfo?.age} years old</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Gender</div>
                              <div className="font-medium">{profile.basicInfo?.gender}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Nationality</div>
                              <div className="font-medium">{profile.basicInfo?.nationality}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Risk Score</div>
                              <div className={`font-bold ${
                                profile.riskAssessment?.riskScore > 200 ? 'text-red-600' :
                                profile.riskAssessment?.riskScore > 100 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {profile.riskAssessment?.riskScore || 'N/A'}
                              </div>
                            </div>
                          </div>

                          {/* Risk Factors */}
                          {profile.riskAssessment?.riskFactors && profile.riskAssessment.riskFactors.length > 0 && (
                            <div>
                              <h6 className="font-semibold text-gray-900 mb-2">⚠️ Risk Factors:</h6>
                              <div className="space-y-2">
                                {profile.riskAssessment.riskFactors.map((factor: any, idx: number) => (
                                  <div key={idx} className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      factor.severity === 'HIGH' ? 'bg-red-100 text-red-800' :
                                      factor.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-blue-100 text-blue-800'
                                    }`}>
                                      {factor.severity} - {factor.type}
                                    </span>
                                    <span className="text-sm text-gray-600">{factor.description}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Validation Details */}
                          <div className="bg-gray-50 p-4 rounded">
                            <h6 className="font-semibold text-gray-900 mb-2">✅ Validation Details:</h6>
                            <ul className="text-sm space-y-1">
                              {profile.reliabilityReasons?.map((reason: string, idx: number) => (
                                <li key={idx} className="flex items-center text-green-700">
                                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Digital Footprint */}
                {results.searchResult.results.atlascompass_v3?.profiles?.[0]?.webPresence && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">🌐 Digital Footprint Analysis</h4>
                    
                    {(() => {
                      const webPresence = results.searchResult.results.atlascompass_v3.profiles[0].webPresence;
                      const socialMedia = results.searchResult.results.atlascompass_v3.profiles[0].socialMedia;
                      
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h6 className="font-semibold text-gray-900 mb-3">Web Presence</h6>
                            {webPresence.linksSummary && (
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Total Links:</span>
                                  <span className="font-medium">{webPresence.linksSummary.total}</span>
                                </div>
                                {Object.entries(webPresence.linksSummary.byCategory || {}).map(([category, count]) => (
                                  <div key={category} className="flex justify-between text-sm">
                                    <span className="text-gray-600">{category}:</span>
                                    <span className="font-medium">{count as number}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <h6 className="font-semibold text-gray-900 mb-3">Social Media</h6>
                            {socialMedia?.summary && (
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Platforms:</span>
                                  <span className="font-medium">{socialMedia.summary.totalPlatforms}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Verified:</span>
                                  <span className="font-medium">{socialMedia.summary.verifiedAccounts}</span>
                                </div>
                              </div>
                            )}
                            
                            {socialMedia?.platforms && socialMedia.platforms.length > 0 && (
                              <div className="mt-3">
                                <div className="text-sm text-gray-600">Platforms found:</div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {socialMedia.platforms.slice(0, 6).map((platform: any, idx: number) => (
                                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                      {platform.platform}
                                    </span>
                                  ))}
                                  {socialMedia.platforms.length > 6 && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                      +{socialMedia.platforms.length - 6} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Court Cases */}
                {results.searchResult.results.atlascompass_v3?.profiles?.[0]?.criminalRecord?.courtCases && 
                 results.searchResult.results.atlascompass_v3.profiles[0].criminalRecord.courtCases.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">⚖️ Legal History</h4>
                    <div className="space-y-3">
                      {results.searchResult.results.atlascompass_v3.profiles[0].criminalRecord.courtCases.map((courtCase: any, idx: number) => (
                        <div key={idx} className="border-l-4 border-yellow-400 pl-4 py-2">
                          <div className="font-medium">Case #{courtCase.caseNumber || 'Unknown'}</div>
                          <div className="text-sm text-gray-600">Court: {courtCase.court || 'Unknown Court'}</div>
                          {courtCase.link && (
                            <a href={courtCase.link} target="_blank" rel="noopener noreferrer" 
                               className="text-blue-600 hover:text-blue-800 text-sm">
                              View Case Details →
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Profiles */}
                {results.searchResult.results.atlascompass_v3?.profiles && 
                 results.searchResult.results.atlascompass_v3.profiles.length > 1 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">
                      📋 Additional Profile Matches ({results.searchResult.results.atlascompass_v3.profiles.length - 1})
                    </h4>
                    <div className="space-y-3">
                      {results.searchResult.results.atlascompass_v3.profiles.slice(1, 6).map((profile: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium">{profile.basicInfo?.fullName}</div>
                            <div className="text-sm text-gray-600">
                              {profile.basicInfo?.dateOfBirth} • {profile.basicInfo?.nationality}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-blue-600">{profile.matchConfidence}%</div>
                            <span className={`px-2 py-1 rounded text-xs ${
                              profile.riskAssessment?.overallRisk === 'LOW' ? 'bg-green-100 text-green-800' :
                              profile.riskAssessment?.overallRisk === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {profile.riskAssessment?.overallRisk || 'UNKNOWN'} RISK
                            </span>
                          </div>
                        </div>
                      ))}
                      {results.searchResult.results.atlascompass_v3.profiles.length > 6 && (
                        <div className="text-center text-gray-500 text-sm py-2">
                          +{results.searchResult.results.atlascompass_v3.profiles.length - 6} more profiles found
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Raw API Response */}
                <details className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <summary className="font-semibold text-gray-800 cursor-pointer">
                    🔧 Raw API Response (Click to expand)
                  </summary>
                  <pre className="mt-2 text-xs text-gray-600 overflow-auto bg-white p-2 rounded border max-h-96">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Test Configuration
          </h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>API Base URL:</strong> /api/atlas-proxy (proxied to Atlas Global V4)</p>
            <p><strong>Test Email:</strong> ryan11@thedevelopers.dev</p>
            <p><strong>Search Target:</strong> Ryan Scott (born 09-03-1969)</p>
            <p><strong>Check Type:</strong> AtlasCompass V3</p>
          </div>
        </div>
      </div>
    </div>
  );
}