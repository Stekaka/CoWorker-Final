# DB Intake Artifacts

Provide schema and RLS context here (no secrets). Prefer uploading files to this folder over pasting in chat.

## What to upload

- `schema.sql` — schema-only dump (no data, no credentials)
- `policies.csv` — output of pg_policies
- `columns.csv` — columns for all public tables
- `constraints.csv` — PK/FK/UNIQUE constraints
- `indexes.csv` — index list
- `routines.csv` — routines list
- `functions.sql` — function definitions (pg_get_functiondef)
- `triggers.csv` — triggers (optional)
- `sequences.csv` — sequences (optional)

## How to generate

Run these in Supabase SQL Editor and export results as CSV (or copy-paste to files here):

1) Policies
```sql
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

2) Columns
```sql
select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
order by table_name, ordinal_position;
```

3) Constraints
```sql
select
  tc.table_name,
  tc.constraint_type,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name as foreign_table,
  ccu.column_name as foreign_column
from information_schema.table_constraints tc
left join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name and tc.table_schema = kcu.table_schema
left join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name and ccu.table_schema = tc.table_schema
where tc.table_schema = 'public'
order by tc.table_name, tc.constraint_name;
```

4) Indexes
```sql
select tablename, indexname, indexdef
from pg_indexes
where schemaname = 'public'
order by tablename, indexname;
```

5) Routines list
```sql
select routine_name, routine_type, data_type
from information_schema.routines
where specific_schema = 'public'
order by routine_name;
```

6) Functions definitions
```sql
select p.proname, pg_get_functiondef(p.oid) as definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
order by p.proname;
```

7) Triggers (optional)
```sql
select event_object_table as table_name, trigger_name, event_manipulation as event, action_timing
from information_schema.triggers
where trigger_schema = 'public'
order by table_name, trigger_name;
```

8) Sequences (optional)
```sql
select sequence_name, data_type
from information_schema.sequences
where sequence_schema = 'public'
order by sequence_name;
```

## Schema-only dump (local terminal)

In your terminal (zsh), not in SQL Editor:

```bash
# Do not paste secrets into chat; use your own env locally
export POSTGRES_URL='postgres://USER:PASSWORD@HOST:PORT/DB?sslmode=require'

pg_dump --schema-only "$POSTGRES_URL" > db-intake/schema.sql
```

## Formats

CSV or JSON are fine. Use the filenames above so I can pick them up easily.

Once you’ve added files here, ping me and I’ll generate the migrations and RLS policies to fix Product Library and Quotes end-to-end.
