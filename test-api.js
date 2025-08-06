const fetch = require('node-fetch');

async function testSettingsAPI() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('Testing Settings API...\n');
  
  // Test updating general settings
  try {
    const response = await fetch(`${baseUrl}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'general',
        name: 'Test Credit Union',
        primaryColor: '#10b981',
        accentColor: '#34d399',
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ General settings updated successfully');
      console.log('   Name:', data.name);
      console.log('   Primary Color:', data.primaryColor);
    } else {
      console.log('❌ Failed to update general settings:', response.status);
    }
  } catch (error) {
    console.log('❌ Error updating general settings:', error.message);
  }
  
  // Test updating flow settings
  try {
    const response = await fetch(`${baseUrl}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'flow',
        requireSin: true,
        requireEmployment: false,
        addressFieldLabels: JSON.stringify({
          streetNumber: 'House Number',
          streetName: 'Street',
          unit: 'Suite',
          city: 'Town/City',
          province: 'State/Province',
          postalCode: 'ZIP/Postal Code',
        }),
        requiredDocuments: JSON.stringify(['id_front', 'id_back', 'pay_stub', 'bank_statement']),
        requiredFinancialInfo: JSON.stringify({
          bankAccountBalance: true,
          investmentValue: true,
          propertyValue: false,
          vehicleValue: false,
          creditCardBalances: true,
          creditCardLimits: false,
        }),
        requiredConsents: JSON.stringify({
          creditCheck: true,
          fintrac: false,
          privacy: true,
          terms: true,
          esignature: true,
        }),
        termsOfService: 'Updated terms of service text for testing.',
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ Flow settings updated successfully');
      console.log('   Require Employment:', data.requireEmployment);
      console.log('   Address Labels:', data.addressFieldLabels ? 'Set' : 'Not set');
      console.log('   Required Documents:', data.requiredDocuments ? 'Set' : 'Not set');
    } else {
      console.log('\n❌ Failed to update flow settings:', response.status);
    }
  } catch (error) {
    console.log('\n❌ Error updating flow settings:', error.message);
  }
  
  // Test product configuration
  console.log('\n\nTesting Product Configuration API...\n');
  
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  try {
    const products = await prisma.loanProduct.findMany();
    
    if (products.length > 0) {
      const product = products[0];
      
      const response = await fetch(`${baseUrl}/api/products/${product.id}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          additionalDocuments: JSON.stringify(['test_document_1', 'test_document_2']),
          additionalFinancialFields: JSON.stringify({
            testField1: true,
            testField2: false,
          }),
          fieldOverrides: JSON.stringify({
            minIncome: 30000,
            maxDebtRatio: 0.5,
          }),
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Product configuration updated for ${product.name}`);
        console.log('   Additional Documents:', data.additionalDocuments ? 'Set' : 'Not set');
        console.log('   Field Overrides:', data.fieldOverrides ? 'Set' : 'Not set');
      } else {
        console.log(`❌ Failed to update product configuration:`, response.status);
      }
    }
  } catch (error) {
    console.log('❌ Error testing product configuration:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSettingsAPI().catch(console.error);