-- Test script för att koppla mock-användaren till test-företaget
-- Detta ska köras direkt i Supabase för att testa systemet

-- Först, lägg till mock-användaren i auth.users
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at,
  raw_user_meta_data
) VALUES (
  'mock-user-123',
  'demo@crm.se',
  '$2a$10$mockpasswordhash', -- Mock password hash
  NOW(),
  NOW(),
  NOW(),
  '{"full_name": "Demo Användare"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();

-- Sedan, koppla användaren till test-företaget
SELECT link_user_to_test_company('mock-user-123'::uuid);

-- Verifiera kopplingen
SELECT 
  u.email,
  c.name as company_name,
  uc.role,
  uc.is_primary
FROM auth.users u
JOIN user_companies uc ON uc.user_id = u.id  
JOIN companies c ON c.id = uc.company_id
WHERE u.id = 'mock-user-123';
