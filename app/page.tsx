"use client";
import { useRouter } from 'next/navigation';
import { Plane, MapPin, Calendar, Plus, Download, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import DelegationForm from '@/components/DelegationForm';
import PersistentAIAssistant from '@/components/PersistentAIAssistant';
import { exportToPDF, exportToCSV } from '@/logic/export';
import { calculateTotalExpensesMultiCurrency, calculateDailyAllowance } from '@/logic/rules';

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
  const router = useRouter();

  const fetchDelegations = async () => {
    try {
      const response = await fetch('/api/delegations');
      const data = await response.json();
      // Ensure data is an array
      setDelegations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching delegations:', error);
      setDelegations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Ensure we're on the client side
    setIsClient(true);
    fetchDelegations();
  }, []);

  // Don't render until we're on the client side
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleRowClick = (delegationId: string) => {
    router.push(`/delegations/${delegationId}`);
  };

  // Selection handlers
  const handleSelectDelegation = (delegationId: string) => {
    setSelectedDelegations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(delegationId)) {
        newSet.delete(delegationId);
      } else {
        newSet.add(delegationId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedDelegations.size === delegations.length) {
      setSelectedDelegations(new Set());
    } else {
      setSelectedDelegations(new Set(delegations.map(d => d.id)));
    }
  };

  // Individual export handlers
  const handleExportIndividualPDF = async (delegation: Delegation) => {
    try {
      const response = await fetch(`/api/expenses?delegationId=${delegation.id}`);
      const expenses = await response.json();
      exportToPDF(delegation, expenses);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const handleExportIndividualCSV = async (delegation: Delegation) => {
    try {
      const response = await fetch(`/api/expenses?delegationId=${delegation.id}`);
      const expenses = await response.json();
      exportToCSV(delegation, expenses);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  // Bulk export handlers
  const handleExportSelectedPDFs = async () => {
    for (const delegationId of selectedDelegations) {
      const delegation = delegations.find(d => d.id === delegationId);
      if (delegation) {
        try {
          const response = await fetch(`/api/expenses?delegationId=${delegation.id}`);
          const expenses = await response.json();
          exportToPDF(delegation, expenses);
        } catch (error) {
          console.error(`Error exporting PDF for ${delegation.title}:`, error);
        }
      }
    }
  };

  const handleExportSelectedCSVs = async () => {
    for (const delegationId of selectedDelegations) {
      const delegation = delegations.find(d => d.id === delegationId);
      if (delegation) {
        try {
          const response = await fetch(`/api/expenses?delegationId=${delegation.id}`);
          const expenses = await response.json();
          exportToCSV(delegation, expenses);
        } catch (error) {
          console.error(`Error exporting CSV for ${delegation.title}:`, error);
        }
      }
    }
  };

  const handleDelegationSuccess = () => {
    fetchDelegations(); // Refresh the list
    setAiInitialData(null); // Clear AI initial data
    setAiExpensesData([]); // Clear AI expenses data
  };

  const exportAllToPDF = () => {
    delegations.forEach(delegation => {
      exportToPDF(delegation, delegation.expenses || []);
    });
  };

  const exportAllToCSV = () => {
    delegations.forEach(delegation => {
      exportToCSV(delegation, delegation.expenses || []);
    });
  };

  const handleAIDelegation = (delegationData: any, expensesData?: any[]) => {
    // Set the initial data for the form
    setAiInitialData(delegationData);
    setAiExpensesData(expensesData || []);
    // Open delegation form
    setShowDelegationForm(true);
  };

  const handleAIExpense = (expenseData: any, delegationId?: string) => {
    // This will be handled by the persistent assistant
    console.log('Expense data:', expenseData, 'Delegation ID:', delegationId);
  };

  const handleUpdateExpense = (expenseId: string, expenseData: any) => {
    // This will be handled by the persistent assistant
    console.log('Update expense:', expenseId, expenseData);
  };

  const handleNavigateToDelegation = (delegationId: string) => {
    router.push(`/delegations/${delegationId}`);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-neutral-900">Business Travel</h1>
          <p className="text-neutral-600">Track and manage your business travel expenses</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-neutral-500">Loading business travel...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Business Travel</h1>
            <p className="text-neutral-600">Track and manage your business travel expenses</p>
          </div>
          <button
            onClick={() => setShowDelegationForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Business Travel
          </button>
        </div>

        {/* Export Section */}
        <div className="card p-4">
          <h2 className="text-lg font-semibold text-neutral-900 mb-3">Export Business Travel</h2>
          <p className="text-neutral-600 mb-3">
            {selectedDelegations.size > 0 
              ? `Export ${selectedDelegations.size} selected business travel(s)`
              : "Export all business travel at once for accounting purposes"
            }
          </p>
          <div className="flex flex-wrap gap-3">
            {selectedDelegations.size > 0 ? (
              <>
                <button
                  onClick={handleExportSelectedPDFs}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Selected PDFs ({selectedDelegations.size})
                </button>
                <button
                  onClick={handleExportSelectedCSVs}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Selected CSVs ({selectedDelegations.size})
                </button>
                <button
                  onClick={() => setSelectedDelegations(new Set())}
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-500 text-white hover:bg-neutral-600 transition-colors"
                >
                  Clear Selection
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={exportAllToPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export All PDFs
                </button>
                <button
                  onClick={exportAllToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-200 text-neutral-900 hover:bg-neutral-300 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export All CSVs
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Business Travel */}
      <div className="space-y-4">

            {/* Desktop Table View */}
            <div className="hidden md:block card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-neutral-200" style={{ minWidth: '800px' }}>
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-12">
                        <input
                          type="checkbox"
                          checked={selectedDelegations.size === delegations.length && delegations.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Business Travel
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Destination
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Purpose
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Meals Allowance
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Expenses
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-32">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {Array.isArray(delegations) && delegations.map((delegation) => (
                      <tr 
                        key={delegation.id} 
                        className={`hover:bg-neutral-50 transition-colors ${selectedDelegations.has(delegation.id) ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-3 py-3 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedDelegations.has(delegation.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectDelegation(delegation.id);
                            }}
                            className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td 
                          className="px-3 py-3 whitespace-nowrap cursor-pointer"
                          onClick={() => handleRowClick(delegation.id)}
                        >
                          <div className="flex items-center">
                            <Plane className="w-4 h-4 text-blue-600 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-neutral-900">
                                {delegation.title}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {delegation.id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td 
                          className="px-3 py-3 whitespace-nowrap cursor-pointer"
                          onClick={() => handleRowClick(delegation.id)}
                        >
                          <div className="text-sm text-neutral-600">
                            {delegation.destination_city}, {delegation.destination_country}
                          </div>
                        </td>
                        <td 
                          className="px-3 py-3 whitespace-nowrap cursor-pointer"
                          onClick={() => handleRowClick(delegation.id)}
                        >
                          <div className="text-sm text-neutral-600">
                            {new Date(delegation.start_date).toLocaleDateString('en-GB')} - {new Date(delegation.end_date).toLocaleDateString('en-GB')}
                          </div>
                        </td>
                        <td 
                          className="px-3 py-3 text-sm text-neutral-900 max-w-[200px] cursor-pointer"
                          onClick={() => handleRowClick(delegation.id)}
                        >
                          <div className="truncate" title={delegation.purpose}>
                            {delegation.purpose}
                          </div>
                        </td>
                        <td 
                          className="px-3 py-3 whitespace-nowrap text-sm text-neutral-600 cursor-pointer"
                          onClick={() => handleRowClick(delegation.id)}
                        >
                          {calculateDailyAllowance(delegation).toFixed(2)} PLN
                        </td>
                        <td 
                          className="px-3 py-3 whitespace-nowrap text-sm text-neutral-600 cursor-pointer"
                          onClick={() => handleRowClick(delegation.id)}
                        >
                          {calculateTotalExpensesMultiCurrency(delegation.expenses).toFixed(2)} PLN
                        </td>
                        <td 
                          className="px-3 py-3 whitespace-nowrap text-sm font-medium text-neutral-900 cursor-pointer"
                          onClick={() => handleRowClick(delegation.id)}
                        >
                          {(calculateTotalExpensesMultiCurrency(delegation.expenses) + calculateDailyAllowance(delegation)).toFixed(2)} PLN
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExportIndividualPDF(delegation);
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Export PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExportIndividualCSV(delegation);
                              }}
                              className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Export CSV"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {delegations.map((delegation) => (
                <div
                  key={delegation.id}
                  className={`card p-4 hover:shadow-md transition-shadow ${selectedDelegations.has(delegation.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedDelegations.has(delegation.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectDelegation(delegation.id);
                        }}
                        className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 mr-3"
                      />
                      <Plane className="w-5 h-5 text-blue-600 mr-2" />
                      <div className="flex-1">
                        <h3 
                          className="font-semibold text-neutral-900 cursor-pointer"
                          onClick={() => handleRowClick(delegation.id)}
                        >
                          {delegation.title}
                        </h3>
                        <p className="text-xs text-neutral-500">{delegation.id}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1">
                      {calculateDailyAllowance(delegation).toFixed(2)} PLN
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-neutral-600">
                      <MapPin className="w-4 h-4 text-neutral-400 mr-2" />
                      {delegation.destination_city}, {delegation.destination_country}
                    </div>
                    
                    <div className="flex items-center text-sm text-neutral-600">
                      <Calendar className="w-4 h-4 text-neutral-400 mr-2" />
                      {new Date(delegation.start_date).toLocaleDateString()} - {new Date(delegation.end_date).toLocaleDateString()}
                    </div>
                    
                    <p className="text-sm text-neutral-700 mt-2 line-clamp-2">
                      {delegation.purpose}
                    </p>
                    
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-neutral-200">
                      <div className="text-sm text-neutral-600">
                        <div>Expenses: {calculateTotalExpensesMultiCurrency(delegation.expenses).toFixed(2)} PLN</div>
                        <div>Allowance: {calculateDailyAllowance(delegation).toFixed(2)} PLN</div>
                      </div>
                      <div className="text-lg font-semibold text-neutral-900">
                        {(calculateTotalExpensesMultiCurrency(delegation.expenses) + calculateDailyAllowance(delegation)).toFixed(2)} PLN
                      </div>
                    </div>
                    
                    {/* Mobile Export Buttons */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-neutral-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportIndividualPDF(delegation);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        PDF
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportIndividualCSV(delegation);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        CSV
                      </button>
                    </div>
                  </div>
              </div>
            ))}
          </div>
      </div>

          {/* Delegation Form Modal */}
          <DelegationForm
            isOpen={showDelegationForm}
            onClose={() => {
              setShowDelegationForm(false);
              setAiInitialData(null);
              setAiExpensesData([]);
            }}
            onSuccess={handleDelegationSuccess}
            initialData={aiInitialData}
            expensesData={aiExpensesData}
          />

          {/* Persistent AI Assistant */}
          <PersistentAIAssistant
            onAddDelegation={handleAIDelegation}
            onAddExpense={handleAIExpense}
            onUpdateExpense={handleUpdateExpense}
            onNavigateToDelegation={handleNavigateToDelegation}
          />
    </div>
  );
}
