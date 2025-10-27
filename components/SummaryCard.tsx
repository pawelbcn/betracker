"use client";
import { calculateTotalExpensesMultiCurrency, calculateTotalExpensesByCurrency, calculateDailyAllowance, calculateDelegationTimeBreakdown, getExchangeRateForCurrency, Delegation, Expense } from '@/logic/rules';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface SummaryCardProps {
  delegation: Delegation;
  expenses: Expense[];
}

export function SummaryCard({ delegation, expenses }: SummaryCardProps) {
  const totalExpenses = calculateTotalExpensesMultiCurrency(expenses);
  const totalExpensesByCurrency = calculateTotalExpensesByCurrency(expenses);
  const totalAllowance = calculateDailyAllowance(delegation);
  const timeBreakdown = calculateDelegationTimeBreakdown(delegation);
  const tripTotal = totalExpenses + totalAllowance;

  // Prepare chart data
  const chartData = expenses.reduce((acc, expense) => {
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
    return acc;
  }, [] as { category: string; amount: number }[]);

  return (
    <div className="card p-6 space-y-6">
      <h3 className="text-xl font-semibold text-neutral-900">Business Travel Summary</h3>
      
      {/* Summary Numbers */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-neutral-600">
          <span>Total Expenses:</span>
          <div className="text-right">
            {Object.entries(totalExpensesByCurrency).map(([currency, amount]) => (
              <div key={currency} className="font-semibold text-neutral-900">
                {amount.toFixed(2)} {currency}
              </div>
            ))}
            <div className="text-sm text-neutral-500">{totalExpenses.toFixed(2)} PLN</div>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-neutral-600">
          <span>Meals Allowance:</span>
          <div className="text-right">
            <div className="font-semibold text-neutral-900">{totalAllowance.toFixed(2)} PLN</div>
            <div className="text-xs text-neutral-500">
              {timeBreakdown.hasTimeFields ? (
                <>
                  {timeBreakdown.fullDays > 0 && (
                    <span>
                      {timeBreakdown.fullDays} × {delegation.daily_allowance} EUR
                      {timeBreakdown.partialDayHours > 0 && ' + '}
                    </span>
                  )}
                  {timeBreakdown.partialDayHours > 0 && (
                    <span>
                      {timeBreakdown.partialDayRate === 1/3 ? '1/3' : timeBreakdown.partialDayRate === 1/2 ? '1/2' : '1'} × {delegation.daily_allowance} EUR
                    </span>
                  )}
                  <span> × {delegation.exchange_rate} PLN</span>
                </>
              ) : (
                <span>
                  {timeBreakdown.totalDays} × {delegation.daily_allowance} EUR × {delegation.exchange_rate} PLN
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-3 border-t border-neutral-200">
          <div className="flex justify-between items-center text-lg font-semibold text-neutral-900">
            <span>Total:</span>
            <div className="text-right">
              {Object.entries(totalExpensesByCurrency).map(([currency, amount]) => (
                <div key={currency}>
                  {amount.toFixed(2)} {currency}
                </div>
              ))}
              <div className="text-sm text-neutral-500">+ allowance = {tripTotal.toFixed(2)} PLN</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chart */}
      {chartData.length > 0 && (
        <div className="pt-4 border-t border-neutral-200">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">Expenses by Category</h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <XAxis 
                dataKey="category" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)} PLN`, 'Amount']}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="amount" 
                fill="#111827" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {/* Exchange Rate Info */}
      <div className="pt-4 border-t border-neutral-200">
        <div className="text-sm text-neutral-500 space-y-1">
          <p>Exchange rate: 1 EUR = {delegation.exchange_rate} PLN</p>
          <p>Meals allowance rate: {delegation.daily_allowance} EUR</p>
        </div>
      </div>
    </div>
  );
}
