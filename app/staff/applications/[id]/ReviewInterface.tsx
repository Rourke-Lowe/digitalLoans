'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import FieldWithChangeIndicator from '@/components/ui/FieldWithChangeIndicator';
import { LoanApplication, LoanProduct, User, Document, ApplicationReview, ApplicationActivity, CreditUnionSettings } from '@prisma/client';
import { getAvailableStatuses, getStatusBadgeColor, getStageStatus, getProgressPercentage, getStatusReasons } from '@/lib/statusHelpers';

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
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [losReferenceNumber, setLosReferenceNumber] = useState('');

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

  const handleStatusChange = async () => {
    if (!newStatus) {
      alert('Please select a new status');
      return;
    }

    setLoading(true);
    try {
      await fetch(`/api/applications/${application.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          statusReason,
          statusNotes,
          userId: currentUser.id,
          losReferenceNumber: newStatus === 'TO_LOS' ? losReferenceNumber : undefined,
          losRoutingReason: newStatus === 'TO_LOS' ? statusReason : undefined,
        }),
      });

      setShowStatusModal(false);
      setNewStatus('');
      setStatusReason('');
      setStatusNotes('');
      router.refresh();
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

          {/* Quick Actions for legacy statuses */}
          {['submitted', 'draft'].includes(application.status) && (
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => handleStatusUpdate('SCREENING')}
                disabled={loading}
                className="btn-primary"
              >
                START SCREENING
              </button>
            </div>
          )}
        </div>

        {/* Status Management Card */}
        <div className="card mb-8">
          <h3 className="font-semibold text-lg mb-4">APPLICATION STATUS MANAGEMENT</h3>

          {/* Current Status Display */}
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">Current Status:</span>
            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(application.status)}`}>
              {application.status}
            </span>
            <span className="ml-2 text-sm text-gray-500">
              (Since: {formatDate(application.statusChangedAt || application.updatedAt)})
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
                  <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Reason for Change:</label>
              <select
                className="w-full p-2 border rounded-lg"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
              >
                <option value="">Select reason...</option>
                {newStatus && getStatusReasons(application.status, newStatus).map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Special Routing Options */}
          {(application.status === 'SCREENING' || application.status === 'UNDERWRITING') && (
            <div className="mt-4 p-4 border-2 border-yellow-200 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Route to LOS?</h4>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setNewStatus('TO_LOS');
                    setShowStatusModal(true);
                  }}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Route to LOS
                </button>
                <input
                  type="text"
                  placeholder="LOS Reference Number (optional)"
                  value={losReferenceNumber}
                  onChange={(e) => setLosReferenceNumber(e.target.value)}
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
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleStatusChange}
              disabled={!newStatus || loading}
              className="btn-primary"
            >
              {loading ? 'Updating...' : 'Update Status'}
            </button>
            <button
              onClick={() => {
                setNewStatus('');
                setStatusReason('');
                setStatusNotes('');
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Workflow Progress Visualization */}
        <div className="card mb-8">
          <h3 className="font-semibold text-lg mb-4">WORKFLOW PROGRESS</h3>

          {/* Visual Pipeline */}
          <div className="relative">
            <div className="flex justify-between items-center">
              {['SCREENING', 'UNDERWRITING', 'DECISION', 'DOCUMENTS', 'SIGNATURES', 'RELEASING', 'DISBURSED', 'COMPLETED'].map((stage, index) => (
                <div key={stage} className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm
                    ${getStageStatus(stage, application.status) === 'completed' ? 'bg-green-500' :
                      getStageStatus(stage, application.status) === 'current' ? 'bg-blue-500 animate-pulse' :
                      'bg-gray-300'}`}>
                    {getStageStatus(stage, application.status) === 'completed' ? '✓' : index + 1}
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

          {/* Special Status Indicators */}
          {application.status === 'TO_LOS' && (
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <span className="font-medium">Routed to LOS</span>
              {application.losReferenceNumber && (
                <span className="ml-2 text-sm text-gray-600">
                  (Reference: {application.losReferenceNumber})
                </span>
              )}
            </div>
          )}

          {application.status === 'REJECTED' && (
            <div className="mt-4 p-3 bg-red-100 rounded">
              <span className="font-medium text-red-800">Application Rejected</span>
            </div>
          )}
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

        {/* Document Management Section */}
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
                  <label className="flex items-center p-3 border rounded hover:bg-gray-50">
                    <input type="checkbox" className="mr-3" defaultChecked />
                    <span className="flex-1">Auto-Debit Authorization</span>
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
                  <tr className="border-b">
                    <td className="p-2">Disclosure Forms</td>
                    <td className="p-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Signed</span>
                    </td>
                    <td className="p-2 text-sm">12/20/24 2:30pm</td>
                    <td className="p-2 text-sm">12/20/24 3:45pm</td>
                    <td className="p-2 text-sm">12/20/24 4:15pm</td>
                    <td className="p-2">
                      <button className="text-blue-600 text-sm">Download</button>
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

        {/* Disbursement Management Section */}
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
                <p className="text-sm">Name: {application.firstName} {application.lastName}</p>
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
                  <p>Transaction ID: TXN-2024-{application.applicationNumber}</p>
                  <p>Amount: ${application.amount.toLocaleString()}</p>
                  <p>Method: {application.disbursementMethod || 'ACH Transfer'}</p>
                  <p>Initiated: {application.disbursementDate ? formatDate(application.disbursementDate) : '12/20/2024 10:30 AM'}</p>
                  <p>Completed: {application.completionDate ? formatDate(application.completionDate) : '12/20/2024 10:35 AM'}</p>
                </div>
              </div>
            )}
          </div>
        )}

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