'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MigratePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const migrateData = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/assign-delegations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setResult(data);
        console.log('Migration successful:', data);
      } else {
        const errorData = await response.json();
        setError(`Migration failed: ${errorData.error || response.statusText}`);
        console.error('Migration failed:', response.status, errorData);
      }
    } catch (error) {
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Migration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-2xl w-full mx-4">
        <div className="card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">
              Migracja Danych
            </h1>
            <p className="text-neutral-600">
              Ta strona przypisze istniejące delegacje do użytkownika pawel
            </p>
          </div>

          <div className="space-y-6">
            <button
              onClick={migrateData}
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                  Migracja w toku...
                </>
              ) : (
                'Rozpocznij migrację'
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">Błąd migracji:</h3>
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {result && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Migracja zakończona pomyślnie!</h3>
                <div className="space-y-2 text-green-700">
                  <p><strong>Użytkownik:</strong> {result.user?.username || 'pawel'} ({result.user?.email || 'pawel@example.com'})</p>
                  <p><strong>Delegacje:</strong> {result.totalDelegations}</p>
                  <p><strong>Wydatki:</strong> {result.totalExpenses}</p>
                  
                  {result.delegations && result.delegations.length > 0 && (
                    <div>
                      <p className="font-semibold mt-4">Lista delegacji:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {result.delegations.map((delegation: any) => (
                          <li key={delegation.id}>
                            {delegation.title} ({delegation.expenses} wydatków)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-colors"
              >
                Powrót do aplikacji
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
