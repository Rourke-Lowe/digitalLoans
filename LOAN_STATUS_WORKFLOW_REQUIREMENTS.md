# Loan Status Workflow Requirements Document
## UI/UX Prototype Enhancement Specifications

> **Context**: This document outlines all required changes to transform the current loan application prototype into a comprehensive demonstration of the new loan processing workflow. This is a UI/UX prototype designed to showcase requirements and workflows to stakeholders, not a production application.

---

## 1. Executive Summary

### Current State
The existing prototype demonstrates a basic loan application flow with simple approve/deny functionality and minimal status tracking.

### Target State
A comprehensive loan processing workflow demonstration with 12 distinct statuses, role-based actions, document management, and clear visibility into each processing stage.

### Key Business Benefits to Demonstrate
- Clear visibility of application status for both staff and members
- Defined handoff points between departments
- Ability to route complex cases to LOS
- Automated workflow progression
- Compliance and audit trail capabilities

---

## 2. New Status Workflow

### Status Definitions and Flow

```
1. SCREENING → Initial eligibility and completeness check
   ↓ (Pass) or → TO_LOS (Complex case identified)

2. UNDERWRITING → Credit analysis and risk assessment
   ↓ (Pass) or → TO_LOS (Requires manual underwriting)

3. DECISION_PENDING → Awaiting approval from authorized personnel
   ↓

4. APPROVED / REJECTED → Clear decision states
   ↓ (If Approved)

5. DOCUMENT_PREPARATION → Generate loan documents and disclosures
   ↓

6. AWAITING_SIGNATURES → Documents sent to borrower
   ↓

7. SIGNED → Documents received and verified
   ↓

8. RELEASING → Final compliance checks and disbursement setup
   ↓

9. DISBURSED → Funds transferred
   ↓

10. COMPLETED → Funds confirmed received by borrower

Special Status:
11. TO_LOS → Routed to Loan Origination System (can branch from SCREENING or UNDERWRITING)
```

---

## 3. Current Features Analysis

### What Currently Exists
✅ Basic status field (draft, submitted, under_review, approved, denied)
✅ Simple approval buttons (Approve, Deny, Request More Info)
✅ Document upload capability
✅ Activity logging
✅ Member application view
✅ Staff review interface
✅ Application listing with filters
✅ KYC status indicator
✅ Debt-to-income calculation
✅ Change tracking for existing members

### What's Missing (Gap Analysis)
❌ Status dropdown selector
❌ Status transition validation
❌ Document generation interface
❌ Signature tracking
❌ Disbursement management
❌ LOS routing capability
❌ Status-specific workflows
❌ Progress visualization
❌ Automated notifications
❌ Compliance checklists
❌ Status duration tracking
❌ Role-based status permissions

---

## 4. Required UI/UX Changes by Component

### 4.1 Database Schema Updates

**File**: `prisma/schema.prisma`

```prisma
// Update LoanApplication model status field comment
status String @default("SCREENING")
// New values: SCREENING, UNDERWRITING, DECISION_PENDING, APPROVED, REJECTED,
// DOCUMENT_PREPARATION, AWAITING_SIGNATURES, SIGNED, RELEASING, DISBURSED, COMPLETED, TO_LOS

// Add new fields to LoanApplication
statusChangedAt    DateTime?
statusChangedBy    String?
losReferenceNumber String?
losRoutingReason   String?
disbursementMethod String?
disbursementDate   DateTime?
completionDate     DateTime?

// New model for status history
model StatusHistory {
  id                String      @id @default(cuid())
  applicationId     String
  fromStatus        String
  toStatus          String
  reason            String?
  notes             String?
  changedBy         String
  changedAt         DateTime    @default(now())

  application       LoanApplication @relation(fields: [applicationId], references: [id])
  user              User @relation(fields: [changedBy], references: [id])
}

// New model for document templates
model DocumentTemplate {
  id                String      @id @default(cuid())
  name              String
  type              String      // loan_agreement, disclosure, etc.
  templateContent   String      // HTML or markdown template
  requiredFields    String      // JSON array of required merge fields
  isActive          Boolean     @default(true)
}

// New model for generated documents
model GeneratedDocument {
  id                String      @id @default(cuid())
  applicationId     String
  templateId        String
  documentName      String
  status            String      // generated, sent, viewed, signed
  sentAt            DateTime?
  viewedAt          DateTime?
  signedAt          DateTime?
  documentUrl       String

  application       LoanApplication @relation(fields: [applicationId], references: [id])
}
```

