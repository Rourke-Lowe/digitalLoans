import { prisma } from '@/lib/prisma';

export default async function TestCustomDocsPage() {
  const settings = await prisma.creditUnionSettings.findFirst();
  const products = await prisma.loanProduct.findMany({
    include: {
      configuration: true,
    },
  });

  const requiredDocs = settings?.requiredDocuments ? JSON.parse(settings.requiredDocuments) : [];
  
  // Categorize documents
  const predefinedDocs = ['id_front', 'id_back', 'pay_stub', 'bank_statement', 'employment_letter', 'tax_return', 'property_appraisal', 'insurance_proof', 'utility_bill'];
  const customDocs = requiredDocs.filter((doc: string) => !predefinedDocs.includes(doc));
  const standardDocs = requiredDocs.filter((doc: string) => predefinedDocs.includes(doc));
  
  const formatDocLabel = (doc: string) => {
    return doc.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Custom Document Types Test</h1>
        <p className="text-gray-600 mb-8">Demonstrating the ability to add custom document types dynamically</p>
        
        {/* Current Required Documents */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Required Documents</h2>
          
          {/* Standard Documents */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">Standard Documents</h3>
            <div className="grid grid-cols-3 gap-3">
              {standardDocs.map((doc: string) => (
                <div key={doc} className="flex items-center p-3 bg-blue-50 rounded">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-900">
                    {formatDocLabel(doc)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Custom Documents */}
          {customDocs.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-3">Custom Documents (Added by CU)</h3>
              <div className="grid grid-cols-3 gap-3">
                {customDocs.map((doc: string) => (
                  <div key={doc} className="flex items-center p-3 bg-green-50 border-2 border-green-200 rounded">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-sm font-medium text-green-900">
                      {formatDocLabel(doc)}
                    </span>
                    <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded">Custom</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* How Custom Documents Work */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">How Custom Documents Work</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-indigo-600 font-semibold">1</span>
              </div>
              <div>
                <h3 className="font-semibold">Select or Create</h3>
                <p className="text-sm text-gray-600">
                  Choose from predefined document types or select "+ Create Custom Document Type..." to add your own
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-indigo-600 font-semibold">2</span>
              </div>
              <div>
                <h3 className="font-semibold">Enter Custom Name</h3>
                <p className="text-sm text-gray-600">
                  Type any document name you need (e.g., "Landlord Reference", "Spousal Consent Form")
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-indigo-600 font-semibold">3</span>
              </div>
              <div>
                <h3 className="font-semibold">Automatic Tagging</h3>
                <p className="text-sm text-gray-600">
                  The document name becomes a tag in your storage system (e.g., "landlord_reference")
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-indigo-600 font-semibold">4</span>
              </div>
              <div>
                <h3 className="font-semibold">Dynamic Display</h3>
                <p className="text-sm text-gray-600">
                  Custom documents appear alongside standard ones in application forms
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Product-Specific Custom Documents */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Product-Specific Custom Documents</h2>
          <div className="space-y-4">
            {products.map((product) => {
              const additionalDocs = product.configuration?.additionalDocuments 
                ? JSON.parse(product.configuration.additionalDocuments) 
                : [];
              
              return (
                <div key={product.id} className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-semibold">{product.name}</h3>
                  {additionalDocs.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {additionalDocs.map((doc: string) => {
                        const isCustom = !['property_appraisal', 'insurance_proof', 'mortgage_statement', 'lease_agreement', 'co_applicant_id', 'co_applicant_income', 'business_registration', 'business_financials', 'vehicle_registration', 'vehicle_insurance'].includes(doc);
                        return (
                          <span
                            key={doc}
                            className={`px-3 py-1 text-xs rounded-full ${
                              isCustom 
                                ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {formatDocLabel(doc)}
                            {isCustom && <span className="ml-1 font-bold">*</span>}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">No additional documents</p>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-4">
            * Indicates custom document type created by the Credit Union
          </p>
        </div>
      </div>
    </div>
  );
}