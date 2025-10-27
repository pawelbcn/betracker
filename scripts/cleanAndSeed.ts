import { prisma } from '../lib/prisma';

async function main() {
  console.log('🧹 Cleaning existing data...');

  // Clear existing data
  await prisma.expense.deleteMany();
  await prisma.delegation.deleteMany();

  console.log('✅ Data cleaned successfully!');

  console.log('🌱 Seeding with 5 new delegations for this month...');

  // Get current month dates
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Create 5 delegations for this month
  const delegations = [
    {
      title: "Berlin Tech Conference 2025",
      destination_country: "Germany",
      destination_city: "Berlin",
      start_date: new Date(currentYear, currentMonth, 5),
      end_date: new Date(currentYear, currentMonth, 7),
      purpose: "Attend ReactEurope Conference and network with developers",
      exchange_rate: 4.35,
      daily_allowance: 49,
      notes: "Speaking engagement on Next.js performance optimization"
    },
    {
      title: "Prague Business Meeting",
      destination_country: "Czech Republic", 
      destination_city: "Prague",
      start_date: new Date(currentYear, currentMonth, 12),
      end_date: new Date(currentYear, currentMonth, 14),
      purpose: "Client project kickoff meeting with Czech development team",
      exchange_rate: 4.35,
      daily_allowance: 41,
      notes: "Discuss new e-commerce platform requirements"
    },
    {
      title: "Vienna Art Gallery Visit",
      destination_country: "Austria",
      destination_city: "Vienna", 
      start_date: new Date(currentYear, currentMonth, 18),
      end_date: new Date(currentYear, currentMonth, 20),
      purpose: "Research for digital art exhibition project",
      exchange_rate: 4.35,
      daily_allowance: 45,
      notes: "Visit Belvedere Museum and meet with local artists"
    },
    {
      title: "Warsaw Startup Event",
      destination_country: "Poland",
      destination_city: "Warsaw",
      start_date: new Date(currentYear, currentMonth, 22),
      end_date: new Date(currentYear, currentMonth, 24),
      purpose: "Attend startup networking event and pitch session",
      exchange_rate: 4.35,
      daily_allowance: 40,
      notes: "Looking for potential business partnerships"
    },
    {
      title: "Bratislava Client Workshop",
      destination_country: "Slovakia",
      destination_city: "Bratislava",
      start_date: new Date(currentYear, currentMonth, 28),
      end_date: new Date(currentYear, currentMonth, 30),
      purpose: "Conduct UX design workshop for Slovak client",
      exchange_rate: 4.35,
      daily_allowance: 42,
      notes: "Two-day intensive design thinking workshop"
    }
  ];

  // Create delegations
  const createdDelegations = [];
  for (const delegationData of delegations) {
    const delegation = await prisma.delegation.create({
      data: {
        ...delegationData,
        // user_id: 'temp_user_id' // TODO: Get from authentication - removed until user_id field exists
      }
    });
    createdDelegations.push(delegation);
    console.log(`✅ Created delegation: ${delegation.title}`);
  }

  console.log(`📊 Created ${createdDelegations.length} delegations`);

  // Create realistic expenses for each delegation
  const expenses = [
    // Berlin Tech Conference expenses
    {
      delegation_id: createdDelegations[0].id,
      date: new Date(currentYear, currentMonth, 5),
      category: "flight",
      amount: 180,
      currency: "EUR",
      description: "Return flight WAW-BER"
    },
    {
      delegation_id: createdDelegations[0].id,
      date: new Date(currentYear, currentMonth, 5),
      category: "hotel",
      amount: 120,
      currency: "EUR", 
      description: "Hotel Berlin Central - 2 nights"
    },
    {
      delegation_id: createdDelegations[0].id,
      date: new Date(currentYear, currentMonth, 6),
      category: "misc",
      amount: 85,
      currency: "EUR",
      description: "Conference ticket and materials"
    },
    {
      delegation_id: createdDelegations[0].id,
      date: new Date(currentYear, currentMonth, 6),
      category: "taxi",
      amount: 25,
      currency: "EUR",
      description: "Airport transfers"
    },

    // Prague Business Meeting expenses
    {
      delegation_id: createdDelegations[1].id,
      date: new Date(currentYear, currentMonth, 12),
      category: "flight",
      amount: 95,
      currency: "EUR",
      description: "Return flight WAW-PRG"
    },
    {
      delegation_id: createdDelegations[1].id,
      date: new Date(currentYear, currentMonth, 12),
      category: "hotel",
      amount: 85,
      currency: "EUR",
      description: "Hotel Prague Center - 2 nights"
    },
    {
      delegation_id: createdDelegations[1].id,
      date: new Date(currentYear, currentMonth, 13),
      category: "transport",
      amount: 15,
      currency: "EUR",
      description: "Public transport and taxi"
    },

    // Vienna Art Gallery expenses
    {
      delegation_id: createdDelegations[2].id,
      date: new Date(currentYear, currentMonth, 18),
      category: "flight",
      amount: 140,
      currency: "EUR",
      description: "Return flight WAW-VIE"
    },
    {
      delegation_id: createdDelegations[2].id,
      date: new Date(currentYear, currentMonth, 18),
      category: "hotel",
      amount: 110,
      currency: "EUR",
      description: "Hotel Vienna Art District - 2 nights"
    },
    {
      delegation_id: createdDelegations[2].id,
      date: new Date(currentYear, currentMonth, 19),
      category: "misc",
      amount: 45,
      currency: "EUR",
      description: "Museum tickets and art materials"
    },

    // Warsaw Startup Event expenses
    {
      delegation_id: createdDelegations[3].id,
      date: new Date(currentYear, currentMonth, 22),
      category: "transport",
      amount: 35,
      currency: "PLN",
      description: "Train tickets and local transport"
    },
    {
      delegation_id: createdDelegations[3].id,
      date: new Date(currentYear, currentMonth, 22),
      category: "hotel",
      amount: 200,
      currency: "PLN",
      description: "Hotel Warsaw Business Center - 2 nights"
    },
    {
      delegation_id: createdDelegations[3].id,
      date: new Date(currentYear, currentMonth, 23),
      category: "misc",
      amount: 150,
      currency: "PLN",
      description: "Event tickets and networking dinner"
    },

    // Bratislava Client Workshop expenses
    {
      delegation_id: createdDelegations[4].id,
      date: new Date(currentYear, currentMonth, 28),
      category: "flight",
      amount: 75,
      currency: "EUR",
      description: "Return flight WAW-BTS"
    },
    {
      delegation_id: createdDelegations[4].id,
      date: new Date(currentYear, currentMonth, 28),
      category: "hotel",
      amount: 90,
      currency: "EUR",
      description: "Hotel Bratislava Business - 2 nights"
    },
    {
      delegation_id: createdDelegations[4].id,
      date: new Date(currentYear, currentMonth, 29),
      category: "misc",
      amount: 120,
      currency: "EUR",
      description: "Workshop materials and client dinner"
    }
  ];

  // Create expenses
  const createdExpenses = [];
  for (const expenseData of expenses) {
    const expense = await prisma.expense.create({
      data: expenseData
    });
    createdExpenses.push(expense);
  }

  console.log(`💰 Created ${createdExpenses.length} expenses`);

  // Calculate totals
  let totalExpensesPLN = 0;
  let totalAllowancesPLN = 0;

  for (const delegation of createdDelegations) {
    const delegationExpenses = expenses.filter(e => e.delegation_id === delegation.id);
    const expensesPLN = delegationExpenses.reduce((sum, expense) => {
      return sum + (expense.amount * delegation.exchange_rate);
    }, 0);
    totalExpensesPLN += expensesPLN;

    const days = Math.ceil((delegation.end_date.getTime() - delegation.start_date.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const allowancePLN = days * delegation.daily_allowance * delegation.exchange_rate;
    totalAllowancesPLN += allowancePLN;
  }

  console.log('\n📈 SUMMARY:');
  console.log(`Total Delegations: ${createdDelegations.length}`);
  console.log(`Total Expenses: ${totalExpensesPLN.toFixed(2)} PLN`);
  console.log(`Total Allowances: ${totalAllowancesPLN.toFixed(2)} PLN`);
  console.log(`Grand Total: ${(totalExpensesPLN + totalAllowancesPLN).toFixed(2)} PLN`);

  console.log('\n✅ Database seeded successfully with realistic data!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
