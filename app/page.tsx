"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, MapPin, Calendar, Plus, Download, MessageCircle } from 'lucide-react';
import DelegationForm from '@/components/DelegationForm';
import PersistentAIAssistant from '@/components/PersistentAIAssistant';
import { exportToPDF, exportToCSV } from '@/logic/export';
import { calculateTotalExpensesMultiCurrencySync, calculateDailyAllowance } from '@/logic/rules';
import { useLanguage } from '@/contexts/LanguageContext';

interface Delegation {
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
  expenses: Expense[];
}

interface Expense {
  id: string;
  delegation_id: string;
  date: string;
  category: string;
  amount: number;
  currency: string;
  description: string;
}

export default function Home() {
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDelegationForm, setShowDelegationForm] = useState(false);
  const [aiInitialData, setAiInitialData] = useState<any>(null);
  const [aiExpensesData, setAiExpensesData] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [selectedDelegations, setSelectedDelegations] = useState<Set<string>>(new Set());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const { t, isClient: isLanguageClient } = useLanguage();

  // Check authentication on mount
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const authStatus = sessionStorage.getItem('authenticated');
      if (authStatus === 'true') {
        setIsAuthenticated(true);
      } else {
        // Redirect to landing page if not authenticated
        router.push('/landing');
        return;
      }
    }
  }, [router]);

  const fetchDelegations = async () => {
    try {
      const response = await fetch('/api/delegations');
      if (response.ok) {
        const data = await response.json();
        setDelegations(data);
      }
    } catch (error) {
      console.error('Error fetching delegations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDelegations();
    }
  }, [isAuthenticated]);

  const handleSelectDelegation = (delegationId: string) => {
    const newSelected = new Set(selectedDelegations);
    if (newSelected.has(delegationId)) {
      newSelected.delete(delegationId);
    } else {
      newSelected.add(delegationId);
    }
    setSelectedDelegations(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedDelegations.size === delegations.length) {
      setSelectedDelegations(new Set());
    } else {
      setSelectedDelegations(new Set(delegations.map(d => d.id)));
    }
  };

  const handleExportIndividualPDF = async (delegation: Delegation) => {
    try {
      exportToPDF(delegation, delegation.expenses);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const handleExportIndividualCSV = async (delegation: Delegation) => {
    try {
      exportToCSV(delegation, delegation.expenses);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const handleExportSelectedPDFs = async () => {
    const selectedDelegationsArray = Array.from(selectedDelegations);
    const selectedDelegationsData = delegations.filter(d => selectedDelegationsArray.includes(d.id));
    
    if (selectedDelegationsData.length === 0) return;
    
    try {
      // Export each delegation individually
      for (const delegation of selectedDelegationsData) {
        exportToPDF(delegation, delegation.expenses);
      }
    } catch (error) {
      console.error('Error exporting selected PDFs:', error);
    }
  };

  const handleExportSelectedCSVs = async () => {
    const selectedDelegationsArray = Array.from(selectedDelegations);
    const selectedDelegationsData = delegations.filter(d => selectedDelegationsArray.includes(d.id));
    
    if (selectedDelegationsData.length === 0) return;
    
    try {
      // Export each delegation individually
      for (const delegation of selectedDelegationsData) {
        exportToCSV(delegation, delegation.expenses);
      }
    } catch (error) {
      console.error('Error exporting selected CSVs:', error);
    }
  };

  const handleExportAllPDF = async () => {
    if (delegations.length === 0) return;
    
    try {
      // Export each delegation individually
      for (const delegation of delegations) {
        exportToPDF(delegation, delegation.expenses);
      }
    } catch (error) {
      console.error('Error exporting all PDFs:', error);
    }
  };

  const handleExportAllCSV = async () => {
    if (delegations.length === 0) return;
    
    try {
      // Export each delegation individually
      for (const delegation of delegations) {
        exportToCSV(delegation, delegation.expenses);
      }
    } catch (error) {
      console.error('Error exporting all CSVs:', error);
    }
  };

  // Show loading or redirect if not authenticated
  if (!isClient || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Ładowanie delegacji...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">{t('main.title')}</h1>
          <p className="text-neutral-600 mt-1">{t('main.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowDelegationForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('main.add_travel')}
        </button>
      </div>

      {/* Export Section */}
      {delegations.length > 0 && (
        <div className="card p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">{t('main.export_all')}</h3>
              <p className="text-neutral-600 text-sm">{t('main.export_all_desc')}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExportAllPDF}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                {t('main.export_all_pdfs')}
              </button>
              <button
                onClick={handleExportAllCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                {t('main.export_all_csvs')}
              </button>
            </div>
          </div>

          {/* Selected Delegations Export */}
          {selectedDelegations.size > 0 && (
            <div className="mt-4 pt-4 border-t border-neutral-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h4 className="font-medium text-neutral-900">
                    {t('main.export_selected').replace('{count}', selectedDelegations.size.toString())}
                  </h4>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleExportSelectedPDFs}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    {t('main.export_selected_pdfs').replace('{count}', selectedDelegations.size.toString())}
                  </button>
                  <button
                    onClick={handleExportSelectedCSVs}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    {t('main.export_selected_csvs').replace('{count}', selectedDelegations.size.toString())}
                  </button>
                  <button
                    onClick={() => setSelectedDelegations(new Set())}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-colors text-sm"
                  >
                    {t('main.clear_selection')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delegations List */}
      {delegations.length === 0 ? (
        <div className="card p-12 text-center">
          <Plane className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">Brak delegacji</h3>
          <p className="text-neutral-600 mb-6">Dodaj pierwszą delegację służbową, aby rozpocząć korzystanie z aplikacji.</p>
          <button
            onClick={() => setShowDelegationForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <Plus className="w-5 h-5" />
            {t('main.add_travel')}
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedDelegations.size === delegations.length && delegations.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    {t('table.business_travel')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    {t('table.destination')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    {t('table.dates')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    {t('table.purpose')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    {t('table.meals_allowance')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    {t('table.expenses')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    {t('table.total')}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    {t('table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {delegations.map((delegation) => {
                  const totalExpenses = calculateTotalExpensesMultiCurrencySync(delegation.expenses);
                  const totalAllowance = calculateDailyAllowance(delegation);
                  const total = totalExpenses + totalAllowance;

                  return (
                    <tr key={delegation.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedDelegations.has(delegation.id)}
                          onChange={() => handleSelectDelegation(delegation.id)}
                          className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-neutral-900">{delegation.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-neutral-400 mr-2" />
                          <div className="text-sm text-neutral-900">
                            {delegation.destination_city}, {delegation.destination_country}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-neutral-400 mr-2" />
                          <div className="text-sm text-neutral-900">
                            {new Date(delegation.start_date).toLocaleDateString()} - {new Date(delegation.end_date).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-neutral-900 max-w-xs truncate">
                          {delegation.purpose}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-medium text-neutral-900">
                          {totalAllowance.toFixed(2)} PLN
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-medium text-neutral-900">
                          {totalExpenses.toFixed(2)} PLN
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-semibold text-neutral-900">
                          {total.toFixed(2)} PLN
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleExportIndividualPDF(delegation)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Eksportuj PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleExportIndividualCSV(delegation)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Eksportuj CSV"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <a
                            href={`/delegations/${delegation.id}`}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Zobacz szczegóły"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delegation Form Modal */}
      {showDelegationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <DelegationForm
              isOpen={showDelegationForm}
              onClose={() => setShowDelegationForm(false)}
              onSuccess={() => {
                setShowDelegationForm(false);
                fetchDelegations();
              }}
            />
          </div>
        </div>
      )}

      {/* AI Assistant */}
      <PersistentAIAssistant
        onAddDelegation={(delegation, expenses) => {
          // Handle delegation creation
          fetchDelegations();
        }}
        onAddExpense={(expense, delegationId) => {
          // Handle expense creation
          fetchDelegations();
        }}
        onUpdateExpense={(expenseId, expense) => {
          // Handle expense update
          fetchDelegations();
        }}
        allowNewDelegations={true}
      />
    </div>
  );
}