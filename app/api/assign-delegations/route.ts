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
        user_id: true,
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

    // Try to create or find pawel user
    let pawelUser;
    try {
      // First try to find existing user
      pawelUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username: 'pawel' },
            { email: 'pawel@example.com' }
          ]
        }
      });

      if (!pawelUser) {
        // Create pawel user
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('ooo000', 12);
        
        pawelUser = await prisma.user.create({
          data: {
            username: 'pawel',
            email: 'pawel@example.com',
            password: hashedPassword,
            first_name: 'Pawel',
            last_name: 'User',
            company: 'Default Company'
          }
        });
        console.log('✅ Created pawel user:', pawelUser.id);
      } else {
        console.log('✅ Found existing pawel user:', pawelUser.id);
      }
    } catch (userError) {
      console.error('❌ User creation failed:', userError);
      // If user creation fails, we'll just update the delegations with a temp user_id
      console.log('🔄 Proceeding with temp user_id assignment...');
    }

    // Update delegations to belong to pawel (or temp user if user creation failed)
    const userId = pawelUser ? pawelUser.id : 'pawel_user_id';
    
    const updateResult = await prisma.delegation.updateMany({
      where: {
        OR: [
          { user_id: null },
          { user_id: 'temp_user_id' }
        ]
      },
      data: {
        user_id: userId
      }
    });

    console.log(`✅ Updated ${updateResult.count} delegations`);

    // Get updated delegations with expenses
    const updatedDelegations = await prisma.delegation.findMany({
      where: { user_id: userId },
      include: { expenses: true }
    });

    return NextResponse.json({
      success: true,
      message: 'Delegations assigned successfully',
      user: pawelUser ? {
        id: pawelUser.id,
        username: pawelUser.username,
        email: pawelUser.email
      } : { id: userId, username: 'pawel' },
      delegations: updatedDelegations.map(d => ({
        id: d.id,
        title: d.title,
        expenses: d.expenses.length,
        user_id: d.user_id
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
