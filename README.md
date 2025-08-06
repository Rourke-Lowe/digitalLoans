# Digital Loans Application Platform

## 🚀 QUICK START - LOCAL SETUP INSTRUCTIONS

### ⚠️ IMPORTANT: Follow these steps to run the application locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Rourke-Lowe/digitalLoans.git
   cd digitalLoans
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create the environment file:**
   ```bash
   echo "DATABASE_URL=\"file:./dev.db\"" > .env
   ```

4. **Initialize the database:**
   ```bash
   npx prisma db push
   ```

5. **Seed the database with test data:**
   ```bash
   npm run seed
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```

7. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

### 📝 TEST ACCOUNTS

Use these test accounts to login and explore the application:

**Admin Account:**
- Email: `admin@creditunion.com`
- Role: Admin (full access)

**Staff Account:**
- Email: `staff@creditunion.com`
- Role: Staff (can review applications)

**Member Accounts:**
- `john.doe@email.com` (Member)
- `jane.smith@email.com` (Member)
- `sarah.martin@email.com` (Member)

**Note:** This application uses email-only authentication (no passwords required for testing).

### ⚠️ TROUBLESHOOTING

If you encounter any issues:

1. **Port already in use:** The app runs on port 3000 by default. If this port is busy, it will automatically use port 3001 or 3002.

2. **Database issues:** If you need to reset the database:
   ```bash
   rm prisma/dev.db
   npx prisma db push
   npm run seed
   ```

3. **Build errors:** Make sure you have Node.js 18+ installed:
   ```bash
   node --version  # Should show v18.0.0 or higher
   ```

---

## Overview

Based on the Adobe XD prototypes, this platform consists of two main components:

1. **Member Application Portal** - A user-friendly interface for members to apply for loans
2. **Credit Union Review Dashboard** - An administrative interface for credit union staff to review and process loan applications

## Architecture Overview

### Technology Stack
- **Frontend**: React.js with TypeScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Authentication**: JWT with refresh tokens
- **File Storage**: AWS S3 or local storage
- **Identity Verification**: Third-party integration (TBD)

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Member Application Flow                  │
├─────────────────────────────────────────────────────────────┤
│  1. Registration & Authentication                           │
│  2. Personal Information Collection                         │
│  3. Identity Verification & Document Upload                 │
│  4. Account Selection & Review                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                            │
│  - Authentication Middleware                                │
│  - Request Validation                                       │
│  - Rate Limiting                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Credit Union Review Dashboard               │
├─────────────────────────────────────────────────────────────┤
│  - Application Queue Management                             │
│  - Document Review Interface                                │
│  - Decision Making Tools                                    │
│  - Communication with Applicants                           │
└─────────────────────────────────────────────────────────────┘
```

## Member Application Flow

### Step 1: Create Account & Verify Email
- Email registration
- Password creation with strength requirements
- Email verification via OTP or link
- Session management

### Step 2: Tell Us About Yourself
- Personal information collection
  - Full name
  - Date of birth
  - Social Security Number (encrypted)
  - Contact information
- Employment information
  - Employer name
  - Employment status
  - Income details
  - Employment duration

### Step 3: Identity Verification
- Photo ID upload (driver's license, passport)
- Selfie capture for biometric verification
- Document upload functionality
  - Pay stubs
  - Tax returns
  - Bank statements
- Real-time verification status

### Step 4: Choose Account Type
- Display available loan products
- Product comparison tool
- Terms and conditions review
- Electronic signature capture

## Credit Union Review Dashboard

### Core Features

1. **Application Queue**
   - Sortable/filterable list of pending applications
   - Priority indicators
   - Status tracking
   - Bulk actions support

2. **Application Review Interface**
   - Comprehensive applicant profile view
   - Document viewer with zoom/rotate capabilities
   - Identity verification results
   - Credit check integration
   - Decision history log

3. **Communication Tools**
   - In-app messaging with applicants
   - Email notifications
   - Request additional documents
   - Status update notifications

4. **Decision Management**
   - Approve/Deny/Request more info actions
   - Conditional approval options
   - Counter-offer capabilities
   - Automated decision rules engine

## Database Schema

### Core Tables

```sql
-- Users table for both members and credit union staff
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('member', 'staff', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Member profiles
CREATE TABLE member_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    ssn_encrypted VARCHAR(255),
    phone VARCHAR(20),
    address JSONB,
    employment_info JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loan applications
CREATE TABLE loan_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES member_profiles(id),
    application_number VARCHAR(20) UNIQUE,
    loan_type VARCHAR(50),
    requested_amount DECIMAL(10, 2),
    status ENUM('draft', 'submitted', 'under_review', 'approved', 'denied', 'withdrawn'),
    submitted_at TIMESTAMP,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    decision_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES loan_applications(id),
    document_type VARCHAR(50),
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP
);

-- Application activity log
CREATE TABLE application_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES loan_applications(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100),
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - New user registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/verify-email` - Email verification

### Member Portal
- `GET /api/member/profile` - Get member profile
- `PUT /api/member/profile` - Update member profile
- `POST /api/applications` - Create new loan application
- `GET /api/applications/:id` - Get application details
- `PUT /api/applications/:id` - Update application
- `POST /api/applications/:id/submit` - Submit application
- `POST /api/applications/:id/documents` - Upload documents
- `DELETE /api/applications/:id/documents/:docId` - Delete document

### Credit Union Dashboard
- `GET /api/admin/applications` - List all applications (with filters)
- `GET /api/admin/applications/:id` - Get detailed application view
- `PUT /api/admin/applications/:id/status` - Update application status
- `POST /api/admin/applications/:id/notes` - Add internal notes
- `POST /api/admin/applications/:id/messages` - Send message to applicant
- `GET /api/admin/analytics` - Dashboard analytics

## Security Considerations

1. **Data Encryption**
   - All sensitive data encrypted at rest (SSN, documents)
   - TLS 1.3 for data in transit
   - Field-level encryption for PII

2. **Authentication & Authorization**
   - JWT tokens with short expiration
   - Refresh token rotation
   - Role-based access control (RBAC)
   - Multi-factor authentication for staff

3. **Document Security**
   - Secure file upload with virus scanning
   - Signed URLs for document access
   - Automatic document expiration

4. **Compliance**
   - GDPR/CCPA compliance
   - Fair lending compliance tracking
   - Audit logs for all actions

## Development Phases

### Phase 1: Foundation (Current)
- Database schema design and implementation
- Basic authentication system
- Core API structure

### Phase 2: Member Portal
- Registration and profile management
- Application creation workflow
- Document upload system

### Phase 3: Identity Verification
- Third-party integration selection
- ID verification implementation
- Biometric matching

### Phase 4: Credit Union Dashboard
- Application review interface
- Decision management system
- Communication tools

### Phase 5: Advanced Features
- Automated decision engine
- Analytics and reporting
- Mobile application

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (for session management)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/digitalloans.git

# Install dependencies
cd digitalloans
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/digitalloans

# Authentication
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# File Storage
STORAGE_TYPE=local # or 's3'
AWS_BUCKET_NAME=your-bucket
AWS_REGION=us-east-1

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
```

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.