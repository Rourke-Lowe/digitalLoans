const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSettings() {
  try {
    // Fetch settings
    const settings = await prisma.creditUnionSettings.findFirst();
    console.log('Settings found:', settings ? 'Yes' : 'No');
    
    if (settings) {
      console.log('Settings Name:', settings.name);
      console.log('Address Labels:', settings.addressFieldLabels);
      console.log('Required Documents:', settings.requiredDocuments);
      console.log('Required Consents:', settings.requiredConsents);
    }
    
    // Fetch products with configurations
    const products = await prisma.loanProduct.findMany({
      include: {
        configuration: true,
      },
    });
    
    console.log('\nProducts found:', products.length);
    products.forEach(product => {
      console.log(`- ${product.name}: ${product.configuration ? 'Has configuration' : 'No configuration'}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSettings();