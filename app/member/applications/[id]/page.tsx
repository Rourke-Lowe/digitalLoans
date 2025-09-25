import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Header from '@/components/ui/Header';
import {
  getStatusBadgeColor,
  getStatusDescription,
  getStatusTitle,
  getNextSteps,
  getEstimatedCompletion,
  getStatusSteps
} from '@/lib/statusHelpers';

export default async function ApplicationViewPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'member') {
    redirect('/');
  }

  const { id } = await params;

  const application = await prisma.loanApplication.findUnique({
    where: { id },
    include: {
      product: true,
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      activities: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!application || application.userId !== user.id) {
    redirect('/member');
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const latestReview = application.reviews[0];
  const statusSteps = getStatusSteps(application.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userName={user.name} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Details</h1>
        <p className="text-gray-600 mb-8">Application #{application.applicationNumber}</p>

        {/* Enhanced Status Card with Timeline */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Application Progress</h2>

          {/* Visual Progress Timeline */}
          <div className="mb-6">
            <div className="flex justify-between relative">
              {statusSteps.map((step, index) => (
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
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">{getStatusTitle(application.status)}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(application.status)}`}>
                {application.status.replace(/_/g, ' ')}
              </span>
            </div>
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

          {/* Review Notes if Available */}
          {latestReview && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium mb-2">Latest Update:</p>
              <p className="text-gray-700">{latestReview.notes}</p>
              <p className="text-sm text-gray-500 mt-2">
                Updated on {formatDate(latestReview.createdAt)}
              </p>
            </div>
          )}
        </div>

        {/* Member Action Center */}
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
                  <span className="text-sm text-orange-600">Pending Signature</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Truth in Lending Disclosure</span>
                  <span className="text-sm text-orange-600">Pending Signature</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Auto-Debit Authorization</span>
                  <span className="text-sm text-orange-600">Pending Signature</span>
                </div>
              </div>
            </div>
          )}

          {application.status === 'APPROVED' && (
            <div className="p-4 bg-green-50 border-l-4 border-green-400">
              <h3 className="font-medium text-green-900 mb-2">🎉 Congratulations! Your loan is approved</h3>
              <p className="text-sm text-green-700">
                We're preparing your loan documents. You'll receive an email when they're ready for signature.
              </p>
            </div>
          )}

          {application.status === 'DISBURSED' && (
            <div className="p-4 bg-blue-50 border-l-4 border-blue-400">
              <h3 className="font-medium text-blue-900 mb-2">Funds Disbursed</h3>
              <p className="text-sm text-blue-700 mb-3">
                Your loan funds have been sent to your account ending in ****4567. Please confirm receipt.
              </p>
              <button className="btn-primary">Confirm Fund Receipt</button>
            </div>
          )}

          {application.status === 'REJECTED' && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400">
              <h3 className="font-medium text-red-900 mb-2">Application Decision</h3>
              <p className="text-sm text-red-700 mb-3">
                Unfortunately, we cannot approve your loan application at this time. Please review the decision letter for more details.
              </p>
              <button className="btn-secondary">View Decision Letter</button>
            </div>
          )}

          {application.status === 'TO_LOS' && (
            <div className="p-4 bg-gray-50 border-l-4 border-gray-400">
              <h3 className="font-medium text-gray-900 mb-2">Specialized Review</h3>
              <p className="text-sm text-gray-700">
                Your application requires specialized review and has been routed to our loan origination team.
                {application.losReferenceNumber && ` Reference: ${application.losReferenceNumber}`}
              </p>
            </div>
          )}

          {application.status === 'COMPLETED' && (
            <div className="p-4 bg-green-50 border-l-4 border-green-400">
              <h3 className="font-medium text-green-900 mb-2">✓ Loan Successfully Completed</h3>
              <p className="text-sm text-green-700 mb-3">
                Your loan has been successfully disbursed and completed. All documents are available for download below.
              </p>
              <button className="btn-secondary">Download Loan Documents</button>
            </div>
          )}

          {/* No actions required for other statuses */}
          {!['AWAITING_SIGNATURES', 'APPROVED', 'DISBURSED', 'REJECTED', 'TO_LOS', 'COMPLETED'].includes(application.status) && (
            <p className="text-gray-500">No actions required at this time. We'll notify you when your application progresses.</p>
          )}
        </div>

        {/* Loan Details */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Loan Details</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Product</p>
              <p className="font-medium">{application.product.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Amount</p>
              <p className="font-medium">${application.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Term</p>
              <p className="font-medium">{application.term} months</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly Payment</p>
              <p className="font-medium">${application.monthlyPayment?.toFixed(2) || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Purpose</p>
              <p className="font-medium">{application.purpose}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Interest Rate</p>
              <p className="font-medium">{application.product.interestRate}% APR</p>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Activity Timeline</h2>
          <div className="space-y-4">
            {application.activities.map((activity, index) => (
              <div key={activity.id} className="flex items-start">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="font-medium">
                    {activity.action.replace(/_/g, ' ').toUpperCase()}
                  </p>
                  {activity.details && (
                    <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}