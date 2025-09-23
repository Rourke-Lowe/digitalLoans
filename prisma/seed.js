const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create test users
  const users = await Promise.all([
    // Members
    prisma.user.create({
      data: {
        email: 'john.doe@email.com',
        name: 'John Doe',
        role: 'member',
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@email.com',
        name: 'Jane Smith',
        role: 'member',
      },
    }),
    prisma.user.create({
      data: {
        email: 'sarah.martin@email.com',
        name: 'Sarah Martin',
        role: 'member',
      },
    }),
    // New test users for member types
    prisma.user.create({
      data: {
        email: 'new.member@email.com',
        name: 'New Member',
        role: 'member',
      },
    }),
    prisma.user.create({
      data: {
        email: 'existing.member@email.com',
        name: 'Robert Johnson',
        role: 'member',
      },
    }),
    // Staff
    prisma.user.create({
      data: {
        email: 'staff@creditunion.com',
        name: 'Staff Member',
        role: 'staff',
      },
    }),
    // Admin
    prisma.user.create({
      data: {
        email: 'admin@creditunion.com',
        name: 'Admin User',
        role: 'admin',
      },
    }),
  ]);

  // Create loan products
  const products = await Promise.all([
    prisma.loanProduct.create({
      data: {
        name: 'Personal Loan',
        description: 'Flexible personal loans for any purpose',
        minAmount: 1000,
        maxAmount: 50000,
        minTerm: 12,
        maxTerm: 60,
        interestRate: 7.99,
        requiredFields: JSON.stringify(['sin', 'employment', 'income']),
      },
    }),
    prisma.loanProduct.create({
      data: {
        name: 'Auto Loan',
        description: 'Finance your new or used vehicle',
        minAmount: 5000,
        maxAmount: 75000,
        minTerm: 24,
        maxTerm: 84,
        interestRate: 5.99,
        requiredFields: JSON.stringify(['sin', 'employment', 'income', 'vehicle']),
      },
    }),
    prisma.loanProduct.create({
      data: {
        name: 'Home Equity Line of Credit',
        description: 'Access your home equity when you need it',
        minAmount: 10000,
        maxAmount: 250000,
        minTerm: 60,
        maxTerm: 300,
        interestRate: 4.99,
        requiredFields: JSON.stringify(['sin', 'employment', 'income', 'property']),
      },
    }),
  ]);

  // Create sample applications
  const member1 = users.find(u => u.email === 'john.doe@email.com');
  const member2 = users.find(u => u.email === 'jane.smith@email.com');
  const member3 = users.find(u => u.email === 'sarah.martin@email.com');
  const personalLoan = products.find(p => p.name === 'Personal Loan');

  await Promise.all([
    // Submitted application
    prisma.loanApplication.create({
      data: {
        applicationNumber: 'APP-2024-001',
        userId: member1.id,
        productId: personalLoan.id,
        amount: 15000,
        term: 36,
        purpose: 'Debt consolidation',
        monthlyPayment: 475.50,
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1985-03-15',
        sin: '123-456-789',
        phone: '(555) 123-4567',
        address: '123 Main St, Toronto, ON M5V 3A8',
        employerName: 'Tech Corp Inc.',
        employmentStatus: 'Full-time',
        annualIncome: 75000,
        monthlyIncome: 6250,
        employmentDuration: '3 years',
        status: 'submitted',
        currentStep: 5,
        submittedAt: new Date('2024-01-10'),
      },
    }),
    // Under review application
    prisma.loanApplication.create({
      data: {
        applicationNumber: 'APP-2024-002',
        userId: member2.id,
        productId: personalLoan.id,
        amount: 25000,
        term: 48,
        purpose: 'Home renovation',
        monthlyPayment: 625.25,
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: '1990-07-22',
        sin: '987-654-321',
        phone: '(555) 987-6543',
        address: '456 Oak Ave, Vancouver, BC V6B 2W2',
        employerName: 'Marketing Solutions Ltd.',
        employmentStatus: 'Full-time',
        annualIncome: 85000,
        monthlyIncome: 7083,
        employmentDuration: '5 years',
        status: 'under_review',
        currentStep: 5,
        submittedAt: new Date('2024-01-08'),
      },
    }),
    // Draft application
    prisma.loanApplication.create({
      data: {
        applicationNumber: 'APP-2024-003',
        userId: member3.id,
        productId: personalLoan.id,
        amount: 10000,
        term: 24,
        purpose: 'Emergency expenses',
        status: 'draft',
        currentStep: 2,
      },
    }),
  ]);

  // Create CU settings
  await prisma.creditUnionSettings.create({
    data: {
      name: 'Digital Credit Union',
      primaryColor: '#2563eb',
      accentColor: '#3b82f6',
      requireSin: true,
      requireEmployment: true,
      approvalTemplate: 'Congratulations! Your loan application has been approved.',
      denialTemplate: 'We regret to inform you that your loan application has been denied.',
      moreInfoTemplate: 'We need additional information to process your loan application.',
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