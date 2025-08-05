'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import { LoanApplication, LoanProduct, User, Document, ApplicationReview, ApplicationActivity, CreditUnionSettings } from '@prisma/client';

interface ReviewInterfaceProps {
  application: LoanApplication & {
    user: User;
    product: LoanProduct;
    documents: Document[];
    reviews: (ApplicationReview & { reviewer: User })[];
    activities: (ApplicationActivity & { user: User })[];
  };
  currentUser: User;
  settings: CreditUnionSettings | null;
}

export default function ReviewInterface({ application, currentUser, settings }: ReviewInterfaceProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decision, setDecision] = useState<'approved' | 'denied' | 'more_info_needed' | ''>('');

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setLoading(true);
    try {
      await fetch(`/api/applications/${application.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (newStatus === 'under_review') {
        router.refresh();
      }
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async () => {
    if (!decision || !notes) {
      alert('Please select a decision and add notes');
      return;
    }

    setLoading(true);
    try {
      await fetch(`/api/applications/${application.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          notes,
          reviewerId: currentUser.id,
        }),
      });

      setShowDecisionModal(false);
      router.push('/staff');
    } catch (error) {
      alert('Failed to submit decision');
    } finally {
      setLoading(false);
    }
  };

  const getKYCStatus = () => {
    const hasId = application.documents.some(d => d.type === 'id_front' || d.type === 'id_back');
    const hasPayStub = application.documents.some(d => d.type === 'pay_stub');
    return hasId && hasPayStub ? 'COMPLETED' : 'PENDING';
  };

  const calculateDebtRatio = () => {
    if (!application.annualIncome || !application.monthlyPayment) return 0;
    const monthlyIncome = application.annualIncome / 12;
    return ((application.monthlyPayment / monthlyIncome) * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showSettings={currentUser.role === 'admin'} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/staff/applications')}
              className="mr-4"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DETAILS: {application.user.name.toUpperCase()}</h1>
            </div>
          </div>
        </div>

        {/* Request Summary Card */}
        <div className="card mb-8">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                REQUEST - {formatDate(application.submittedAt)}
              </p>
              <p className="text-lg">
                <span className="font-medium">From:</span> {application.user.name}
              </p>
              <p className="text-lg">
                <span className="font-medium">Account Applied For:</span> {application.product.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">KYC</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  getKYCStatus() === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {getKYCStatus() === 'COMPLETED' ? '✓ AML/PEP' : 'PENDING'}
                </span>
                <button className="text-primary-600 text-sm font-medium">VIEW</button>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            {application.status === 'submitted' && (
              <button
                onClick={() => handleStatusUpdate('under_review')}
                disabled={loading}
                className="btn-secondary"
              >
                START REVIEW
              </button>
            )}
            {application.status === 'under_review' && (
              <>
                <button
                  onClick={() => setShowDecisionModal(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  REQUEST MORE INFO
                </button>
                <button
                  onClick={() => {
                    setDecision('denied');
                    setShowDecisionModal(true);
                  }}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  DENY
                </button>
                <button
                  onClick={() => {
                    setDecision('approved');
                    setShowDecisionModal(true);
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  APPROVE
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Personal Info */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="font-semibold text-lg mb-4">REGISTRATION INFO</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Legal Name</p>
                  <p className="font-medium">{application.firstName} {application.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-medium">{application.dateOfBirth || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Home Address</p>
                  <p className="font-medium">{application.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{application.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="font-medium">{application.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Employment & Financial */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="font-semibold text-lg mb-4">EMPLOYMENT</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Employer Name</p>
                  <p className="font-medium">{application.employerName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Employment Status</p>
                  <p className="font-medium">{application.employmentStatus || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-medium">{application.employmentDuration || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Occupation</p>
                  <p className="font-medium">Not specified</p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-lg mb-4">FINANCIAL INFO</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Annual Income</p>
                  <p className="font-medium text-lg">${application.annualIncome?.toLocaleString() || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Requested Amount</p>
                  <p className="font-medium text-lg">${application.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monthly Payment</p>
                  <p className="font-medium">${application.monthlyPayment?.toFixed(2) || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Debt-to-Income Ratio</p>
                  <p className="font-medium">{calculateDebtRatio()}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Documents */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="font-semibold text-lg mb-4">ID & DOCUMENTS</h3>
              <div className="space-y-3">
                {application.documents.map((doc) => (
                  <div key={doc.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{doc.type.replace('_', ' ').toUpperCase()}</p>
                      <p className="text-sm text-gray-600">{doc.fileName}</p>
                    </div>
                    <button className="text-primary-600 text-sm font-medium">VIEW</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-lg mb-4">ACTIVITY LOG</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {application.activities.map((activity) => (
                  <div key={activity.id} className="text-sm">
                    <p className="font-medium">{activity.action.replace('_', ' ').toUpperCase()}</p>
                    <p className="text-gray-600">
                      by {activity.user.name} • {formatDate(activity.createdAt)}
                    </p>
                    {activity.details && (
                      <p className="text-gray-500 mt-1">{activity.details}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Decision Modal */}
        {showDecisionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">
                {decision === 'approved' ? 'Approve Application' : 
                 decision === 'denied' ? 'Deny Application' : 
                 'Request More Information'}
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes or reason for decision..."
                className="w-full h-32 p-3 border rounded-lg mb-4"
                required
              />
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDecisionModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDecision}
                  disabled={loading || !notes}
                  className={`flex-1 px-4 py-2 rounded-lg text-white ${
                    decision === 'approved' ? 'bg-green-600 hover:bg-green-700' :
                    decision === 'denied' ? 'bg-red-600 hover:bg-red-700' :
                    'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}