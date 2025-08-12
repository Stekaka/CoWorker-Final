-- SQL script to create missing trigger function for user signup
-- This should be run in the Supabase SQL editor

-- First, let's create a function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Create a company for the new user
  insert into public.companies (id, name, created_at, updated_at)
  values (gen_random_uuid(), new.raw_user_meta_data->>'company_name', now(), now());
  
  -- Link the user to the company
  insert into public.user_companies (user_id, company_id, role, created_at)
  values (
    new.id, 
    (select id from public.companies where name = new.raw_user_meta_data->>'company_name' order by created_at desc limit 1),
    'owner',
    now()
  );
  
  return new;
end;
$$ language plpgsql security definer;

-- Create the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
