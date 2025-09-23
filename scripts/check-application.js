const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkApplications() {
  try {
    // Find all applications for existing.member@email.com
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
    console.log('\n=== Latest Application for existing.member@email.com ===');
    console.log('Application ID:', app.id);
    console.log('Status:', app.status);
    console.log('Current Step:', app.currentStep);
    console.log('\n--- Personal Info ---');
    console.log('Name:', app.firstName, app.lastName);
    console.log('Email:', app.email);
    console.log('Phone:', app.phone);
    console.log('Date of Birth:', app.dateOfBirth);
    console.log('SIN:', app.sin);
    console.log('\n--- Address ---');
    console.log('Street:', app.streetNumber, app.streetName, app.unit);
    console.log('City:', app.city);
    console.log('Province:', app.province);
    console.log('Postal Code:', app.postalCode);
    console.log('\n--- Employment ---');
    console.log('Employer:', app.employerName);
    console.log('Employment Status:', app.employmentStatus);
    console.log('Annual Income:', app.annualIncome);
    console.log('\n--- Financial ---');
    console.log('Bank Balance:', app.bankAccountBalance);
    console.log('Investment Value:', app.investmentValue);
    console.log('Property Value:', app.propertyValue);
    console.log('Vehicle Value:', app.vehicleValue);
    console.log('\n--- Universa Tracking ---');
    console.log('Has Universa Data:', !!app.universaData);
    console.log('Changed Fields:', app.changedFields);
    
    if (app.universaData) {
      const universaData = JSON.parse(app.universaData);
      console.log('\n--- Universa Profile Data ---');
      console.log('Profile Name:', universaData.firstName, universaData.lastName);
      console.log('Profile Phone:', universaData.phone);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkApplications();