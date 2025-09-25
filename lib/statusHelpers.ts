// Helper functions for loan status workflow

export type LoanStatus =
  | 'SCREENING'
  | 'UNDERWRITING'
  | 'DECISION_PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'DOCUMENT_PREPARATION'
  | 'AWAITING_SIGNATURES'
  | 'SIGNED'
  | 'RELEASING'
  | 'DISBURSED'
  | 'COMPLETED'
  | 'TO_LOS';

export const getAvailableStatuses = (currentStatus: string): string[] => {
  const transitions: Record<string, string[]> = {
    SCREENING: ['UNDERWRITING', 'REJECTED', 'TO_LOS'],
    UNDERWRITING: ['DECISION_PENDING', 'REJECTED', 'TO_LOS'],
    DECISION_PENDING: ['APPROVED', 'REJECTED'],
    APPROVED: ['DOCUMENT_PREPARATION'],
    REJECTED: [],
    DOCUMENT_PREPARATION: ['AWAITING_SIGNATURES'],
    AWAITING_SIGNATURES: ['SIGNED'],
    SIGNED: ['RELEASING'],
    RELEASING: ['DISBURSED'],
    DISBURSED: ['COMPLETED'],
    COMPLETED: [],
    TO_LOS: [],
    // Legacy statuses for backward compatibility
    draft: ['SCREENING'],
    submitted: ['SCREENING', 'UNDERWRITING'],
    under_review: ['DECISION_PENDING', 'REJECTED'],
    approved: ['DOCUMENT_PREPARATION'],
    denied: ['REJECTED'],
  };

  return transitions[currentStatus] || [];
};

export const validateStatusTransition = (currentStatus: string, newStatus: string): boolean => {
  const availableStatuses = getAvailableStatuses(currentStatus);
  return availableStatuses.includes(newStatus);
};

export const getStatusBadgeColor = (status: string): string => {
  const colors: Record<string, string> = {
    // New statuses
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
    // Legacy statuses
    draft: 'bg-gray-100 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    denied: 'bg-red-100 text-red-800',
    withdrawn: 'bg-gray-100 text-gray-800',
  };

  return colors[status] || 'bg-gray-100 text-gray-800';
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

export const getStatusTitle = (status: string): string => {
  const titles: Record<string, string> = {
    SCREENING: 'Initial Review',
    UNDERWRITING: 'Credit Analysis',
    DECISION_PENDING: 'Awaiting Decision',
    APPROVED: 'Loan Approved',
    REJECTED: 'Application Declined',
    DOCUMENT_PREPARATION: 'Preparing Documents',
    AWAITING_SIGNATURES: 'Signature Required',
    SIGNED: 'Documents Signed',
    RELEASING: 'Releasing Funds',
    DISBURSED: 'Funds Sent',
    COMPLETED: 'Loan Complete',
    TO_LOS: 'Specialized Review',
  };

  return titles[status] || status.replace(/_/g, ' ');
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
    DECISION_PENDING: [
      'Final review by lending committee',
      'Decision will be made shortly',
      'You will be notified via email',
    ],
    APPROVED: [
      'Loan documents will be generated',
      'You will receive an email to sign documents',
      'Funds will be disbursed after signing',
    ],
    DOCUMENT_PREPARATION: [
      'Documents are being prepared',
      'You will receive signing instructions soon',
      'Review documents carefully before signing',
    ],
    AWAITING_SIGNATURES: [
      'Review all documents carefully',
      'Complete electronic signature',
      'Contact us if you have questions',
    ],
    SIGNED: [
      'Final compliance review',
      'Disbursement will be initiated',
      'Funds will arrive in your account soon',
    ],
    RELEASING: [
      'Final checks in progress',
      'Disbursement being processed',
      'You will receive confirmation shortly',
    ],
    DISBURSED: [
      'Check your account for funds',
      'Confirm receipt of funds',
      'First payment information will follow',
    ],
    COMPLETED: [
      'Loan successfully completed',
      'All documents are available in your portal',
      'Thank you for your business',
    ],
    TO_LOS: [
      'Specialized team reviewing your application',
      'Additional time may be required',
      'We will contact you with updates',
    ],
    REJECTED: [
      'Review the decision letter for details',
      'You may reapply after addressing concerns',
      'Contact us to discuss options',
    ],
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

export const getProgressPercentage = (status: string): number => {
  const progress: Record<string, number> = {
    SCREENING: 10,
    UNDERWRITING: 20,
    DECISION_PENDING: 30,
    APPROVED: 40,
    DOCUMENT_PREPARATION: 50,
    AWAITING_SIGNATURES: 60,
    SIGNED: 70,
    RELEASING: 80,
    DISBURSED: 90,
    COMPLETED: 100,
    TO_LOS: 15,
    REJECTED: 100,
  };

  return progress[status] || 0;
};

export const getStatusSteps = (currentStatus: string) => {
  const allSteps = [
    { name: 'SCREENING', label: 'Screening' },
    { name: 'UNDERWRITING', label: 'Underwriting' },
    { name: 'DECISION_PENDING', label: 'Decision' },
    { name: 'APPROVED', label: 'Approved' },
    { name: 'DOCUMENT_PREPARATION', label: 'Documents' },
    { name: 'AWAITING_SIGNATURES', label: 'Sign' },
    { name: 'SIGNED', label: 'Signed' },
    { name: 'RELEASING', label: 'Releasing' },
    { name: 'DISBURSED', label: 'Disbursed' },
    { name: 'COMPLETED', label: 'Complete' },
  ];

  const currentIndex = allSteps.findIndex(step => step.name === currentStatus);

  return allSteps.map((step, index) => ({
    ...step,
    status: index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'pending',
  }));
};

export const getStageStatus = (stage: string, currentStatus: string): 'completed' | 'current' | 'pending' => {
  const stageMap: Record<string, string[]> = {
    SCREENING: ['SCREENING'],
    UNDERWRITING: ['UNDERWRITING'],
    DECISION: ['DECISION_PENDING'],
    DOCUMENTS: ['APPROVED', 'DOCUMENT_PREPARATION'],
    SIGNATURES: ['AWAITING_SIGNATURES'],
    RELEASING: ['SIGNED', 'RELEASING'],
    DISBURSED: ['DISBURSED'],
    COMPLETED: ['COMPLETED'],
  };

  const stages = Object.keys(stageMap);
  const currentStageIndex = stages.findIndex(s => stageMap[s].includes(currentStatus));
  const targetStageIndex = stages.findIndex(s => s === stage);

  if (targetStageIndex < currentStageIndex) return 'completed';
  if (targetStageIndex === currentStageIndex) return 'current';
  return 'pending';
};

export const getStatusReasons = (fromStatus: string, toStatus: string): string[] => {
  const reasons: Record<string, string[]> = {
    'SCREENING_UNDERWRITING': [
      'Passed initial screening',
      'All required documents received',
      'Eligible for credit review',
    ],
    'SCREENING_REJECTED': [
      'Incomplete application',
      'Missing required documents',
      'Does not meet eligibility criteria',
      'Citizenship/residency requirements not met',
    ],
    'SCREENING_TO_LOS': [
      'Complex income structure',
      'Self-employed applicant',
      'Multiple properties involved',
      'Requires manual underwriting',
    ],
    'UNDERWRITING_DECISION_PENDING': [
      'Credit review complete',
      'Risk assessment acceptable',
      'Ready for final decision',
    ],
    'UNDERWRITING_REJECTED': [
      'Credit score below threshold',
      'Debt-to-income ratio too high',
      'Insufficient income',
      'Negative credit history',
    ],
    'UNDERWRITING_TO_LOS': [
      'Requires manual underwriting',
      'Exception review needed',
      'Complex financial situation',
      'Policy override required',
    ],
    'DECISION_PENDING_APPROVED': [
      'Meets all lending criteria',
      'Committee approval granted',
      'Manager override approved',
    ],
    'DECISION_PENDING_REJECTED': [
      'Does not meet lending policy',
      'Committee declined',
      'Risk too high',
    ],
  };

  const key = `${fromStatus}_${toStatus}`;
  return reasons[key] || ['Status change reason'];
};

export const calculateDuration = (date: Date | null): string => {
  if (!date) return 'N/A';

  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  return `${hours}h`;
};

export const canUserChangeStatus = (userRole: string, fromStatus: string, toStatus: string): boolean => {
  const permissions: Record<string, string[]> = {
    staff: [
      'SCREENING_UNDERWRITING',
      'SCREENING_REJECTED',
      'SCREENING_TO_LOS',
      'DOCUMENT_PREPARATION_AWAITING_SIGNATURES',
      'SIGNED_RELEASING',
    ],
    admin: ['*'], // Admin can make any status change
    member: [], // Members cannot change status
  };

  if (userRole === 'admin') return true;

  const transition = `${fromStatus}_${toStatus}`;
  return permissions[userRole]?.includes(transition) || false;
};