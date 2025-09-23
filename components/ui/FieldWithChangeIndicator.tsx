'use client';

import { useState } from 'react';

interface FieldWithChangeIndicatorProps {
  label: string;
  value: string | number | null | undefined;
  originalValue?: string | number | null | undefined;
  isChanged?: boolean;
}

export default function FieldWithChangeIndicator({ 
  label, 
  value, 
  originalValue, 
  isChanged = false 
}: FieldWithChangeIndicatorProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const displayValue = value || 'N/A';
  const displayOriginal = originalValue || 'N/A';
  
  return (
    <div>
      <p className="text-sm text-gray-600 flex items-center gap-2">
        {label}
        {isChanged && (
          <span 
            className="relative inline-flex items-center"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <svg 
              className="w-4 h-4 text-yellow-500" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
            
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
                <div className="space-y-1">
                  <div>
                    <span className="text-yellow-300">Original:</span> {displayOriginal}
                  </div>
                  <div>
                    <span className="text-green-300">Updated:</span> {displayValue}
                  </div>
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <svg className="w-2 h-2 text-gray-900" viewBox="0 0 8 8">
                    <polygon points="4,8 0,0 8,0" fill="currentColor" />
                  </svg>
                </div>
              </div>
            )}
          </span>
        )}
      </p>
      <p className={`font-medium ${isChanged ? 'text-yellow-700 bg-yellow-50 px-2 py-1 rounded' : ''}`}>
        {displayValue}
      </p>
    </div>
  );
}