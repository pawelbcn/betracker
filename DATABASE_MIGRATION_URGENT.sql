-- URGENT: Run this SQL in your production database to enable receipt upload feature
-- Go to Vercel Dashboard → Storage → Postgres → SQL Editor

-- Add receipt_url column to expenses table
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'expenses' AND column_name = 'receipt_url';
