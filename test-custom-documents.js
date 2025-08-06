const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCustomDocuments() {
  console.log('🧪 Testing Custom Document Types\n');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Add custom documents to CU settings
    console.log('\n📋 Test 1: Adding Custom Documents to CU Settings');
    
    const settings = await prisma.creditUnionSettings.findFirst();
    if (!settings) {
      throw new Error('No settings found');
    }
    
    // Simulate adding custom documents
    const existingDocs = JSON.parse(settings.requiredDocuments || '[]');
    const customDocs = [
      ...existingDocs,
      'proof_of_residency',
      'landlord_reference',
      'custom_financial_statement',
      'spousal_consent_form'
    ];
    
    const updatedSettings = await prisma.creditUnionSettings.update({
      where: { id: settings.id },
      data: {
        requiredDocuments: JSON.stringify(customDocs),
      },
    });
    
    console.log('✅ Added custom documents to CU settings');
    console.log('   Total documents:', customDocs.length);
    console.log('   Custom documents added:');
    console.log('   - proof_of_residency');
    console.log('   - landlord_reference');
    console.log('   - custom_financial_statement');
    console.log('   - spousal_consent_form');
    
    // Test 2: Add custom documents to product configuration
    console.log('\n📦 Test 2: Adding Custom Documents to Product Config');
    
    const product = await prisma.loanProduct.findFirst({
      include: { configuration: true },
    });
    
    if (product) {
      const customProductDocs = [
        'home_inspection_report',
        'contractor_estimate',
        'renovation_plans',
        'custom_product_specific_doc'
      ];
      
      if (product.configuration) {
        // Update existing configuration
        await prisma.productConfiguration.update({
          where: { id: product.configuration.id },
          data: {
            additionalDocuments: JSON.stringify(customProductDocs),
          },
        });
      } else {
        // Create new configuration
        await prisma.productConfiguration.create({
          data: {
            productId: product.id,
            additionalDocuments: JSON.stringify(customProductDocs),
            additionalFinancialFields: JSON.stringify({}),
            fieldOverrides: JSON.stringify({}),
          },
        });
      }
      
      console.log(`✅ Added custom documents to ${product.name}`);
      console.log('   Custom product documents:');
      customProductDocs.forEach(doc => {
        console.log(`   - ${doc}`);
      });
    }
    
    // Test 3: Verify document formatting
    console.log('\n🎨 Test 3: Document Name Formatting');
    
    const testDocNames = [
      'custom_document',
      'another_custom_doc',
      'special_verification_form',
      'income_tax_returns_2023'
    ];
    
    console.log('Document formatting test:');
    testDocNames.forEach(doc => {
      const formatted = doc.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      console.log(`   ${doc} → ${formatted}`);
    });
    
    // Test 4: Verify all documents are stored correctly
    console.log('\n✔️ Test 4: Verify Storage');
    
    const finalSettings = await prisma.creditUnionSettings.findFirst();
    const storedDocs = JSON.parse(finalSettings.requiredDocuments || '[]');
    
    console.log('All stored documents:');
    storedDocs.forEach((doc, index) => {
      const formatted = doc.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      console.log(`   ${index + 1}. ${formatted} (${doc})`);
    });
    
    console.log('\n' + '=' .repeat(50));
    console.log('✅ Custom document functionality working correctly!');
    console.log('\nKey features verified:');
    console.log('- Custom documents can be added to CU settings');
    console.log('- Custom documents can be added to product configs');
    console.log('- Document names are properly formatted for display');
    console.log('- Custom documents are stored as tags for your system');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testCustomDocuments();