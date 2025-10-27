import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./dev.db"
    }
  }
});

async function migrateData() {
  try {
    console.log('🔄 Starting simple data migration...');

    // First, let's see what's in the database
    const delegations = await prisma.delegation.findMany();
    console.log(`📊 Found ${delegations.length} delegations in database`);

    // Create pawel user
    const hashedPassword = await bcrypt.hash('ooo000', 12);
    const pawelUser = await prisma.user.create({
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

    console.log(`🎉 Migration complete! Pawel now has ${pawelDelegations.length} delegations`);
    
    pawelDelegations.forEach(delegation => {
      console.log(`  - ${delegation.title} (${delegation.expenses.length} expenses)`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateData();
