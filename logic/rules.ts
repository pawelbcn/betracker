import { differenceInDays } from 'date-fns';
import { convertToPLN, getExchangeRatesForDate } from './exchangeRates';

// Data models as per knowledgebase v0.2 section 2
export interface Delegation {
  id: string;
  title: string;
  destination_country: string;
  destination_city: string;
  start_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM format
  end_date: string; // YYYY-MM-DD
  end_time: string; // HH:MM format
  purpose: string;
  exchange_rate: number;
  daily_allowance: number; // Per Polish regulations (EUR)
  notes?: string;
}

export interface Expense {
  id: string;
  delegation_id: string;
  date: string; // YYYY-MM-DD
  category: string; // flight, hotel, food, taxi, misc
  amount: number; // Amount in original currency
  currency: string; // EUR, HUF, etc.
  description: string;
}

// Country-specific daily allowance rates as per knowledgebase v0.2 section 3.2
export const COUNTRY_DAILY_ALLOWANCES: Record<string, number> = {
  'Hungary': 43,
  'Germany': 49,
  'Italy': 48,
  'France': 50,
  'Czech Republic': 41,
};

// Expense categories and their deductibility as per knowledgebase v0.2 section 3.3
export const EXPENSE_CATEGORIES = {
  'hotel': { deductible: true, requiresInvoice: true },
  'flight': { deductible: true, requiresInvoice: true },
  'transport': { deductible: true, requiresInvoice: true },
  'taxi': { deductible: true, requiresInvoice: true },
  'food': { deductible: false, note: 'Usually covered by diet (dieta)' },
  'misc': { deductible: true, requiresInvoice: true },
} as const;

// Business logic functions as per knowledgebase v0.2

/**
 * Calculate total expenses in PLN as per section 3.1
 * PLN_value = amount * exchange_rate
 */
export const calculateTotalExpenses = (expenses: Expense[], exchangeRate: number): number => {
  return expenses.reduce((total, expense) => {
    return total + (expense.amount * exchangeRate);
  }, 0);
};

/**
 * Calculate total expenses in PLN using NBP exchange rates
 * Handles multi-currency expenses as per section 3.1
 * Uses exchange rate from last working day before delegation settlement date
 */
export const calculateTotalExpensesMultiCurrency = async (expenses: Expense[], settlementDate: string): Promise<number> => {
  if (expenses.length === 0) return 0;
  
  // Get unique currency codes
  const currencyCodes = Array.from(new Set(expenses.map(expense => expense.currency)));
  
  // Get exchange rates for all currencies
  const exchangeRates = await getExchangeRatesForDate(currencyCodes, settlementDate);
  
  return expenses.reduce((total, expense) => {
    const rate = exchangeRates[expense.currency] || 1.0;
    return total + (expense.amount * rate);
  }, 0);
};

/**
 * Calculate total expenses in PLN using exchange rates (synchronous fallback)
 * This is kept for backward compatibility and when async is not available
 */
export const calculateTotalExpensesMultiCurrencySync = (expenses: Expense[]): number => {
  return expenses.reduce((total, expense) => {
    const exchangeRate = getExchangeRateForCurrency(expense.currency);
    return total + (expense.amount * exchangeRate);
  }, 0);
};

/**
 * Get exchange rate for a specific currency
 */
