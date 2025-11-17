import React, { useState } from 'react';
import { Building2, CheckCircle, AlertCircle } from 'lucide-react';

interface SetupWizardProps {
  onClose: () => void;
  onComplete: () => void;
}

type Step = 'info' | 'industry' | 'controls' | 'review' | 'complete';

interface SetupData {
  name: string;
  industry: string;
  jurisdiction: string;
  isoAlignment: boolean;
}

const INDUSTRIES = [
  'Electrical',
  'Construction',
  'Manufacturing',
  'Mining',
  'Oil & Gas',
  'Transportation',
  'Healthcare',
  'Other'
];

const JURISDICTIONS = [
  'VIC (Victoria)',
  'NSW (New South Wales)',
  'QLD (Queensland)',
  'WA (Western Australia)',
  'SA (South Australia)',
  'TAS (Tasmania)',
  'ACT (Australian Capital Territory)',
  'NT (Northern Territory)'
];

export function ClientSetupWizard({ onClose, onComplete }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupResults, setSetupResults] = useState<any>(null);
  
  const [setupData, setSetupData] = useState<SetupData>({
    name: '',
    industry: '',
    jurisdiction: '',
    isoAlignment: false
  });

  const steps: { id: Step; label: string; description: string }[] = [
    { id: 'info', label: 'Client Info', description: 'Basic details' },
    { id: 'industry', label: 'Industry', description: 'Select sector' },
    { id: 'controls', label: 'Framework', description: 'Safety controls' },
    { id: 'review', label: 'Review', description: 'Confirm setup' },
    { id: 'complete', label: 'Complete', description: 'Finalize' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleNext = () => {
    if (currentStep === 'info') {
      if (!setupData.name.trim()) {
        setError('Client name is required');
        return;
      }
      setError(null);
      setCurrentStep('industry');
    } else if (currentStep === 'industry') {
      if (!setupData.industry) {
        setError('Please select an industry');
        return;
      }
      setError(null);
      setCurrentStep('controls');
    } else if (currentStep === 'controls') {
      setCurrentStep('review');
    } else if (currentStep === 'review') {
      handleSetupClient();
    }
  };

  const handleBack = () => {
    if (currentStep === 'industry') setCurrentStep('info');
    else if (currentStep === 'controls') setCurrentStep('industry');
    else if (currentStep === 'review') setCurrentStep('controls');
  };

  const handleSetupClient = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Create the client
      const client = await window.api.createClient({
        name: setupData.name.trim()
      });

      if (!client?.id) {
        throw new Error('Failed to create client');
      }

      // Step 2: Setup the safety framework
      const results = await window.api.setupClientFramework({
        clientId: client.id,
        industry: setupData.industry,
        jurisdiction: setupData.jurisdiction,
        isoAlignment: setupData.isoAlignment
      });

      setSetupResults(results);
      setCurrentStep('complete');
    } catch (err: any) {
      console.error('Setup failed:', err);
      setError(err?.message || 'Failed to setup client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                index < currentStepIndex
                  ? 'bg-green-500 text-white'
                  : index === currentStepIndex
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {index < currentStepIndex ? (
                <CheckCircle size={20} />
              ) : (
                index + 1
              )}
            </div>
            <div className="text-xs mt-2 text-center">
              <div className="font-medium">{step.label}</div>
              <div className="text-gray-500">{step.description}</div>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-1 flex-1 mx-2 rounded transition-colors ${
                index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderInfoStep = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Client Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={setupData.name}
          onChange={(e) => setSetupData({ ...setupData, name: e.target.value })}
          placeholder="e.g., ABC Construction Pty Ltd"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoFocus
        />
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">What happens next?</p>
            <p>We'll guide you through selecting the right safety framework, controls, and hazards for this client based on their industry and jurisdiction.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIndustryStep = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Primary Industry <span className="text-red-500">*</span>
        </label>
        <select
          value={setupData.industry}
          onChange={(e) => setSetupData({ ...setupData, industry: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select industry...</option>
          {INDUSTRIES.map(ind => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Jurisdiction
        </label>
        <select
          value={setupData.jurisdiction}
          onChange={(e) => setSetupData({ ...setupData, jurisdiction: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select jurisdiction...</option>
          {JURISDICTIONS.map(jur => (
            <option key={jur} value={jur}>{jur}</option>
          ))}
        </select>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          This helps us pre-load industry-specific hazards and jurisdiction-specific compliance requirements.
        </p>
      </div>
    </div>
  );

  const renderControlsStep = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Safety Framework Options
        </label>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              id="iso-alignment"
              checked={setupData.isoAlignment}
              onChange={(e) => setSetupData({ ...setupData, isoAlignment: e.target.checked })}
              className="mt-1"
            />
            <div>
              <label htmlFor="iso-alignment" className="font-medium text-gray-900 cursor-pointer">
                ISO 45001 Alignment
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Include ISO 45001:2018 requirements for occupational health and safety management systems.
                Adds policy templates, competence procedures, and audit records.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-green-900">
            <p className="font-medium mb-1">What will be loaded?</p>
            <ul className="list-disc list-inside space-y-1">
              {setupData.industry && (
                <li>Industry-specific hazards and controls for {setupData.industry}</li>
              )}
              {setupData.jurisdiction && (
                <li>Legislative requirements for {setupData.jurisdiction}</li>
              )}
              {setupData.isoAlignment && (
                <li>ISO 45001:2018 compliance framework</li>
              )}
              {!setupData.industry && !setupData.jurisdiction && !setupData.isoAlignment && (
                <li className="text-gray-600">Base safety controls library</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Review Setup</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-600">Client Name:</span>
            <p className="font-medium">{setupData.name}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Industry:</span>
            <p className="font-medium">{setupData.industry || 'Not specified'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Jurisdiction:</span>
            <p className="font-medium">{setupData.jurisdiction || 'Not specified'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">ISO 45001:</span>
            <p className="font-medium">{setupData.isoAlignment ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Ready to create?</p>
            <p>
              This will create the client profile and import all relevant hazards, controls, and framework templates. 
              You can customize everything after setup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center space-y-6 py-8">
      <div className="flex justify-center">
        <div className="bg-green-100 rounded-full p-6">
          <CheckCircle className="text-green-600" size={48} />
        </div>
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Setup Complete!</h3>
        <p className="text-gray-600">
          Client <span className="font-semibold">{setupData.name}</span> has been created successfully.
        </p>
      </div>

      {setupResults && (
        <div className="bg-gray-50 rounded-lg p-6 text-left">
          <h4 className="font-semibold text-gray-900 mb-3">What was imported:</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Hazards:</span>
              <span className="font-medium">{setupResults.hazardsImported || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Controls:</span>
              <span className="font-medium">{setupResults.controlsImported || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Mappings:</span>
              <span className="font-medium">{setupResults.mappingsCreated || 0}</span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          onComplete();
          onClose();
        }}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
      >
        Done
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Building2 className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Client Setup Wizard</h2>
                <p className="text-gray-600 text-sm">Create a new client with a tailored safety framework</p>
              </div>
            </div>
          </div>

          {/* Step Indicator */}
          {currentStep !== 'complete' && renderStepIndicator()}

          {/* Content */}
          <div className="min-h-[300px]">
            {currentStep === 'info' && renderInfoStep()}
            {currentStep === 'industry' && renderIndustryStep()}
            {currentStep === 'controls' && renderControlsStep()}
            {currentStep === 'review' && renderReviewStep()}
            {currentStep === 'complete' && renderCompleteStep()}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Actions */}
          {currentStep !== 'complete' && (
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={currentStepIndex === 0 ? onClose : handleBack}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
              >
                {currentStepIndex === 0 ? 'Cancel' : 'Back'}
              </button>
              <button
                onClick={handleNext}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Processing...' : currentStep === 'review' ? 'Create Client' : 'Next'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}