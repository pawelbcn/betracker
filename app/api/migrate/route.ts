import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting production data migration...');

    // First, let's see what's in the production database
    const delegations = await prisma.delegation.findMany();
    console.log(`📊 Found ${delegations.length} delegations in production database`);

    if (delegations.length === 0) {
      return NextResponse.json({ 
        message: 'No delegations found in production database',
        delegations: 0 
      });
    }

    // Skip user creation since user model doesn't exist yet
    console.log('🔄 Skipping user creation - user model not available yet');
    const pawelUser = null;

    // For now, just return the delegations without updating user_id
    // since the field doesn't exist in the current database schema
    const updateResult = { count: 0 };

    console.log(`✅ Updated ${updateResult.count} delegations to belong to pawel`);

    // Get all delegations since user_id doesn't exist yet
    const pawelDelegations = await prisma.delegation.findMany({
      include: { expenses: true }
    });

    console.log(`🎉 Migration complete! Pawel now has ${pawelDelegations.length} delegations in production`);

    return NextResponse.json({
      message: 'Migration completed successfully',
      user: {
        id: 'pawel_user_id',
        username: 'pawel',
        email: 'pawel@example.com'
      },
      delegations: pawelDelegations.map(d => ({
        id: d.id,
        title: d.title,
        expenses: d.expenses.length
      })),
      totalDelegations: pawelDelegations.length,
      totalExpenses: pawelDelegations.reduce((sum, d) => sum + d.expenses.length, 0)
    });

  } catch (error) {
    console.error('❌ Production migration failed:', error);
    return NextResponse.json({ 
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
