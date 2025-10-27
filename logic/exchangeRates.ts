/**
 * Exchange rate utilities for NBP API integration
 * Implements Polish tax law: foreign currency expenses are converted using
 * the NBP average exchange rate from the last working day before the delegation settlement date
 * 
 * Features:
 * - Intelligent caching (past rates never change)
 * - Retry mechanism for failed requests
 * - User warnings for fallback rates
 * - Performance optimization
 */

// Cache for exchange rates - past rates never change
const rateCache = new Map<string, { rate: number; date: string; cachedAt: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours for current rates
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

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
 * Get exchange rate for a specific currency and date with intelligent caching
 * Returns the rate from the last working day before the given date
 * Features: caching, retry mechanism, and performance optimization
 */
export async function getExchangeRateForDate(
  currencyCode: string, 
  settlementDate: string
): Promise<number> {
  const settlement = new Date(settlementDate);
  const lastWorkingDay = getLastWorkingDay(settlement);
  const formattedDate = formatDateForNBP(lastWorkingDay);
  const cacheKey = `${currencyCode}-${formattedDate}`;
  
  // Check cache first
  const cached = rateCache.get(cacheKey);
  if (cached) {
    const isPastDate = lastWorkingDay < new Date();
    const isRecentCache = Date.now() - cached.cachedAt < CACHE_DURATION;
    
    // Past rates never change, current rates cache for 24h
    if (isPastDate || isRecentCache) {
      console.log(`Using cached rate for ${currencyCode} on ${formattedDate}: ${cached.rate}`);
      return cached.rate;
    }
  }
  
  // Fetch with retry mechanism
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Fetching rate for ${currencyCode} on ${formattedDate} (attempt ${attempt})`);
      
      // Try to get rate for the specific date first
      let response = await fetch(`https://api.nbp.pl/api/exchangerates/rates/a/${currencyCode}/${formattedDate}/`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // If no data for that date, try the latest available
          response = await fetch(`https://api.nbp.pl/api/exchangerates/rates/a/${currencyCode}/`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch exchange rate for ${currencyCode} (404 fallback failed)`);
          }
        } else {
          throw new Error(`HTTP ${response.status}: Failed to fetch exchange rate for ${currencyCode}`);
        }
      }
      
      const data = await response.json();
      const rate = data.rates[0].mid;
      
      // Cache the result
      rateCache.set(cacheKey, {
        rate,
        date: formattedDate,
        cachedAt: Date.now()
      });
      
      console.log(`Successfully fetched and cached rate for ${currencyCode} on ${formattedDate}: ${rate}`);
      return rate;
      
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt} failed for ${currencyCode} on ${formattedDate}:`, error);
      
      if (attempt < MAX_RETRIES) {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      }
    }
  }
  
  // All retries failed
  console.error(`All ${MAX_RETRIES} attempts failed for ${currencyCode} on ${formattedDate}:`, lastError);
  throw new Error(`Unable to get exchange rate for ${currencyCode} after ${MAX_RETRIES} attempts: ${lastError?.message}`);
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
  
  // Fetch rates in parallel using individual rate fetching with caching
  const ratePromises = currencyCodes.map(async (currencyCode) => {
    try {
      const rate = await getExchangeRateForDate(currencyCode, settlementDate);
      return { currencyCode, rate };
    } catch (error) {
      console.warn(`Failed to fetch rate for ${currencyCode}:`, error);
      return { currencyCode, rate: null };
    }
  });
  
  const results = await Promise.all(ratePromises);
  
  // Process results
  for (const { currencyCode, rate } of results) {
    if (rate !== null) {
      rates[currencyCode] = rate;
    } else {
      console.warn(`Currency ${currencyCode} rate not available for ${settlementDate}`);
    }
  }
  
  return rates;
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

/**
 * Get cache statistics for monitoring and debugging
 */
export function getCacheStats(): {
  size: number;
  entries: Array<{ key: string; rate: number; date: string; cachedAt: number; age: number }>;
  hitRate?: number;
} {
  const entries = Array.from(rateCache.entries()).map(([key, data]) => ({
    key,
    rate: data.rate,
    date: data.date,
    cachedAt: data.cachedAt,
    age: Date.now() - data.cachedAt
  }));
  
  return {
    size: rateCache.size,
    entries: entries.sort((a, b) => b.cachedAt - a.cachedAt)
  };
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): number {
  const now = Date.now();
  let cleared = 0;
  
  // Convert to array to avoid iteration issues
  const entries = Array.from(rateCache.entries());
  for (const [key, data] of entries) {
    const isExpired = now - data.cachedAt > CACHE_DURATION;
    if (isExpired) {
      rateCache.delete(key);
      cleared++;
    }
  }
  
  console.log(`Cleared ${cleared} expired cache entries`);
  return cleared;
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
  rateCache.clear();
  console.log('Cleared all cache entries');
}

/**
 * Check if we're using fallback rates and return warning info
 */
export function getFallbackWarning(currencyCode: string, date: string): {
  isUsingFallback: boolean;
  warning?: string;
  lastUpdated?: string;
} {
  const cacheKey = `${currencyCode}-${date}`;
  const cached = rateCache.get(cacheKey);
  
  if (!cached) {
    return {
      isUsingFallback: true,
      warning: `No cached rate available for ${currencyCode} on ${date}. Using fallback rate.`,
    };
  }
  
  const isExpired = Date.now() - cached.cachedAt > CACHE_DURATION;
  if (isExpired) {
    return {
      isUsingFallback: true,
      warning: `Cached rate for ${currencyCode} on ${date} is expired. Using fallback rate.`,
      lastUpdated: new Date(cached.cachedAt).toISOString()
    };
  }
  
  return {
    isUsingFallback: false,
    lastUpdated: new Date(cached.cachedAt).toISOString()
  };
}
