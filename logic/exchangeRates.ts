/**
 * Exchange rate utilities for NBP API integration
 * Implements Polish tax law: foreign currency expenses are converted using
 * the NBP average exchange rate from the last working day before the delegation settlement date
 */

export interface ExchangeRate {
  currency: string;
  code: string;
  mid: number;
  effectiveDate: string;
}

export interface ExchangeRateTable {
  table: string;
  no: string;
  effectiveDate: string;
  rates: ExchangeRate[];
}

/**
 * Get the last working day before a given date
 * Excludes weekends (Saturday = 6, Sunday = 0)
 */
export function getLastWorkingDay(date: Date): Date {
  const result = new Date(date);
  
  // Go back one day
  result.setDate(result.getDate() - 1);
  
  // If it's Sunday (0), go back to Friday
  if (result.getDay() === 0) {
    result.setDate(result.getDate() - 2);
  }
  // If it's Saturday (6), go back to Friday
  else if (result.getDay() === 6) {
    result.setDate(result.getDate() - 1);
  }
  
  return result;
}

/**
 * Format date for NBP API (YYYY-MM-DD)
 */
export function formatDateForNBP(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get exchange rate for a specific currency and date
 * Returns the rate from the last working day before the given date
 */
export async function getExchangeRateForDate(
  currencyCode: string, 
  settlementDate: string
): Promise<number> {
  try {
    const settlement = new Date(settlementDate);
    const lastWorkingDay = getLastWorkingDay(settlement);
    const formattedDate = formatDateForNBP(lastWorkingDay);
    
    // Try to get rate for the specific date first
    let response = await fetch(`https://api.nbp.pl/api/exchangerates/rates/a/${currencyCode}/${formattedDate}/`);
    
    if (!response.ok) {
      if (response.status === 404) {
        // If no data for that date, try the latest available
        response = await fetch(`https://api.nbp.pl/api/exchangerates/rates/a/${currencyCode}/`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch exchange rate for ${currencyCode}`);
        }
      } else {
        throw new Error(`Failed to fetch exchange rate for ${currencyCode}`);
      }
    }
    
    const data = await response.json();
    return data.rates[0].mid;
    
  } catch (error) {
    console.error(`Error fetching exchange rate for ${currencyCode}:`, error);
    throw new Error(`Unable to get exchange rate for ${currencyCode}`);
  }
}

/**
 * Get exchange rates for multiple currencies for a specific date
 * Returns rates from the last working day before the given date
 */
export async function getExchangeRatesForDate(
  currencyCodes: string[], 
  settlementDate: string
): Promise<Record<string, number>> {
  const rates: Record<string, number> = {};
  
  // Get all rates for the last working day
  const settlement = new Date(settlementDate);
  const lastWorkingDay = getLastWorkingDay(settlement);
  const formattedDate = formatDateForNBP(lastWorkingDay);
  
  try {
    // Try to get the full table for the specific date first
    let response = await fetch(`https://api.nbp.pl/api/exchangerates/tables/a/${formattedDate}/`);
    
    if (!response.ok) {
      if (response.status === 404) {
        // If no data for that date, get the latest available
        response = await fetch('https://api.nbp.pl/api/exchangerates/tables/a/');
        
        if (!response.ok) {
          throw new Error('Failed to fetch exchange rates');
        }
      } else {
        throw new Error('Failed to fetch exchange rates');
      }
    }
    
    const data: ExchangeRateTable[] = await response.json();
    const table = data[0];
    
    if (!table || !table.rates) {
      throw new Error('No exchange rate data available');
    }
    
    // Create a map of currency codes to rates
    const rateMap = new Map<string, number>();
    table.rates.forEach(rate => {
      rateMap.set(rate.code, rate.mid);
    });
    
    // Get rates for requested currencies
    for (const code of currencyCodes) {
      if (rateMap.has(code)) {
        rates[code] = rateMap.get(code)!;
      } else {
        console.warn(`Exchange rate not found for currency: ${code}`);
        // For missing currencies, try individual API call
        try {
          rates[code] = await getExchangeRateForDate(code, settlementDate);
        } catch (error) {
          console.error(`Failed to get individual rate for ${code}:`, error);
          // Use a fallback rate (1.0 for PLN, or throw error for others)
          if (code === 'PLN') {
            rates[code] = 1.0;
          } else {
            throw new Error(`Exchange rate not available for ${code}`);
          }
        }
      }
    }
    
    return rates;
    
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw new Error('Unable to get exchange rates');
  }
}

/**
 * Convert amount from foreign currency to PLN using NBP rate
 * Implements Polish tax law: use rate from last working day before settlement
 */
export async function convertToPLN(
  amount: number,
  currencyCode: string,
  settlementDate: string
): Promise<number> {
  if (currencyCode === 'PLN') {
    return amount;
  }
  
  const rate = await getExchangeRateForDate(currencyCode, settlementDate);
  return amount * rate;
}

/**
 * Get available currency codes from NBP
 */
export async function getAvailableCurrencies(): Promise<string[]> {
  try {
    const response = await fetch('https://api.nbp.pl/api/exchangerates/tables/a/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch available currencies');
    }
    
    const data: ExchangeRateTable[] = await response.json();
    const table = data[0];
    
    if (!table || !table.rates) {
      throw new Error('No currency data available');
    }
    
    return table.rates.map(rate => rate.code);
    
  } catch (error) {
    console.error('Error fetching available currencies:', error);
    throw new Error('Unable to get available currencies');
  }
}
