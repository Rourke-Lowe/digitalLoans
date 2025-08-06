import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Header from '@/components/ui/Header';

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

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'text-gray-600',
      submitted: 'text-blue-600',
      under_review: 'text-yellow-600',
      approved: 'text-green-600',
      denied: 'text-red-600',
      withdrawn: 'text-gray-600',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600';
  };

  const latestReview = application.reviews[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userName={user.name} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Details</h1>
        <p className="text-gray-600 mb-8">Application #{application.applicationNumber}</p>

        {/* Status Card */}
        <div className="card mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold mb-2">Current Status</h2>
              <p className={`text-2xl font-bold ${getStatusColor(application.status)}`}>
                {application.status.replace('_', ' ').toUpperCase()}
              </p>
              {latestReview && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-2">Decision Notes:</p>
                  <p className="text-gray-700">{latestReview.notes}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Reviewed on {formatDate(latestReview.createdAt)}
                  </p>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Submitted</p>
              <p className="font-medium">{formatDate(application.submittedAt)}</p>
            </div>
          </div>
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