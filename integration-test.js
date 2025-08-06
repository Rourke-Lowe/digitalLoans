const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runIntegrationTest() {
  console.log('🧪 Running Integration Tests for CU Settings\n');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Verify Credit Union Settings
    console.log('\n📋 Test 1: Credit Union Settings');
    const settings = await prisma.creditUnionSettings.findFirst();
    
    if (settings) {
      console.log('✅ Settings found');
      console.log('   - Name:', settings.name);
      console.log('   - Has address labels:', !!settings.addressFieldLabels);
      console.log('   - Has required documents:', !!settings.requiredDocuments);
      console.log('   - Has required consents:', !!settings.requiredConsents);
      console.log('   - Has terms of service:', !!settings.termsOfService);
      
      // Parse and validate JSON fields
      try {
        if (settings.addressFieldLabels) {
          const labels = JSON.parse(settings.addressFieldLabels);
          console.log('   - Address labels count:', Object.keys(labels).length);
        }
        if (settings.requiredDocuments) {
          const docs = JSON.parse(settings.requiredDocuments);
          console.log('   - Required documents count:', docs.length);
        }
        if (settings.requiredConsents) {
          const consents = JSON.parse(settings.requiredConsents);
          console.log('   - Required consents count:', Object.keys(consents).length);
        }
      } catch (e) {
        console.log('❌ Error parsing JSON fields:', e.message);
      }
    } else {
      console.log('❌ No settings found');
    }
    
    // Test 2: Verify Product Configurations
    console.log('\n📦 Test 2: Product Configurations');
    const products = await prisma.loanProduct.findMany({
      include: {
        configuration: true,
      },
    });
    
    console.log(`Found ${products.length} products`);
    
    for (const product of products) {
      console.log(`\n   ${product.name}:`);
      console.log(`   - Amount: $${product.minAmount} - $${product.maxAmount}`);
      console.log(`   - Term: ${product.minTerm} - ${product.maxTerm} months`);
      console.log(`   - Rate: ${product.interestRate}%`);
      
      if (product.configuration) {
        console.log('   ✅ Has configuration');
        
        try {
          if (product.configuration.additionalDocuments) {
            const docs = JSON.parse(product.configuration.additionalDocuments);
            console.log(`      - Additional documents: ${docs.length}`);
          }
          if (product.configuration.additionalFinancialFields) {
            const fields = JSON.parse(product.configuration.additionalFinancialFields);
            console.log(`      - Additional financial fields: ${Object.keys(fields).length}`);
          }
          if (product.configuration.fieldOverrides) {
            const overrides = JSON.parse(product.configuration.fieldOverrides);
            console.log(`      - Field overrides: ${Object.keys(overrides).length}`);
          }
        } catch (e) {
          console.log('   ❌ Error parsing configuration:', e.message);
        }
      } else {
        console.log('   ⚠️  No configuration');
      }
    }
    
    // Test 3: Update Settings
    console.log('\n🔄 Test 3: Update Settings');
    const updatedSettings = await prisma.creditUnionSettings.update({
      where: { id: settings.id },
      data: {
        name: 'Updated Credit Union',
        addressFieldLabels: JSON.stringify({
          streetNumber: 'Building Number',
          streetName: 'Road Name',
          unit: 'Apartment',
          city: 'Municipality',
          province: 'Region',
          postalCode: 'Postal Code',
        }),
      },
    });
    
    console.log('✅ Settings updated successfully');
    console.log('   - New name:', updatedSettings.name);
    
    // Test 4: Create/Update Product Configuration
    console.log('\n🔧 Test 4: Product Configuration Management');
    
    const testProduct = products[0];
    if (testProduct) {
      let config;
      
      if (testProduct.configuration) {
        // Update existing
        config = await prisma.productConfiguration.update({
          where: { id: testProduct.configuration.id },
          data: {
            additionalDocuments: JSON.stringify(['test_doc_1', 'test_doc_2']),
          },
        });
        console.log('✅ Updated configuration for', testProduct.name);
      } else {
        // Create new
        config = await prisma.productConfiguration.create({
          data: {
            productId: testProduct.id,
            additionalDocuments: JSON.stringify(['new_doc_1']),
            additionalFinancialFields: JSON.stringify({ newField: true }),
            fieldOverrides: JSON.stringify({ minIncome: 25000 }),
          },
        });
        console.log('✅ Created configuration for', testProduct.name);
      }
    }
    
    // Test 5: Verify Relationships
    console.log('\n🔗 Test 5: Verify Relationships');
    const productWithConfig = await prisma.loanProduct.findFirst({
      where: {
        configuration: {
          isNot: null,
        },
      },
      include: {
        configuration: true,
      },
    });
    
    if (productWithConfig) {
      console.log('✅ Found product with configuration:', productWithConfig.name);
      console.log('   - Config ID:', productWithConfig.configuration.id);
      console.log('   - Product ID match:', productWithConfig.configuration.productId === productWithConfig.id);
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('✅ All integration tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Integration test failed:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

runIntegrationTest();