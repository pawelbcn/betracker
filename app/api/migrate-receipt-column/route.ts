import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Security: Add a simple secret key check (set this in Vercel environment variables)
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.MIGRATION_SECRET || 'migrate-receipt-column-2025';
    
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Run the migration using raw SQL
    await prisma.$executeRawUnsafe(`
      ALTER TABLE expenses ADD COLUMN IF NOT EXISTS receipt_url TEXT;
    `);

    // Verify the column was added
    const result = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'expenses' AND column_name = 'receipt_url';
    `) as any[];

    return NextResponse.json({ 
      success: true, 
      message: 'receipt_url column added successfully',
      verification: result 
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    // Check if column already exists
    if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
      return NextResponse.json({ 
        success: true, 
        message: 'Column already exists - migration not needed',
        note: 'This is fine, the column is already there'
      });
    }
    
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  // Simple check endpoint - no auth needed
  try {
    const result = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'expenses' AND column_name = 'receipt_url';
    `) as any[];

    return NextResponse.json({ 
      columnExists: result.length > 0,
      details: result.length > 0 ? result[0] : null,
      message: result.length > 0 
        ? 'receipt_url column exists - migration already done!' 
        : 'receipt_url column does NOT exist - migration needed'
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Check failed', 
      details: error.message 
    }, { status: 500 });
  }
}
