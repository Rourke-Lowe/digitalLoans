'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import { LoanApplication, LoanProduct, ProductConfiguration, CreditUnionSettings } from '@prisma/client';

// Mock Universa data - simulating external system data
const universaData: Record<string, any> = {
  'existing.member@email.com': {
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'existing.member@email.com',
    phone: '(416) 555-0123',
    dateOfBirth: '1980-05-15',
    sin: '555-123-456',
    citizenshipStatus: 'Canadian Citizen',
    // Address
    streetNumber: '789',
    streetName: 'King Street',
    unit: 'Suite 400',
    city: 'Toronto',
    province: 'ON',
    postalCode: 'M5V 2N5',
    yearsAtAddress: '5',
    monthsAtAddress: '6',
    // Employment
    employerName: 'Tech Solutions Inc',
    employmentStatus: 'Full-time',
    annualIncome: '95000',
    employmentYears: '8',
    employmentMonths: '3',
    // Financial
    monthlyHousingCost: '2500',
    otherMonthlyDebts: '800',
    numberOfDependents: '2',
    bankAccountBalance: '25000',
    investmentValue: '45000',
    propertyValue: '650000',
    vehicleValue: '35000',
    creditCardBalances: '3500',
    creditCardLimits: '20000',
    primaryBank: 'TD Bank',
    bankingYears: '10',
    accountType: 'Both',
    lastUpdated: '2024-01-15',
  },
};

interface ApplicationFormProps {
  application: LoanApplication & { 
    product: LoanProduct & { 
      configuration: ProductConfiguration | null;
    };
  };
  settings: CreditUnionSettings | null;
  user: { id: string; email: string; name: string; role: string; };
}

