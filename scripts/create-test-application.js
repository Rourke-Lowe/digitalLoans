const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestApplication() {
  try {
    // Create a test member user
    const testUser = await prisma.user.upsert({
      where: { email: 'testmember@example.com' },
      update: {},
      create: {
        email: 'testmember@example.com',
        name: 'Test Member',
        role: 'member',
      },
    });
    
    console.log('✅ Test user created:', testUser.email);
    
    // Get a product
    const product = await prisma.loanProduct.findFirst({
      where: { isActive: true },
    });
    
    if (!product) {
      throw new Error('No active products found');
    }
    
    // Create a test application
    const application = await prisma.loanApplication.create({
      data: {
        applicationNumber: `APP-${Date.now()}`,
        userId: testUser.id,
        productId: product.id,
        amount: 10000,
        term: 36,
        purpose: 'Test application',
        status: 'draft',
        currentStep: 2,
        firstName: 'Test',
        lastName: 'User',
        email: 'testmember@example.com',
      },
    });
    
    console.log('✅ Test application created:', application.applicationNumber);
    console.log('   Product:', product.name);
    console.log('   Application ID:', application.id);
    console.log('\n📝 Use this URL to test the application form:');
    console.log(`   http://localhost:3000/member/apply/${application.id}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestApplication();