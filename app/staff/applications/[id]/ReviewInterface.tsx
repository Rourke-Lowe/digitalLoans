'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import FieldWithChangeIndicator from '@/components/ui/FieldWithChangeIndicator';
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
  const [showAllChanges, setShowAllChanges] = useState(false);

  // Parse Universa data and changed fields
  const universaData = application.universaData ? JSON.parse(application.universaData) : null;
  const changedFields = application.changedFields ? JSON.parse(application.changedFields) : [];
  const isExistingMember = !!universaData;
  
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
    const otherDebts = parseFloat(application.otherMonthlyDebts || '0');
    const housingCost = parseFloat(application.monthlyHousingCost || '0');
    const totalDebts = (application.monthlyPayment || 0) + otherDebts + housingCost;
    return ((totalDebts / monthlyIncome) * 100).toFixed(1);
  };

  const formatAddress = () => {
    const parts = [];
    if (application.streetNumber) parts.push(application.streetNumber);
    if (application.streetName) parts.push(application.streetName);
    if (application.unit) parts.push(application.unit);
    const street = parts.join(' ');
    
    const cityParts = [];
    if (application.city) cityParts.push(application.city);
    if (application.province) cityParts.push(application.province);
    if (application.postalCode) cityParts.push(application.postalCode);
    const cityLine = cityParts.join(', ');
    
    return street && cityLine ? `${street}, ${cityLine}` : street || cityLine || 'N/A';
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
              {isExistingMember && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                  Existing Member - Profile Data Available
                </span>
              )}
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
              {changedFields.length > 0 && (
                <div className="mt-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    ⚠️ {changedFields.length} fields updated from profile
                  </span>
                  <button
                    onClick={() => setShowAllChanges(!showAllChanges)}
                    className="ml-2 text-xs text-primary-600 hover:text-primary-700 underline"
                  >
                    {showAllChanges ? 'Hide' : 'View'} all changes
                  </button>
                </div>
              )}
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

          {/* Changes Summary */}
          {showAllChanges && changedFields.length > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-3">Fields Changed from Universa Profile</h4>
              <div className="space-y-2">
                {changedFields.map((field: string) => {
                  const fieldLabels: Record<string, string> = {
                    firstName: 'First Name',
                    lastName: 'Last Name',
                    email: 'Email',
                    phone: 'Phone',
                    dateOfBirth: 'Date of Birth',
                    sin: 'SIN',
                    citizenshipStatus: 'Citizenship Status',
                    streetNumber: 'Street Number',
                    streetName: 'Street Name',
                    unit: 'Unit',
                    city: 'City',
                    province: 'Province',
                    postalCode: 'Postal Code',
                    employerName: 'Employer',
                    annualIncome: 'Annual Income',
                    monthlyHousingCost: 'Monthly Housing Cost',
                    // Add more mappings as needed
                  };
                  
                  return (
                    <div key={field} className="flex items-center justify-between bg-white p-2 rounded">
                      <span className="text-sm font-medium">{fieldLabels[field] || field}</span>
                      <div className="text-sm">
                        <span className="text-gray-500">From: </span>
                        <span className="font-medium text-gray-700">{universaData?.[field] || 'N/A'}</span>
                        <span className="mx-2">→</span>
                        <span className="font-medium text-yellow-700">{(application as any)[field] || 'N/A'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Personal & Contact Info */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="font-semibold text-lg mb-4">PERSONAL INFORMATION</h3>
              <div className="space-y-3">
                <FieldWithChangeIndicator
                  label="First Name"
                  value={application.firstName}
                  originalValue={universaData?.firstName}
                  isChanged={changedFields.includes('firstName')}
                />
                <FieldWithChangeIndicator
                  label="Last Name"
                  value={application.lastName}
                  originalValue={universaData?.lastName}
                  isChanged={changedFields.includes('lastName')}
                />
                <FieldWithChangeIndicator
                  label="Date of Birth"
                  value={application.dateOfBirth}
                  originalValue={universaData?.dateOfBirth}
                  isChanged={changedFields.includes('dateOfBirth')}
                />
                <FieldWithChangeIndicator
                  label="SIN"
                  value={application.sin}
                  originalValue={universaData?.sin}
                  isChanged={changedFields.includes('sin')}
                />
                <FieldWithChangeIndicator
                  label="Citizenship Status"
                  value={application.citizenshipStatus}
                  originalValue={universaData?.citizenshipStatus}
                  isChanged={changedFields.includes('citizenshipStatus')}
                />
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-lg mb-4">CONTACT INFORMATION</h3>
              <div className="space-y-3">
                <FieldWithChangeIndicator
                  label="Email"
                  value={application.user.email}
                  originalValue={universaData?.email}
                  isChanged={changedFields.includes('email')}
                />
                <FieldWithChangeIndicator
                  label="Phone"
                  value={application.phone}
                  originalValue={universaData?.phone}
                  isChanged={changedFields.includes('phone')}
                />
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-lg mb-4">ADDRESS</h3>
              <div className="space-y-3">
                <FieldWithChangeIndicator
                  label="Current Address"
                  value={formatAddress()}
                  originalValue={universaData ? `${universaData.streetNumber || ''} ${universaData.streetName || ''} ${universaData.unit || ''}, ${universaData.city || ''}, ${universaData.province || ''} ${universaData.postalCode || ''}`.trim() : undefined}
                  isChanged={changedFields.some((f: string) => ['streetNumber', 'streetName', 'unit', 'city', 'province', 'postalCode'].includes(f))}
                />
                <FieldWithChangeIndicator
                  label="Time at Address"
                  value={`${application.yearsAtAddress || 0} years, ${application.monthsAtAddress || 0} months`}
                  originalValue={universaData ? `${universaData.yearsAtAddress || 0} years, ${universaData.monthsAtAddress || 0} months` : undefined}
                  isChanged={changedFields.includes('yearsAtAddress') || changedFields.includes('monthsAtAddress')}
                />
              </div>
            </div>
          </div>

          {/* Column 2: Employment & Financial */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="font-semibold text-lg mb-4">EMPLOYMENT</h3>
              <div className="space-y-3">
                <FieldWithChangeIndicator
                  label="Employer Name"
                  value={application.employerName}
                  originalValue={universaData?.employerName}
                  isChanged={changedFields.includes('employerName')}
                />
                <FieldWithChangeIndicator
                  label="Employment Status"
                  value={application.employmentStatus}
                  originalValue={universaData?.employmentStatus}
                  isChanged={changedFields.includes('employmentStatus')}
                />
                <FieldWithChangeIndicator
                  label="Time with Employer"
                  value={`${application.employmentYears || 0} years, ${application.employmentMonths || 0} months`}
                  originalValue={universaData ? `${universaData.employmentYears || 0} years, ${universaData.employmentMonths || 0} months` : undefined}
                  isChanged={changedFields.includes('employmentYears') || changedFields.includes('employmentMonths')}
                />
                <FieldWithChangeIndicator
                  label="Annual Income"
                  value={application.annualIncome ? `$${application.annualIncome.toLocaleString()}` : null}
                  originalValue={universaData?.annualIncome ? `$${parseInt(universaData.annualIncome).toLocaleString()}` : undefined}
                  isChanged={changedFields.includes('annualIncome')}
                />
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-lg mb-4">LOAN DETAILS</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Requested Amount</p>
                  <p className="font-medium text-lg">${application.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Term</p>
                  <p className="font-medium">{application.term} months</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Purpose</p>
                  <p className="font-medium">{application.purpose}</p>
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

            <div className="card">
              <h3 className="font-semibold text-lg mb-4">EXPENSES</h3>
              <div className="space-y-3">
                <FieldWithChangeIndicator
                  label="Monthly Housing Cost"
                  value={application.monthlyHousingCost ? `$${application.monthlyHousingCost}` : null}
                  originalValue={universaData?.monthlyHousingCost ? `$${universaData.monthlyHousingCost}` : undefined}
                  isChanged={changedFields.includes('monthlyHousingCost')}
                />
                <FieldWithChangeIndicator
                  label="Other Monthly Debts"
                  value={application.otherMonthlyDebts ? `$${application.otherMonthlyDebts}` : null}
                  originalValue={universaData?.otherMonthlyDebts ? `$${universaData.otherMonthlyDebts}` : undefined}
                  isChanged={changedFields.includes('otherMonthlyDebts')}
                />
                <FieldWithChangeIndicator
                  label="Number of Dependents"
                  value={application.numberOfDependents}
                  originalValue={universaData?.numberOfDependents}
                  isChanged={changedFields.includes('numberOfDependents')}
                />
              </div>
            </div>
          </div>

          {/* Column 3: Assets, Banking & Documents */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="font-semibold text-lg mb-4">ASSETS</h3>
              <div className="space-y-3">
                <FieldWithChangeIndicator
                  label="Bank Account Balance"
                  value={application.bankAccountBalance ? `$${application.bankAccountBalance.toLocaleString()}` : null}
                  originalValue={universaData?.bankAccountBalance ? `$${parseInt(universaData.bankAccountBalance).toLocaleString()}` : undefined}
                  isChanged={changedFields.includes('bankAccountBalance')}
                />
                <FieldWithChangeIndicator
                  label="Investment Value"
                  value={application.investmentValue ? `$${application.investmentValue.toLocaleString()}` : null}
                  originalValue={universaData?.investmentValue ? `$${parseInt(universaData.investmentValue).toLocaleString()}` : undefined}
                  isChanged={changedFields.includes('investmentValue')}
                />
                <FieldWithChangeIndicator
                  label="Property Value"
                  value={application.propertyValue ? `$${application.propertyValue.toLocaleString()}` : null}
                  originalValue={universaData?.propertyValue ? `$${parseInt(universaData.propertyValue).toLocaleString()}` : undefined}
                  isChanged={changedFields.includes('propertyValue')}
                />
                <FieldWithChangeIndicator
                  label="Vehicle Value"
                  value={application.vehicleValue ? `$${application.vehicleValue.toLocaleString()}` : null}
                  originalValue={universaData?.vehicleValue ? `$${parseInt(universaData.vehicleValue).toLocaleString()}` : undefined}
                  isChanged={changedFields.includes('vehicleValue')}
                />
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-lg mb-4">LIABILITIES</h3>
              <div className="space-y-3">
                <FieldWithChangeIndicator
                  label="Credit Card Balances"
                  value={application.creditCardBalances ? `$${application.creditCardBalances.toLocaleString()}` : null}
                  originalValue={universaData?.creditCardBalances ? `$${parseInt(universaData.creditCardBalances).toLocaleString()}` : undefined}
                  isChanged={changedFields.includes('creditCardBalances')}
                />
                <FieldWithChangeIndicator
                  label="Credit Card Limits"
                  value={application.creditCardLimits ? `$${application.creditCardLimits.toLocaleString()}` : null}
                  originalValue={universaData?.creditCardLimits ? `$${parseInt(universaData.creditCardLimits).toLocaleString()}` : undefined}
                  isChanged={changedFields.includes('creditCardLimits')}
                />
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-lg mb-4">BANKING RELATIONSHIP</h3>
              <div className="space-y-3">
                <FieldWithChangeIndicator
                  label="Primary Bank"
                  value={application.primaryBank}
                  originalValue={universaData?.primaryBank}
                  isChanged={changedFields.includes('primaryBank')}
                />
                <FieldWithChangeIndicator
                  label="Years with Bank"
                  value={application.bankingYears}
                  originalValue={universaData?.bankingYears}
                  isChanged={changedFields.includes('bankingYears')}
                />
                <FieldWithChangeIndicator
                  label="Account Type"
                  value={application.accountType}
                  originalValue={universaData?.accountType}
                  isChanged={changedFields.includes('accountType')}
                />
              </div>
            </div>

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
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full">
              <h3 className="text-lg font-semibold mb-4">
                {decision === 'approved' && 'Approve Application'}
                {decision === 'denied' && 'Deny Application'}
                {decision === 'more_info_needed' && 'Request More Information'}
                {!decision && 'Make a Decision'}
              </h3>
              
              {!decision && (
                <div className="space-y-2 mb-4">
                  <button
                    onClick={() => setDecision('more_info_needed')}
                    className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded"
                  >
                    Request More Information
                  </button>
                  <button
                    onClick={() => setDecision('denied')}
                    className="w-full text-left px-4 py-2 bg-red-50 hover:bg-red-100 rounded"
                  >
                    Deny Application
                  </button>
                  <button
                    onClick={() => setDecision('approved')}
                    className="w-full text-left px-4 py-2 bg-green-50 hover:bg-green-100 rounded"
                  >
                    Approve Application
                  </button>
                </div>
              )}

              {decision && (
                <>
                  <textarea
                    placeholder="Add notes (required)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 border rounded-lg h-32"
                  />
                  
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => {
                        setShowDecisionModal(false);
                        setDecision('');
                        setNotes('');
                      }}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDecision}
                      disabled={loading || !notes}
                      className="btn-primary flex-1"
                    >
                      {loading ? 'Processing...' : 'Submit Decision'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}