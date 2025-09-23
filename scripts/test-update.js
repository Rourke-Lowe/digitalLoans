const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testUpdate() {
  try {
    // Find the existing member's application
    const user = await prisma.user.findUnique({
      where: { email: 'existing.member@email.com' }
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    const applications = await prisma.loanApplication.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 1
    });
    
    if (applications.length === 0) {
      console.log('No applications found');
      return;
    }
    
    const app = applications[0];
    console.log('Testing update for application:', app.id);
    
    // Try to update with universaData
    const updated = await prisma.loanApplication.update({
      where: { id: app.id },
      data: {
        firstName: 'Robert',
        lastName: 'Johnson',
        universaData: JSON.stringify({ test: 'data' }),
        changedFields: JSON.stringify(['firstName', 'lastName'])
      }
    });
    
    console.log('Update successful!');
    console.log('universaData:', updated.universaData);
    console.log('changedFields:', updated.changedFields);
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.message.includes('Unknown argument')) {
      console.error('\nPrisma Client does not recognize the new fields!');
      console.error('This suggests the Prisma Client needs to be regenerated.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testUpdate();