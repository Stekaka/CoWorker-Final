-- Koppla test-användare till test-företag
-- Skapad: 2025-08-11

-- Lägg till user_companies mapping för test-användaren (måste uppdateras med rätt user_id)
-- Du måste logga in först för att få ett user_id, sedan uppdatera denna migration

-- Exempel: INSERT INTO user_companies (user_id, company_id, role, is_primary)
-- VALUES ('din-user-id-här', '550e8400-e29b-41d4-a716-446655440000', 'admin', true);

-- Vi skapar en funktion som kan köras senare för att koppla en användare till test-företaget
CREATE OR REPLACE FUNCTION link_user_to_test_company(user_uuid UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO user_companies (user_id, company_id, role, is_primary)
  VALUES (user_uuid, '550e8400-e29b-41d4-a716-446655440000', 'admin', true)
  ON CONFLICT (user_id, company_id) DO UPDATE SET
    role = EXCLUDED.role,
    is_primary = EXCLUDED.is_primary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
