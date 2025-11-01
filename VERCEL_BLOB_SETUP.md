# Vercel Blob Storage Setup

## Why This Is Needed

Vercel serverless functions have a **read-only filesystem** (except `/tmp` which is temporary). To properly store uploaded receipt files, we need to use **Vercel Blob Storage**.

## Setup Steps

### 1. Create Vercel Blob Storage

1. Go to your **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your project: **betracker**
3. Go to **Storage** tab
4. Click **Create Database** → **Blob**
5. Name it: `receipts` (or any name)
6. Select your project: **betracker**

### 2. Add Environment Variable

Vercel will automatically add the `BLOB_READ_WRITE_TOKEN` environment variable to your project.

**Verify it's set:**
- Go to **Settings** → **Environment Variables**
- You should see `BLOB_READ_WRITE_TOKEN` with a value starting with `vercel_blob_rw_`

### 3. Redeploy

After adding Blob Storage:
- Vercel will automatically redeploy
- Or manually trigger a redeploy from the dashboard

## Current Behavior

**Without BLOB_READ_WRITE_TOKEN:**
- Files are converted to base64 data URLs
- Stored in database as text
- Works but not ideal for large files

**With BLOB_READ_WRITE_TOKEN:**
- Files are stored in Vercel Blob Storage
- Returns a public URL
- Proper cloud storage solution ✅

## Testing

After setup, try uploading a receipt again. Check Vercel logs to see:
- If Blob Storage is being used
- Any errors that occur

## Troubleshooting

If upload still fails:
1. Check Vercel logs: **Deployments** → **Latest** → **Functions** → Check `/api/upload-receipt` logs
2. Verify `BLOB_READ_WRITE_TOKEN` is set in environment variables
3. Make sure Blob Storage is created and linked to your project
