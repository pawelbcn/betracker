import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function migrateExistingData() {
  try {
    console.log('🔄 Starting data migration...');

    // First, create or find the pawel user
    let pawelUser;
    try {
      // Try to find existing pawel user
      pawelUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username: 'pawel' },
            { email: 'pawel@example.com' }
          ]
        }
      });

      if (!pawelUser) {
        // Create pawel user if doesn't exist
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
        console.log('✅ Created pawel user account');
      } else {
        console.log('✅ Found existing pawel user account');
      }
    } catch (error) {
      console.error('❌ Error creating/finding pawel user:', error);
      return;
    }

    // Find all delegations without user_id (null or temp_user_id)
    const delegationsToMigrate = await prisma.delegation.findMany({
      where: {
        OR: [
          { user_id: null },
          { user_id: 'temp_user_id' }
        ]
      },
      include: {
        expenses: true
      }
    });

    console.log(`📊 Found ${delegationsToMigrate.length} delegations to migrate`);

    if (delegationsToMigrate.length === 0) {
      console.log('ℹ️ No delegations need migration');
      return;
    }

    // Update each delegation to belong to pawel
    let migratedCount = 0;
    for (const delegation of delegationsToMigrate) {
      try {
        await prisma.delegation.update({
          where: { id: delegation.id },
          data: { user_id: pawelUser.id }
        });
        
        console.log(`✅ Migrated delegation: ${delegation.title}`);
        migratedCount++;
      } catch (error) {
        console.error(`❌ Error migrating delegation ${delegation.id}:`, error);
      }
    }

    console.log(`🎉 Migration complete! Migrated ${migratedCount} delegations to pawel user`);
    
    // Show summary
    const totalDelegations = await prisma.delegation.count({
      where: { user_id: pawelUser.id }
    });
    
    const totalExpenses = await prisma.expense.count({
      where: {
        delegation: {
          user_id: pawelUser.id
        }
      }
    });

    console.log(`📈 Pawel now has ${totalDelegations} delegations with ${totalExpenses} expenses`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateExistingData();
