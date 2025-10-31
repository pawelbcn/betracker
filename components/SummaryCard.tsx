"use client";
import { useState, useEffect } from 'react';
import { calculateTotalExpensesMultiCurrency, calculateTotalExpensesByCurrency, calculateTotalExpensesByCurrencyPLN, calculateTotalExpensesMultiCurrencySync, calculateDailyAllowanceAsync, calculateDelegationTimeBreakdown, getExchangeRateForCurrency, Delegation, Expense } from '@/logic/rules';
import { getExchangeRateForDate } from '@/logic/exchangeRates';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface SummaryCardProps {
  delegation: Delegation;
  expenses: Expense[];
}

export function SummaryCard({ delegation, expenses }: SummaryCardProps) {
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalExpensesByCurrency, setTotalExpensesByCurrency] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exchangeRateDetails, setExchangeRateDetails] = useState<Record<string, { rate: number; date: string; amount: number; convertedAmount: number }>>({});
  
  const [totalAllowance, setTotalAllowance] = useState(0);
  const [allowanceLoading, setAllowanceLoading] = useState(true);
  const [allowanceRate, setAllowanceRate] = useState<number | null>(null);
  const [allowanceRateDate, setAllowanceRateDate] = useState<string | null>(null);
  const timeBreakdown = calculateDelegationTimeBreakdown(delegation);
  
  useEffect(() => {
    const calculateAllowance = async () => {
      try {
        // Fetch the NBP rate for EUR on delegation start date
        const eurRate = await getExchangeRateForDate('EUR', delegation.start_date);
        setAllowanceRate(eurRate);
        setAllowanceRateDate(delegation.start_date);
        
        const allowance = await calculateDailyAllowanceAsync(delegation);
        setTotalAllowance(allowance);
      } catch (error) {
        console.error('Error calculating allowance:', error);
        setTotalAllowance(0);
        // Set fallback rate info
        setAllowanceRate(delegation.exchange_rate);
        setAllowanceRateDate(delegation.start_date);
      } finally {
        setAllowanceLoading(false);
      }
    };
    calculateAllowance();
  }, [delegation]);
  
  const tripTotal = totalExpenses + totalAllowance;

  // Calculate expenses using NBP rates
  useEffect(() => {
    const calculateExpenses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [total, byCurrency] = await Promise.all([
          calculateTotalExpensesMultiCurrency(expenses),
          calculateTotalExpensesByCurrencyPLN(expenses)
        ]);
        
        setTotalExpenses(total);
        setTotalExpensesByCurrency(byCurrency);
        
        // Calculate detailed exchange rate information
        const rateDetails: Record<string, { rate: number; date: string; amount: number; convertedAmount: number }> = {};
        
        // Group expenses by currency
        const expensesByCurrency = expenses.reduce((acc, expense) => {
          if (expense.currency === 'PLN') return acc;
          if (!acc[expense.currency]) acc[expense.currency] = [];
          acc[expense.currency].push(expense);
          return acc;
        }, {} as Record<string, Expense[]>);
        
        // Fetch rates for each currency
        for (const [currency, currencyExpenses] of Object.entries(expensesByCurrency)) {
          try {
            // Use the first expense's date as representative for the currency
            const representativeDate = currencyExpenses[0].date;
            const rate = await getExchangeRateForDate(currency, representativeDate);
            const totalAmount = currencyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
            
            rateDetails[currency] = {
              rate,
              date: representativeDate,
              amount: totalAmount,
              convertedAmount: totalAmount * rate
            };
          } catch (error) {
            console.error(`Error fetching rate for ${currency}:`, error);
            // Use fallback rate
            const fallbackRate = getExchangeRateForCurrency(currency);
            const totalAmount = currencyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
            
            rateDetails[currency] = {
              rate: fallbackRate,
              date: currencyExpenses[0].date,
              amount: totalAmount,
              convertedAmount: totalAmount * fallbackRate
            };
          }
        }
        
        setExchangeRateDetails(rateDetails);
      } catch (err) {
        console.error('Error calculating expenses:', err);
        setError(err instanceof Error ? err.message : 'Failed to calculate expenses');
        
        // Fallback to sync calculation
        setTotalExpenses(calculateTotalExpensesMultiCurrencySync(expenses));
        setTotalExpensesByCurrency(calculateTotalExpensesByCurrency(expenses));
      } finally {
        setLoading(false);
      }
    };

    calculateExpenses();
  }, [expenses]);

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
      
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">
            <strong>Exchange Rate Error:</strong> {error}
            <br />
            <span className="text-red-600">Using fallback calculation with default rates.</span>
          </p>
        </div>
      )}
      
      {/* Summary Numbers */}
      <div className="space-y-3">
        <div className="flex justify-between items-start text-neutral-600">
          <span>Total Expenses:</span>
          <div className="text-right">
            {loading ? (
              <div className="text-sm text-neutral-500">Loading exchange rates...</div>
            ) : (
              <>
                {/* Show only original currency amounts */}
                {Object.entries(expenses.reduce((acc, expense) => {
                  if (expense.currency === 'PLN') {
                    acc['PLN'] = (acc['PLN'] || 0) + expense.amount;
                  } else {
                    acc[expense.currency] = (acc[expense.currency] || 0) + expense.amount;
                  }
                  return acc;
                }, {} as Record<string, number>)).map(([currency, amount]) => (
                  <div key={currency} className="mb-1">
                    <div className="font-semibold text-neutral-900 text-lg">
                      {amount.toFixed(2)} {currency}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-start text-neutral-600">
          <span>Meals Allowance:</span>
          <div className="text-right">
            <div className="font-semibold text-neutral-900">
              {allowanceLoading ? '...' : `${totalAllowance.toFixed(2)} PLN`}
            </div>
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
                  <span> × {allowanceRate ? allowanceRate.toFixed(4) : 'NBP rate'} PLN</span>
                </>
              ) : (
                <span>
                  {timeBreakdown.totalDays} × {delegation.daily_allowance} EUR × {allowanceRate ? allowanceRate.toFixed(4) : 'NBP rate'} PLN
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-3 border-t border-neutral-200">
          <div className="space-y-3">
            <div className="text-lg font-semibold text-neutral-900 mb-3">Total Breakdown:</div>
            
            {loading ? (
              <div className="text-sm text-neutral-500">Loading exchange rates...</div>
            ) : (
              <div className="space-y-2">
                {/* Show detailed breakdown with exchange rates */}
                {Object.entries(exchangeRateDetails).map(([currency, details]) => (
                  <div key={currency} className="flex justify-between items-start text-sm">
                    <div className="text-neutral-600">
                      {details.amount.toFixed(2)} {currency}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-neutral-900">
                        {details.convertedAmount.toFixed(2)} PLN
                      </div>
                      <div className="text-xs text-neutral-500">
                        Rate: 1 {currency} = {details.rate.toFixed(4)} PLN
                      </div>
                      <div className="text-xs text-neutral-500">
                        Date: {new Date(details.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* PLN expenses */}
                {expenses.filter(e => e.currency === 'PLN').length > 0 && (
                  <div className="flex justify-between items-start text-sm">
                    <div className="text-neutral-600">
                      {expenses
                        .filter(e => e.currency === 'PLN')
                        .reduce((sum, expense) => sum + expense.amount, 0)
                        .toFixed(2)} PLN
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-neutral-900">
                        {expenses
                          .filter(e => e.currency === 'PLN')
                          .reduce((sum, expense) => sum + expense.amount, 0)
                          .toFixed(2)} PLN
                      </div>
                      <div className="text-xs text-neutral-500">
                        (No conversion needed)
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Meals allowance */}
                <div className="flex justify-between items-start text-sm">
                  <div className="text-neutral-600">Meals Allowance</div>
                  <div className="text-right">
                    <div className="font-semibold text-neutral-900">
                      {allowanceLoading ? '...' : `${totalAllowance.toFixed(2)} PLN`}
                    </div>
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
                          {allowanceRate && (
                            <>
                              <span> × {allowanceRate.toFixed(4)} PLN</span>
                              <div className="text-xs text-neutral-400">
                                Rate: 1 EUR = {allowanceRate.toFixed(4)} PLN
                              </div>
                              <div className="text-xs text-neutral-400">
                                Date: {allowanceRateDate ? new Date(allowanceRateDate).toLocaleDateString() : 'N/A'}
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <span>
                          {timeBreakdown.totalDays} × {delegation.daily_allowance} EUR
                          {allowanceRate && (
                            <>
                              <span> × {allowanceRate.toFixed(4)} PLN</span>
                              <div className="text-xs text-neutral-400">
                                Rate: 1 EUR = {allowanceRate.toFixed(4)} PLN
                              </div>
                              <div className="text-xs text-neutral-400">
                                Date: {allowanceRateDate ? new Date(allowanceRateDate).toLocaleDateString() : 'N/A'}
                              </div>
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Total */}
                <div className="pt-2 border-t border-neutral-200">
                  <div className="flex justify-between items-center text-lg font-semibold text-neutral-900">
                    <span>Total:</span>
                    <span>{tripTotal.toFixed(2)} PLN</span>
                  </div>
                </div>
              </div>
            )}
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
          <p>All exchange rates fetched from NBP API</p>
          <p>Meals allowance rate: {delegation.daily_allowance} EUR per day</p>
          {allowanceRate && (
            <p>EUR rate used: 1 EUR = {allowanceRate.toFixed(4)} PLN (from {allowanceRateDate ? new Date(allowanceRateDate).toLocaleDateString() : 'N/A'})</p>
          )}
        </div>
      </div>
    </div>
  );
}
