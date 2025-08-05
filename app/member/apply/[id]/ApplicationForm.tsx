'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import { LoanApplication, LoanProduct } from '@prisma/client';

interface ApplicationFormProps {
  application: LoanApplication & { product: LoanProduct };
}

export default function ApplicationForm({ application }: ApplicationFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(application.currentStep || 1);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File }>({});
  const [formData, setFormData] = useState({
    // Step 2 - Contact Info
    firstName: application.firstName || '',
    lastName: application.lastName || '',
    email: application.email || '',
    phone: application.phone || '',
    // Step 4 - Personal Details
    dateOfBirth: application.dateOfBirth || '',
    sin: application.sin || '',
    citizenshipStatus: application.citizenshipStatus || '',
    // Step 5 - Address
    streetNumber: '',
    streetName: '',
    unit: '',
    city: '',
    province: '',
    postalCode: '',
    yearsAtAddress: '',
    monthsAtAddress: '',
    // Previous address (if needed)
    prevStreetNumber: '',
    prevStreetName: '',
    prevUnit: '',
    prevCity: '',
    prevProvince: '',
    prevPostalCode: '',
    // Step 6 - Financial
    employerName: application.employerName || '',
    employmentStatus: application.employmentStatus || 'Full-time',
    annualIncome: application.annualIncome?.toString() || '',
    otherIncome: '',
    employmentYears: '',
    employmentMonths: '',
    monthlyHousingCost: '',
    otherMonthlyDebts: '',
    numberOfDependents: '',
  });

  const [showPreviousAddress, setShowPreviousAddress] = useState(false);

  const steps = [
    { number: 1, title: 'Loan Details', completed: true },
    { number: 2, title: "Let's Get Started", completed: currentStep > 2 },
    { number: 3, title: 'Email Verification', completed: currentStep > 3 },
    { number: 4, title: 'Personal Details', completed: currentStep > 4 },
    { number: 5, title: 'Address History', completed: currentStep > 5 },
    { number: 6, title: 'Financial Overview', completed: currentStep > 6 },
    { number: 7, title: 'Supporting Documents', completed: currentStep > 7 },
    { number: 8, title: 'Review & Consents', completed: false },
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/applications/${application.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          annualIncome: formData.annualIncome ? parseFloat(formData.annualIncome) : null,
          monthlyIncome: formData.annualIncome ? parseFloat(formData.annualIncome) / 12 : null,
          currentStep,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save');
      }
    } catch (error) {
      alert('Failed to save progress');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    await handleSave();
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleFileUpload = (type: string, file: File) => {
    setUploadedFiles({ ...uploadedFiles, [type]: file });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Upload documents
      for (const [type, file] of Object.entries(uploadedFiles)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        formData.append('applicationId', application.id);

        await fetch('/api/documents', {
          method: 'POST',
          body: formData,
        });
      }

      // Submit application
      const res = await fetch(`/api/applications/${application.id}/submit`, {
        method: 'POST',
      });

      if (res.ok) {
        router.push('/member');
      }
    } catch (error) {
      alert('Failed to submit application');
    } finally {
      setLoading(false);
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

        <h1 className="text-3xl font-bold text-primary-700 mb-8">
          {application.product.name} Application
        </h1>

        {/* Progress Circles */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-2 md:space-x-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="relative">
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      step.completed && currentStep !== step.number
                        ? 'bg-green-500 text-white'
                        : currentStep === step.number
                        ? 'bg-yellow-500 text-white'
                        : 'bg-blue-500 text-white'
                    }`}
                  >
                    {step.completed && currentStep !== step.number ? (
                      <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  {/* Step title on hover - desktop only */}
                  <div className="hidden md:block absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <p className={`text-xs ${currentStep === step.number ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 md:w-16 h-1 mx-1 transition-colors ${
                    step.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          {/* Current step title - mobile */}
          <div className="mt-4 text-center md:hidden">
            <p className="text-lg font-semibold text-gray-900">
              Step {currentStep}: {steps.find(s => s.number === currentStep)?.title}
            </p>
          </div>
        </div>

        {/* Form Content */}
        <div className="card">
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Loan Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="text-lg font-semibold">${application.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Term</p>
                    <p className="text-lg font-semibold">{application.term} months</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Purpose</p>
                    <p className="text-lg font-semibold">{application.purpose}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monthly Payment</p>
                    <p className="text-lg font-semibold">${application.monthlyPayment?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Let's Get Started</h2>
              <p className="text-gray-600 mb-8">We'll need some basic information to begin your application.</p>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    className="input"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">We'll use this to save your progress and send updates</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="input"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Email Verification</h2>
              <div className="max-w-md mx-auto">
                <p className="text-gray-600 mb-8 text-center">
                  We've sent a verification code to <strong>{formData.email}</strong>
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                  <p className="text-sm text-blue-700 mb-2">For demo purposes, your verification code is:</p>
                  <p className="text-3xl font-bold text-blue-900 text-center">123456</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    className="input text-center text-2xl tracking-wider"
                    maxLength={6}
                  />
                </div>

                <button className="text-primary-600 hover:text-primary-700 text-sm mt-4">
                  Didn't receive the code? Resend
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Personal Details</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Social Insurance Number
                  </label>
                  <p className="text-sm text-gray-500 mb-2">
                    We need your SIN to perform a mandatory credit check with Equifax/TransUnion
                  </p>
                  <input
                    type="text"
                    value={formData.sin}
                    onChange={(e) => setFormData({ ...formData, sin: e.target.value })}
                    placeholder="123-456-789"
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Citizenship/Residency Status
                  </label>
                  <select
                    value={formData.citizenshipStatus}
                    onChange={(e) => setFormData({ ...formData, citizenshipStatus: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Select status</option>
                    <option value="Canadian Citizen">Canadian Citizen</option>
                    <option value="Permanent Resident">Permanent Resident</option>
                    <option value="Work Permit">Work Permit</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Address History</h2>
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Current Address</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Number
                    </label>
                    <input
                      type="text"
                      value={formData.streetNumber}
                      onChange={(e) => setFormData({ ...formData, streetNumber: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Name
                    </label>
                    <input
                      type="text"
                      value={formData.streetName}
                      onChange={(e) => setFormData({ ...formData, streetName: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit/Apartment (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="input"
                    placeholder="e.g., Apt 301"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Province/Territory
                    </label>
                    <select
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="input"
                      required
                    >
                      <option value="">Select province</option>
                      <option value="AB">Alberta</option>
                      <option value="BC">British Columbia</option>
                      <option value="MB">Manitoba</option>
                      <option value="NB">New Brunswick</option>
                      <option value="NL">Newfoundland and Labrador</option>
                      <option value="NT">Northwest Territories</option>
                      <option value="NS">Nova Scotia</option>
                      <option value="NU">Nunavut</option>
                      <option value="ON">Ontario</option>
                      <option value="PE">Prince Edward Island</option>
                      <option value="QC">Quebec</option>
                      <option value="SK">Saskatchewan</option>
                      <option value="YT">Yukon</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value.toUpperCase() })}
                    placeholder="A1B 2C3"
                    className="input"
                    maxLength={7}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How long have you lived at this address?
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        value={formData.yearsAtAddress}
                        onChange={(e) => {
                          setFormData({ ...formData, yearsAtAddress: e.target.value });
                          const years = parseInt(e.target.value) || 0;
                          const months = parseInt(formData.monthsAtAddress) || 0;
                          setShowPreviousAddress(years < 2 || (years === 2 && months === 0));
                        }}
                        placeholder="Years"
                        className="input"
                        min="0"
                        required
                      />
                      <span className="text-sm text-gray-500 mt-1">Years</span>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={formData.monthsAtAddress}
                        onChange={(e) => {
                          setFormData({ ...formData, monthsAtAddress: e.target.value });
                          const years = parseInt(formData.yearsAtAddress) || 0;
                          const months = parseInt(e.target.value) || 0;
                          setShowPreviousAddress(years < 2 || (years === 2 && months === 0));
                        }}
                        placeholder="Months"
                        className="input"
                        min="0"
                        max="11"
                        required
                      />
                      <span className="text-sm text-gray-500 mt-1">Months</span>
                    </div>
                  </div>
                </div>

                {showPreviousAddress && (
                  <>
                    <hr className="my-6" />
                    <h3 className="text-lg font-semibold">Previous Address</h3>
                    <p className="text-sm text-gray-600 -mt-2 mb-4">
                      We need your previous address since you've lived at your current address for less than 2 years
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Street Number
                        </label>
                        <input
                          type="text"
                          value={formData.prevStreetNumber}
                          onChange={(e) => setFormData({ ...formData, prevStreetNumber: e.target.value })}
                          className="input"
                          required={showPreviousAddress}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Street Name
                        </label>
                        <input
                          type="text"
                          value={formData.prevStreetName}
                          onChange={(e) => setFormData({ ...formData, prevStreetName: e.target.value })}
                          className="input"
                          required={showPreviousAddress}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.prevCity}
                          onChange={(e) => setFormData({ ...formData, prevCity: e.target.value })}
                          className="input"
                          required={showPreviousAddress}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Province/Territory
                        </label>
                        <select
                          value={formData.prevProvince}
                          onChange={(e) => setFormData({ ...formData, prevProvince: e.target.value })}
                          className="input"
                          required={showPreviousAddress}
                        >
                          <option value="">Select province</option>
                          <option value="AB">Alberta</option>
                          <option value="BC">British Columbia</option>
                          <option value="MB">Manitoba</option>
                          <option value="NB">New Brunswick</option>
                          <option value="NL">Newfoundland and Labrador</option>
                          <option value="NT">Northwest Territories</option>
                          <option value="NS">Nova Scotia</option>
                          <option value="NU">Nunavut</option>
                          <option value="ON">Ontario</option>
                          <option value="PE">Prince Edward Island</option>
                          <option value="QC">Quebec</option>
                          <option value="SK">Saskatchewan</option>
                          <option value="YT">Yukon</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Financial Overview</h2>
              <div className="space-y-8">
                {/* Employment Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Employment Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employment Status
                      </label>
                      <select
                        value={formData.employmentStatus}
                        onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                        className="input"
                        required
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Self-employed">Self-employed</option>
                        <option value="Retired">Retired</option>
                        <option value="Student">Student</option>
                        <option value="Unemployed">Unemployed</option>
                      </select>
                    </div>

                    {formData.employmentStatus !== 'Unemployed' && formData.employmentStatus !== 'Student' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Employer Name
                          </label>
                          <input
                            type="text"
                            value={formData.employerName}
                            onChange={(e) => setFormData({ ...formData, employerName: e.target.value })}
                            className="input"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            How long have you been with this employer?
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <input
                                type="number"
                                value={formData.employmentYears}
                                onChange={(e) => setFormData({ ...formData, employmentYears: e.target.value })}
                                placeholder="Years"
                                className="input"
                                min="0"
                                required
                              />
                              <span className="text-sm text-gray-500 mt-1">Years</span>
                            </div>
                            <div>
                              <input
                                type="number"
                                value={formData.employmentMonths}
                                onChange={(e) => setFormData({ ...formData, employmentMonths: e.target.value })}
                                placeholder="Months"
                                className="input"
                                min="0"
                                max="11"
                                required
                              />
                              <span className="text-sm text-gray-500 mt-1">Months</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gross Annual Income
                      </label>
                      <input
                        type="number"
                        value={formData.annualIncome}
                        onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                        placeholder="75000"
                        className="input"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">Before taxes and deductions</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Other Monthly Income (Optional)
                      </label>
                      <input
                        type="number"
                        value={formData.otherIncome}
                        onChange={(e) => setFormData({ ...formData, otherIncome: e.target.value })}
                        placeholder="0"
                        className="input"
                      />
                      <p className="text-sm text-gray-500 mt-1">Rental income, investments, etc.</p>
                    </div>
                  </div>
                </div>

                {/* Monthly Obligations Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Monthly Obligations</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Housing Cost
                      </label>
                      <input
                        type="number"
                        value={formData.monthlyHousingCost}
                        onChange={(e) => setFormData({ ...formData, monthlyHousingCost: e.target.value })}
                        placeholder="1500"
                        className="input"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">Rent or mortgage payment</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Other Monthly Debts
                      </label>
                      <input
                        type="number"
                        value={formData.otherMonthlyDebts}
                        onChange={(e) => setFormData({ ...formData, otherMonthlyDebts: e.target.value })}
                        placeholder="500"
                        className="input"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">Car payments, credit cards, other loans</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Dependents
                      </label>
                      <input
                        type="number"
                        value={formData.numberOfDependents}
                        onChange={(e) => setFormData({ ...formData, numberOfDependents: e.target.value })}
                        placeholder="0"
                        className="input"
                        min="0"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">Children or other dependents you support</p>
                    </div>
                  </div>
                </div>

                {/* Debt Service Ratio Calculation (for display only) */}
                {formData.annualIncome && formData.monthlyHousingCost && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Debt Service Ratios</h4>
                    <div className="text-sm text-blue-800">
                      <p>Gross Debt Service (GDS): {
                        ((parseFloat(formData.monthlyHousingCost) / (parseFloat(formData.annualIncome) / 12)) * 100).toFixed(1)
                      }%</p>
                      <p className="mt-1">Total Debt Service (TDS): {
                        (((parseFloat(formData.monthlyHousingCost) + parseFloat(formData.otherMonthlyDebts || '0')) / (parseFloat(formData.annualIncome) / 12)) * 100).toFixed(1)
                      }%</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Supporting Documents</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Government ID (Front)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && handleFileUpload('id_front', e.target.files[0])}
                      className="hidden"
                      id="id_front"
                    />
                    <label htmlFor="id_front" className="cursor-pointer">
                      {uploadedFiles.id_front ? (
                        <p className="text-green-600">✓ {uploadedFiles.id_front.name}</p>
                      ) : (
                        <p className="text-gray-500">Click to upload or drag and drop</p>
                      )}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Government ID (Back)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && handleFileUpload('id_back', e.target.files[0])}
                      className="hidden"
                      id="id_back"
                    />
                    <label htmlFor="id_back" className="cursor-pointer">
                      {uploadedFiles.id_back ? (
                        <p className="text-green-600">✓ {uploadedFiles.id_back.name}</p>
                      ) : (
                        <p className="text-gray-500">Click to upload or drag and drop</p>
                      )}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recent Pay Stub
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => e.target.files && handleFileUpload('pay_stub', e.target.files[0])}
                      className="hidden"
                      id="pay_stub"
                    />
                    <label htmlFor="pay_stub" className="cursor-pointer">
                      {uploadedFiles.pay_stub ? (
                        <p className="text-green-600">✓ {uploadedFiles.pay_stub.name}</p>
                      ) : (
                        <p className="text-gray-500">Click to upload or drag and drop</p>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 8 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Review & Consents</h2>
              <div className="space-y-6">
                {/* Review Section */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4 flex justify-between">
                    Loan Details
                    <button 
                      onClick={() => setCurrentStep(1)}
                      className="text-sm text-primary-600 hover:text-primary-700 font-normal"
                    >
                      Edit
                    </button>
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Product</p>
                      <p className="font-medium">{application.product.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Amount</p>
                      <p className="font-medium">${application.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Term</p>
                      <p className="font-medium">{application.term} months</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Monthly Payment</p>
                      <p className="font-medium">${application.monthlyPayment?.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4 flex justify-between">
                    Personal Information
                    <button 
                      onClick={() => setCurrentStep(2)}
                      className="text-sm text-primary-600 hover:text-primary-700 font-normal"
                    >
                      Edit
                    </button>
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Name</p>
                      <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Email</p>
                      <p className="font-medium">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Phone</p>
                      <p className="font-medium">{formData.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Date of Birth</p>
                      <p className="font-medium">{formData.dateOfBirth}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Citizenship Status</p>
                      <p className="font-medium">{formData.citizenshipStatus}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4 flex justify-between">
                    Address
                    <button 
                      onClick={() => setCurrentStep(5)}
                      className="text-sm text-primary-600 hover:text-primary-700 font-normal"
                    >
                      Edit
                    </button>
                  </h3>
                  <div className="text-sm">
                    <p className="font-medium">
                      {formData.streetNumber} {formData.streetName} {formData.unit}
                    </p>
                    <p className="font-medium">
                      {formData.city}, {formData.province} {formData.postalCode}
                    </p>
                    <p className="text-gray-600 mt-2">
                      Time at address: {formData.yearsAtAddress} years, {formData.monthsAtAddress} months
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4 flex justify-between">
                    Financial Information
                    <button 
                      onClick={() => setCurrentStep(6)}
                      className="text-sm text-primary-600 hover:text-primary-700 font-normal"
                    >
                      Edit
                    </button>
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Employer</p>
                      <p className="font-medium">{formData.employerName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Annual Income</p>
                      <p className="font-medium">${parseInt(formData.annualIncome).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Monthly Housing Cost</p>
                      <p className="font-medium">${parseInt(formData.monthlyHousingCost || '0').toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Other Monthly Debts</p>
                      <p className="font-medium">${parseInt(formData.otherMonthlyDebts || '0').toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Consents Section */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-4">Required Consents</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="credit_check"
                        className="mt-1 mr-3"
                        required
                      />
                      <label htmlFor="credit_check" className="text-sm text-gray-700">
                        <span className="font-medium">Credit Bureau Authorization:</span> I authorize the credit union to obtain credit reports from Equifax and/or TransUnion to assess my creditworthiness for this loan application.
                      </label>
                    </div>

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="fintrac"
                        className="mt-1 mr-3"
                        required
                      />
                      <label htmlFor="fintrac" className="text-sm text-gray-700">
                        <span className="font-medium">FINTRAC Identity Verification:</span> I consent to the verification of my identity as required under Canadian anti-money laundering regulations.
                      </label>
                    </div>

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="privacy"
                        className="mt-1 mr-3"
                        required
                      />
                      <label htmlFor="privacy" className="text-sm text-gray-700">
                        <span className="font-medium">Privacy Policy:</span> I have read and agree to the credit union's privacy policy regarding the collection, use, and disclosure of my personal information.
                      </label>
                    </div>

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="terms"
                        className="mt-1 mr-3"
                        required
                      />
                      <label htmlFor="terms" className="text-sm text-gray-700">
                        <span className="font-medium">Terms of Service:</span> I agree to the terms and conditions of the loan application and understand the obligations if my application is approved.
                      </label>
                    </div>

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="esignature"
                        className="mt-1 mr-3"
                        required
                      />
                      <label htmlFor="esignature" className="text-sm text-gray-700">
                        <span className="font-medium">Electronic Signature Consent:</span> I consent to using electronic signatures for this application and understand they are legally binding.
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <button onClick={handleBack} className="btn-secondary">
                Back
              </button>
            )}
            {currentStep < 8 ? (
              <button
                onClick={handleNext}
                disabled={loading}
                className="btn-primary ml-auto"
              >
                {loading ? 'Saving...' : 'Continue'}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary ml-auto"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}