### 4.2 Staff Review Interface Updates

**File**: `app/staff/applications/[id]/ReviewInterface.tsx`

#### Replace Action Buttons with Status Management Section

**Current Code (Lines 230-268):**
```tsx
// Simple buttons for approve/deny/more info
```

**New Requirements:**
```tsx
// Status Management Card
<div className="card mb-6">
  <h3 className="font-semibold text-lg mb-4">APPLICATION STATUS MANAGEMENT</h3>

  {/* Current Status Display */}
  <div className="mb-4 p-3 bg-gray-50 rounded">
    <span className="text-sm text-gray-600">Current Status:</span>
    <span className="ml-2 font-bold text-lg">{application.status}</span>
    <span className="ml-2 text-sm text-gray-500">
      (Since: {formatDate(application.statusChangedAt)})
    </span>
  </div>

  {/* Status Change Controls */}
  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium mb-2">Change Status To:</label>
      <select
        className="w-full p-2 border rounded-lg"
        value={newStatus}
        onChange={(e) => setNewStatus(e.target.value)}
      >
        <option value="">Select new status...</option>
        {getAvailableStatuses(application.status).map(status => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium mb-2">Reason for Change:</label>
      <select className="w-full p-2 border rounded-lg">
        <option>Passed initial screening</option>
        <option>Failed eligibility check</option>
        <option>Requires manual underwriting</option>
        <option>Documents incomplete</option>
        <option>Credit score below threshold</option>
        <option>DTI exceeds limits</option>
        <option>Approved by committee</option>
        <option>Other (specify in notes)</option>
      </select>
    </div>
  </div>

  {/* Special Routing Options */}
  {(application.status === 'SCREENING' || application.status === 'UNDERWRITING') && (
    <div className="mt-4 p-4 border-2 border-yellow-200 bg-yellow-50 rounded-lg">
      <h4 className="font-medium text-yellow-900 mb-2">Route to LOS?</h4>
      <div className="flex items-center gap-4">
        <button className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
          Route to LOS
        </button>
        <input
          type="text"
          placeholder="LOS Reference Number (optional)"
          className="flex-1 p-2 border rounded"
        />
      </div>
    </div>
  )}

  {/* Notes Field */}
  <div className="mt-4">
    <label className="block text-sm font-medium mb-2">Status Change Notes:</label>
    <textarea
      className="w-full p-3 border rounded-lg h-24"
      placeholder="Add notes about this status change..."
    />
  </div>

  {/* Action Buttons */}
  <div className="flex gap-3 mt-4">
    <button className="btn-primary">Update Status</button>
    <button className="btn-secondary">Cancel</button>
  </div>
</div>
```

#### Add Workflow Progress Visualization

```tsx
// Add after the status management card
<div className="card mb-6">
  <h3 className="font-semibold text-lg mb-4">WORKFLOW PROGRESS</h3>

  {/* Visual Pipeline */}
  <div className="relative">
    <div className="flex justify-between items-center">
      {['SCREENING', 'UNDERWRITING', 'DECISION', 'DOCUMENTS', 'SIGNATURES', 'RELEASING', 'DISBURSED', 'COMPLETED'].map((stage, index) => (
        <div key={stage} className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm
            ${getStageStatus(stage, application.status) === 'completed' ? 'bg-green-500' :
              getStageStatus(stage, application.status) === 'current' ? 'bg-blue-500' :
              'bg-gray-300'}`}>
            {index + 1}
          </div>
          <span className="text-xs mt-1">{stage}</span>
        </div>
      ))}
    </div>
    {/* Progress Line */}
    <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-300 -z-10"></div>
    <div className="absolute top-5 left-0 h-0.5 bg-green-500 -z-10"
         style={{width: `${getProgressPercentage(application.status)}%`}}></div>
  </div>
