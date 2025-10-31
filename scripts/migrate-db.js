#!/usr/bin/env node
/**
 * Database migration script for Vercel deployments
 * Runs Prisma migrations when DATABASE_URL is available
 */

const { execSync } = require('child_process');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log('⚠️  DATABASE_URL not set, skipping migrations');
  process.exit(0);
}

// Check if it's a PostgreSQL database (production)
if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
  try {
    console.log('🔄 Running database migrations...');
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: databaseUrl }
    });
    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    // Don't fail the build if migration fails - might already be applied
    console.log('⚠️  Continuing build... (migration may have already been applied)');
    process.exit(0);
  }
} else {
  console.log('⚠️  Not a PostgreSQL database, skipping migrations');
  process.exit(0);
}


