"use client";
import { useState, useEffect } from 'react';
import { Calendar, RefreshCw, Search, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ExchangeRate {
  currency: string;
  code: string;
  mid: number;
  effectiveDate: string;
}

interface ExchangeRateTable {
  table: string;
  no: string;
  effectiveDate: string;
  rates: ExchangeRate[];
}

export default function ExchangeRatesPage() {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useLanguage();

  const fetchExchangeRates = async (date: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to get rates for specific date first
      const response = await fetch(`https://api.nbp.pl/api/exchangerates/tables/a/${date}/`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // If no data for specific date, get latest available
          const latestResponse = await fetch('https://api.nbp.pl/api/exchangerates/tables/a/');
          if (!latestResponse.ok) {
            throw new Error('Failed to fetch exchange rates');
          }
          const latestData: ExchangeRateTable[] = await latestResponse.json();
          setExchangeRates(latestData[0]?.rates || []);
        } else {
          throw new Error('Failed to fetch exchange rates');
        }
      } else {
        const data: ExchangeRateTable[] = await response.json();
        setExchangeRates(data[0]?.rates || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setExchangeRates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRates(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const handleRefresh = () => {
    fetchExchangeRates(selectedDate);
  };

  const filteredRates = exchangeRates.filter(rate =>
    rate.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rate.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neutral-900">Exchange Rates</h1>
        <p className="text-neutral-600">Current and historical exchange rates from NBP (National Bank of Poland)</p>
      </div>

      {/* Controls */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-neutral-500" />
              <label htmlFor="date" className="text-sm font-medium text-neutral-700">
                Date:
              </label>
              <input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-neutral-500" />
              <input
                type="text"
                placeholder="Search currencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 transition-colors rounded-md"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="card p-4 bg-red-50 border border-red-200">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Exchange Rates Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-neutral-900">
              Exchange Rates for {formatDate(selectedDate)}
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-neutral-500">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Loading exchange rates...
            </div>
          </div>
        ) : filteredRates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Currency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Exchange Rate (PLN)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    PLN per Unit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredRates.map((rate, index) => (
                  <tr key={`${rate.code}-${index}`} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900">
                        {rate.currency}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-600 font-mono">
                        {rate.code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-semibold text-neutral-900">
                        {rate.mid.toFixed(4)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-neutral-600">
                        {(1 / rate.mid).toFixed(4)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-500">
                {searchTerm ? 'No currencies found matching your search.' : 'No exchange rates available for this date.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="card p-4 bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Data Source: National Bank of Poland (NBP)</p>
            <p>
              Exchange rates are updated daily and represent the average exchange rates (Table A) 
              published by the National Bank of Poland. Rates are expressed as PLN per foreign currency unit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
