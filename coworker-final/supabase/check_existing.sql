-- Check existing tables migration
-- Skapad: 2025-08-11

-- First, let's check what tables already exist
-- This will help us understand the current schema

\echo 'Checking existing tables...'

-- Check if quotes-related tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('companies', 'products', 'customers', 'quotes', 'quote_items');

-- Check auth.users structure to see if company_id already exists
\d auth.users;

-- Show existing companies table structure if it exists
\d companies;

\echo 'Existing table check complete.'