export const getExchangeRateForCurrency = (currency: string): number => {
  const exchangeRates: Record<string, number> = {
    // Major European currencies
    'EUR': 4.35,  // 1 EUR = 4.35 PLN
    'GBP': 5.3,   // 1 GBP = 5.3 PLN
    'CHF': 4.7,   // 1 CHF = 4.7 PLN (Swiss Franc)
    'NOK': 0.38,  // 1 NOK = 0.38 PLN (Norwegian Krone)
    'SEK': 0.38,  // 1 SEK = 0.38 PLN (Swedish Krona)
    'DKK': 0.58,  // 1 DKK = 0.58 PLN (Danish Krone)
    
    // Central/Eastern European currencies
    'HUF': 0.012, // 1 HUF = 0.012 PLN (Hungarian Forint)
    'CZK': 0.18,  // 1 CZK = 0.18 PLN (Czech Koruna)
    'SKK': 0.12,  // 1 SKK = 0.12 PLN (Slovak Koruna) - if still used
    'RON': 0.88,  // 1 RON = 0.88 PLN (Romanian Leu)
    'BGN': 2.22,  // 1 BGN = 2.22 PLN (Bulgarian Lev)
    'HRK': 0.58,  // 1 HRK = 0.58 PLN (Croatian Kuna)
    'RSD': 0.037, // 1 RSD = 0.037 PLN (Serbian Dinar)
    
    // Major global currencies
    'USD': 4.2,   // 1 USD = 4.2 PLN
    'CAD': 3.1,   // 1 CAD = 3.1 PLN (Canadian Dollar)
    'AUD': 2.8,   // 1 AUD = 2.8 PLN (Australian Dollar)
    'JPY': 0.028, // 1 JPY = 0.028 PLN (Japanese Yen)
    'CNY': 0.58,  // 1 CNY = 0.58 PLN (Chinese Yuan)
    'INR': 0.05,  // 1 INR = 0.05 PLN (Indian Rupee)
    'BRL': 0.82,  // 1 BRL = 0.82 PLN (Brazilian Real)
    'MXN': 0.25,  // 1 MXN = 0.25 PLN (Mexican Peso)
    
    // Middle East & Africa
    'AED': 1.14,  // 1 AED = 1.14 PLN (UAE Dirham)
    'SAR': 1.12,  // 1 SAR = 1.12 PLN (Saudi Riyal)
    'ZAR': 0.22,  // 1 ZAR = 0.22 PLN (South African Rand)
    'EGP': 0.14,  // 1 EGP = 0.14 PLN (Egyptian Pound)
    
    // Base currency
    'PLN': 1.0,   // 1 PLN = 1 PLN
  };
  
  return exchangeRates[currency] || 1.0; // Default to 1.0 if currency not found
};

/**
 * Calculate total expenses in original currency
 */
export const calculateTotalExpensesOriginal = (expenses: Expense[]): number => {
  return expenses.reduce((total, expense) => {
    return total + expense.amount;
  }, 0);
};

/**
 * Calculate total expenses grouped by currency (original amounts)
 */
export const calculateTotalExpensesByCurrency = (expenses: Expense[]): Record<string, number> => {
  return expenses.reduce((totals, expense) => {
    const currency = expense.currency;
    totals[currency] = (totals[currency] || 0) + expense.amount;
    return totals;
  }, {} as Record<string, number>);
};

/**
 * Calculate total expenses grouped by currency converted to PLN using NBP rates
 * Uses exchange rate from last working day before delegation settlement date
 */
export const calculateTotalExpensesByCurrencyPLN = async (expenses: Expense[], settlementDate: string): Promise<Record<string, number>> => {
  if (expenses.length === 0) return {};
  
  // Get unique currency codes
  const currencyCodes = Array.from(new Set(expenses.map(expense => expense.currency)));
  
  // Get exchange rates for all currencies
  const exchangeRates = await getExchangeRatesForDate(currencyCodes, settlementDate);
  
  return expenses.reduce((totals, expense) => {
    const rate = exchangeRates[expense.currency] || 1.0;
    const convertedAmount = expense.amount * rate;
    totals[expense.currency] = (totals[expense.currency] || 0) + convertedAmount;
    return totals;
  }, {} as Record<string, number>);
};

/**
 * Calculate daily allowance (diety) as per section 3.2
 * Handles partial days based on time spent according to Polish law:
 * - <8h → 1/3 rate
 * - 8–12h → 1/2 rate  
 * - >12h → full day
 * Fixed: Proper date string concatenation for time calculations
 */
export const calculateDailyAllowance = (delegation: Delegation): number => {
  // Handle legacy delegations without time fields or with invalid time values
  const hasValidTimeFields = delegation.start_time && 
                            delegation.end_time && 
                            delegation.start_time !== 'null' && 
                            delegation.end_time !== 'null' &&
                            delegation.start_time !== 'undefined' && 
                            delegation.end_time !== 'undefined' &&
                            delegation.start_time.trim() !== '' &&
                            delegation.end_time.trim() !== '';
  
  if (!hasValidTimeFields) {
    // Fallback to old calculation for existing delegations
    const days = differenceInDays(
      new Date(delegation.end_date),
      new Date(delegation.start_date)
    ) + 1; // Include both start and end date
    
    return days * delegation.daily_allowance * delegation.exchange_rate;
  }
  
  const startDateTime = new Date(`${delegation.start_date.split('T')[0]}T${delegation.start_time}`);
  const endDateTime = new Date(`${delegation.end_date.split('T')[0]}T${delegation.end_time}`);
  
  // Calculate total hours
  const totalHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
  
  // Calculate full days
  const fullDays = Math.floor(totalHours / 24);
  
  // Calculate remaining hours for partial day
  const remainingHours = totalHours % 24;
  
  let totalAllowance = 0;
  
  // Full days get full allowance
  totalAllowance += fullDays * delegation.daily_allowance;
  
  // Partial day calculation based on hours
  if (remainingHours > 0) {
    let partialDayRate = 0;
    
    if (remainingHours < 8) {
      partialDayRate = 1/3; // <8h → 1/3 rate
    } else if (remainingHours <= 12) {
      partialDayRate = 1/2; // 8–12h → 1/2 rate
    } else {
      partialDayRate = 1; // >12h → full day
    }
    
    totalAllowance += partialDayRate * delegation.daily_allowance;
  }
  
  return totalAllowance * delegation.exchange_rate;
};

