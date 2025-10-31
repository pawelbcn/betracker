-- Migration: Add receipt_url column to expenses table
-- Run this SQL on your production database

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS receipt_url TEXT;
