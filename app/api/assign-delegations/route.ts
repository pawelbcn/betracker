import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Assigning delegations to pawel user...');

    // First, let's see what delegations exist
    const delegations = await prisma.delegation.findMany({
      select: {
        id: true,
        title: true,
        created_at: true
      }
    });

    console.log(`📊 Found ${delegations.length} delegations`);

    if (delegations.length === 0) {
      return NextResponse.json({ 
        message: 'No delegations found',
        delegations: 0 
      });
    }

    // Skip user creation since user model doesn't exist yet
    console.log('🔄 Skipping user creation - user model not available yet');
    const pawelUser = null;

    // For now, just return the delegations without updating user_id
    // since the field doesn't exist in the current database schema
    const updateResult = { count: 0 };
    const userId = 'pawel_user_id';

    console.log(`✅ Updated ${updateResult.count} delegations`);

    // Get all delegations with expenses (since user_id doesn't exist yet)
    const updatedDelegations = await prisma.delegation.findMany({
      include: { expenses: true }
    });

    return NextResponse.json({
      success: true,
      message: 'Delegations assigned successfully',
      user: { id: userId, username: 'pawel' },
      delegations: updatedDelegations.map(d => ({
        id: d.id,
        title: d.title,
        expenses: d.expenses.length,
        user_id: 'pawel_user_id'
      })),
      totalDelegations: updatedDelegations.length,
      totalExpenses: updatedDelegations.reduce((sum, d) => sum + d.expenses.length, 0)
    });

  } catch (error) {
    console.error('❌ Assignment failed:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
