# Database Migration for Neon Database

## Your Database Setup
You're using **Neon** (not Vercel Postgres directly), which is a serverless PostgreSQL database.

## Steps to Run Migration

### Option 1: Via Neon Console (Recommended)

1. **Go to Neon Dashboard:**
   - Visit: https://console.neon.tech/
   - Log in and find your `neon-betracker` project

2. **Open SQL Editor:**
   - Click on your project/database
   - Go to "SQL Editor" tab
   - Or use the "Query" option

3. **Run the Migration:**
   ```sql
   ALTER TABLE expenses ADD COLUMN IF NOT EXISTS receipt_url TEXT;
   ```

4. **Verify it worked:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'expenses' AND column_name = 'receipt_url';
   ```
   You should see `receipt_url | text` in the results.

### Option 2: Via Vercel Dashboard

1. **In Vercel Dashboard:**
   - Go to your project
   - Click on "Storage" or "Databases"
   - Find "neon-betracker"
   - Click on it to open Neon dashboard (if linked)

2. **Or use Connection String:**
   - Get your Neon connection string from Vercel environment variables
   - Connect via psql or any PostgreSQL client
   - Run the migration SQL

### Option 3: Via Command Line (if you have psql)

```bash
# Get connection string from Vercel environment variables
# Then connect:
psql "your-neon-connection-string"

# Run migration:
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS receipt_url TEXT;
```

## After Migration

Once the migration is complete:
- ✅ Receipt upload feature will be fully enabled
- ✅ The fallback code in the API can be removed (optional)
- ✅ Your data remains safe and accessible

## Need Help?

If you can't find the SQL Editor:
- Neon dashboard: https://console.neon.tech/
- Look for "SQL Editor" or "Query" in the left sidebar
- Or use "Branches" → select your branch → "Query"
