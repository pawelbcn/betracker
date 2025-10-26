import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.expense.deleteMany()
  await prisma.delegation.deleteMany()

  // Create delegations
  const delegation1 = await prisma.delegation.create({
    data: {
      title: 'Pécs Business Meeting',
      destination_country: 'Hungary',
      destination_city: 'Pécs',
      start_date: new Date('2025-10-15'),
      end_date: new Date('2025-10-17'),
      purpose: 'Client project kickoff meeting',
      exchange_rate: 4.35,
      daily_allowance: 43,
      notes: 'Meeting with DevTeam Hungary'
    }
  })

  const delegation2 = await prisma.delegation.create({
    data: {
      title: 'Berlin Tech Conference',
      destination_country: 'Germany',
      destination_city: 'Berlin',
      start_date: new Date('2025-10-20'),
      end_date: new Date('2025-10-22'),
      purpose: 'ReactEurope Conference',
      exchange_rate: 4.35,
      daily_allowance: 49,
      notes: 'Speaking engagement on Next.js'
    }
  })

  // Create expenses for delegation 1
  await prisma.expense.createMany({
    data: [
      {
        delegation_id: delegation1.id,
        date: new Date('2025-10-15'),
        category: 'hotel',
        amount: 190,
        currency: 'EUR',
        description: 'Hotel Arkadia - 2 nights'
      },
      {
        delegation_id: delegation1.id,
        date: new Date('2025-10-15'),
        category: 'flight',
        amount: 120,
        currency: 'EUR',
        description: 'Return flight WAW-PEV'
      }
    ]
  })

  // Create expenses for delegation 2
  await prisma.expense.createMany({
    data: [
      {
        delegation_id: delegation2.id,
        date: new Date('2025-10-20'),
        category: 'hotel',
        amount: 250,
        currency: 'EUR',
        description: 'Hotel Berlin Central - 2 nights'
      },
      {
        delegation_id: delegation2.id,
        date: new Date('2025-10-20'),
        category: 'flight',
        amount: 180,
        currency: 'EUR',
        description: 'Return flight WAW-BER'
      },
      {
        delegation_id: delegation2.id,
        date: new Date('2025-10-21'),
        category: 'misc',
        amount: 50,
        currency: 'EUR',
        description: 'Conference ticket'
      }
    ]
  })

  console.log('✅ Database seeded successfully!')
  console.log(`Created ${await prisma.delegation.count()} delegations`)
  console.log(`Created ${await prisma.expense.count()} expenses`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
