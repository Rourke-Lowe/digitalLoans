'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import { LoanProduct } from '@prisma/client';

interface ApplyFormProps {
  products: LoanProduct[];
  userId: string;
}

export default function ApplyForm({ products, userId }: ApplyFormProps) {
  const router = useRouter();
  const [showOverview, setShowOverview] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1
    productId: '',
    amount: '',
    term: '',
    purpose: '',
    // Step 2
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    sin: '',
    phone: '',
    address: '',
    // Step 3
    employerName: '',
    employmentStatus: 'Full-time',
    annualIncome: '',
    employmentDuration: '',
  });

  const selectedProduct = products.find((p) => p.id === formData.productId);
  const monthlyPayment = selectedProduct && formData.amount && formData.term
    ? calculateMonthlyPayment(
        parseFloat(formData.amount),
        selectedProduct.interestRate,
        parseInt(formData.term)
      )
    : 0;

  function calculateMonthlyPayment(principal: number, rate: number, months: number) {
    const monthlyRate = rate / 100 / 12;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
  }

  const steps = [
    { number: 1, title: 'Loan Details', icon: '💰', description: 'Choose your loan product, amount, and term' },
    { number: 2, title: "Let's Get Started", icon: '📝', description: 'Basic information and email setup' },
    { number: 3, title: 'Email Verification', icon: '✉️', description: 'Verify your email address' },
    { number: 4, title: 'Personal Details', icon: '👤', description: 'Personal information and citizenship' },
    { number: 5, title: 'Address History', icon: '🏠', description: 'Current and previous addresses' },
    { number: 6, title: 'Financial Overview', icon: '💼', description: 'Employment and financial information' },
    { number: 7, title: 'Supporting Documents', icon: '📄', description: 'Upload required documents' },
    { number: 8, title: 'Review & Consents', icon: '✅', description: 'Review and submit application' },
  ];

  const requiredDocuments = [
    { category: 'Identification', items: ['Government-issued photo ID (Driver\'s License or Passport)', 'Social Insurance Number'] },
    { category: 'Income Verification', items: ['Recent pay stubs (last 2-3)', 'Employment letter', 'Tax documents (if self-employed)'] },
    { category: 'Banking', items: ['Recent bank statements (last 3 months)', 'Void cheque or PAD form'] },
    { category: 'Additional (if applicable)', items: ['Proof of address (utility bill)', 'References', 'Co-applicant information'] },
  ];

  const handleNext = async () => {
    if (showOverview) {
      setShowOverview(false);
      return;
    }
    
    if (currentStep === 1) {
      // Create draft application
      setLoading(true);
      try {
        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            ...formData,
            amount: parseFloat(formData.amount),
            term: parseInt(formData.term),
            monthlyPayment,
          }),
        });

        if (res.ok) {
          const { id } = await res.json();
          router.push(`/member/apply/${id}`);
        }
      } catch (error) {
        alert('Failed to create application');
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (!showOverview && currentStep === 1) {
      setShowOverview(true);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/member')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {showOverview ? (
          // Overview Screen
          <>
            <h1 className="text-3xl font-bold text-primary-700 mb-2">
              Ready to Apply for Your Loan?
            </h1>
            <p className="text-gray-600 mb-8">
              Before we begin, let's review what you'll need for your application.
            </p>

            {/* Application Steps */}
            <div className="card mb-8">
              <h2 className="text-xl font-semibold mb-6">Application Process - 8 Simple Steps</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {steps.map((step) => (
                  <div key={step.number} className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-primary-700 font-semibold">{step.number}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{step.title}</h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Documents */}
            <div className="card mb-8">
              <h2 className="text-xl font-semibold mb-6">Documents You'll Need</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {requiredDocuments.map((doc) => (
                  <div key={doc.category}>
                    <h3 className="font-medium text-gray-900 mb-2">{doc.category}</h3>
                    <ul className="space-y-1">
                      {doc.items.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start">
                          <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-medium text-yellow-800">Important Information</h3>
                  <ul className="mt-1 text-sm text-yellow-700 space-y-1">
                    <li>• The application takes approximately 15-20 minutes to complete</li>
                    <li>• Your progress is automatically saved as you go</li>
                    <li>• All information is secured and encrypted</li>
                    <li>• You can return to complete your application later if needed</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="btn-primary w-full py-3 text-lg"
            >
              Start Application
            </button>
          </>
        ) : (
          // Original Form Content
          <>
            <h1 className="text-3xl font-bold text-primary-700 mb-8">
              Let's get you set up. It only takes a few minutes.
            </h1>

            {/* Form Content */}
            <div className="card">
              {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Choose Your Loan</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Product
                  </label>
                  <select
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {product.interestRate}% APR
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Amount
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="Enter amount"
                    className="input"
                    min={selectedProduct?.minAmount || 1000}
                    max={selectedProduct?.maxAmount || 50000}
                    required
                  />
                  {selectedProduct && (
                    <p className="text-sm text-gray-500 mt-1">
                      Min: ${selectedProduct.minAmount.toLocaleString()} - Max: ${selectedProduct.maxAmount.toLocaleString()}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Term (months)
                  </label>
                  <select
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Select term</option>
                    {selectedProduct &&
                      Array.from(
                        { length: (selectedProduct.maxTerm - selectedProduct.minTerm) / 12 + 1 },
                        (_, i) => selectedProduct.minTerm + i * 12
                      ).map((months) => (
                        <option key={months} value={months}>
                          {months} months ({months / 12} years)
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Purpose
                  </label>
                  <select
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Select purpose</option>
                    <option value="Debt consolidation">Debt consolidation</option>
                    <option value="Home improvement">Home improvement</option>
                    <option value="Major purchase">Major purchase</option>
                    <option value="Emergency expenses">Emergency expenses</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {monthlyPayment > 0 && (
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">Estimated Monthly Payment</p>
                    <p className="text-2xl font-bold text-primary-700">
                      ${monthlyPayment.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <button onClick={handleBack} className="btn-secondary">
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={loading || !formData.productId || !formData.amount || !formData.term || !formData.purpose}
              className="btn-primary ml-auto"
            >
              {loading ? 'Creating...' : 'GET STARTED'}
            </button>
          </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}