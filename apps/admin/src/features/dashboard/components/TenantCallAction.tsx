import React from 'react';
import { Phone, PhoneOff } from 'lucide-react';

export function normalizePhoneNumber(phone?: string | null): string | null {
  if (!phone) return null;
  // Remove non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it's a 10 digit Indian number without +91, add +91
  if (cleaned.length === 10 && !cleaned.startsWith('+')) {
    cleaned = '+91' + cleaned;
  }
  
  return cleaned;
}

interface TenantCallActionProps {
  tenantName: string;
  phoneNumber?: string | null;
  className?: string;
}

export const TenantCallAction: React.FC<TenantCallActionProps> = ({ 
  tenantName, 
  phoneNumber,
  className = ""
}) => {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  
  if (!normalizedPhone) {
    return (
      <button 
        disabled
        title="Phone unavailable"
        aria-label="Phone unavailable"
        className={`inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-100 dark:border-gray-800/50 ${className}`}
      >
        <PhoneOff className="w-3.5 h-3.5" />
        <span className="hidden xl:inline">Call</span>
      </button>
    );
  }

  return (
    <a 
      href={`tel:${normalizedPhone}`}
      aria-label={`Call ${tenantName}`}
      title={`Call ${tenantName}`}
      className={`inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-400 transition cursor-pointer border border-green-200 dark:border-green-800 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <Phone className="w-3.5 h-3.5" />
      <span className="hidden xl:inline">Call</span>
    </a>
  );
};
