import { prisma } from '../lib/prisma';

async function main() {
  // Create test users matching the login page
  
  // Admin user
  await prisma.user.upsert({
    where: { email: 'admin@creditunion.com' },
    update: {},
    create: {
      email: 'admin@creditunion.com',
      name: 'Admin User',
      role: 'admin',
    },
  });

  // Staff user
  await prisma.user.upsert({
    where: { email: 'staff@creditunion.com' },
    update: {},
    create: {
      email: 'staff@creditunion.com',
      name: 'Staff User',
      role: 'staff',
    },
  });

  // Member users
  await prisma.user.upsert({
    where: { email: 'john.doe@email.com' },
    update: {},
    create: {
      email: 'john.doe@email.com',
      name: 'John Doe',
      role: 'member',
    },
  });

  await prisma.user.upsert({
    where: { email: 'jane.smith@email.com' },
    update: {},
    create: {
      email: 'jane.smith@email.com',
      name: 'Jane Smith',
      role: 'member',
    },
  });

  await prisma.user.upsert({
    where: { email: 'sarah.martin@email.com' },
    update: {},
    create: {
      email: 'sarah.martin@email.com',
      name: 'Sarah Martin',
      role: 'member',
    },
  });
  
  // New test users for member types
  await prisma.user.upsert({
    where: { email: 'new.member@email.com' },
    update: {},
    create: {
      email: 'new.member@email.com',
      name: 'New Member',
      role: 'member',
    },
  });
  
  await prisma.user.upsert({
    where: { email: 'existing.member@email.com' },
    update: {},
    create: {
      email: 'existing.member@email.com',
      name: 'Robert Johnson',
      role: 'member',
    },
  });

  // Create credit union settings
  await prisma.creditUnionSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'Digital Credit Union',
      primaryColor: '#2563eb',
      accentColor: '#3b82f6',
      requireSin: true,
      requireEmployment: true,
      maxUploadSize: 5242880,
      allowedFileTypes: 'image/jpeg,image/png,application/pdf',
      addressFieldLabels: JSON.stringify({
        streetNumber: 'Street Number',
        streetName: 'Street Name',
        unit: 'Unit/Apt',
        city: 'City',
        province: 'Province',
        postalCode: 'Postal Code',
      }),
      requiredDocuments: JSON.stringify(['id_front', 'id_back', 'pay_stub']),
      requiredFinancialInfo: JSON.stringify({
        bankAccountBalance: true,
        investmentValue: false,
        propertyValue: false,
        vehicleValue: false,
        creditCardBalances: true,
        creditCardLimits: true,
      }),
      requiredConsents: JSON.stringify({
        creditCheck: true,
        fintrac: true,
        privacy: true,
        terms: true,
        esignature: true,
      }),
      termsOfService: 'By submitting this application, you agree to our terms of service and understand that this is a legally binding agreement.',
    },
  });

  // Create loan products
  const personalLoan = await prisma.loanProduct.create({
    data: {
      name: 'Personal Loan',
      description: 'Flexible personal loan for any purpose',
      minAmount: 1000,
      maxAmount: 50000,
      minTerm: 12,
      maxTerm: 60,
      interestRate: 8.99,
      isActive: true,
      requiredFields: JSON.stringify(['income', 'employment']),
    },
  });

  const autoLoan = await prisma.loanProduct.create({
    data: {
      name: 'Auto Loan',
      description: 'Finance your new or used vehicle',
      minAmount: 5000,
      maxAmount: 100000,
      minTerm: 24,
      maxTerm: 84,
      interestRate: 6.99,
      isActive: true,
      requiredFields: JSON.stringify(['income', 'employment', 'vehicle_info']),
    },
  });

  const homeLoan = await prisma.loanProduct.create({
    data: {
      name: 'Home Equity Loan',
      description: 'Leverage your home equity for major expenses',
      minAmount: 10000,
      maxAmount: 500000,
      minTerm: 60,
      maxTerm: 300,
      interestRate: 5.99,
      isActive: true,
      requiredFields: JSON.stringify(['income', 'employment', 'property_info']),
    },
  });

  // Create product configurations
  await prisma.productConfiguration.create({
    data: {
      productId: autoLoan.id,
      additionalDocuments: JSON.stringify(['vehicle_registration', 'vehicle_insurance']),
      additionalFinancialFields: JSON.stringify({
        vehicleValue: true,
        vehicleYear: true,
      }),
      fieldOverrides: JSON.stringify({
        minIncome: 35000,
        maxDebtRatio: 0.45,
      }),
    },
  });

  await prisma.productConfiguration.create({
    data: {
      productId: homeLoan.id,
      additionalDocuments: JSON.stringify(['property_appraisal', 'mortgage_statement', 'insurance_proof']),
      additionalFinancialFields: JSON.stringify({
        propertyTaxes: true,
        homeInsurance: true,
        propertyValue: true,
      }),
      fieldOverrides: JSON.stringify({
        minIncome: 50000,
        maxDebtRatio: 0.35,
        minCreditScore: 650,
        requiredDownPayment: 20,
      }),
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });