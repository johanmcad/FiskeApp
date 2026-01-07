# Supabase Migrations

## How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Copy and paste the contents of the migration file you want to run
5. Click **Run**

### Option 2: Supabase CLI

If you have Supabase CLI installed:

```bash
supabase db push
```

## Migration Files

- `001_initial_schema.sql` - Initial database schema with tables and RLS policies
- `002_storage_bucket.sql` - Storage bucket for catch images
- `003_allow_anonymous_public_catches.sql` - **NEW**: Allows anonymous users to view public catches

## Recent Changes

### 2026-01-07: Fix Public Catches Visibility

**Problem**: Anonymous (non-logged-in) users could not see public catches because the RLS policy required authentication.

**Solution**: Migration `003_allow_anonymous_public_catches.sql` replaces the policy to allow ANYONE (including anonymous users) to view catches where `is_public = TRUE`.

**To apply**: Run the migration in your Supabase project's SQL Editor.
