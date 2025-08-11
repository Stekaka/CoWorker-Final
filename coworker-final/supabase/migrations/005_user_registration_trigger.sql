-- Migration för automatisk företagsskapelse vid registrering
-- Skapad: 2025-01-15

-- Lägg till created_by kolumn i companies tabellen
ALTER TABLE companies ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Skapa en trigger-funktion som körs när en ny användare skapas
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  company_id UUID;
BEGIN
  -- Skapa ett nytt företag om company_name finns i user metadata
  IF NEW.raw_user_meta_data ->> 'company_name' IS NOT NULL THEN
    INSERT INTO companies (name, created_by)
    VALUES (
      NEW.raw_user_meta_data ->> 'company_name',
      NEW.id
    )
    RETURNING id INTO company_id;

    -- Länka användaren till företaget som primary company
    INSERT INTO user_companies (user_id, company_id, role, is_primary)
    VALUES (NEW.id, company_id, 'owner', true);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Skapa trigger som körs efter att en ny användare skapas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Lägg till RLS policy för companies så användare kan läsa sitt eget företag
CREATE POLICY "Users can read their own company" ON companies
  FOR SELECT USING (
    created_by = auth.uid() OR 
    id IN (
      SELECT company_id FROM user_companies 
      WHERE user_id = auth.uid()
    )
  );

-- Lägg till RLS policy för user_companies så användare kan läsa sina egna relationer
CREATE POLICY "Users can read their own company relationships" ON user_companies
  FOR SELECT USING (user_id = auth.uid());

-- Lägg till RLS policy så användare kan uppdatera sin egen företagsrelation
CREATE POLICY "Users can update their own company relationships" ON user_companies
  FOR UPDATE USING (user_id = auth.uid());
