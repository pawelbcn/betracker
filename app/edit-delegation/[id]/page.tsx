"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, X } from 'lucide-react';
import DelegationForm from '@/components/DelegationForm';

interface Delegation {
  id: string;
  title: string;
  destination_country: string;
  destination_city: string;
  start_date: string;
  start_time?: string;
  end_date: string;
  end_time?: string;
  purpose: string;
  exchange_rate: number;
  daily_allowance: number;
  notes?: string;
}

export default function EditDelegationPage() {
  const [delegation, setDelegation] = useState<Delegation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const params = useParams();
  const delegationId = params.id as string;

  useEffect(() => {
    const fetchDelegation = async () => {
      try {
        const response = await fetch(`/api/delegations/${delegationId}`);
        if (response.ok) {
          const data = await response.json();
          setDelegation(data);
        } else {
          console.error('Failed to fetch delegation');
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching delegation:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    if (delegationId) {
      fetchDelegation();
    }
  }, [delegationId, router]);

  const handleSuccess = () => {
    router.push(`/delegations/${delegationId}`);
  };

  const handleCancel = () => {
    router.push(`/delegations/${delegationId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading delegation...</p>
        </div>
      </div>
    );
  }

  if (!delegation) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Delegation not found</h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to main page
          </button>
        </div>
      </div>
    );
  }

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
                Back to delegation
              </button>
              <h1 className="text-xl font-semibold text-neutral-900">
                Edit delegation: {delegation.title}
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
            delegation={{
              ...delegation,
              start_time: delegation.start_time || '09:00',
              end_time: delegation.end_time || '17:00'
            }}
          />
        </div>
      </div>
    </div>
  );
}
