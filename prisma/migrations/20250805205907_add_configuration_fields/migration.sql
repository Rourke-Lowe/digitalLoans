-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LoanProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "minAmount" REAL NOT NULL,
    "maxAmount" REAL NOT NULL,
    "minTerm" INTEGER NOT NULL,
    "maxTerm" INTEGER NOT NULL,
    "interestRate" REAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requiredFields" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LoanApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "term" INTEGER NOT NULL,
    "purpose" TEXT NOT NULL,
    "monthlyPayment" REAL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "dateOfBirth" TEXT,
    "sin" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "citizenshipStatus" TEXT,
    "streetNumber" TEXT,
    "streetName" TEXT,
    "unit" TEXT,
    "city" TEXT,
    "province" TEXT,
    "postalCode" TEXT,
    "yearsAtAddress" TEXT,
    "monthsAtAddress" TEXT,
    "prevStreetNumber" TEXT,
    "prevStreetName" TEXT,
    "prevUnit" TEXT,
    "prevCity" TEXT,
    "prevProvince" TEXT,
    "prevPostalCode" TEXT,
    "employerName" TEXT,
    "employmentStatus" TEXT,
    "annualIncome" REAL,
    "monthlyIncome" REAL,
    "employmentDuration" TEXT,
    "employmentYears" TEXT,
    "employmentMonths" TEXT,
    "otherIncome" TEXT,
    "monthlyHousingCost" TEXT,
    "otherMonthlyDebts" TEXT,
    "numberOfDependents" TEXT,
    "bankAccountBalance" REAL,
    "investmentValue" REAL,
    "propertyValue" REAL,
    "vehicleValue" REAL,
    "otherAssetsValue" REAL,
    "otherAssetsDesc" TEXT,
    "creditCardBalances" REAL,
    "creditCardLimits" REAL,
    "existingLoans" TEXT,
    "primaryBank" TEXT,
    "bankingYears" TEXT,
    "accountType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "submittedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LoanApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LoanApplication_productId_fkey" FOREIGN KEY ("productId") REFERENCES "LoanProduct" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Document_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "LoanApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApplicationReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApplicationReview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "LoanApplication" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ApplicationReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApplicationActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApplicationActivity_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "LoanApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ApplicationActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CreditUnionSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#2563eb',
    "accentColor" TEXT NOT NULL DEFAULT '#3b82f6',
    "requireSin" BOOLEAN NOT NULL DEFAULT true,
    "requireEmployment" BOOLEAN NOT NULL DEFAULT true,
    "maxUploadSize" INTEGER NOT NULL DEFAULT 5242880,
    "allowedFileTypes" TEXT NOT NULL DEFAULT 'image/jpeg,image/png,application/pdf',
    "addressFieldLabels" TEXT,
    "requiredDocuments" TEXT,
    "requiredFinancialInfo" TEXT,
    "requiredConsents" TEXT,
    "termsOfService" TEXT,
    "approvalTemplate" TEXT,
    "denialTemplate" TEXT,
    "moreInfoTemplate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProductConfiguration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "additionalDocuments" TEXT,
    "additionalFinancialFields" TEXT,
    "fieldOverrides" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductConfiguration_productId_fkey" FOREIGN KEY ("productId") REFERENCES "LoanProduct" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LoanApplication_applicationNumber_key" ON "LoanApplication"("applicationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ProductConfiguration_productId_key" ON "ProductConfiguration"("productId");
