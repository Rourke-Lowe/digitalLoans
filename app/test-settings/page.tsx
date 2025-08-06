import { prisma } from '@/lib/prisma';

export default async function TestSettingsPage() {
  const settings = await prisma.creditUnionSettings.findFirst();
  const products = await prisma.loanProduct.findMany({
    include: {
      configuration: true,
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Credit Union Settings</h2>
          {settings ? (
            <div className="space-y-2">
              <p><strong>Name:</strong> {settings.name}</p>
              <p><strong>Primary Color:</strong> {settings.primaryColor}</p>
              <p><strong>Accent Color:</strong> {settings.accentColor}</p>
              <p><strong>Require SIN:</strong> {settings.requireSin ? 'Yes' : 'No'}</p>
              <p><strong>Require Employment:</strong> {settings.requireEmployment ? 'Yes' : 'No'}</p>
              
              {settings.addressFieldLabels && (
                <div>
                  <strong>Address Labels:</strong>
                  <pre className="bg-gray-100 p-2 rounded mt-1 text-sm">
                    {JSON.stringify(JSON.parse(settings.addressFieldLabels), null, 2)}
                  </pre>
                </div>
              )}
              
              {settings.requiredDocuments && (
                <div>
                  <strong>Required Documents:</strong>
                  <pre className="bg-gray-100 p-2 rounded mt-1 text-sm">
                    {JSON.stringify(JSON.parse(settings.requiredDocuments), null, 2)}
                  </pre>
                </div>
              )}
              
              {settings.requiredConsents && (
                <div>
                  <strong>Required Consents:</strong>
                  <pre className="bg-gray-100 p-2 rounded mt-1 text-sm">
                    {JSON.stringify(JSON.parse(settings.requiredConsents), null, 2)}
                  </pre>
                </div>
              )}
              
              {settings.termsOfService && (
                <div>
                  <strong>Terms of Service:</strong>
                  <p className="bg-gray-100 p-2 rounded mt-1 text-sm">
                    {settings.termsOfService}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No settings found</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Loan Products</h2>
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.description}</p>
                <p className="text-sm">
                  <strong>Range:</strong> ${product.minAmount.toLocaleString()} - ${product.maxAmount.toLocaleString()}
                </p>
                <p className="text-sm">
                  <strong>Term:</strong> {product.minTerm} - {product.maxTerm} months
                </p>
                <p className="text-sm">
                  <strong>Interest Rate:</strong> {product.interestRate}%
                </p>
                
                {product.configuration && (
                  <div className="mt-2 bg-gray-50 p-2 rounded">
                    <p className="text-sm font-semibold">Product Configuration:</p>
                    {product.configuration.additionalDocuments && (
                      <div className="text-xs">
                        <strong>Additional Docs:</strong>
                        <pre className="bg-white p-1 rounded mt-1">
                          {JSON.stringify(JSON.parse(product.configuration.additionalDocuments), null, 2)}
                        </pre>
                      </div>
                    )}
                    {product.configuration.fieldOverrides && (
                      <div className="text-xs mt-2">
                        <strong>Field Overrides:</strong>
                        <pre className="bg-white p-1 rounded mt-1">
                          {JSON.stringify(JSON.parse(product.configuration.fieldOverrides), null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}