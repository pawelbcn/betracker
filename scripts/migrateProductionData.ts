import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function migrateProductionData() {
  try {
    console.log('🔄 Starting production data migration...');

    // First, let's see what's in the production database
    const delegations = await prisma.delegation.findMany();
    console.log(`📊 Found ${delegations.length} delegations in production database`);

    if (delegations.length === 0) {
      console.log('ℹ️ No delegations found in production database');
      return;
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
      return;
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

    console.log(`🎉 Migration complete! Pawel now has ${pawelDelegations.length} delegations in production:`);
    
    pawelDelegations.forEach(delegation => {
      console.log(`  - ${delegation.title} (${delegation.expenses.length} expenses)`);
    });

  } catch (error) {
    console.error('❌ Production migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateProductionData();
