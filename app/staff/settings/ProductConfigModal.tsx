'use client';

import { useState, useEffect } from 'react';
import { LoanProduct, ProductConfiguration } from '@prisma/client';

interface ProductConfigModalProps {
  product: LoanProduct & { configuration?: ProductConfiguration | null };
  isOpen: boolean;
  onClose: () => void;
  onSave: (productId: string, config: any) => Promise<void>;
}

export default function ProductConfigModal({ product, isOpen, onClose, onSave }: ProductConfigModalProps) {
  const [loading, setLoading] = useState(false);
  const [newDocumentType, setNewDocumentType] = useState('');
  const [customDocumentName, setCustomDocumentName] = useState('');
  const [isCustomDocument, setIsCustomDocument] = useState(false);
  
  // Parse existing configuration or use defaults
  const parseJsonSafe = (str: string | null | undefined, defaultValue: any) => {
    if (!str) return defaultValue;
    try {
      return JSON.parse(str);
    } catch {
      return defaultValue;
    }
  };

  const [additionalDocuments, setAdditionalDocuments] = useState<string[]>(
    parseJsonSafe(product.configuration?.additionalDocuments, [])
  );
  
  const [additionalFinancialFields, setAdditionalFinancialFields] = useState(
    parseJsonSafe(product.configuration?.additionalFinancialFields, {
      propertyTaxes: false,
      homeInsurance: false,
      coApplicantIncome: false,
      rentalIncome: false,
      otherLoans: false,
    })
  );
  
  const [fieldOverrides, setFieldOverrides] = useState(
    parseJsonSafe(product.configuration?.fieldOverrides, {
      minIncome: '',
      maxDebtRatio: '',
      minCreditScore: '',
      requiredDownPayment: '',
    })
  );

  const documentTypeOptions = [
    { value: 'property_appraisal', label: 'Property Appraisal' },
    { value: 'insurance_proof', label: 'Insurance Proof' },
    { value: 'mortgage_statement', label: 'Mortgage Statement' },
    { value: 'lease_agreement', label: 'Lease Agreement' },
    { value: 'co_applicant_id', label: 'Co-Applicant ID' },
    { value: 'co_applicant_income', label: 'Co-Applicant Income Proof' },
    { value: 'business_registration', label: 'Business Registration' },
    { value: 'business_financials', label: 'Business Financial Statements' },
    { value: 'vehicle_registration', label: 'Vehicle Registration' },
    { value: 'vehicle_insurance', label: 'Vehicle Insurance' },
    { value: 'custom', label: '+ Create Custom Document Type...' },
  ];

  const addDocument = () => {
    if (isCustomDocument && customDocumentName) {
      // Add custom document
      const customDoc = customDocumentName.toLowerCase().replace(/\s+/g, '_');
      if (!additionalDocuments.includes(customDoc)) {
        setAdditionalDocuments([...additionalDocuments, customDoc]);
        setCustomDocumentName('');
        setIsCustomDocument(false);
      }
    } else if (newDocumentType && !additionalDocuments.includes(newDocumentType)) {
      // Add predefined document
      setAdditionalDocuments([...additionalDocuments, newDocumentType]);
      setNewDocumentType('');
    }
  };

  const handleDocumentSelectChange = (value: string) => {
    if (value === 'custom') {
      setIsCustomDocument(true);
      setNewDocumentType('');
    } else {
      setIsCustomDocument(false);
      setNewDocumentType(value);
      setCustomDocumentName('');
    }
  };

  const formatDocumentLabel = (doc: string) => {
    // Check if it's a predefined document
    const predefined = documentTypeOptions.find(opt => opt.value === doc);
    if (predefined && predefined.value !== 'custom') return predefined.label;
    // Format custom document name
    return doc.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const removeDocument = (doc: string) => {
    setAdditionalDocuments(additionalDocuments.filter(d => d !== doc));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const config = {
        additionalDocuments: JSON.stringify(additionalDocuments),
        additionalFinancialFields: JSON.stringify(additionalFinancialFields),
        fieldOverrides: JSON.stringify(fieldOverrides),
      };
      
      await onSave(product.id, config);
      onClose();
    } catch (error) {
      alert('Failed to save product configuration');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Configure: {product.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Additional Documents */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Additional Required Documents</h3>
            <p className="text-sm text-gray-600 mb-3">
              These documents will be required in addition to the base requirements when this product is selected.
            </p>
            <div className="space-y-4">
              <div className="flex gap-2">
                {!isCustomDocument ? (
                  <select
                    value={newDocumentType}
                    onChange={(e) => handleDocumentSelectChange(e.target.value)}
                    className="input flex-1"
                  >
                    <option value="">Select additional document type...</option>
                    {documentTypeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={customDocumentName}
                      onChange={(e) => setCustomDocumentName(e.target.value)}
                      placeholder="Enter custom document name..."
                      className="input flex-1"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        setIsCustomDocument(false);
                        setCustomDocumentName('');
                      }}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <button
                  onClick={addDocument}
                  className="btn-primary"
                  disabled={!isCustomDocument ? !newDocumentType : !customDocumentName.trim()}
                >
                  {isCustomDocument ? 'Add Custom' : 'Add Document'}
                </button>
              </div>
              <div className="space-y-2">
                {additionalDocuments.map(doc => (
                  <div key={doc} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded">
                    <span className="text-sm">
                      {formatDocumentLabel(doc)}
                    </span>
                    <button
                      onClick={() => removeDocument(doc)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {additionalDocuments.length === 0 && (
                  <p className="text-gray-500 text-sm italic">No additional documents required</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Financial Fields */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Additional Financial Information</h3>
            <p className="text-sm text-gray-600 mb-3">
              Select additional financial fields that should be required for this product.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(additionalFinancialFields).map(([key, value]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={value as boolean}
                    onChange={(e) => setAdditionalFinancialFields({ 
                      ...additionalFinancialFields, 
                      [key]: e.target.checked 
                    })}
                    className="mr-3"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Field Overrides */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Product-Specific Requirements</h3>
            <p className="text-sm text-gray-600 mb-3">
              Set specific requirements that override the default settings for this product.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Income Required
                </label>
                <input
                  type="number"
                  value={fieldOverrides.minIncome}
                  onChange={(e) => setFieldOverrides({ ...fieldOverrides, minIncome: e.target.value })}
                  className="input"
                  placeholder="e.g., 50000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Debt Ratio
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={fieldOverrides.maxDebtRatio}
                  onChange={(e) => setFieldOverrides({ ...fieldOverrides, maxDebtRatio: e.target.value })}
                  className="input"
                  placeholder="e.g., 0.4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Credit Score
                </label>
                <input
                  type="number"
                  value={fieldOverrides.minCreditScore}
                  onChange={(e) => setFieldOverrides({ ...fieldOverrides, minCreditScore: e.target.value })}
                  className="input"
                  placeholder="e.g., 650"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Down Payment (%)
                </label>
                <input
                  type="number"
                  value={fieldOverrides.requiredDownPayment}
                  onChange={(e) => setFieldOverrides({ ...fieldOverrides, requiredDownPayment: e.target.value })}
                  className="input"
                  placeholder="e.g., 20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}