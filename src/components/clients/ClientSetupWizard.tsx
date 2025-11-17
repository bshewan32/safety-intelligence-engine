import React, { useState, useMemo } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  AlertCircle,
  Building2,
  Factory,
  MapPin,
  Shield,
  Eye,
  Sliders
} from 'lucide-react';

interface SetupData {
  // Step 1: Basic info
  name: string;
  
  // Step 2: Industry & Jurisdiction
  industry: string;
  jurisdiction: string;
  isoAlignment: boolean;
  
  // Step 3: Hazard Pack Selection (preview will be fetched from API)
  selectedHazardPacks: string[];
  
  // Step 4: Risk Customization
  hazardCustomizations: Array<{
    hazardId: string;
    code: string;
    name: string;
    category: string;
    originalRisk: number;
    customRisk?: number;
    isActive: boolean;
    notes?: string;
  }>;
}

interface ClientSetupWizardProps {
  onClose: () => void;
  onComplete: () => void;
}

type WizardStep = 'info' | 'industry' | 'hazards' | 'customize' | 'review' | 'complete';

const INDUSTRIES = [
  'Electrical Contracting',
  'Construction & Building',
  'Manufacturing',
  'Mining & Resources',
  'Transport & Logistics',
  'Healthcare & Medical',
  'Hospitality & Retail',
  'General Services'
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

// Risk level labels and colors
const RISK_LEVELS = [
  { value: 0, label: 'Very Low', color: 'bg-green-100 text-green-800' },
  { value: 1, label: 'Low', color: 'bg-green-200 text-green-900' },
  { value: 2, label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 3, label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 4, label: 'Critical', color: 'bg-red-100 text-red-800' }
];

const getRiskLabel = (score: number) => RISK_LEVELS.find(r => r.value === score) || RISK_LEVELS[0];

export function ClientSetupWizard({ onClose, onComplete }: ClientSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Preview data from API
  const [hazardPreview, setHazardPreview] = useState<any[]>([]);
  const [controlPreview, setControlPreview] = useState<any[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  // Setup completion results
  const [setupResults, setSetupResults] = useState<any>(null);

  const [setupData, setSetupData] = useState<SetupData>({
    name: '',
    industry: '',
    jurisdiction: '',
    isoAlignment: false,
    selectedHazardPacks: [],
    hazardCustomizations: []
  });

  const steps = [
    { id: 'info', label: 'Client Info', description: 'Basic details', icon: Building2 },
    { id: 'industry', label: 'Industry', description: 'Select type', icon: Factory },
    { id: 'hazards', label: 'Hazard Packs', description: 'Preview risks', icon: Eye },
    { id: 'customize', label: 'Customize', description: 'Adjust risks', icon: Sliders },
    { id: 'review', label: 'Review', description: 'Confirm setup', icon: Shield },
    { id: 'complete', label: 'Complete', description: 'Finish', icon: CheckCircle }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const isLastStep = currentStep === 'review';
  const isComplete = currentStep === 'complete';

  // Validation
  const canProceed = useMemo(() => {
    if (currentStep === 'info') return setupData.name.trim().length > 0;
    if (currentStep === 'industry') return setupData.industry.length > 0;
    if (currentStep === 'hazards') return true; // Preview is optional
    if (currentStep === 'customize') return true; // Customization is optional
    if (currentStep === 'review') return true; // Always can proceed from review
    return false;
  }, [currentStep, setupData]);

  // Load hazard preview when industry/jurisdiction changes
  const loadHazardPreview = async () => {
    if (!setupData.industry) return;
    
    setPreviewLoading(true);
    setError(null);
    
    try {
      const preview = await window.api.previewClientHazards({
        industry: setupData.industry,
        jurisdiction: setupData.jurisdiction,
        isoAlignment: setupData.isoAlignment
      });
      
      setHazardPreview(preview.hazards || []);
      setControlPreview(preview.controls || []);
      
      // Initialize customizations with preview data
      setSetupData(prev => ({
        ...prev,
        hazardCustomizations: preview.hazards.map((h: any) => ({
          hazardId: h.id,
          code: h.code,
          name: h.name,
          category: h.category,
          originalRisk: h.preControlRisk,
          customRisk: h.preControlRisk, // Start with original
          isActive: true,
          notes: ''
        }))
      }));
    } catch (err: any) {
      console.error('Failed to load preview:', err);
      setError('Failed to load hazard preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 'info') {
      setCurrentStep('industry');
    } else if (currentStep === 'industry') {
      loadHazardPreview(); // Load preview before showing
      setCurrentStep('hazards');
    } else if (currentStep === 'hazards') {
      setCurrentStep('customize');
    } else if (currentStep === 'customize') {
      setCurrentStep('review');
    } else if (currentStep === 'review') {
      handleSetupClient();
    }
  };

  const handleBack = () => {
    if (currentStep === 'industry') setCurrentStep('info');
    else if (currentStep === 'hazards') setCurrentStep('industry');
    else if (currentStep === 'customize') setCurrentStep('hazards');
    else if (currentStep === 'review') setCurrentStep('customize');
  };

  const handleSetupClient = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create the client and import the full risk universe
      const result = await window.api.setupClientWithRiskUniverse({
        name: setupData.name.trim(),
        industry: setupData.industry,
        jurisdiction: setupData.jurisdiction,
        isoAlignment: setupData.isoAlignment,
        hazardCustomizations: setupData.hazardCustomizations
      });

      if (!result?.client?.id) {
        throw new Error('Failed to create client');
      }

      setSetupResults(result);
      setCurrentStep('complete');
    } catch (err: any) {
      console.error('Setup failed:', err);
      setError(err?.message || 'Failed to setup client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateCustomization = (hazardId: string, updates: Partial<SetupData['hazardCustomizations'][0]>) => {
    setSetupData(prev => ({
      ...prev,
      hazardCustomizations: prev.hazardCustomizations.map(h =>
        h.hazardId === hazardId ? { ...h, ...updates } : h
      )
    }));
  };

  // ============================================
  // STEP RENDERERS
  // ============================================

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const StepIcon = step.icon;
        return (
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
                  <StepIcon size={20} />
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
        );
      })}
    </div>
  );

  const renderInfoStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Client</h3>
        <p className="text-sm text-gray-600">
          Enter the client's business name to begin setup. We'll guide you through selecting
          their industry, jurisdiction, and safety framework requirements.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Client Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={setupData.name}
          onChange={(e) => setSetupData({ ...setupData, name: e.target.value })}
          placeholder="e.g., ABC Electrical Contractors Pty Ltd"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoFocus
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">What happens next?</p>
            <p>
              After entering the client name, you'll select their industry and jurisdiction.
              We'll then automatically generate a customized risk matrix with relevant hazards
              and controls, which you can review and adjust before finalizing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIndustryStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Industry & Jurisdiction</h3>
        <p className="text-sm text-gray-600">
          Select the client's primary industry and operating jurisdiction. This determines
          which hazards, controls, and legislative requirements apply.
        </p>
      </div>

      {/* Industry Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Primary Industry <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {INDUSTRIES.map((industry) => (
            <button
              key={industry}
              onClick={() => setSetupData({ ...setupData, industry })}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                setupData.industry === industry
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-sm">{industry}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Jurisdiction Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Jurisdiction (Optional)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {JURISDICTIONS.map((jurisdiction) => (
            <button
              key={jurisdiction}
              onClick={() => setSetupData({ ...setupData, jurisdiction })}
              className={`p-3 border-2 rounded-lg text-left transition-all ${
                setupData.jurisdiction === jurisdiction
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-sm">{jurisdiction}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ISO 45001 Alignment */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={setupData.isoAlignment}
            onChange={(e) => setSetupData({ ...setupData, isoAlignment: e.target.checked })}
            className="mt-1"
          />
          <div>
            <div className="font-medium text-sm">ISO 45001:2018 Alignment</div>
            <div className="text-xs text-gray-600 mt-1">
              Include controls and documentation aligned with ISO 45001 occupational health and safety
              management systems standard. Adds 5-8 additional controls focused on policy, competence,
              and audit requirements.
            </div>
          </div>
        </label>
      </div>
    </div>
  );

  const renderHazardsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview Hazard Packs</h3>
        <p className="text-sm text-gray-600">
          Based on your selections, here's what will be imported into this client's risk matrix.
          You can customize risk levels in the next step.
        </p>
      </div>

      {previewLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-4">Loading hazard preview...</p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-900">{hazardPreview.length}</div>
              <div className="text-sm text-blue-700">Hazards</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-900">{controlPreview.length}</div>
              <div className="text-sm text-green-700">Controls</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-900">
                {new Set(hazardPreview.map(h => h.category)).size}
              </div>
              <div className="text-sm text-purple-700">Categories</div>
            </div>
          </div>

          {/* Hazard List Preview */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Hazards to Import</h4>
            <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
              {hazardPreview.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <AlertCircle className="mx-auto mb-2" size={32} />
                  <p>No hazards available for this combination</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {hazardPreview.map((hazard: any) => {
                    const riskInfo = getRiskLabel(hazard.preControlRisk);
                    return (
                      <div key={hazard.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-xs text-gray-500">{hazard.code}</span>
                              <span className="font-medium text-sm">{hazard.name}</span>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">{hazard.category}</div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${riskInfo.color}`}>
                            {riskInfo.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-green-900">
                <p className="font-medium mb-1">What will be created?</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>{hazardPreview.length} client-specific hazards (customizable)</li>
                  <li>{controlPreview.length} client-specific controls (customizable)</li>
                  <li>Hazard-to-control mappings based on best practices</li>
                  <li>Industry and legislative compliance requirements</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderCustomizeStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Customize Risk Levels</h3>
        <p className="text-sm text-gray-600">
          Adjust risk levels based on this client's specific circumstances, existing controls,
          or operating environment. You can also disable hazards that don't apply.
        </p>
      </div>

      {/* Customization Controls */}
      <div className="border border-gray-200 rounded-lg max-h-[500px] overflow-y-auto">
        {setupData.hazardCustomizations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No hazards to customize</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {setupData.hazardCustomizations.map((hazard) => {
              const originalRisk = getRiskLabel(hazard.originalRisk);
              const customRisk = getRiskLabel(hazard.customRisk || hazard.originalRisk);
              
              return (
                <div key={hazard.hazardId} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={hazard.isActive}
                          onChange={(e) => updateCustomization(hazard.hazardId, { isActive: e.target.checked })}
                          className="rounded"
                        />
                        <span className="font-mono text-xs text-gray-500">{hazard.code}</span>
                        <span className="font-medium text-sm">{hazard.name}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1 ml-6">{hazard.category}</div>
                    </div>
                  </div>

                  {hazard.isActive && (
                    <div className="ml-6 space-y-3">
                      {/* Risk Level Selector */}
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-600 w-24">Risk Level:</span>
                        <div className="flex space-x-2">
                          {RISK_LEVELS.map((level) => (
                            <button
                              key={level.value}
                              onClick={() => updateCustomization(hazard.hazardId, { customRisk: level.value })}
                              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                                (hazard.customRisk || hazard.originalRisk) === level.value
                                  ? level.color
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {level.label}
                            </button>
                          ))}
                        </div>
                        {hazard.customRisk !== hazard.originalRisk && (
                          <span className="text-xs text-blue-600">
                            (changed from {originalRisk.label})
                          </span>
                        )}
                      </div>

                      {/* Notes */}
                      <div className="flex items-start space-x-4">
                        <span className="text-xs text-gray-600 w-24 pt-2">Notes:</span>
                        <input
                          type="text"
                          value={hazard.notes || ''}
                          onChange={(e) => updateCustomization(hazard.hazardId, { notes: e.target.value })}
                          placeholder="Optional: Explain why risk was adjusted..."
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-yellow-900">
            <p className="font-medium mb-1">Tip: Risk Customization</p>
            <p className="text-xs">
              You can always adjust these settings later from the Client Risk Matrix page.
              For now, focus on major changes like disabling inapplicable hazards or adjusting
              obviously incorrect risk levels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => {
    const activeHazards = setupData.hazardCustomizations.filter(h => h.isActive);
    const customizedHazards = setupData.hazardCustomizations.filter(h => h.customRisk !== h.originalRisk);

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Setup</h3>
          <p className="text-sm text-gray-600">
            Please review all settings before creating the client. This will create the client
            profile and import their complete risk universe.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <span className="text-xs text-gray-600">Client Name</span>
            <p className="font-semibold text-lg mt-1">{setupData.name}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <span className="text-xs text-gray-600">Industry</span>
            <p className="font-medium mt-1">{setupData.industry || 'Not specified'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <span className="text-xs text-gray-600">Jurisdiction</span>
            <p className="font-medium mt-1">{setupData.jurisdiction || 'Not specified'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <span className="text-xs text-gray-600">ISO 45001</span>
            <p className="font-medium mt-1">{setupData.isoAlignment ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* Import Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-sm text-blue-900 mb-3">What will be imported:</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-900">{activeHazards.length}</div>
              <div className="text-xs text-blue-700">Active Hazards</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-900">{controlPreview.length}</div>
              <div className="text-xs text-blue-700">Controls</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-900">{customizedHazards.length}</div>
              <div className="text-xs text-blue-700">Customized Risks</div>
            </div>
          </div>
        </div>

        {/* Warnings */}
        {activeHazards.length === 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-red-900">
                <p className="font-medium">Warning: No active hazards</p>
                <p className="text-xs mt-1">
                  You've disabled all hazards. The client won't have any risk matrix entries.
                  Consider enabling at least some relevant hazards.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-green-900">
              <p className="font-medium mb-1">Ready to create</p>
              <p className="text-xs">
                This will create the client profile and import all active hazards and controls
                into client-specific tables. You can customize everything further after setup.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <h4 className="font-semibold text-sm text-gray-700">Import Summary</h4>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-3xl font-bold text-blue-600">
                {setupResults.stats?.hazardsImported || 0}
              </div>
              <div className="text-xs text-gray-600 mt-1">Hazards Imported</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-3xl font-bold text-green-600">
                {setupResults.stats?.controlsImported || 0}
              </div>
              <div className="text-xs text-gray-600 mt-1">Controls Imported</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-3xl font-bold text-purple-600">
                {setupResults.stats?.mappingsCreated || 0}
              </div>
              <div className="text-xs text-gray-600 mt-1">Hazard-Control Mappings</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center space-x-3 pt-4">
        <button
          onClick={onComplete}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          View Client
        </button>
        <button
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  );

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Client Setup Wizard</h2>
            <p className="text-sm text-gray-600 mt-1">
              {isComplete ? 'Setup complete' : `Step ${currentStepIndex + 1} of ${steps.length}`}
            </p>
          </div>
          {!loading && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Progress Indicator */}
        {!isComplete && (
          <div className="px-6 pt-6">
            {renderStepIndicator()}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-red-900">{error}</div>
              </div>
            </div>
          )}

          {currentStep === 'info' && renderInfoStep()}
          {currentStep === 'industry' && renderIndustryStep()}
          {currentStep === 'hazards' && renderHazardsStep()}
          {currentStep === 'customize' && renderCustomizeStep()}
          {currentStep === 'review' && renderReviewStep()}
          {currentStep === 'complete' && renderCompleteStep()}
        </div>

        {/* Footer with navigation */}
        {!isComplete && (
          <div className="flex items-center justify-between p-6 border-t bg-gray-50">
            <button
              onClick={handleBack}
              disabled={currentStep === 'info' || loading}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed || loading}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <span>{loading ? 'Processing...' : isLastStep ? 'Create Client' : 'Next'}</span>
              {!loading && <ChevronRight size={16} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}