import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection...');

    // Test basic connection
    const delegations = await prisma.delegation.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        user_id: true,
        created_at: true
      }
    });

    console.log(`📊 Found ${delegations.length} delegations`);

    // Try to check if User model exists
    let userTest;
    try {
      userTest = await prisma.user.findMany({ take: 1 });
      console.log('✅ User model is available');
    } catch (error) {
      console.log('❌ User model not available:', error instanceof Error ? error.message : 'Unknown error');
    }

    return NextResponse.json({
      success: true,
      delegations: delegations,
      userModelAvailable: !!userTest,
      totalDelegations: delegations.length
    });

  } catch (error) {
    console.error('❌ Database test failed:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
