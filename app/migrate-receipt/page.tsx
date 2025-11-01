"use client";
import { useState } from 'react';

// This page doesn't use Layout to avoid navigation/header

export default function MigrateReceiptPage() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'migrating' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [details, setDetails] = useState<any>(null);

  const checkStatus = async () => {
    setStatus('checking');
    setMessage('');
    try {
      const response = await fetch('/api/migrate-receipt-column');
      const data = await response.json();
      setDetails(data);
      
      if (data.columnExists) {
        setStatus('success');
        setMessage('✅ Column already exists! Migration not needed.');
      } else {
        setStatus('idle');
        setMessage('⚠️ Column does not exist. Click "Run Migration" below.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error checking status: ' + (error as Error).message);
    }
  };

  const runMigration = async () => {
    setStatus('migrating');
    setMessage('Running migration...');
    try {
      const response = await fetch('/api/migrate-receipt-column', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer migrate-receipt-column-2025',
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setDetails(data);
      
      if (response.ok && data.success) {
        setStatus('success');
        setMessage('✅ Migration completed successfully! The receipt_url column has been added.');
      } else {
        setStatus('error');
        setMessage('❌ Migration failed: ' + (data.error || data.message || 'Unknown error'));
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error running migration: ' + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">
          Database Migration: Add receipt_url Column
        </h1>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>What this does:</strong> Adds the <code className="bg-blue-100 px-1 rounded">receipt_url</code> column 
              to the <code className="bg-blue-100 px-1 rounded">expenses</code> table to enable receipt uploads.
            </p>
            <p className="text-sm text-blue-800 mt-2">
              <strong>Safe:</strong> This only adds a column, it doesn't delete or modify any existing data.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={checkStatus}
              disabled={status === 'checking' || status === 'migrating'}
              className="px-4 py-2 bg-neutral-600 text-white rounded hover:bg-neutral-700 disabled:opacity-50 transition-colors"
            >
              {status === 'checking' ? 'Checking...' : 'Check Status'}
            </button>
            
            <button
              onClick={runMigration}
              disabled={status === 'migrating' || status === 'success'}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {status === 'migrating' ? 'Migrating...' : 'Run Migration'}
            </button>
          </div>

          {message && (
            <div className={`p-4 rounded-lg ${
              status === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
              status === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
              'bg-neutral-50 border border-neutral-200 text-neutral-800'
            }`}>
              <p className="font-medium">{message}</p>
              {details && (
                <pre className="mt-2 text-xs bg-neutral-100 p-2 rounded overflow-auto">
                  {JSON.stringify(details, null, 2)}
                </pre>
              )}
            </div>
          )}

          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                ✅ <strong>Migration complete!</strong> You can now use the receipt upload feature when adding or editing expenses.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-neutral-200">
          <p className="text-xs text-neutral-500">
            After migration, you can delete this page if you want. The receipt upload feature will be fully functional.
          </p>
        </div>
      </div>
    </div>
  );
}