</div>
```

#### Add Document Management Section (for DOCUMENT_PREPARATION status)

```tsx
// New section to add when status is DOCUMENT_PREPARATION or later
{['DOCUMENT_PREPARATION', 'AWAITING_SIGNATURES', 'SIGNED'].includes(application.status) && (
  <div className="card mb-6">
    <h3 className="font-semibold text-lg mb-4">DOCUMENT MANAGEMENT</h3>

    {/* Document Generation (only in DOCUMENT_PREPARATION) */}
    {application.status === 'DOCUMENT_PREPARATION' && (
      <div className="mb-6">
        <h4 className="font-medium mb-3">Generate Documents</h4>
        <div className="space-y-3">
          <label className="flex items-center p-3 border rounded hover:bg-gray-50">
            <input type="checkbox" className="mr-3" defaultChecked />
            <span className="flex-1">Loan Agreement</span>
            <button className="text-blue-600 text-sm">Preview Template</button>
          </label>
          <label className="flex items-center p-3 border rounded hover:bg-gray-50">
            <input type="checkbox" className="mr-3" defaultChecked />
            <span className="flex-1">Truth in Lending Disclosure</span>
            <button className="text-blue-600 text-sm">Preview Template</button>
          </label>
          <label className="flex items-center p-3 border rounded hover:bg-gray-50">
            <input type="checkbox" className="mr-3" defaultChecked />
            <span className="flex-1">Privacy Notice</span>
            <button className="text-blue-600 text-sm">Preview Template</button>
          </label>
        </div>
        <button className="btn-primary mt-4">Generate Selected Documents</button>
      </div>
    )}

    {/* Document Status Tracking */}
    <div>
      <h4 className="font-medium mb-3">Document Status</h4>
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 text-left text-sm">Document</th>
            <th className="p-2 text-left text-sm">Status</th>
            <th className="p-2 text-left text-sm">Sent</th>
            <th className="p-2 text-left text-sm">Viewed</th>
            <th className="p-2 text-left text-sm">Signed</th>
            <th className="p-2 text-left text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="p-2">Loan Agreement</td>
            <td className="p-2">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Awaiting Signature</span>
            </td>
            <td className="p-2 text-sm">12/20/24 2:30pm</td>
            <td className="p-2 text-sm">12/20/24 3:45pm</td>
            <td className="p-2 text-sm">-</td>
            <td className="p-2">
              <button className="text-blue-600 text-sm mr-2">View</button>
              <button className="text-blue-600 text-sm">Resend</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    {/* eSignature Integration Panel */}
    {application.status === 'AWAITING_SIGNATURES' && (
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">eSignature Status</h4>
        <div className="flex items-center justify-between">
          <span className="text-sm">DocuSign Envelope ID: #ENV-2024-1220-001</span>
          <button className="text-blue-600 text-sm font-medium">Open in DocuSign</button>
        </div>
        <div className="mt-3">
          <button className="btn-secondary mr-2">Send Reminder</button>
          <button className="btn-secondary">Void & Regenerate</button>
        </div>
      </div>
    )}
  </div>
)}
```

#### Add Disbursement Management Section

```tsx
// New section for RELEASING, DISBURSED, COMPLETED statuses
{['RELEASING', 'DISBURSED', 'COMPLETED'].includes(application.status) && (
  <div className="card mb-6">
    <h3 className="font-semibold text-lg mb-4">DISBURSEMENT MANAGEMENT</h3>

    {/* Pre-Disbursement Checklist (RELEASING) */}
    {application.status === 'RELEASING' && (
      <div className="mb-6">
        <h4 className="font-medium mb-3">Pre-Disbursement Checklist</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input type="checkbox" className="mr-3" />
            <span>All documents signed and received</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-3" />
            <span>Final compliance review completed</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-3" />
            <span>Lien position verified (if applicable)</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-3" />
            <span>Insurance requirements met</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-3" />
            <span>Funding source confirmed</span>
          </label>
        </div>
      </div>
    )}

    {/* Disbursement Details */}
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-2">Disbursement Method</label>
        <select className="w-full p-2 border rounded-lg">
          <option>ACH Transfer</option>
          <option>Wire Transfer</option>
          <option>Check</option>
          <option>Internal Transfer</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Disbursement Date</label>
        <input type="date" className="w-full p-2 border rounded-lg" />
      </div>
    </div>

    {/* Account Details */}
    <div className="mt-4">
      <label className="block text-sm font-medium mb-2">Disbursement Account</label>
      <div className="p-3 bg-gray-50 rounded">
        <p className="text-sm">Account: ****4567</p>
        <p className="text-sm">Routing: ****8901</p>
        <p className="text-sm">Name: John Doe</p>
      </div>
    </div>

    {/* Disbursement Actions */}
    <div className="mt-4 flex gap-3">
      {application.status === 'RELEASING' && (
        <button className="btn-primary">Initiate Disbursement</button>
      )}
      {application.status === 'DISBURSED' && (
        <>
          <button className="btn-primary">Confirm Receipt</button>
          <button className="btn-secondary">View Transaction</button>
        </>
      )}
    </div>

    {/* Transaction Details (for DISBURSED/COMPLETED) */}
    {['DISBURSED', 'COMPLETED'].includes(application.status) && (
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <h4 className="font-medium text-green-900 mb-2">Transaction Details</h4>
        <div className="space-y-1 text-sm">
          <p>Transaction ID: TXN-2024-1220-001</p>
          <p>Amount: $25,000.00</p>
          <p>Method: ACH Transfer</p>
          <p>Initiated: 12/20/2024 10:30 AM</p>
          <p>Completed: 12/20/2024 10:35 AM</p>
        </div>
      </div>
    )}
  </div>
)}
```

### 4.3 Member Portal Updates

**File**: `app/member/applications/[id]/page.tsx`

#### Enhanced Status Display with Timeline

```tsx
// Replace current status card with enhanced version
<div className="card mb-8">
  <h2 className="text-xl font-semibold mb-4">Application Progress</h2>

  {/* Visual Progress Timeline */}
  <div className="mb-6">
    <div className="flex justify-between relative">
      {getStatusSteps(application.status).map((step, index) => (
        <div key={step.name} className="flex flex-col items-center flex-1">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white
            ${step.status === 'completed' ? 'bg-green-500' :
              step.status === 'current' ? 'bg-blue-500 animate-pulse' :
              'bg-gray-300'}`}>
            {step.status === 'completed' ? '✓' : index + 1}
          </div>
          <span className="text-xs mt-2 text-center">{step.label}</span>
          {step.status === 'current' && (
            <span className="text-xs text-blue-600 mt-1">Current Step</span>
          )}
        </div>
      ))}
    </div>
  </div>

  {/* Current Status Details */}
  <div className="p-4 bg-blue-50 rounded-lg">
    <h3 className="font-semibold text-lg mb-2">{getStatusTitle(application.status)}</h3>
    <p className="text-gray-700 mb-3">{getStatusDescription(application.status)}</p>

    {/* What to Expect */}
    <div className="mb-3">
      <h4 className="font-medium text-sm mb-1">What happens next:</h4>
      <ul className="text-sm text-gray-600 list-disc list-inside">
        {getNextSteps(application.status).map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ul>
    </div>

    {/* Estimated Timeline */}
    <div className="flex items-center text-sm text-gray-500">
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Estimated completion: {getEstimatedCompletion(application.status)}
    </div>
  </div>
</div>
```

#### Add Member Action Center

```tsx
// New section for member actions based on status
<div className="card mb-8">
  <h2 className="text-xl font-semibold mb-4">Action Required</h2>

  {application.status === 'AWAITING_SIGNATURES' && (
    <div className="space-y-4">
      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
        <h3 className="font-medium text-yellow-900 mb-2">Documents Ready for Signature</h3>
        <p className="text-sm text-yellow-700 mb-3">
          Your loan documents are ready for review and signature. Please review carefully before signing.
        </p>
        <button className="btn-primary">Review & Sign Documents</button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
          <span className="font-medium">Loan Agreement</span>
          <span className="text-sm text-gray-600">Pending Signature</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
          <span className="font-medium">Truth in Lending Disclosure</span>
          <span className="text-sm text-gray-600">Pending Signature</span>
        </div>
      </div>
    </div>
  )}

  {application.status === 'APPROVED' && (
    <div className="p-4 bg-green-50 border-l-4 border-green-400">
      <h3 className="font-medium text-green-900 mb-2">Congratulations! Your loan is approved</h3>
      <p className="text-sm text-green-700">
        We're preparing your loan documents. You'll receive an email when they're ready for signature.
      </p>
    </div>
  )}

  {application.status === 'DISBURSED' && (
    <div className="p-4 bg-blue-50 border-l-4 border-blue-400">
      <h3 className="font-medium text-blue-900 mb-2">Funds Disbursed</h3>
      <p className="text-sm text-blue-700 mb-3">
        Your loan funds have been sent to your account. Please confirm receipt.
      </p>
      <button className="btn-primary">Confirm Fund Receipt</button>
    </div>
  )}

  {/* No actions required */}
  {!['AWAITING_SIGNATURES', 'APPROVED', 'DISBURSED'].includes(application.status) && (
    <p className="text-gray-500">No actions required at this time. We'll notify you when your application progresses.</p>
  )}
</div>
```

### 4.4 Application List Updates

**File**: `app/staff/applications/page.tsx`

#### Update Status Filter Options

```tsx
// Update the status filter dropdown
<select className="input">
  <option value="">All Statuses</option>
  <option value="SCREENING">Screening</option>
  <option value="UNDERWRITING">Underwriting</option>
  <option value="DECISION_PENDING">Decision Pending</option>
  <option value="APPROVED">Approved</option>
  <option value="REJECTED">Rejected</option>
  <option value="DOCUMENT_PREPARATION">Document Preparation</option>
  <option value="AWAITING_SIGNATURES">Awaiting Signatures</option>
  <option value="SIGNED">Signed</option>
  <option value="RELEASING">Releasing</option>
  <option value="DISBURSED">Disbursed</option>
  <option value="COMPLETED">Completed</option>
  <option value="TO_LOS">Routed to LOS</option>
</select>
```

#### Update Status Badge Colors

```tsx
const getStatusBadge = (status: string) => {
  const colors = {
    SCREENING: 'bg-purple-100 text-purple-800',
    UNDERWRITING: 'bg-indigo-100 text-indigo-800',
    DECISION_PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    DOCUMENT_PREPARATION: 'bg-blue-100 text-blue-800',
    AWAITING_SIGNATURES: 'bg-orange-100 text-orange-800',
    SIGNED: 'bg-teal-100 text-teal-800',
    RELEASING: 'bg-cyan-100 text-cyan-800',
    DISBURSED: 'bg-emerald-100 text-emerald-800',
    COMPLETED: 'bg-green-100 text-green-800',
    TO_LOS: 'bg-gray-100 text-gray-800',
  };
  return colors[status as keyof typeof colors] || colors.SCREENING;
};
```

#### Add Status Duration Column

```tsx
// Add to table headers
<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  Time in Status
</th>

// Add to table body
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  {calculateDuration(app.statusChangedAt)}
</td>
```

### 4.5 API Route Updates

**File**: `app/api/applications/[id]/route.ts`

#### Add Status Validation Logic

```typescript
// New function to validate status transitions
const validateStatusTransition = (currentStatus: string, newStatus: string): boolean => {
  const validTransitions: Record<string, string[]> = {
    SCREENING: ['UNDERWRITING', 'REJECTED', 'TO_LOS'],
    UNDERWRITING: ['DECISION_PENDING', 'REJECTED', 'TO_LOS'],
    DECISION_PENDING: ['APPROVED', 'REJECTED'],
    APPROVED: ['DOCUMENT_PREPARATION'],
    DOCUMENT_PREPARATION: ['AWAITING_SIGNATURES'],
    AWAITING_SIGNATURES: ['SIGNED'],
    SIGNED: ['RELEASING'],
    RELEASING: ['DISBURSED'],
    DISBURSED: ['COMPLETED'],
    // TO_LOS and REJECTED are terminal states
    TO_LOS: [],
    REJECTED: [],
    COMPLETED: [],
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

// Update PATCH handler to include validation
if (data.status) {
  if (!validateStatusTransition(application.status, data.status)) {
    return NextResponse.json(
      { error: `Invalid status transition from ${application.status} to ${data.status}` },
      { status: 400 }
    );
  }

  // Log status history
  await prisma.statusHistory.create({
    data: {
      applicationId: id,
      fromStatus: application.status,
      toStatus: data.status,
      reason: data.statusReason,
      notes: data.statusNotes,
      changedBy: data.userId,
    },
  });
}
```

### 4.6 New Components to Create

#### Status Helper Functions

**File**: `lib/statusHelpers.ts`

```typescript
export const getAvailableStatuses = (currentStatus: string): string[] => {
  const transitions: Record<string, string[]> = {
    SCREENING: ['UNDERWRITING', 'REJECTED', 'TO_LOS'],
    UNDERWRITING: ['DECISION_PENDING', 'REJECTED', 'TO_LOS'],
    DECISION_PENDING: ['APPROVED', 'REJECTED'],
    APPROVED: ['DOCUMENT_PREPARATION'],
    DOCUMENT_PREPARATION: ['AWAITING_SIGNATURES'],
    AWAITING_SIGNATURES: ['SIGNED'],
    SIGNED: ['RELEASING'],
    RELEASING: ['DISBURSED'],
    DISBURSED: ['COMPLETED'],
    TO_LOS: [],
    REJECTED: [],
    COMPLETED: [],
  };

  return transitions[currentStatus] || [];
};

export const getStatusDescription = (status: string): string => {
  const descriptions: Record<string, string> = {
    SCREENING: 'Your application is being reviewed for initial eligibility and completeness.',
    UNDERWRITING: 'We are analyzing your credit profile and assessing the loan risk.',
    DECISION_PENDING: 'Your application is awaiting final approval from our lending team.',
    APPROVED: 'Congratulations! Your loan has been approved. Documents will be prepared shortly.',
    REJECTED: 'Unfortunately, we cannot approve your loan at this time.',
    DOCUMENT_PREPARATION: 'We are preparing your loan documents for signature.',
    AWAITING_SIGNATURES: 'Your documents are ready. Please review and sign them.',
    SIGNED: 'Documents received! We are preparing to release your funds.',
    RELEASING: 'Final compliance checks are being completed before disbursement.',
    DISBURSED: 'Your loan funds have been sent to your account.',
    COMPLETED: 'Your loan has been successfully completed.',
    TO_LOS: 'Your application requires specialized review and has been routed to our loan origination team.',
  };

  return descriptions[status] || 'Processing your application...';
};

export const getNextSteps = (status: string): string[] => {
  const steps: Record<string, string[]> = {
    SCREENING: [
      'We verify your basic eligibility',
      'Credit check will be performed',
      'You may be asked for additional documents',
    ],
    UNDERWRITING: [
      'Detailed credit analysis in progress',
      'Income verification',
      'Decision expected within 24-48 hours',
    ],
    APPROVED: [
      'Loan documents will be generated',
      'You will receive an email to sign documents',
      'Funds will be disbursed after signing',
    ],
    // ... add for all statuses
  };

  return steps[status] || ['Your application is being processed'];
};

export const getEstimatedCompletion = (status: string): string => {
  const estimates: Record<string, string> = {
    SCREENING: '5-7 business days',
    UNDERWRITING: '3-5 business days',
    DECISION_PENDING: '1-2 business days',
    APPROVED: '1 business day',
    DOCUMENT_PREPARATION: 'Same day',
    AWAITING_SIGNATURES: 'Waiting for your action',
    SIGNED: '1 business day',
    RELEASING: 'Same day',
    DISBURSED: 'Same day',
    COMPLETED: 'Complete',
    TO_LOS: '7-10 business days',
    REJECTED: 'N/A',
  };

  return estimates[status] || 'TBD';
};
```

---

## 5. Implementation Priority

### Priority 1: Core Status Workflow (Must Have for Demo)
1. ✅ Update database schema with new statuses
2. ✅ Add status dropdown to replace action buttons
3. ✅ Implement status validation logic
4. ✅ Update status badge colors and displays
5. ✅ Add basic status descriptions for members

### Priority 2: Visual Enhancements (High Impact)
1. ⏳ Add workflow progress visualization
2. ⏳ Implement status timeline for members
3. ⏳ Add "what happens next" messaging
4. ⏳ Create action center for members

### Priority 3: Document Management (Key Feature)
1. ⏳ Document generation interface mockup
2. ⏳ Signature tracking dashboard
3. ⏳ eSignature integration UI (mockup)

### Priority 4: Advanced Features (Nice to Have)
1. ⏳ Disbursement management interface
2. ⏳ LOS routing panel
3. ⏳ Pre-disbursement checklists
4. ⏳ Status duration tracking
5. ⏳ Compliance checkpoints

---

## 6. Success Metrics for Prototype

The prototype should effectively demonstrate:

1. **Clear Status Visibility**: Both staff and members can immediately understand where an application stands
2. **Workflow Efficiency**: Logical progression through statuses with clear handoffs
3. **Compliance Readiness**: Audit trail and documentation at each step
4. **Scalability**: Ability to handle complex routing (TO_LOS) and exceptions
5. **User Experience**: Members understand what's happening and what they need to do

---

## 7. Notes for Stakeholder Presentation

### Key Talking Points
- Each status represents a distinct business process with clear ownership
- TO_LOS routing provides flexibility for complex cases
- Document management and eSignature integration streamline the closing process
- Disbursement tracking ensures funds are properly released and confirmed
- Complete audit trail for compliance and reporting

### Demo Scenarios to Prepare
1. **Happy Path**: Application flows smoothly from SCREENING to COMPLETED
2. **LOS Routing**: Complex case identified during SCREENING, routed to LOS
3. **Document Workflow**: Show document generation, sending, and signature tracking
4. **Member Experience**: Walk through what members see at each status

### Questions to Address
- How are notifications handled at each status change?
- What permissions control who can change statuses?
- How does the system integrate with existing LOS?
- What reporting capabilities are needed?
- How are SLAs and timeouts handled?

---

## 8. Technical Considerations

### Frontend
- All changes are UI/UX focused for demonstration
- Use mock data for document templates and eSignature integration
- Implement client-side status validation for immediate feedback

### Backend
- Status transition validation in API routes
- Activity logging for all status changes
- Status history tracking for audit trails

### Database
- Minimal schema changes to support new fields
- Consider migration strategy for existing data

---

## Appendix A: Status Transition Matrix

| From Status | Can Transition To |
|------------|------------------|
| SCREENING | UNDERWRITING, REJECTED, TO_LOS |
| UNDERWRITING | DECISION_PENDING, REJECTED, TO_LOS |
| DECISION_PENDING | APPROVED, REJECTED |
| APPROVED | DOCUMENT_PREPARATION |
| REJECTED | (Terminal State) |
| DOCUMENT_PREPARATION | AWAITING_SIGNATURES |
| AWAITING_SIGNATURES | SIGNED |
| SIGNED | RELEASING |
| RELEASING | DISBURSED |
| DISBURSED | COMPLETED |
| COMPLETED | (Terminal State) |
| TO_LOS | (Terminal State - Managed Externally) |

---

## Appendix B: Role-Based Permissions

| Role | Allowed Status Changes |
|------|----------------------|
| Loan Officer | SCREENING → UNDERWRITING, TO_LOS |
| Underwriter | UNDERWRITING → DECISION_PENDING, REJECTED, TO_LOS |
| Manager | Any transition |
| Processor | DOCUMENT_PREPARATION → AWAITING_SIGNATURES |
| Disbursement Officer | RELEASING → DISBURSED, DISBURSED → COMPLETED |

---

*End of Requirements Document*