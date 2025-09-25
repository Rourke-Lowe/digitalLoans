# Digital Loans Application Platform - UI/UX Prototype

A comprehensive loan application workflow demonstration platform designed to showcase credit union loan processing capabilities and gather stakeholder requirements.

## 🎯 Purpose

This is a **UI/UX prototype** that demonstrates the complete loan application lifecycle from initial submission through disbursement. It's designed for requirements gathering and stakeholder demonstrations, not production use.

## 🚀 Quick Start - Local Setup

### Prerequisites

- **Node.js 18.0 or higher** (check with `node --version`)
- **npm** (comes with Node.js)
- **Git**

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Rourke-Lowe/digitalLoans.git
   cd digitalLoans
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment file:**
   ```bash
   echo 'DATABASE_URL="file:./dev.db"' > .env
   ```

4. **Initialize and migrate the database:**
   ```bash
   npx prisma migrate dev
   ```
   When prompted for a migration name, just press Enter to accept the default.

5. **Seed the database with test data:**
   ```bash
   npm run seed
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```

7. **Open your browser:**
   ```
   http://localhost:3000
   ```
   Note: If port 3000 is busy, the app will use 3001 or 3002 automatically.

## 📝 Test Accounts

**Important:** This prototype uses email-only authentication (no passwords) for testing convenience.

### Admin Account (Full Access)
- **Email:** `admin@creditunion.com`
- **Access:** All features, settings, and administrative controls

### Staff Account (Review Applications)
- **Email:** `staff@creditunion.com`
- **Access:** Review applications, make decisions, manage workflow

### Member Accounts (Submit Applications)
- `john.doe@email.com` - Sample member
- `jane.smith@email.com` - Sample member
- `sarah.martin@email.com` - Sample member
- `new.member@email.com` - New member (no existing data)
- `existing.member@email.com` - Existing member (has profile data)

## 🔄 Loan Status Workflow

The prototype demonstrates a comprehensive 12-stage loan processing workflow:

1. **SCREENING** - Initial eligibility check
2. **UNDERWRITING** - Credit analysis
3. **DECISION_PENDING** - Awaiting approval
4. **APPROVED** / **REJECTED** - Decision states
5. **DOCUMENT_PREPARATION** - Generate documents
6. **AWAITING_SIGNATURES** - Sent to borrower
7. **SIGNED** - Documents received
8. **RELEASING** - Final checks
9. **DISBURSED** - Funds transferred
10. **COMPLETED** - Process complete
11. **TO_LOS** - Routed to Loan Origination System (for complex cases)

## 🎮 Key Features to Test

### As a Member:
1. **Start a loan application** - Click "Apply Now"
2. **Complete the multi-step form** - Personal, employment, and financial info
3. **Upload documents** - ID, pay stubs, etc.
4. **Track application status** - View progress timeline
5. **Review action items** - See what's needed from you

### As Staff/Admin:
1. **Review applications** - Access the dashboard
2. **Change application status** - Use the status dropdown
3. **Add notes and decisions** - Document your review
4. **Route to LOS** - For complex cases
5. **Manage documents** - View uploaded files
6. **Configure settings** (Admin only) - Customize requirements

## 🛠 Troubleshooting

### Database Issues

If you encounter database errors, reset and rebuild:
```bash
rm prisma/dev.db
rm -rf prisma/migrations
npx prisma migrate dev --name init
npm run seed
```

### Port Already in Use

The app will automatically try ports 3000, 3001, 3002. Check the console output for the actual port being used.

### Missing Dependencies

If you see module errors:
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Build Errors

Ensure you have the correct Node.js version:
```bash
node --version  # Should be v18.0.0 or higher
```

If needed, use [nvm](https://github.com/nvm-sh/nvm) to install Node.js 18+:
```bash
nvm install 18
nvm use 18
```

## 📁 Project Structure

```
digitalLoans/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── member/            # Member portal pages
│   ├── staff/             # Staff dashboard pages
│   └── page.tsx           # Landing page
├── components/            # React components
├── lib/                   # Utility functions
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── scripts/              # Setup scripts
```

## 🔍 What This Prototype Demonstrates

### ✅ Fully Implemented:
- Complete loan application workflow
- Multi-role authentication (Member/Staff/Admin)
- Document upload and management
- Status tracking and history
- Application review interface
- Activity audit trails
- Administrative settings

### 🎭 UI Mockups (Not Functional):
- Credit bureau integration interface
- eSignature workflow (DocuSign)
- Email notifications
- Payment processing
- Third-party integrations

For a complete feature list, see [featureList.md](featureList.md)

## 🚀 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Reset database
rm prisma/dev.db && npx prisma migrate dev && npm run seed

# View database
npx prisma studio
```

## 📊 Technology Stack

- **Framework:** Next.js 15.4 with TypeScript
- **Database:** SQLite with Prisma ORM
- **Styling:** Tailwind CSS
- **Authentication:** Session-based (simplified for prototype)

## 🤝 Contributing

This is a prototype project for demonstration purposes. For questions or issues:

1. Check the [Issues](https://github.com/Rourke-Lowe/digitalLoans/issues) page
2. Review [featureList.md](featureList.md) for implementation status
3. Contact the development team

## 📜 License

This project is a proprietary prototype. All rights reserved.

## 🔗 Additional Resources

- [Feature List](featureList.md) - Complete feature implementation status
- [Requirements Document](LOAN_STATUS_WORKFLOW_REQUIREMENTS.md) - Detailed workflow specifications
- [Prisma Documentation](https://www.prisma.io/docs) - Database ORM reference
- [Next.js Documentation](https://nextjs.org/docs) - Framework reference

---

**Note:** This is a UI/UX prototype designed for demonstration and requirements gathering. It is not intended for production use and lacks many security features required for handling real financial data.