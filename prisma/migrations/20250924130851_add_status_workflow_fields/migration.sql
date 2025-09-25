-- CreateTable
CREATE TABLE "StatusHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "fromStatus" TEXT NOT NULL,
    "toStatus" TEXT NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "changedBy" TEXT NOT NULL,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StatusHistory_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "LoanApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StatusHistory_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DocumentTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "templateContent" TEXT NOT NULL,
    "requiredFields" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GeneratedDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "documentName" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'generated',
    "documentUrl" TEXT NOT NULL,
    "sentAt" DATETIME,
    "viewedAt" DATETIME,
    "signedAt" DATETIME,
    "signatureId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GeneratedDocument_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "LoanApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LoanApplication" (
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
    "status" TEXT NOT NULL DEFAULT 'SCREENING',
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "submittedAt" DATETIME,
    "statusChangedAt" DATETIME,
    "statusChangedBy" TEXT,
    "losReferenceNumber" TEXT,
    "losRoutingReason" TEXT,
    "disbursementMethod" TEXT,
    "disbursementDate" DATETIME,
    "completionDate" DATETIME,
    "universaData" TEXT,
    "changedFields" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LoanApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LoanApplication_productId_fkey" FOREIGN KEY ("productId") REFERENCES "LoanProduct" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LoanApplication" ("accountType", "address", "amount", "annualIncome", "applicationNumber", "bankAccountBalance", "bankingYears", "citizenshipStatus", "city", "createdAt", "creditCardBalances", "creditCardLimits", "currentStep", "dateOfBirth", "email", "employerName", "employmentDuration", "employmentMonths", "employmentStatus", "employmentYears", "existingLoans", "firstName", "id", "investmentValue", "lastName", "monthlyHousingCost", "monthlyIncome", "monthlyPayment", "monthsAtAddress", "numberOfDependents", "otherAssetsDesc", "otherAssetsValue", "otherIncome", "otherMonthlyDebts", "phone", "postalCode", "prevCity", "prevPostalCode", "prevProvince", "prevStreetName", "prevStreetNumber", "prevUnit", "primaryBank", "productId", "propertyValue", "province", "purpose", "sin", "status", "streetName", "streetNumber", "submittedAt", "term", "unit", "updatedAt", "userId", "vehicleValue", "yearsAtAddress") SELECT "accountType", "address", "amount", "annualIncome", "applicationNumber", "bankAccountBalance", "bankingYears", "citizenshipStatus", "city", "createdAt", "creditCardBalances", "creditCardLimits", "currentStep", "dateOfBirth", "email", "employerName", "employmentDuration", "employmentMonths", "employmentStatus", "employmentYears", "existingLoans", "firstName", "id", "investmentValue", "lastName", "monthlyHousingCost", "monthlyIncome", "monthlyPayment", "monthsAtAddress", "numberOfDependents", "otherAssetsDesc", "otherAssetsValue", "otherIncome", "otherMonthlyDebts", "phone", "postalCode", "prevCity", "prevPostalCode", "prevProvince", "prevStreetName", "prevStreetNumber", "prevUnit", "primaryBank", "productId", "propertyValue", "province", "purpose", "sin", "status", "streetName", "streetNumber", "submittedAt", "term", "unit", "updatedAt", "userId", "vehicleValue", "yearsAtAddress" FROM "LoanApplication";
DROP TABLE "LoanApplication";
ALTER TABLE "new_LoanApplication" RENAME TO "LoanApplication";
CREATE UNIQUE INDEX "LoanApplication_applicationNumber_key" ON "LoanApplication"("applicationNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