/**
 * Calculate trip total as per section 5
 * trip_total_PLN = total_expenses_PLN + total_diety_PLN
 */
export const calculateTripTotal = (
  expenses: Expense[],
  delegation: Delegation
): number => {
  const totalExpenses = calculateTotalExpenses(expenses, delegation.exchange_rate);
  const totalAllowance = calculateDailyAllowance(delegation);
  
  return totalExpenses + totalAllowance;
};

/**
 * Calculate taxable income base as per section 5
 * income_tax_base = income - trip_total_PLN
 */
export const calculateTaxableIncomeBase = (
  income: number,
  tripTotal: number
): number => {
  return income - tripTotal;
};

/**
 * Get country-specific daily allowance rate
 */
export const getCountryDailyAllowance = (country: string): number => {
  return COUNTRY_DAILY_ALLOWANCES[country] || 0;
};

/**
 * Validate expense category deductibility
 */
export const isExpenseDeductible = (category: string): boolean => {
  return EXPENSE_CATEGORIES[category as keyof typeof EXPENSE_CATEGORIES]?.deductible || false;
};

/**
 * Get expense category information
 */
export const getExpenseCategoryInfo = (category: string) => {
  return EXPENSE_CATEGORIES[category as keyof typeof EXPENSE_CATEGORIES];
};

/**
 * Calculate delegation time breakdown for display
 * Returns detailed time information including total hours, full days, and partial day rates
 */
export const calculateDelegationTimeBreakdown = (delegation: Delegation) => {
  // Handle legacy delegations without time fields or with invalid time values
  const hasValidTimeFields = delegation.start_time && 
                            delegation.end_time && 
                            delegation.start_time !== 'null' && 
                            delegation.end_time !== 'null' &&
                            delegation.start_time !== 'undefined' && 
                            delegation.end_time !== 'undefined' &&
                            delegation.start_time.trim() !== '' &&
                            delegation.end_time.trim() !== '';
  
  if (!hasValidTimeFields) {
    // Fallback for legacy delegations - calculate days only
    const days = differenceInDays(
      new Date(delegation.end_date),
      new Date(delegation.start_date)
    ) + 1; // Include both start and end date
    
    return {
      totalHours: days * 24,
      fullDays: days,
      partialDayHours: 0,
      partialDayRate: 0,
      totalDays: days,
      hasTimeFields: false
    };
  }
  
  const startDateTime = new Date(`${delegation.start_date.split('T')[0]}T${delegation.start_time}`);
  const endDateTime = new Date(`${delegation.end_date.split('T')[0]}T${delegation.end_time}`);
  
  // Calculate total hours
  const totalHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
  
  // Calculate full days
  const fullDays = Math.floor(totalHours / 24);
  
  // Calculate remaining hours for partial day
  const partialDayHours = totalHours % 24;
  
  // Determine partial day rate based on Polish law
  let partialDayRate = 0;
  if (partialDayHours > 0) {
    if (partialDayHours < 8) {
      partialDayRate = 1/3; // <8h → 1/3 rate
    } else if (partialDayHours <= 12) {
      partialDayRate = 1/2; // 8–12h → 1/2 rate
    } else {
      partialDayRate = 1; // >12h → full day
    }
  }
  
  // Calculate total effective days (full days + partial day rate)
  const totalDays = fullDays + partialDayRate;
  
  return {
    totalHours,
    fullDays,
    partialDayHours,
    partialDayRate,
    totalDays,
    hasTimeFields: true
  };
};
