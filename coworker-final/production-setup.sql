-- Production setup för CoWorker
-- Skapa user_profiles tabell och trigger

-- Skapa user_profiles tabell
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    full_name TEXT,
    company_name TEXT,
    avatar_url TEXT,
    plan_type TEXT DEFAULT 'starter',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aktivera RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Skapa RLS policies
CREATE POLICY "Users can view own profile" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Skapa trigger-funktion för automatisk profilskapande
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, full_name, company_name)
    VALUES (
        NEW.id,
        'New User',
        'New Company'
    );
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log the error but don't fail the user creation
        RAISE LOG 'Error creating user profile: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Skapa trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Bekräfta att allt fungerar
SELECT 'Setup completed successfully!' as status;
