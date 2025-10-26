#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
const localSchemaPath = path.join(__dirname, '../prisma/schema.local.prisma');
const productionSchemaPath = path.join(__dirname, '../prisma/schema.production.prisma');

const environment = process.argv[2];

if (!environment || !['local', 'production'].includes(environment)) {
  console.log('Usage: node scripts/switch-db.js [local|production]');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/switch-db.js local      # Switch to SQLite for local development');
  console.log('  node scripts/switch-db.js production # Switch to PostgreSQL for production');
  process.exit(1);
}

try {
  let sourceSchema;
  
  if (environment === 'local') {
    sourceSchema = localSchemaPath;
    console.log('🔄 Switching to local SQLite database...');
  } else {
    sourceSchema = productionSchemaPath;
    console.log('🔄 Switching to production PostgreSQL database...');
  }

  // Read the source schema
  const schemaContent = fs.readFileSync(sourceSchema, 'utf8');
  
  // Write to main schema file
  fs.writeFileSync(schemaPath, schemaContent);
  
  console.log(`✅ Successfully switched to ${environment} database configuration`);
  console.log('');
  console.log('Next steps:');
  console.log('1. Run: npx prisma generate');
  console.log('2. Run: npx prisma db push');
  console.log('3. Run: npm run db:seed (optional)');
  
} catch (error) {
  console.error('❌ Error switching database configuration:', error.message);
  process.exit(1);
}
