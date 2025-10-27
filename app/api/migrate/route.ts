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

    // Create or find pawel user
    let pawelUser;
    try {
      pawelUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username: 'pawel' },
            { email: 'pawel@example.com' }
          ]
        }
      });

      if (!pawelUser) {
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
        console.log('✅ Created pawel user in production:', pawelUser.id);
      } else {
        console.log('✅ Found existing pawel user in production:', pawelUser.id);
      }
    } catch (error) {
      console.error('❌ Error creating/finding pawel user:', error);
      return NextResponse.json({ 
        error: 'Failed to create/find pawel user',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    // Update all delegations to belong to pawel
    const updateResult = await prisma.delegation.updateMany({
      where: {
        OR: [
          { user_id: null },
          { user_id: 'temp_user_id' }
        ]
      },
      data: {
        user_id: pawelUser.id
      }
    });

    console.log(`✅ Updated ${updateResult.count} delegations to belong to pawel`);

    // Verify the migration
    const pawelDelegations = await prisma.delegation.findMany({
      where: { user_id: pawelUser.id },
      include: { expenses: true }
    });

    console.log(`🎉 Migration complete! Pawel now has ${pawelDelegations.length} delegations in production`);

    return NextResponse.json({
      message: 'Migration completed successfully',
      user: {
        id: pawelUser.id,
        username: pawelUser.username,
        email: pawelUser.email
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
