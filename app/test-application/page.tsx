import { prisma } from '@/lib/prisma';

export default async function TestApplicationPage() {
  const settings = await prisma.creditUnionSettings.findFirst();
  const products = await prisma.loanProduct.findMany({
    include: {
      configuration: true,
    },
  });
  
  // Parse settings
  const addressLabels = settings?.addressFieldLabels ? JSON.parse(settings.addressFieldLabels) : {};
  const requiredDocuments = settings?.requiredDocuments ? JSON.parse(settings.requiredDocuments) : [];
  const requiredConsents = settings?.requiredConsents ? JSON.parse(settings.requiredConsents) : {};
  const requiredFinancialInfo = settings?.requiredFinancialInfo ? JSON.parse(settings.requiredFinancialInfo) : {};

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Application Form Settings Test</h1>
        
        {/* Address Field Labels */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Address Field Labels (Dynamic)</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(addressLabels).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {value as string}
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder={`Enter ${value}`}
                  disabled
                />
              </div>
            ))}
          </div>
        </div>

        {/* Required Documents */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Required Documents</h2>
          <div className="space-y-2">
            {requiredDocuments.map((doc: string) => (
              <div key={doc} className="flex items-center p-3 bg-gray-50 rounded">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">
                  {doc.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Required Consents */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Required Consents</h2>
          <div className="space-y-3">
            {Object.entries(requiredConsents).map(([key, required]) => 
              required ? (
                <div key={key} className="flex items-start">
                  <input
                    type="checkbox"
                    className="mt-1 mr-3"
                    disabled
                  />
                  <label className="text-sm text-gray-700">
                    <span className="font-medium">
                      {key === 'creditCheck' && 'Credit Bureau Authorization'}
                      {key === 'fintrac' && 'FINTRAC Identity Verification'}
                      {key === 'privacy' && 'Privacy Policy'}
                      {key === 'terms' && 'Terms of Service'}
                      {key === 'esignature' && 'Electronic Signature Consent'}
                    </span>
                    {(key === 'terms' || key === 'esignature') && <span className="text-red-500 ml-1">*</span>}
                  </label>
                </div>
              ) : null
            )}
          </div>
        </div>

        {/* Required Financial Information */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Required Financial Information</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(requiredFinancialInfo).map(([key, required]) => (
              <div key={key} className="flex items-center">
                <span className={`inline-block w-3 h-3 rounded-full mr-3 ${required ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span className="text-sm">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
                <span className="ml-auto text-xs text-gray-500">
                  {required ? 'Required' : 'Optional'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Product-Specific Configurations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Product-Specific Configurations</h2>
          <div className="space-y-6">
            {products.map((product) => (
              <div key={product.id} className="border-l-4 border-indigo-500 pl-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                
                {product.configuration ? (
                  <div className="space-y-3">
                    {product.configuration.additionalDocuments && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Additional Documents:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {JSON.parse(product.configuration.additionalDocuments).map((doc: string) => (
                            <span key={doc} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              {doc.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {product.configuration.additionalFinancialFields && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Additional Financial Fields:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {Object.entries(JSON.parse(product.configuration.additionalFinancialFields))
                            .filter(([_, required]) => required)
                            .map(([field]) => (
                              <span key={field} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                {field.replace(/([A-Z])/g, ' $1')}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    {product.configuration.fieldOverrides && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Field Overrides:</p>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          {Object.entries(JSON.parse(product.configuration.fieldOverrides))
                            .filter(([_, value]) => value)
                            .map(([key, value]) => (
                              <div key={key} className="text-xs">
                                <span className="font-medium">{key.replace(/([A-Z])/g, ' $1')}:</span> {String(value)}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No additional configuration</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}