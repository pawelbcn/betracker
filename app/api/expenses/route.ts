import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        delegation: true
      },
      orderBy: {
        date: 'desc'
      }
    })
    
    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const expense = await prisma.expense.create({
      data: {
        delegation_id: body.delegation_id,
        date: new Date(body.date),
        category: body.category,
        amount: parseFloat(body.amount),
        currency: body.currency,
        description: body.description
      }
    })
    
    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
}
