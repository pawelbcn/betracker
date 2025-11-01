# URGENT: Data Recovery Steps

## What Happened
We only added a `receipt_url` field to the Expense model - this should NOT affect delegation data. Your data is likely still in the database.

## Immediate Actions

### 1. Check Vercel Deployment Logs
- Go to your Vercel dashboard
- Check the latest deployment logs for errors
- Look for database connection errors or Prisma errors

### 2. Check Database Connection
The issue is likely a database connection problem on Vercel, not deleted data.

### 3. Quick Fix - Run Database Migration
If you haven't run the migration yet, the database might be in an inconsistent state:

```sql
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS receipt_url TEXT;
```

### 4. Regenerate Prisma Client
On Vercel, this should happen automatically, but you can trigger it:
- In Vercel dashboard: Settings → Environment Variables
- Make sure `DATABASE_URL` is set correctly
- Redeploy the project

### 5. Check API Endpoints Directly
Test if data is accessible:
- Visit: `https://betracker.vercel.app/api/delegations`
- This will show if the API is returning data or errors

## Data Recovery

Your data should still be in the database. The changes we made were:
- ✅ Only added `receipt_url TEXT` column to expenses table
- ✅ Did NOT modify delegation table structure
- ✅ Did NOT delete any data

If data is truly missing, check:
1. Database connection string in Vercel
2. Whether database was reset/restored
3. Database backup (if available)

## Temporary Rollback Option

If you need to rollback immediately:
1. Go to Vercel dashboard
2. Find the deployment before our changes (commit `2974f81` or earlier)
3. Click "Redeploy" on that deployment
4. This will restore the previous version without receipt upload

## Verification Steps

1. Check Vercel logs for errors
2. Test API endpoint: `/api/delegations`
3. Check Vercel environment variables for `DATABASE_URL`
4. Verify database connection is working
