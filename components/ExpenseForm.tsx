"use client";
import { useState, useEffect } from 'react';
import { X, Save, TrendingUp, Calculator, Upload, FileText, Download } from 'lucide-react';
import { getExchangeRateForDate } from '@/logic/exchangeRates';
import { ReceiptViewer } from '@/components/ReceiptViewer';

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  delegationId: string;
  expense?: {
    id: string;
    date: string;
    category: string;
    amount: number;
    currency: string;
    description: string;
    receipt_url?: string | null;
  } | null;
}

export default function ExpenseForm({ isOpen, onClose, onSuccess, delegationId, expense }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    date: expense?.date ? expense.date.split('T')[0] : '',
    category: expense?.category || '',
    amount: expense?.amount || 0,
    currency: expense?.currency || 'EUR',
    description: expense?.description || '',
    receipt_url: expense?.receipt_url || null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // Update form data when expense prop changes
  useEffect(() => {
    if (expense) {
      setFormData({
        date: expense.date ? expense.date.split('T')[0] : '',
        category: expense.category || '',
        amount: expense.amount || 0,
        currency: expense.currency || 'EUR',
        description: expense.description || '',
        receipt_url: expense.receipt_url || null
      });
      setSelectedFile(null);
    } else {
      // Reset form for new expense
      setFormData({
        date: '',
        category: '',
        amount: 0,
        currency: 'EUR',
        description: '',
        receipt_url: null
      });
      setSelectedFile(null);
    }
  }, [expense]);

  // Fetch exchange rate when currency and date change
  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (!formData.currency || !formData.date || formData.currency === 'PLN') {
        setExchangeRate(null);
        setRateError(null);
        return;
      }

      setRateLoading(true);
      setRateError(null);

      try {
        const rate = await getExchangeRateForDate(formData.currency, formData.date);
        setExchangeRate(rate);
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
        setRateError('Failed to fetch exchange rate');
        setExchangeRate(null);
      } finally {
        setRateLoading(false);
      }
    };

    fetchExchangeRate();
  }, [formData.currency, formData.date]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Only images and PDFs are allowed.');
        return;
      }
      
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError('File size exceeds 10MB limit.');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!formData.date) {
      setError('Date is required');
      setLoading(false);
      return;
    }
    if (!formData.category) {
      setError('Category is required');
      setLoading(false);
      return;
    }
    if (formData.amount <= 0) {
      setError('Amount must be greater than 0');
      setLoading(false);
      return;
    }
    if (!formData.currency) {
      setError('Currency is required');
      setLoading(false);
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      setLoading(false);
      return;
    }

    try {
      let receiptUrl = formData.receipt_url;

      // Upload receipt if a new file is selected
      if (selectedFile) {
        setUploadingReceipt(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);

        const uploadResponse = await fetch('/api/upload-receipt', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          setError(errorData.error || 'Failed to upload receipt');
          setLoading(false);
          setUploadingReceipt(false);
          return;
        }

        const uploadData = await uploadResponse.json();
        receiptUrl = uploadData.url;
        setUploadingReceipt(false);
      }

      const url = expense ? `/api/expenses/${expense.id}` : '/api/expenses';
      const method = expense ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          receipt_url: receiptUrl,
          delegation_id: delegationId
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          date: '',
          category: '',
          amount: 0,
          currency: 'EUR',
          description: '',
          receipt_url: null
        });
        setSelectedFile(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save expense');
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setUploadingReceipt(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white shadow-xl max-w-lg w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">
              {expense ? 'Edit Expense' : 'Add New Expense'}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  <option value="hotel">Hotel</option>
                  <option value="flight">Flight</option>
                  <option value="transport">Transport</option>
                  <option value="taxi">Taxi</option>
                  <option value="food">Food</option>
                  <option value="misc">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Currency *
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {/* Major European currencies */}
                  <optgroup label="Major European">
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CHF">CHF - Swiss Franc</option>
                    <option value="NOK">NOK - Norwegian Krone</option>
                    <option value="SEK">SEK - Swedish Krona</option>
                    <option value="DKK">DKK - Danish Krone</option>
                  </optgroup>
                  
                  {/* Central/Eastern European currencies */}
                  <optgroup label="Central/Eastern European">
                    <option value="PLN">PLN - Polish Złoty</option>
                    <option value="HUF">HUF - Hungarian Forint</option>
                    <option value="CZK">CZK - Czech Koruna</option>
                    <option value="RON">RON - Romanian Leu</option>
                    <option value="BGN">BGN - Bulgarian Lev</option>
                    <option value="HRK">HRK - Croatian Kuna</option>
                    <option value="RSD">RSD - Serbian Dinar</option>
                  </optgroup>
                  
                  {/* Major global currencies */}
                  <optgroup label="Major Global">
                    <option value="USD">USD - US Dollar</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="CNY">CNY - Chinese Yuan</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="BRL">BRL - Brazilian Real</option>
                    <option value="MXN">MXN - Mexican Peso</option>
                  </optgroup>
                  
                  {/* Middle East & Africa */}
                  <optgroup label="Middle East & Africa">
                    <option value="AED">AED - UAE Dirham</option>
                    <option value="SAR">SAR - Saudi Riyal</option>
                    <option value="ZAR">ZAR - South African Rand</option>
                    <option value="EGP">EGP - Egyptian Pound</option>
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Exchange Rate Display and Conversion Preview */}
            {formData.currency && formData.currency !== 'PLN' && formData.date && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Exchange Rate Information</span>
                </div>
                
                {rateLoading ? (
                  <div className="text-sm text-blue-700">Loading exchange rate...</div>
                ) : rateError ? (
                  <div className="text-sm text-red-600">⚠️ {rateError}</div>
                ) : exchangeRate ? (
                  <div className="space-y-2">
                    <div className="text-sm text-blue-800">
                      <strong>NBP Rate:</strong> 1 {formData.currency} = {exchangeRate.toFixed(4)} PLN
                    </div>
                    {formData.amount > 0 && (
                      <div className="flex items-center gap-2 text-sm text-blue-800">
                        <Calculator className="w-4 h-4" />
                        <strong>Converted Amount:</strong> {formData.amount.toFixed(2)} {formData.currency} = {(formData.amount * exchangeRate).toFixed(2)} PLN
                      </div>
                    )}
                    <div className="text-xs text-blue-600">
                      Rate from last working day before {new Date(formData.date).toLocaleDateString()}
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Hotel Arkadia - 2 nights"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Receipt (Optional)
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded cursor-pointer hover:bg-neutral-50 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Choose File</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {selectedFile && (
                    <span className="text-sm text-neutral-600">{selectedFile.name}</span>
                  )}
                </div>
                {formData.receipt_url && !selectedFile && (
                  <div className="flex items-center gap-2 p-2 bg-neutral-50 border border-neutral-200 rounded">
                    <FileText className="w-4 h-4 text-neutral-600" />
                    <span className="text-sm text-neutral-600">Current receipt:</span>
                    <ReceiptViewer
                      url={formData.receipt_url}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>View Receipt</span>
                    </ReceiptViewer>
                  </div>
                )}
                <p className="text-xs text-neutral-500">
                  Supported formats: JPG, PNG, GIF, WebP, PDF (Max 10MB)
                </p>
              </div>
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
                disabled={loading || uploadingReceipt}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                {uploadingReceipt ? 'Uploading...' : loading ? 'Saving...' : (expense ? 'Update' : 'Add')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
