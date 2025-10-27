"use client";
import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface DelegationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  delegation?: {
    id: string;
    title: string;
    destination_country: string;
    destination_city: string;
    start_date: string;
    start_time: string;
    end_date: string;
    end_time: string;
    purpose: string;
    exchange_rate: number;
    daily_allowance: number;
    notes?: string;
  } | null;
  initialData?: {
    title?: string;
    destination_country?: string;
    destination_city?: string;
    start_date?: string;
    start_time?: string;
    end_date?: string;
    end_time?: string;
    purpose?: string;
    exchange_rate?: number;
    daily_allowance?: number;
    notes?: string;
  };
  expensesData?: Array<{
    date: string;
    category: string;
    amount: number;
    currency: string;
    description: string;
  }>;
}

export default function DelegationForm({ isOpen, onClose, onSuccess, delegation, initialData, expensesData }: DelegationFormProps) {
  const [formData, setFormData] = useState({
    title: delegation?.title || initialData?.title || '',
    destination_country: delegation?.destination_country || initialData?.destination_country || '',
    destination_city: delegation?.destination_city || initialData?.destination_city || '',
    start_date: delegation?.start_date ? delegation.start_date.split('T')[0] : initialData?.start_date || '',
    start_time: delegation?.start_time || initialData?.start_time || '09:00',
    end_date: delegation?.end_date ? delegation.end_date.split('T')[0] : initialData?.end_date || '',
    end_time: delegation?.end_time || initialData?.end_time || '17:00',
    purpose: delegation?.purpose || initialData?.purpose || '',
    exchange_rate: delegation?.exchange_rate || initialData?.exchange_rate || 4.35,
    daily_allowance: delegation?.daily_allowance || initialData?.daily_allowance || 43,
    notes: delegation?.notes || initialData?.notes || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form data when delegation prop or initialData changes
  useEffect(() => {
    if (delegation) {
      setFormData({
        title: delegation.title || '',
        destination_country: delegation.destination_country || '',
        destination_city: delegation.destination_city || '',
        start_date: delegation.start_date ? delegation.start_date.split('T')[0] : '',
        start_time: delegation.start_time || '09:00',
        end_date: delegation.end_date ? delegation.end_date.split('T')[0] : '',
        end_time: delegation.end_time || '17:00',
        purpose: delegation.purpose || '',
        exchange_rate: delegation.exchange_rate || 4.35,
        daily_allowance: delegation.daily_allowance || 43,
        notes: delegation.notes || ''
      });
    } else if (initialData) {
      // Pre-fill form with AI assistant data
      setFormData({
        title: initialData.title || '',
        destination_country: initialData.destination_country || '',
        destination_city: initialData.destination_city || '',
        start_date: initialData.start_date || '',
        start_time: initialData.start_time || '09:00',
        end_date: initialData.end_date || '',
        end_time: initialData.end_time || '17:00',
        purpose: initialData.purpose || '',
        exchange_rate: initialData.exchange_rate || 4.35,
        daily_allowance: initialData.daily_allowance || 43,
        notes: initialData.notes || ''
      });
    } else {
      // Reset form for new delegation
      setFormData({
        title: '',
        destination_country: '',
        destination_city: '',
        start_date: '',
        start_time: '09:00',
        end_date: '',
        end_time: '17:00',
        purpose: '',
        exchange_rate: 4.35,
        daily_allowance: 43,
        notes: ''
      });
    }
  }, [delegation, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!formData.title.trim()) {
      setError('Business travel title is required');
      setLoading(false);
      return;
    }
    if (!formData.destination_country) {
      setError('Destination country is required');
      setLoading(false);
      return;
    }
    if (!formData.destination_city.trim()) {
      setError('Destination city is required');
      setLoading(false);
      return;
    }
    if (!formData.start_date || !formData.end_date) {
      setError('Start and end dates are required');
      setLoading(false);
      return;
    }
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      setError('End date must be after start date');
      setLoading(false);
      return;
    }
    if (!formData.purpose.trim()) {
      setError('Purpose is required');
      setLoading(false);
      return;
    }
    if (formData.exchange_rate <= 0) {
      setError('Exchange rate must be greater than 0');
      setLoading(false);
      return;
    }
    if (formData.daily_allowance <= 0) {
      setError('Daily allowance must be greater than 0');
      setLoading(false);
      return;
    }

    try {
      const url = delegation ? `/api/delegations/${delegation.id}` : '/api/delegations';
      const method = delegation ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        
        // If we have expenses data and this is a new delegation, create the expenses
        if (expensesData && expensesData.length > 0 && !delegation) {
          const delegationId = result.id;
          
          // Create each expense
          for (const expense of expensesData) {
            try {
              await fetch('/api/expenses', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  ...expense,
                  delegation_id: delegationId
                }),
              });
            } catch (expenseError) {
              console.error('Error creating expense:', expenseError);
              // Continue with other expenses even if one fails
            }
          }
        }
        
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          title: '',
          destination_country: '',
          destination_city: '',
          start_date: '',
          start_time: '09:00',
          end_date: '',
          end_time: '17:00',
          purpose: '',
          exchange_rate: 4.35,
          daily_allowance: 43,
          notes: ''
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save business travel');
      }
    } catch (error) {
      console.error('Error saving delegation:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'exchange_rate' || name === 'daily_allowance' ? parseFloat(value) || 0 : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">
              {delegation ? 'Edit Business Travel' : 'Add New Business Travel'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First line: Business Travel Title and Purpose */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Business Travel Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Berlin Tech Conference"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Purpose *
                </label>
                <input
                  type="text"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Client project kickoff meeting"
                />
              </div>
            </div>

            {/* Second line: Destination City and Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Destination City *
                </label>
                <input
                  type="text"
                  name="destination_city"
                  value={formData.destination_city}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Berlin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Destination Country *
                </label>
                <select
                  name="destination_country"
                  value={formData.destination_country}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Country</option>
                  <option value="Hungary">Hungary</option>
                  <option value="Germany">Germany</option>
                  <option value="Italy">Italy</option>
                  <option value="France">France</option>
                  <option value="Czech Republic">Czech Republic</option>
                  <option value="Poland">Poland</option>
                  <option value="Austria">Austria</option>
                  <option value="Slovakia">Slovakia</option>
                </select>
              </div>
            </div>

            {/* Third line: Start Date and Start Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Fourth line: End Date and End Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Fifth line: Daily Allowance and Exchange Rate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Daily Allowance (EUR) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="daily_allowance"
                  value={formData.daily_allowance}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="43"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Exchange Rate (EUR to PLN) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="exchange_rate"
                  value={formData.exchange_rate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="4.35"
                />
              </div>
            </div>


            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Additional notes about the business travel..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-neutral-600 hover:text-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : (delegation ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
