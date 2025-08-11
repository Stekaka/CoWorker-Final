-- Setup mock användare för testning
-- Skapad: 2025-08-11

-- Lägg till mock-användaren i auth.users om den inte finns
INSERT INTO auth.users (
  instance_id,
  id, 
  aud,
  role,
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at,
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '12345678-1234-5678-9abc-123456789abc',
  'authenticated',
  'authenticated',
  'demo@crm.se',
  '$2a$10$mockpasswordhash', -- Mock password hash
  NOW(),
  NOW(),
  NOW(),
  '{"full_name": "Demo Användare"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();

-- Koppla användaren till test-företaget
SELECT link_user_to_test_company('12345678-1234-5678-9abc-123456789abc'::uuid);
