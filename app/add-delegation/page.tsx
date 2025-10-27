"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X } from 'lucide-react';
import DelegationForm from '@/components/DelegationForm';

export default function AddDelegationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/');
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={handleCancel}
                className="flex items-center text-neutral-600 hover:text-neutral-900 mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Powrót
              </button>
              <h1 className="text-xl font-semibold text-neutral-900">
                Dodaj nową delegację
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <DelegationForm
            isOpen={true}
            onClose={handleCancel}
            onSuccess={handleSuccess}
            isStaticPage={true}
          />
        </div>
      </div>
    </div>
  );
}
