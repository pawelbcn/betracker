"use client";
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, Utensils, Plus, Edit, Trash2 } from 'lucide-react';
import { ExpenseTable } from '@/components/ExpenseTable';
import { SummaryCard } from '@/components/SummaryCard';
import ExportMenu from '@/components/ExportMenu';
import ExpenseForm from '@/components/ExpenseForm';
import DelegationForm from '@/components/DelegationForm';
import PersistentAIAssistant from '@/components/PersistentAIAssistant';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getExchangeRateForCurrency } from '@/logic/rules';

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

export default function DelegationPage({ params }: { params: { id: string } }) {
  const [delegation, setDelegation] = useState<Delegation | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showDelegationForm, setShowDelegationForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchDelegationData();
  }, [params.id]);

  const fetchDelegationData = async () => {
    try {
      const response = await fetch(`/api/delegations/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setDelegation(data);
        setExpenses(data.expenses || []);
      } else {
        notFound();
      }
    } catch (error) {
      console.error('Error fetching delegation:', error);
      notFound();
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseSuccess = () => {
    fetchDelegationData(); // Refresh the data
    setEditingExpense(null);
  };

  const handleDelegationSuccess = () => {
    fetchDelegationData(); // Refresh the data
    setShowDelegationForm(false);
  };

  const handleEditDelegation = () => {
    setShowDelegationForm(true);
  };

  const handleDeleteDelegation = async () => {
    if (confirm('Are you sure you want to delete this delegation? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/delegations/${params.id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          router.push('/'); // Redirect to dashboard
        } else {
          alert('Failed to delete delegation');
        }
      } catch (error) {
        console.error('Error deleting delegation:', error);
        alert('Error deleting delegation');
      }
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        const response = await fetch(`/api/expenses/${expenseId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchDelegationData(); // Refresh the data
        } else {
          alert('Failed to delete expense');
        }
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Error deleting expense');
      }
    }
  };

  // AI Assistant handlers
  const handleAIDelegation = (delegationData: any, expensesData?: any[]) => {
    // This shouldn't happen on delegation detail page, but handle it gracefully
    console.log('AI delegation request on detail page:', delegationData);
  };

  const handleAIExpense = async (expenseData: any, delegationId?: string) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...expenseData,
          delegation_id: delegationId || params.id
        }),
      });

      if (response.ok) {
        fetchDelegationData(); // Refresh the data
      } else {
        console.error('Failed to create expense');
      }
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  };

  const handleUpdateExpense = async (expenseId: string, expenseData: any) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      });

      if (response.ok) {
        fetchDelegationData(); // Refresh the data
      } else {
        console.error('Failed to update expense');
      }
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleNavigateToDelegation = (delegationId: string) => {
    router.push(`/delegations/${delegationId}`);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-neutral-500">Loading delegation...</div>
        </div>
      </div>
    );
  }

  if (!delegation) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Link 
          href="/"
          className="inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Business Travel
        </Link>

            <div className="space-y-4">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">{delegation.title}</h1>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleEditDelegation}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                          title="Edit delegation"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleDeleteDelegation}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                          title="Delete delegation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-neutral-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{delegation.destination_city}, {delegation.destination_country}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(delegation.start_date).toLocaleDateString()} - {new Date(delegation.end_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Utensils className="w-5 h-5" />
                    <span className="text-sm font-medium">{delegation.daily_allowance} EUR/day</span>
                  </div>
                </div>
              </div>
          
          <div className="card p-4">
            <p className="text-neutral-700">{delegation.purpose}</p>
            {delegation.notes && (
              <p className="text-sm text-neutral-500 mt-2">{delegation.notes}</p>
            )}
          </div>
        </div>
      </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">Expense Details</h3>
              <button
                onClick={() => setShowExpenseForm(true)}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </button>
            </div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      PLN
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-600">
                        {new Date(expense.date).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-800 capitalize">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-neutral-900 max-w-[200px]">
                        <div className="truncate" title={expense.description}>
                          {expense.description}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-900 text-right font-medium">
                        {expense.amount.toFixed(2)} {expense.currency}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-900 text-right font-semibold">
                        {(expense.amount * getExchangeRateForCurrency(expense.currency)).toFixed(2)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-600">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEditExpense(expense)}
                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit expense"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="p-1 text-red-600 hover:text-red-800 transition-colors"
                            title="Delete expense"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 p-4">
              {expenses.map((expense) => (
                <div key={expense.id} className="bg-white border border-neutral-200 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-800 capitalize">
                          {expense.category}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {new Date(expense.date).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                      <h4 className="font-medium text-neutral-900 mb-1">{expense.description}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditExpense(expense)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                        title="Edit expense"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-neutral-600">
                      {expense.amount.toFixed(2)} {expense.currency}
                    </div>
                    <div className="text-sm font-semibold text-neutral-900">
                      {(expense.amount * getExchangeRateForCurrency(expense.currency)).toFixed(2)} PLN
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <ExportMenu delegation={delegation} expenses={expenses} />
        </div>
        
        <div>
          <SummaryCard delegation={delegation} expenses={expenses} />
        </div>
      </div>

          {/* Expense Form Modal */}
          <ExpenseForm
            isOpen={showExpenseForm}
            onClose={() => {
              setShowExpenseForm(false);
              setEditingExpense(null);
            }}
            onSuccess={handleExpenseSuccess}
            delegationId={delegation.id}
            expense={editingExpense}
          />

          {/* Delegation Form Modal */}
          <DelegationForm
            isOpen={showDelegationForm}
            onClose={() => setShowDelegationForm(false)}
            onSuccess={handleDelegationSuccess}
            delegation={delegation}
          />

          {/* Persistent AI Assistant */}
          <PersistentAIAssistant
            onAddDelegation={handleAIDelegation}
            onAddExpense={handleAIExpense}
            onUpdateExpense={handleUpdateExpense}
            currentDelegationId={params.id}
            allowNewDelegations={false}
            onNavigateToDelegation={handleNavigateToDelegation}
          />
        </div>
      );
    }
