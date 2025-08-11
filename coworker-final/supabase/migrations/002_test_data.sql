-- Test-data för offert-systemet
-- Skapad: 2025-08-11

-- Lägg till ett test-företag
INSERT INTO companies (id, name, org_number, email, phone, address, city, postal_code, website)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Test AB',
  '556677-8899',
  'info@test.se',
  '08-123 45 67',
  'Testgatan 1',
  'Stockholm',
  '11122',
  'https://test.se'
);

-- Lägg till test-produkter
INSERT INTO products (company_id, name, description, category, price, unit)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Premium Konsultation', 'Avancerad affärsrådgivning och strategisk planering', 'Konsultation', 1500.00, 'timme'),
  ('550e8400-e29b-41d4-a716-446655440000', 'Systemutveckling', 'Utveckling av webbaserade affärssystem', 'IT-tjänster', 1200.00, 'timme'),
  ('550e8400-e29b-41d4-a716-446655440000', 'Projektledning', 'Professionell projektledning för IT-projekt', 'Projektledning', 1000.00, 'timme'),
  ('550e8400-e29b-41d4-a716-446655440000', 'Support Basic', 'Grundläggande teknisk support', 'Support', 800.00, 'timme'),
  ('550e8400-e29b-41d4-a716-446655440000', 'Utbildning', 'Användarutbildning för nya system', 'Utbildning', 900.00, 'timme');

-- Lägg till test-kunder
INSERT INTO customers (company_id, name, email, phone, company_name, address, city, postal_code)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Anna Andersson', 'anna@exempel.se', '070-123 45 67', 'Exempel AB', 'Kundsvägen 10', 'Göteborg', '41234'),
  ('550e8400-e29b-41d4-a716-446655440000', 'Bengt Bengtsson', 'bengt@firma.se', '070-234 56 78', 'Firma Sverige AB', 'Industrivägen 5', 'Malmö', '21345'),
  ('550e8400-e29b-41d4-a716-446655440000', 'Cecilia Carlsson', 'cecilia@företag.se', '070-345 67 89', 'Företag Nord AB', 'Nordvägen 15', 'Umeå', '90123');
