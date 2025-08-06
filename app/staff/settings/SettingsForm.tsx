'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import { CreditUnionSettings, LoanProduct, ProductConfiguration } from '@prisma/client';
import ProductConfigModal from './ProductConfigModal';

interface SettingsFormProps {
  settings: CreditUnionSettings | null;
  products: (LoanProduct & { configuration?: ProductConfiguration | null })[];
}

export default function SettingsForm({ settings, products }: SettingsFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<(LoanProduct & { configuration?: ProductConfiguration | null }) | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  
  const [generalSettings, setGeneralSettings] = useState({
    name: settings?.name || '',
    primaryColor: settings?.primaryColor || '#2563eb',
    accentColor: settings?.accentColor || '#3b82f6',
  });

  const [flowSettings, setFlowSettings] = useState({
    requireSin: settings?.requireSin ?? true,
    requireEmployment: settings?.requireEmployment ?? true,
    maxUploadSize: settings?.maxUploadSize || 5242880,
    allowedFileTypes: settings?.allowedFileTypes || 'image/jpeg,image/png,application/pdf',
  });

  // Parse JSON fields with defaults
  const defaultAddressLabels = {
    streetNumber: 'Street Number',
    streetName: 'Street Name',
    unit: 'Unit/Apt',
    city: 'City',
    province: 'Province',
    postalCode: 'Postal Code',
  };

  const defaultDocuments = ['id_front', 'id_back', 'pay_stub'];
  
  const defaultFinancialInfo = {
    bankAccountBalance: true,
    investmentValue: false,
    propertyValue: false,
    vehicleValue: false,
    creditCardBalances: true,
    creditCardLimits: true,
  };

  const defaultConsents = {
    creditCheck: true,
    fintrac: true,
    privacy: true,
    terms: true,
    esignature: true,
  };

  const [addressLabels, setAddressLabels] = useState(
    settings?.addressFieldLabels ? JSON.parse(settings.addressFieldLabels) : defaultAddressLabels
  );
  
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>(
    settings?.requiredDocuments ? JSON.parse(settings.requiredDocuments) : defaultDocuments
  );
  
  const [requiredFinancialInfo, setRequiredFinancialInfo] = useState(
    settings?.requiredFinancialInfo ? JSON.parse(settings.requiredFinancialInfo) : defaultFinancialInfo
  );
  
  const [requiredConsents, setRequiredConsents] = useState(
    settings?.requiredConsents ? JSON.parse(settings.requiredConsents) : defaultConsents
  );
  
  const [termsOfService, setTermsOfService] = useState(
    settings?.termsOfService || 'Enter your terms of service here...'
  );

  const [newDocumentType, setNewDocumentType] = useState('');
  const [customDocumentName, setCustomDocumentName] = useState('');
  const [isCustomDocument, setIsCustomDocument] = useState(false);

  const [emailTemplates, setEmailTemplates] = useState({
    approvalTemplate: settings?.approvalTemplate || '',
    denialTemplate: settings?.denialTemplate || '',
    moreInfoTemplate: settings?.moreInfoTemplate || '',
  });

  const handleSaveGeneral = async () => {
    setLoading(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'general', ...generalSettings }),
      });
      alert('Settings saved successfully');
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFlow = async () => {
    setLoading(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'flow', 
          ...flowSettings,
          addressFieldLabels: JSON.stringify(addressLabels),
          requiredDocuments: JSON.stringify(requiredDocuments),
          requiredFinancialInfo: JSON.stringify(requiredFinancialInfo),
          requiredConsents: JSON.stringify(requiredConsents),
          termsOfService,
        }),
      });
      alert('Settings saved successfully');
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const addDocument = () => {
    if (isCustomDocument && customDocumentName) {
      // Add custom document
      const customDoc = customDocumentName.toLowerCase().replace(/\s+/g, '_');
      if (!requiredDocuments.includes(customDoc)) {
        setRequiredDocuments([...requiredDocuments, customDoc]);
        setCustomDocumentName('');
        setIsCustomDocument(false);
      }
    } else if (newDocumentType && !requiredDocuments.includes(newDocumentType)) {
      // Add predefined document
      setRequiredDocuments([...requiredDocuments, newDocumentType]);
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
    if (predefined) return predefined.label;
    // Format custom document name
    return doc.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const removeDocument = (doc: string) => {
    setRequiredDocuments(requiredDocuments.filter(d => d !== doc));
  };

  const documentTypeOptions = [
    { value: 'id_front', label: 'ID - Front' },
    { value: 'id_back', label: 'ID - Back' },
    { value: 'pay_stub', label: 'Pay Stub' },
    { value: 'bank_statement', label: 'Bank Statement' },
    { value: 'employment_letter', label: 'Employment Letter' },
    { value: 'tax_return', label: 'Tax Return' },
    { value: 'property_appraisal', label: 'Property Appraisal' },
    { value: 'insurance_proof', label: 'Insurance Proof' },
    { value: 'utility_bill', label: 'Utility Bill' },
    { value: 'custom', label: '+ Create Custom Document Type...' },
  ];

  const handleProductUpdate = async (productId: string, updates: Partial<LoanProduct>) => {
    setLoading(true);
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      router.refresh();
    } catch (error) {
      alert('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const handleProductConfigSave = async (productId: string, config: any) => {
    await fetch(`/api/products/${productId}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    router.refresh();
  };

  const openProductConfig = (product: LoanProduct & { configuration?: ProductConfiguration | null }) => {
    setSelectedProduct(product);
    setIsConfigModalOpen(true);
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'flow', label: 'Application Flow' },
    { id: 'products', label: 'Products' },
    { id: 'users', label: 'Users' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showSettings={false} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">General Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credit Union Name
                </label>
                <input
                  type="text"
                  value={generalSettings.name}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, name: e.target.value })}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={generalSettings.primaryColor}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, primaryColor: e.target.value })}
                      className="h-10 w-20"
                    />
                    <input
                      type="text"
                      value={generalSettings.primaryColor}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, primaryColor: e.target.value })}
                      className="input flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accent Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={generalSettings.accentColor}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, accentColor: e.target.value })}
                      className="h-10 w-20"
                    />
                    <input
                      type="text"
                      value={generalSettings.accentColor}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, accentColor: e.target.value })}
                      className="input flex-1"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveGeneral}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Saving...' : 'Save General Settings'}
              </button>
            </div>
          </div>
        )}

        {/* Application Flow Settings */}
        {activeTab === 'flow' && (
          <div className="space-y-6">
            {/* Basic Settings */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-6">Basic Flow Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={flowSettings.requireSin}
                      onChange={(e) => setFlowSettings({ ...flowSettings, requireSin: e.target.checked })}
                      className="mr-3"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Require Social Insurance Number
                    </span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={flowSettings.requireEmployment}
                      onChange={(e) => setFlowSettings({ ...flowSettings, requireEmployment: e.target.checked })}
                      className="mr-3"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Require Employment Information
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Upload Size (bytes)
                    </label>
                    <input
                      type="number"
                      value={flowSettings.maxUploadSize}
                      onChange={(e) => setFlowSettings({ ...flowSettings, maxUploadSize: parseInt(e.target.value) })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allowed File Types
                    </label>
                    <input
                      type="text"
                      value={flowSettings.allowedFileTypes}
                      onChange={(e) => setFlowSettings({ ...flowSettings, allowedFileTypes: e.target.value })}
                      className="input"
                      placeholder="image/jpeg,image/png,application/pdf"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address Field Labels */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Address Field Labels</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(addressLabels).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <input
                      type="text"
                      value={value as string}
                      onChange={(e) => setAddressLabels({ ...addressLabels, [key]: e.target.value })}
                      className="input"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Required Documents */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Required Documents</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  {!isCustomDocument ? (
                    <select
                      value={newDocumentType}
                      onChange={(e) => handleDocumentSelectChange(e.target.value)}
                      className="input flex-1"
                    >
                      <option value="">Select document type...</option>
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
                  {requiredDocuments.map(doc => (
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
                  {requiredDocuments.length === 0 && (
                    <p className="text-gray-500 text-sm italic">No documents required</p>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Requirements */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Required Financial Information</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(requiredFinancialInfo).map(([key, value]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={value as boolean}
                      onChange={(e) => setRequiredFinancialInfo({ ...requiredFinancialInfo, [key]: e.target.checked })}
                      className="mr-3"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Consents Configuration */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Required Consents</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(requiredConsents).map(([key, value]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={value as boolean}
                      onChange={(e) => setRequiredConsents({ ...requiredConsents, [key]: e.target.checked })}
                      className="mr-3"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {key === 'fintrac' ? 'FINTRAC' : 
                       key === 'esignature' ? 'E-Signature' :
                       key.charAt(0).toUpperCase() + key.slice(1)} Consent
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Terms of Service */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Terms of Service</h3>
              <textarea
                value={termsOfService}
                onChange={(e) => setTermsOfService(e.target.value)}
                className="input min-h-[200px] font-mono text-sm"
                placeholder="Enter your terms of service text here..."
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveFlow}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Saving...' : 'Save All Flow Settings'}
            </button>
          </div>
        )}

        {/* Products Settings */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Loan Products</h2>
              <button className="btn-primary">Add New Product</button>
            </div>

            {products.map((product) => (
              <div key={product.id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-4">{product.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Amount Range</p>
                        <p className="font-medium">
                          ${product.minAmount.toLocaleString()} - ${product.maxAmount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Term Range</p>
                        <p className="font-medium">
                          {product.minTerm} - {product.maxTerm} months
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Interest Rate</p>
                        <p className="font-medium">{product.interestRate}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status</p>
                        <p className="font-medium">
                          {product.isActive ? (
                            <span className="text-green-600">Active</span>
                          ) : (
                            <span className="text-red-600">Inactive</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleProductUpdate(product.id, { isActive: !product.isActive })}
                      className={`px-4 py-2 rounded-lg text-sm ${
                        product.isActive
                          ? 'bg-gray-200 hover:bg-gray-300'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {product.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      onClick={() => openProductConfig(product)}
                      className="text-primary-600 hover:text-primary-700 px-4 py-2"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Users Settings */}
        {activeTab === 'users' && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Users</h2>
              <button className="btn-primary">ADD NEW</button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Edit
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">23617653</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">John Smith</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">admin@creditunion.com</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">Admin</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="text-green-600">Active</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-primary-600 hover:text-primary-700">✏️ EDIT</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Permissions</h3>
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="text-left text-sm font-medium text-gray-700 pb-2">Role</th>
                    <th className="text-left text-sm font-medium text-gray-700 pb-2">Access</th>
                    <th className="text-left text-sm font-medium text-gray-700 pb-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="py-2">
                    <td className="py-3">Teller</td>
                    <td className="py-3">Request</td>
                    <td className="py-3">
                      <button className="text-primary-600 hover:text-primary-700">✏️ EDIT</button>
                    </td>
                  </tr>
                  <tr className="py-2">
                    <td className="py-3">Officer</td>
                    <td className="py-3">Approve, Request</td>
                    <td className="py-3">
                      <button className="text-primary-600 hover:text-primary-700">✏️ EDIT</button>
                    </td>
                  </tr>
                  <tr className="py-2">
                    <td className="py-3">Manager</td>
                    <td className="py-3">Approve, Request, Settings</td>
                    <td className="py-3">
                      <button className="text-primary-600 hover:text-primary-700">✏️ EDIT</button>
                    </td>
                  </tr>
                  <tr className="py-2">
                    <td className="py-3">Admin</td>
                    <td className="py-3">Approve, Request, Settings</td>
                    <td className="py-3">
                      <button className="text-primary-600 hover:text-primary-700">✏️ EDIT</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Product Configuration Modal */}
      {selectedProduct && (
        <ProductConfigModal
          product={selectedProduct}
          isOpen={isConfigModalOpen}
          onClose={() => {
            setIsConfigModalOpen(false);
            setSelectedProduct(null);
          }}
          onSave={handleProductConfigSave}
        />
      )}
    </div>
  );
}