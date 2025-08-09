import React from 'react';
import { AlertTriangle, Shield, User, Calendar, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import { ScreeningResult } from '@/lib/screening';

interface ScreeningDetailsProps {
  person: any;
  onClose: () => void;
}

const ScreeningDetails: React.FC<ScreeningDetailsProps> = ({ person, onClose }) => {
  // Parse screening data from person
  let screeningData = null;
  
  try {
    if (person.screening_details) {
      // Check if it's already an object or needs parsing
      if (typeof person.screening_details === 'string') {
        screeningData = JSON.parse(person.screening_details);
      } else {
        screeningData = person.screening_details;
      }
    }
  } catch (error) {
    console.error('Error parsing screening data:', error);
    console.log('Raw screening_details:', person.screening_details);
    screeningData = null;
  }
  
  // Debug logging
  console.log('🔍 Debug - Parsed screening data:', screeningData);
  if (screeningData?.matches) {
    console.log('🔍 Debug - Matches found:', screeningData.matches.length);
    console.log('🔍 Debug - First match:', screeningData.matches[0]);
  }
  
  if (!screeningData) {
    return (
      <div className="w-1/3 bg-white border-l border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Screening Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No screening data available</p>
        </div>
      </div>
    );
  }

  const profiles = screeningData.matches || [];
  const primaryProfile = profiles[0];

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-red-100 text-red-800';
    if (confidence >= 80) return 'bg-orange-100 text-orange-800';
    if (confidence >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="w-1/3 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Screening Report</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Person Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-3">
            <User className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="font-semibold text-gray-900">{person.name}</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-2 text-sm">
            {person.email && (
              <div className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                {person.email}
              </div>
            )}
            {person.phone && (
              <div className="flex items-center text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {person.phone}
              </div>
            )}
            {person.date_of_birth && (
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(person.date_of_birth).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Screening Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Screening Summary</h4>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskBadgeColor(screeningData.riskLevel)}`}>
              {screeningData.riskLevel?.toUpperCase()} RISK
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {screeningData.matchCount || 0}
              </div>
              <div className="text-sm text-gray-600">Profiles Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((screeningData.highestConfidence || 0) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Top Match</div>
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-3">
            <strong>Request ID:</strong> {screeningData.requestId}
          </div>
        </div>

        {/* Debug Info */}
        {screeningData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Debug Info</h4>
            <div className="text-xs text-yellow-700">
              <div>Match count: {screeningData.matchCount}</div>
              <div>Matches length: {profiles.length}</div>
              <div>Has primaryProfile: {primaryProfile ? 'Yes' : 'No'}</div>
              {primaryProfile && <div>Profile keys: {Object.keys(primaryProfile).join(', ')}</div>}
            </div>
          </div>
        )}

        {/* Primary Profile Match */}
        {primaryProfile && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
              Primary Profile Match
            </h4>
            
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-bold text-lg">{primaryProfile.basicInfo?.fullName}</h5>
                  {primaryProfile.basicInfo?.alternateNames?.length > 0 && (
                    <p className="text-gray-600 text-sm">
                      Also known as: {primaryProfile.basicInfo.alternateNames.join(', ')}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceBadgeColor(primaryProfile.matchConfidence)}`}>
                    {primaryProfile.matchConfidence}% MATCH
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    {primaryProfile.reliabilityLevel} RELIABILITY
                  </div>
                </div>
              </div>

              {/* Demographics */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {primaryProfile.basicInfo?.age && (
                  <div>
                    <div className="text-gray-500">Age</div>
                    <div className="font-medium">{primaryProfile.basicInfo.age} years old</div>
                  </div>
                )}
                {primaryProfile.basicInfo?.gender && (
                  <div>
                    <div className="text-gray-500">Gender</div>
                    <div className="font-medium">{primaryProfile.basicInfo.gender}</div>
                  </div>
                )}
                {primaryProfile.basicInfo?.nationality && (
                  <div>
                    <div className="text-gray-500">Nationality</div>
                    <div className="font-medium">{primaryProfile.basicInfo.nationality}</div>
                  </div>
                )}
                {primaryProfile.riskAssessment?.riskScore && (
                  <div>
                    <div className="text-gray-500">Risk Score</div>
                    <div className={`font-bold ${
                      primaryProfile.riskAssessment.riskScore > 200 ? 'text-red-600' :
                      primaryProfile.riskAssessment.riskScore > 100 ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {primaryProfile.riskAssessment.riskScore}
                    </div>
                  </div>
                )}
              </div>

              {/* Risk Factors */}
              {primaryProfile.riskAssessment?.riskFactors?.length > 0 && (
                <div>
                  <h6 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
                    Risk Factors
                  </h6>
                  <div className="space-y-2">
                    {primaryProfile.riskAssessment.riskFactors.map((factor: any, idx: number) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          factor.severity === 'HIGH' ? 'bg-red-100 text-red-800' :
                          factor.severity === 'MEDIUM' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {factor.severity} - {factor.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Validation Reasons */}
              {primaryProfile.reliabilityReasons?.length > 0 && (
                <div className="bg-gray-50 p-3 rounded">
                  <h6 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-1 text-green-500" />
                    Validation Details
                  </h6>
                  <ul className="text-sm space-y-1">
                    {primaryProfile.reliabilityReasons.map((reason: string, idx: number) => (
                      <li key={idx} className="flex items-center text-green-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Court Cases */}
              {primaryProfile.criminalRecord?.courtCases?.length > 0 && (
                <div>
                  <h6 className="font-semibold text-gray-900 mb-2 flex items-center">
                    ⚖️ Legal History
                  </h6>
                  <div className="space-y-2">
                    {primaryProfile.criminalRecord.courtCases.map((courtCase: any, idx: number) => (
                      <div key={idx} className="border-l-4 border-orange-400 pl-3 py-2 bg-orange-50">
                        <div className="font-medium text-sm">Case #{courtCase.caseNumber || 'Unknown'}</div>
                        <div className="text-xs text-gray-600">Court: {courtCase.court || 'Unknown Court'}</div>
                        {courtCase.link && (
                          <a href={courtCase.link} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:text-blue-800 text-xs flex items-center mt-1">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Case Details
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Matches */}
        {profiles.length > 1 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-4">
              Additional Matches ({profiles.length - 1})
            </h4>
            <div className="space-y-3">
              {profiles.slice(1, 4).map((profile: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded text-sm">
                  <div>
                    <div className="font-medium">{profile.basicInfo?.fullName}</div>
                    <div className="text-gray-600 text-xs">
                      {profile.basicInfo?.dateOfBirth} • {profile.basicInfo?.nationality}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">{profile.matchConfidence}%</div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      profile.riskAssessment?.overallRisk === 'LOW' ? 'bg-green-100 text-green-800' :
                      profile.riskAssessment?.overallRisk === 'MEDIUM' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {profile.riskAssessment?.overallRisk || 'UNKNOWN'}
                    </span>
                  </div>
                </div>
              ))}
              {profiles.length > 4 && (
                <div className="text-center text-gray-500 text-sm py-2">
                  +{profiles.length - 4} more profiles found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreeningDetails;