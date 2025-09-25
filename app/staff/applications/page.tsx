import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Header from '@/components/ui/Header';
import Link from 'next/link';
import { getStatusBadgeColor, calculateDuration } from '@/lib/statusHelpers';

export default async function ApplicationsPage() {
  const user = await getCurrentUser();

  if (!user || user.role === 'member') {
    redirect('/');
  }

  const applications = await prisma.loanApplication.findMany({
    where: {
      status: {
        notIn: ['draft']
      }
    },
    include: {
      user: true,
      product: true,
    },
    orderBy: { submittedAt: 'desc' },
  });

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showSettings={user.role === 'admin'} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Applications</h1>
          <div className="flex gap-4">
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
              {/* Legacy statuses */}
              <option value="">---</option>
              <option value="submitted">Submitted (Legacy)</option>
              <option value="under_review">Under Review (Legacy)</option>
              <option value="approved">Approved (Legacy)</option>
              <option value="denied">Denied (Legacy)</option>
            </select>
            <select className="input">
              <option value="">All Products</option>
              <option value="personal">Personal Loan</option>
              <option value="auto">Auto Loan</option>
              <option value="heloc">HELOC</option>
            </select>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No applications found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Income
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time in Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {app.applicationNumber}
                      {app.losReferenceNumber && (
                        <span className="block text-xs text-gray-500">
                          LOS: {app.losReferenceNumber}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {app.user.name}
                      <div className="text-xs text-gray-500">{app.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${app.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${app.annualIncome?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(app.status)}`}>
                        {app.status.replace(/_/g, ' ')}
                      </span>
                      {app.status === 'TO_LOS' && (
                        <span className="block text-xs text-gray-500 mt-1">
                          {app.losRoutingReason || 'Specialized Review'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {calculateDuration(app.statusChangedAt || app.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(app.submittedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/staff/applications/${app.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Status Summary Cards */}
        <div className="mt-8 grid grid-cols-4 gap-4">
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">In Screening</h3>
            <p className="text-2xl font-bold text-purple-600">
              {applications.filter(a => a.status === 'SCREENING').length}
            </p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Underwriting</h3>
            <p className="text-2xl font-bold text-indigo-600">
              {applications.filter(a => a.status === 'UNDERWRITING').length}
            </p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Decision</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {applications.filter(a => a.status === 'DECISION_PENDING').length}
            </p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Awaiting Signatures</h3>
            <p className="text-2xl font-bold text-orange-600">
              {applications.filter(a => a.status === 'AWAITING_SIGNATURES').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}