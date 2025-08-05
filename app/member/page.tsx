import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Header from '@/components/ui/Header';
import Link from 'next/link';

export default async function MemberDashboard() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'member') {
    redirect('/');
  }

  const applications = await prisma.loanApplication.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      denied: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userName={user.name} />

      <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg opacity-90">{today}</p>
              <h1 className="text-3xl font-bold mt-1">Welcome, {user.name.split(' ')[0]}</h1>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">MY APPLICATIONS</h2>
            <Link href="/member/apply" className="btn-primary">
              Apply for New Loan
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500 mb-4">
                You haven't submitted any loan applications yet.
              </p>
              <Link href="/member/apply" className="btn-primary inline-block">
                Start Your First Application
              </Link>
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
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
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
                    <tr key={app.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {app.applicationNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {app.product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${app.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(app.status)}`}>
                          {app.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(app.submittedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {app.status === 'draft' ? (
                          <Link
                            href={`/member/apply/${app.id}`}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                          >
                            Continue
                          </Link>
                        ) : (
                          <Link
                            href={`/member/applications/${app.id}`}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                          >
                            View
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}