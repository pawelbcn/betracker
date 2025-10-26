"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, MapPin, Calendar, Euro, CalendarDays, TrendingDown } from 'lucide-react';
import { calculateTotalExpensesMultiCurrency, calculateDailyAllowance, getExchangeRateForCurrency, calculateTotalExpensesByCurrency } from '@/logic/rules';
import { useEffect, useState } from 'react';

interface Delegation {
  id: string;
  title: string;
  destination_country: string;
  destination_city: string;
  start_date: string;
  end_date: string;
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

export default function StatsPage() {
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    fetchDelegations();
  }, []);

  const fetchDelegations = async () => {
    try {
      const response = await fetch('/api/delegations');
      const data = await response.json();
      setDelegations(data);
    } catch (error) {
      console.error('Error fetching delegations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get current month and year
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filter delegations based on view mode
  const filteredDelegations = delegations.filter(delegation => {
    const delegationDate = new Date(delegation.start_date);
    if (viewMode === 'monthly') {
      return delegationDate.getMonth() === currentMonth && delegationDate.getFullYear() === currentYear;
    } else {
      return delegationDate.getFullYear() === currentYear;
    }
  });

  // Calculate statistics for filtered data
  const totalExpenses = filteredDelegations.reduce((total, delegation) => {
    return total + calculateTotalExpensesMultiCurrency(delegation.expenses);
  }, 0);

  // Calculate total expenses by original currency
  const totalExpensesByCurrency = filteredDelegations.reduce((acc, delegation) => {
    const delegationExpensesByCurrency = calculateTotalExpensesByCurrency(delegation.expenses);
    Object.entries(delegationExpensesByCurrency).forEach(([currency, amount]) => {
      acc[currency] = (acc[currency] || 0) + amount;
    });
    return acc;
  }, {} as Record<string, number>);

  const totalAllowances = filteredDelegations.reduce((total, delegation) => {
    return total + calculateDailyAllowance(delegation);
  }, 0);

  const grandTotal = totalExpenses + totalAllowances;

  // Monthly data for the current year
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthDelegations = delegations.filter(d => {
      const date = new Date(d.start_date);
      return date.getMonth() === i && date.getFullYear() === currentYear;
    });
    
    const monthExpenses = monthDelegations.reduce((sum, d) => 
      sum + calculateTotalExpensesMultiCurrency(d.expenses), 0);
    const monthAllowances = monthDelegations.reduce((sum, d) => 
      sum + calculateDailyAllowance(d), 0);
    
    return {
      month: new Date(currentYear, i).toLocaleDateString('en-US', { month: 'short' }),
      expenses: monthExpenses,
      allowances: monthAllowances,
      total: monthExpenses + monthAllowances,
      delegations: monthDelegations.length
    };
  });

  // Yearly data for the last 3 years
  const yearlyData = Array.from({ length: 3 }, (_, i) => {
    const year = currentYear - i;
    const yearDelegations = delegations.filter(d => {
      const date = new Date(d.start_date);
      return date.getFullYear() === year;
    });
    
    const yearExpenses = yearDelegations.reduce((sum, d) => 
      sum + calculateTotalExpensesMultiCurrency(d.expenses), 0);
    const yearAllowances = yearDelegations.reduce((sum, d) => 
      sum + calculateDailyAllowance(d), 0);
    
    return {
      year: year.toString(),
      expenses: yearExpenses,
      allowances: yearAllowances,
      total: yearExpenses + yearAllowances,
      delegations: yearDelegations.length
    };
  });

  // Country distribution for filtered data
  const countryData = filteredDelegations.reduce((acc, delegation) => {
    const existing = acc.find(item => item.country === delegation.destination_country);
    if (existing) {
      existing.count++;
      existing.amount += calculateDailyAllowance(delegation);
    } else {
      acc.push({
        country: delegation.destination_country,
        count: 1,
        amount: calculateDailyAllowance(delegation)
      });
    }
    return acc;
  }, [] as { country: string; count: number; amount: number }[]);

  // Expense category distribution for filtered data
  const categoryData = filteredDelegations.reduce((acc, delegation) => {
    delegation.expenses.forEach(expense => {
      const existing = acc.find(item => item.category === expense.category);
      const exchangeRate = getExchangeRateForCurrency(expense.currency);
      if (existing) {
        existing.amount += expense.amount * exchangeRate;
      } else {
        acc.push({
          category: expense.category,
          amount: expense.amount * exchangeRate
        });
      }
    });
    return acc;
  }, [] as { category: string; amount: number }[]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-neutral-900">Statistics</h1>
          <p className="text-neutral-600">Analytics and insights for your business travel</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-neutral-500">Loading statistics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-neutral-900">Statistics</h1>
          <p className="text-neutral-600">Analytics and insights for your business travel</p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-700">View:</span>
          <div className="flex bg-neutral-100 p-1">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1 text-sm font-medium transition-colors ${
                viewMode === 'monthly'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setViewMode('yearly')}
              className={`px-3 py-1 text-sm font-medium transition-colors ${
                viewMode === 'yearly'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              This Year
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">
                {viewMode === 'monthly' ? 'This Month' : 'This Year'} Business Travel
              </p>
              <p className="text-2xl font-bold text-neutral-900">{filteredDelegations.length}</p>
            </div>
                <div className="w-12 h-12 bg-blue-100 flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">
                {viewMode === 'monthly' ? 'This Month' : 'This Year'} Expenses
              </p>
              <p className="text-2xl font-bold text-neutral-900">{totalExpenses.toFixed(2)} PLN</p>
            </div>
                <div className="w-12 h-12 bg-red-100 flex items-center justify-center">
              <Euro className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">
                {viewMode === 'monthly' ? 'This Month' : 'This Year'} Meals Allowance
              </p>
              <p className="text-2xl font-bold text-neutral-900">{totalAllowances.toFixed(2)} PLN</p>
            </div>
                <div className="w-12 h-12 bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">
                {viewMode === 'monthly' ? 'This Month' : 'This Year'} Total
              </p>
              <p className="text-2xl font-bold text-neutral-900">{grandTotal.toFixed(2)} PLN</p>
            </div>
                <div className="w-12 h-12 bg-purple-100 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Time Series Chart */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            {viewMode === 'monthly' ? 'Monthly Overview (2025)' : 'Yearly Overview (Last 3 Years)'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            {viewMode === 'monthly' ? (
              <LineChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(2)} PLN`, 
                    name === 'total' ? 'Total' : name === 'expenses' ? 'Expenses' : 'Meals Allowance'
                  ]}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="allowances" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            ) : (
              <BarChart data={yearlyData}>
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(2)} PLN`, 'Total']}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="total" fill="#3b82f6" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Country Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            {viewMode === 'monthly' ? 'This Month' : 'This Year'} - Business Travel by Country
          </h3>
          {countryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={countryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ country, count }) => `${country} (${count})`}
                >
                  {countryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} delegations`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-neutral-500 text-sm">No data to display for this period.</p>
          )}
        </div>

        {/* Expense Category Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            {viewMode === 'monthly' ? 'This Month' : 'This Year'} - Expenses by Category
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip formatter={(value: number) => [`${value.toFixed(2)} PLN`, 'Amount']} />
                <Bar dataKey="amount" fill="#111827" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-neutral-500 text-sm">No data to display for this period.</p>
          )}
        </div>
      </div>
    </div>
  );
}