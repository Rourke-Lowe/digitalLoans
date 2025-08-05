# Digital Loans Platform Requirements

## Overview
A configurable digital loan application platform designed for Canadian credit unions to accept and process loan applications online.

## Core Requirements

### 1. User Management
- **Member accounts**: Can apply for loans, track applications
- **Staff accounts**: Can review and process applications  
- **Admin accounts**: Can configure system settings and products
- **Test accounts for demo**: Pre-seeded accounts for each role

### 2. Loan Products
- Configurable loan products with customizable parameters
- Min/max amounts and terms
- Interest rates
- Required fields per product
- Document requirements per product
- Active/inactive status

### 3. Application Flow

#### Current Implementation
1. **Product Selection**: Member selects loan product, amount, term, purpose
2. **Personal Information**: Name, DOB, SIN, phone, address
3. **Employment Information**: Employer, status, income, duration
4. **Document Upload**: ID (front/back), pay stub
5. **Review & Submit**: Summary and terms agreement

#### Required Enhancements
1. **Email & Verification**:
   - Email field in personal information
   - OTP verification step after personal info
   - Show OTP in UI for demo purposes

2. **Comprehensive Address Section**:
   - Street number and name
   - Unit/apartment number
   - City
   - Province/Territory dropdown
   - Postal code with validation
   - Years at current address
   - Previous address if < 2 years

3. **Additional Information Fields**:
   - Citizenship/residency status
   - Number of dependents
   - Monthly housing costs (rent/mortgage)
   - Other monthly obligations
   - Banking relationship status
   - Detailed purpose categories

4. **Consent & Authorization Screens**:
   - FINTRAC identity verification consent
   - Credit bureau authorization
   - Privacy policy acceptance (PIPEDA)
   - Terms of service agreement
   - Electronic signature consent

5. **Configurable Documents**:
   - Base documents configurable by credit union
   - Additional documents by product type
   - Conditional documents based on applicant info

### 4. Staff Review Interface
- Application list with filters
- Detailed application view
- Document preview
- Decision recording (approve/deny/request info)
- Activity history tracking

### 5. Settings & Configuration
- Credit union branding (name, colors)
- Application flow toggles
- Document requirements
- Email templates
- User management

## Security Requirements

### Production Requirements (Not for Demo)
- SIN encryption/tokenization
- Secure document storage
- API authorization checks
- Audit trail for all actions
- PCI-DSS compliance considerations

### Demo Simplifications
- Basic authentication via email
- Simplified document upload
- In-memory or SQLite storage
- Mock integrations

## Technical Requirements

### Current Stack
- Next.js 14 with App Router
- TypeScript
- Prisma ORM
- SQLite (demo) / PostgreSQL (production)
- Tailwind CSS

### Integration Points (Future)
- Credit bureau APIs (Equifax/TransUnion)
- Identity verification (Trulioo)
- Bank aggregation (Plaid/Flinks)
- OTP services (Twilio/SendGrid)
- Document storage (S3/GCS)

## User Experience Requirements

### Application Process
- Multi-step wizard with progress tracking
- Auto-save functionality
- Field validation with helpful error messages
- Mobile-responsive design
- Accessibility compliance (WCAG 2.1 AA)

### Performance
- Page load under 3 seconds
- Instant field validation
- Smooth transitions between steps
- Offline capability for saving progress

## Compliance Requirements

### Regulatory
- FINTRAC identity verification
- PIPEDA privacy compliance
- Provincial lending regulations
- OSFI guidelines (B-20, E-21)

### Industry Standards
- CMHC lending guidelines
- Credit bureau reporting standards
- Electronic signature validity

## Demo-Specific Requirements

### Simplified Features
- Mock credit checks (instant approval/denial)
- Show OTP codes in UI
- Pre-filled test data options
- Simplified document validation
- Instant staff notifications

### Demo Data
- Multiple test applications in various states
- Sample loan products
- Pre-configured credit union settings
- Test documents

## Future Enhancements (Post-Demo)

### Advanced Features
- Co-applicant/guarantor support
- Real-time GDS/TDS calculations
- AI-powered pre-qualification
- Alternative data sources
- Multi-language support
- White-label capabilities

### Integrations
- Core banking systems
- Loan origination systems
- Credit decisioning engines
- Document management systems
- Business intelligence tools