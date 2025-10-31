# Deployment Steps - Receipt Upload Feature

## Database Migration Required

Before the receipt upload feature will work, you need to add the `receipt_url` column to your production database.

### Run this SQL on your production database:

```sql
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS receipt_url TEXT;
```

### Steps:

1. **Connect to your production database** (PostgreSQL on Vercel or your hosting provider)

2. **Run the migration SQL:**
   - If using Vercel Postgres, use the Vercel dashboard SQL editor or psql CLI
   - If using external hosting, connect via your database management tool

3. **Verify the column was added:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'expenses' AND column_name = 'receipt_url';
   ```

## Deployment

The code has been pushed to GitHub. If Vercel is connected to your repository:

1. **Automatic Deployment**: Vercel will automatically deploy from the main branch
2. **Manual Deployment**: Run `npm run vercel:deploy` from the project root

## File Storage

- Receipt files are stored in `public/uploads/receipts/`
- Make sure the `public/uploads/receipts/` directory exists on your server
- For Vercel, files in the `public` folder are automatically served
- Note: Vercel Serverless Functions have limited file system access. For production, consider using:
  - Vercel Blob Storage
  - AWS S3
  - Cloudinary
  - Or another cloud storage service

## Post-Deployment Checklist

- [ ] Database migration completed
- [ ] Vercel deployment successful
- [ ] Test receipt upload functionality
- [ ] Verify receipt files are accessible
- [ ] Test downloading receipts from expense table

## Important Notes

- Files are currently stored in the `public` folder, which works for Vercel
- For high-volume production use, consider migrating to cloud storage
- The upload API validates file types (images & PDFs) and size (max 10MB)
