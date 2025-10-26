"use client";
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

export default function Home() {
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetchDelegations();
  }, []);

  const fetchDelegations = async () => {
    try {
      const response = await fetch('/api/delegations');
      const data = await response.json();
      setDelegations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching delegations:', error);
      setDelegations([]);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading delegations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Delegation Expense Tracker</h1>
      <p className="mb-4">Welcome to your expense tracker!</p>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Your Delegations ({delegations.length})</h2>
        {delegations.length === 0 ? (
          <p className="text-gray-600">No delegations found. Add your first business trip!</p>
        ) : (
          <div className="space-y-2">
            {delegations.map((delegation) => (
              <div key={delegation.id} className="border rounded-lg p-4">
                <h3 className="font-medium">{delegation.title}</h3>
                <p className="text-sm text-gray-600">
                  {delegation.destination_city}, {delegation.destination_country}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(delegation.start_date).toLocaleDateString()} - {new Date(delegation.end_date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  {delegation.expenses.length} expenses
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