export default function ApplicationForm({ application, settings, user }: ApplicationFormProps) {
  // Parse settings
  const addressLabels = settings?.addressFieldLabels ? JSON.parse(settings.addressFieldLabels) : {
    streetNumber: 'Street Number',
    streetName: 'Street Name',
    unit: 'Unit/Apt',
    city: 'City',
    province: 'Province',
    postalCode: 'Postal Code',
  };
  
  const requiredDocuments = settings?.requiredDocuments ? JSON.parse(settings.requiredDocuments) : ['id_front', 'id_back', 'pay_stub'];
  const requiredFinancialInfo = settings?.requiredFinancialInfo ? JSON.parse(settings.requiredFinancialInfo) : {};
  const requiredConsents = settings?.requiredConsents ? JSON.parse(settings.requiredConsents) : {
    creditCheck: true,
    fintrac: true,
    privacy: true,
    terms: true,
    esignature: true,
  };
  
  // Parse product configuration
  const productConfig = application.product.configuration;
  const additionalDocs = productConfig?.additionalDocuments ? JSON.parse(productConfig.additionalDocuments) : [];
  const additionalFinancial = productConfig?.additionalFinancialFields ? JSON.parse(productConfig.additionalFinancialFields) : {};
  
  // Combine required documents
  const allRequiredDocuments = [...requiredDocuments, ...additionalDocs];
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(application.currentStep || 1);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File }>({});
  
  // Check if user is an existing member with Universa data
  const userEmail = user.email;
  const isExistingMember = userEmail === 'existing.member@email.com';
  const profileData = isExistingMember ? universaData[userEmail] : null;
  
  // Debug logging
  console.log('ApplicationForm Debug:', {
    userEmail,
    isExistingMember,
    hasProfileData: !!profileData,
    profileDataKeys: profileData ? Object.keys(profileData).slice(0, 5) : []
  });
  
  // State for tracking current tab
  const [activeTab, setActiveTab] = useState<'application' | 'profile'>('application');
  
  // State for tracking changed fields
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());
  
  // Initialize form data with profile data if available
  const initialFormData = {
    // Step 2 - Contact Info 
    firstName: application.firstName || (profileData ? profileData.firstName : ''),
    lastName: application.lastName || (profileData ? profileData.lastName : ''),
    email: application.email || (profileData ? profileData.email : ''),
    phone: application.phone || (profileData ? profileData.phone : ''),
    // Step 4 - Personal Details
    dateOfBirth: application.dateOfBirth || (profileData ? profileData.dateOfBirth : ''),
    sin: application.sin || (profileData ? profileData.sin : ''),
    citizenshipStatus: application.citizenshipStatus || (profileData ? profileData.citizenshipStatus : ''),
    // Step 5 - Address - FIXED: Check application data first, then profile data
    streetNumber: application.streetNumber || (profileData ? profileData.streetNumber : ''),
    streetName: application.streetName || (profileData ? profileData.streetName : ''),
    unit: application.unit || (profileData ? profileData.unit : ''),
    city: application.city || (profileData ? profileData.city : ''),
    province: application.province || (profileData ? profileData.province : ''),
    postalCode: application.postalCode || (profileData ? profileData.postalCode : ''),
    yearsAtAddress: application.yearsAtAddress || (profileData ? profileData.yearsAtAddress : ''),
    monthsAtAddress: application.monthsAtAddress || (profileData ? profileData.monthsAtAddress : ''),
    // Previous address (if needed)
    prevStreetNumber: application.prevStreetNumber || '',
    prevStreetName: application.prevStreetName || '',
    prevUnit: application.prevUnit || '',
    prevCity: application.prevCity || '',
    prevProvince: application.prevProvince || '',
    prevPostalCode: application.prevPostalCode || '',
    // Step 6 - Financial - FIXED: Check application data first
    employerName: application.employerName || (profileData ? profileData.employerName : ''),
    employmentStatus: application.employmentStatus || (profileData ? profileData.employmentStatus : 'Full-time'),
    annualIncome: application.annualIncome?.toString() || (profileData ? profileData.annualIncome : ''),
    otherIncome: application.otherIncome || '',
    employmentYears: application.employmentYears || (profileData ? profileData.employmentYears : ''),
    employmentMonths: application.employmentMonths || (profileData ? profileData.employmentMonths : ''),
    monthlyHousingCost: application.monthlyHousingCost || (profileData ? profileData.monthlyHousingCost : ''),
    otherMonthlyDebts: application.otherMonthlyDebts || (profileData ? profileData.otherMonthlyDebts : ''),
    numberOfDependents: application.numberOfDependents || (profileData ? profileData.numberOfDependents : ''),
    // Assets - FIXED: Check application data first
    bankAccountBalance: application.bankAccountBalance?.toString() || (profileData ? profileData.bankAccountBalance : ''),
    investmentValue: application.investmentValue?.toString() || (profileData ? profileData.investmentValue : ''),
    propertyValue: application.propertyValue?.toString() || (profileData ? profileData.propertyValue : ''),
    vehicleValue: application.vehicleValue?.toString() || (profileData ? profileData.vehicleValue : ''),
    otherAssetsValue: application.otherAssetsValue?.toString() || '',
    otherAssetsDesc: application.otherAssetsDesc || '',
    // Liabilities - FIXED: Check application data first
    creditCardBalances: application.creditCardBalances?.toString() || (profileData ? profileData.creditCardBalances : ''),
    creditCardLimits: application.creditCardLimits?.toString() || (profileData ? profileData.creditCardLimits : ''),
    existingLoans: application.existingLoans ? JSON.parse(application.existingLoans) : [],
    // Banking - FIXED: Check application data first
    primaryBank: application.primaryBank || (profileData ? profileData.primaryBank : ''),
    bankingYears: application.bankingYears || (profileData ? profileData.bankingYears : ''),
    accountType: application.accountType || (profileData ? profileData.accountType : ''),
  };
  
  const [formData, setFormData] = useState(initialFormData);
  
  // Helper function to handle field changes and track modifications
  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Check if this field has changed from the original profile data
    if (profileData && profileData[fieldName] !== undefined) {
      if (profileData[fieldName] !== value) {
        setChangedFields(prev => new Set(prev).add(fieldName));
      } else {
        setChangedFields(prev => {
          const newSet = new Set(prev);
          newSet.delete(fieldName);
          return newSet;
        });
      }
    }
  };

  const [showPreviousAddress, setShowPreviousAddress] = useState(false);
  
  // Consent state management
  const [consents, setConsents] = useState({
    creditCheck: false,
    fintrac: false,
    privacy: false,
    terms: false,
    esignature: false,
  });
  
  // Check if all mandatory consents are checked
  const mandatoryConsentsChecked = Object.entries(requiredConsents)
    .filter(([_, required]) => required)
    .every(([key, _]) => consents[key as keyof typeof consents]);

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
      const saveData: any = {
        ...formData,
        annualIncome: formData.annualIncome ? parseFloat(formData.annualIncome) : null,
        monthlyIncome: formData.annualIncome ? parseFloat(formData.annualIncome) / 12 : null,
        bankAccountBalance: formData.bankAccountBalance ? parseFloat(formData.bankAccountBalance) : null,
        investmentValue: formData.investmentValue ? parseFloat(formData.investmentValue) : null,
        propertyValue: formData.propertyValue ? parseFloat(formData.propertyValue) : null,
        vehicleValue: formData.vehicleValue ? parseFloat(formData.vehicleValue) : null,
        otherAssetsValue: formData.otherAssetsValue ? parseFloat(formData.otherAssetsValue) : null,
        creditCardBalances: formData.creditCardBalances ? parseFloat(formData.creditCardBalances) : null,
        creditCardLimits: formData.creditCardLimits ? parseFloat(formData.creditCardLimits) : null,
        existingLoans: JSON.stringify(formData.existingLoans),
        currentStep,
      };
      
      // Include Universa data and changed fields for existing members
      if (isExistingMember && profileData) {
        saveData.universaData = JSON.stringify(profileData);
        saveData.changedFields = JSON.stringify(Array.from(changedFields));
      }
      
      const res = await fetch(`/api/applications/${application.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData),
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error('Save failed:', errorData);
        throw new Error(`Failed to save: ${res.status}`);
      }
      
      // Success - data saved
      console.log('Application data saved successfully');
    } catch (error) {
      console.error('Error saving application:', error);
      // Silently handle the error for now since we have a workaround in the API
      // The API will retry without the problematic fields
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
      // Save final data with Universa tracking
      await handleSave();
      
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
        
        {/* Tab Navigation - Only show for existing members */}
        {isExistingMember && (
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('application')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'application'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Application
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile
                {profileData && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    From Universa
                  </span>
                )}
              </button>
            </nav>
          </div>
        )}
        
        {/* Profile Tab Content */}
        {activeTab === 'profile' && isExistingMember && profileData && (
          <div className="card mb-8">
            <h2 className="text-2xl font-bold mb-4">Your Profile Information</h2>
            <p className="text-sm text-gray-600 mb-6">
              Last updated from Universa: {new Date(profileData.lastUpdated).toLocaleDateString()}
            </p>
            
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary-700">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{profileData.firstName} {profileData.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-medium">{profileData.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">SIN</p>
                    <p className="font-medium">{profileData.sin}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Citizenship Status</p>
                    <p className="font-medium">{profileData.citizenshipStatus}</p>
                  </div>
                </div>
              </div>
              
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary-700">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{profileData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{profileData.phone}</p>
                  </div>
                </div>
              </div>
              
              {/* Address */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary-700">Current Address</h3>
                <div className="space-y-2">
                  <p className="font-medium">
                    {profileData.streetNumber} {profileData.streetName} {profileData.unit}
                  </p>
                  <p className="font-medium">
                    {profileData.city}, {profileData.province} {profileData.postalCode}
                  </p>
                  <p className="text-sm text-gray-600">
                    Time at address: {profileData.yearsAtAddress} years, {profileData.monthsAtAddress} months
                  </p>
                </div>
              </div>
              
              {/* Employment Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary-700">Employment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Employer</p>
                    <p className="font-medium">{profileData.employerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Employment Status</p>
                    <p className="font-medium">{profileData.employmentStatus}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Annual Income</p>
                    <p className="font-medium">${parseInt(profileData.annualIncome).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time with Employer</p>
                    <p className="font-medium">{profileData.employmentYears} years, {profileData.employmentMonths} months</p>
                  </div>
                </div>
              </div>
              
              {/* Financial Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary-700">Financial Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Monthly Housing Cost</p>
                    <p className="font-medium">${parseInt(profileData.monthlyHousingCost).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Other Monthly Debts</p>
                    <p className="font-medium">${parseInt(profileData.otherMonthlyDebts).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bank Account Balance</p>
                    <p className="font-medium">${parseInt(profileData.bankAccountBalance).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Investment Value</p>
                    <p className="font-medium">${parseInt(profileData.investmentValue).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Property Value</p>
                    <p className="font-medium">${parseInt(profileData.propertyValue).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vehicle Value</p>
                    <p className="font-medium">${parseInt(profileData.vehicleValue).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              {/* Banking Relationship */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary-700">Banking Relationship</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Primary Bank</p>
                    <p className="font-medium">{profileData.primaryBank}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Years with Bank</p>
                    <p className="font-medium">{profileData.bankingYears} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Account Type</p>
                    <p className="font-medium">{profileData.accountType}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This information is from your existing profile in our system. 
                When you fill out the application, any changes you make will be highlighted for review.
              </p>
            </div>
          </div>
        )}
        
        {/* Application Tab Content */}
        {activeTab === 'application' && (
          <>

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
                      {changedFields.has('firstName') && (
                        <span className="ml-2 text-xs text-yellow-600" title="Modified from profile">
                          (Updated)
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleFieldChange('firstName', e.target.value)}
                      className={`input ${changedFields.has('firstName') ? 'bg-yellow-50 border-yellow-300' : ''}`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                      {changedFields.has('lastName') && (
                        <span className="ml-2 text-xs text-yellow-600" title="Modified from profile">
                          (Updated)
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleFieldChange('lastName', e.target.value)}
                      className={`input ${changedFields.has('lastName') ? 'bg-yellow-50 border-yellow-300' : ''}`}
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
                      {addressLabels.streetNumber}
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
                      {addressLabels.streetName}
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
                    {addressLabels.unit} (Optional)
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
                      {addressLabels.city}
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
                      {addressLabels.province}
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
                    {addressLabels.postalCode}
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

                {/* Assets & Collateral Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Assets & Collateral</h3>
                  <p className="text-sm text-gray-600 mb-4">This information helps us assess your overall financial position</p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bank Account Balance
                        </label>
                        <input
                          type="number"
                          value={formData.bankAccountBalance}
                          onChange={(e) => setFormData({ ...formData, bankAccountBalance: e.target.value })}
                          placeholder="10000"
                          className="input"
                        />
                        <p className="text-sm text-gray-500 mt-1">Checking & savings</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Investment Accounts
                        </label>
                        <input
                          type="number"
                          value={formData.investmentValue}
                          onChange={(e) => setFormData({ ...formData, investmentValue: e.target.value })}
                          placeholder="25000"
                          className="input"
                        />
                        <p className="text-sm text-gray-500 mt-1">Stocks, bonds, TFSA, RRSP</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Real Estate Value
                        </label>
                        <input
                          type="number"
                          value={formData.propertyValue}
                          onChange={(e) => setFormData({ ...formData, propertyValue: e.target.value })}
                          placeholder="500000"
                          className="input"
                        />
                        <p className="text-sm text-gray-500 mt-1">Current market value</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vehicle Value
                        </label>
                        <input
                          type="number"
                          value={formData.vehicleValue}
                          onChange={(e) => setFormData({ ...formData, vehicleValue: e.target.value })}
                          placeholder="15000"
                          className="input"
                        />
                        <p className="text-sm text-gray-500 mt-1">All vehicles owned</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Other Assets (Optional)
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="number"
                          value={formData.otherAssetsValue}
                          onChange={(e) => setFormData({ ...formData, otherAssetsValue: e.target.value })}
                          placeholder="5000"
                          className="input"
                        />
                        <input
                          type="text"
                          value={formData.otherAssetsDesc}
                          onChange={(e) => setFormData({ ...formData, otherAssetsDesc: e.target.value })}
                          placeholder="Description (e.g., jewelry, art)"
                          className="input"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Liabilities Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Liabilities & Monthly Obligations</h3>
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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Credit Card Balances
                        </label>
                        <input
                          type="number"
                          value={formData.creditCardBalances}
                          onChange={(e) => setFormData({ ...formData, creditCardBalances: e.target.value })}
                          placeholder="2000"
                          className="input"
                        />
                        <p className="text-sm text-gray-500 mt-1">Total across all cards</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Credit Card Limits
                        </label>
                        <input
                          type="number"
                          value={formData.creditCardLimits}
                          onChange={(e) => setFormData({ ...formData, creditCardLimits: e.target.value })}
                          placeholder="10000"
                          className="input"
                        />
                        <p className="text-sm text-gray-500 mt-1">Total available credit</p>
                      </div>
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
                      <p className="text-sm text-gray-500 mt-1">Car payments, student loans, other loans</p>
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

                {/* Banking Relationship Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Banking Relationship</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Banking Institution
                      </label>
                      <input
                        type="text"
                        value={formData.primaryBank}
                        onChange={(e) => setFormData({ ...formData, primaryBank: e.target.value })}
                        placeholder="e.g., TD Bank, RBC"
                        className="input"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Years with Bank
                        </label>
                        <input
                          type="number"
                          value={formData.bankingYears}
                          onChange={(e) => setFormData({ ...formData, bankingYears: e.target.value })}
                          placeholder="5"
                          className="input"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Type
                        </label>
                        <select
                          value={formData.accountType}
                          onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                          className="input"
                        >
                          <option value="">Select type</option>
                          <option value="Checking">Checking</option>
                          <option value="Savings">Savings</option>
                          <option value="Both">Both</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Debt Service Ratio Calculation */}
                {formData.annualIncome && formData.monthlyHousingCost && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Financial Summary</h4>
                    <div className="text-sm text-blue-800 space-y-2">
                      <p>Monthly Income: ${(parseFloat(formData.annualIncome) / 12).toFixed(0)}</p>
                      <p>Total Assets: ${(
                        parseFloat(formData.bankAccountBalance || '0') +
                        parseFloat(formData.investmentValue || '0') +
                        parseFloat(formData.propertyValue || '0') +
                        parseFloat(formData.vehicleValue || '0') +
                        parseFloat(formData.otherAssetsValue || '0')
                      ).toLocaleString()}</p>
                      <p>Gross Debt Service (GDS): {
                        ((parseFloat(formData.monthlyHousingCost) / (parseFloat(formData.annualIncome) / 12)) * 100).toFixed(1)
                      }%</p>
                      <p>Total Debt Service (TDS): {
                        (((parseFloat(formData.monthlyHousingCost) + parseFloat(formData.otherMonthlyDebts || '0')) / (parseFloat(formData.annualIncome) / 12)) * 100).toFixed(1)
                      }%</p>
                      {formData.creditCardLimits && formData.creditCardBalances && (
                        <p>Credit Utilization: {
                          ((parseFloat(formData.creditCardBalances) / parseFloat(formData.creditCardLimits)) * 100).toFixed(1)
                        }%</p>
                      )}
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
                
                {/* Show changed fields for existing members */}
                {isExistingMember && changedFields.size > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                    <h3 className="font-semibold text-lg mb-4 text-yellow-800">
                      Updated Information
                    </h3>
                    <p className="text-sm text-yellow-700 mb-4">
                      The following fields have been modified from your Universa profile:
                    </p>
                    <div className="space-y-3">
                      {Array.from(changedFields).map(field => {
                        const fieldLabels: Record<string, string> = {
                          firstName: 'First Name',
                          lastName: 'Last Name',
                          email: 'Email',
                          phone: 'Phone',
                          dateOfBirth: 'Date of Birth',
                          sin: 'SIN',
                          citizenshipStatus: 'Citizenship Status',
                          employerName: 'Employer',
                          annualIncome: 'Annual Income',
                          // Add more field mappings as needed
                        };
                        
                        return (
                          <div key={field} className="flex items-center justify-between bg-white p-3 rounded border border-yellow-100">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700">{fieldLabels[field] || field}</p>
                              <div className="grid grid-cols-2 gap-4 mt-1">
                                <div>
                                  <p className="text-xs text-gray-500">Original (Universa)</p>
                                  <p className="text-sm">{profileData?.[field] || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Updated</p>
                                  <p className="text-sm font-medium">{formData[field as keyof typeof formData]}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

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
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">Required Consents</h3>
                    <button
                      type="button"
                      onClick={() => setConsents({
                        creditCheck: true,
                        fintrac: true,
                        privacy: true,
                        terms: true,
                        esignature: true,
                      })}
                      className="text-sm bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                    >
                      Consent to All
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="credit_check"
                        checked={consents.creditCheck}
                        onChange={(e) => setConsents({ ...consents, creditCheck: e.target.checked })}
                        className="mt-1 mr-3"
                      />
                      <label htmlFor="credit_check" className="text-sm text-gray-700">
                        <span className="font-medium">Credit Bureau Authorization:</span> I authorize the credit union to obtain credit reports from Equifax and/or TransUnion to assess my creditworthiness for this loan application.
                      </label>
                    </div>

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="fintrac"
                        checked={consents.fintrac}
                        onChange={(e) => setConsents({ ...consents, fintrac: e.target.checked })}
                        className="mt-1 mr-3"
                      />
                      <label htmlFor="fintrac" className="text-sm text-gray-700">
                        <span className="font-medium">FINTRAC Identity Verification:</span> I consent to the verification of my identity as required under Canadian anti-money laundering regulations.
                      </label>
                    </div>

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="privacy"
                        checked={consents.privacy}
                        onChange={(e) => setConsents({ ...consents, privacy: e.target.checked })}
                        className="mt-1 mr-3"
                      />
                      <label htmlFor="privacy" className="text-sm text-gray-700">
                        <span className="font-medium">Privacy Policy:</span> I have read and agree to the credit union's privacy policy regarding the collection, use, and disclosure of my personal information.
                      </label>
                    </div>

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={consents.terms}
                        onChange={(e) => setConsents({ ...consents, terms: e.target.checked })}
                        className="mt-1 mr-3"
                      />
                      <label htmlFor="terms" className="text-sm text-gray-700">
                        <span className="font-medium">Terms of Service <span className="text-red-500">*</span>:</span> I agree to the terms and conditions of the loan application and understand the obligations if my application is approved.
                      </label>
                    </div>

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="esignature"
                        checked={consents.esignature}
                        onChange={(e) => setConsents({ ...consents, esignature: e.target.checked })}
                        className="mt-1 mr-3"
                      />
                      <label htmlFor="esignature" className="text-sm text-gray-700">
                        <span className="font-medium">Electronic Signature Consent <span className="text-red-500">*</span>:</span> I consent to using electronic signatures for this application and understand they are legally binding.
                      </label>
                    </div>
                  </div>
                  
                  {!mandatoryConsentsChecked && (
                    <p className="text-sm text-red-600 mt-4">
                      * Mandatory consents must be checked to continue
                    </p>
                  )}
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
                disabled={loading || !mandatoryConsentsChecked}
                className={`btn-primary ml-auto ${!mandatoryConsentsChecked ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}