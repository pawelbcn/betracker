import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch delegations without expenses first to avoid schema mismatch issues
    const delegations = await prisma.delegation.findMany({
      orderBy: {
        start_date: 'desc'
      }
    })
    
    // Fetch expenses separately to handle potential receipt_url column issue gracefully
    const expenses = await prisma.expense.findMany({
      where: {
        delegation_id: {
          in: delegations.map(d => d.id)
        }
      }
    })
    
    // Attach expenses to delegations
    const delegationsWithExpenses = delegations.map(delegation => ({
      ...delegation,
      expenses: expenses.filter(e => e.delegation_id === delegation.id)
    }))
    
    return NextResponse.json(delegationsWithExpenses)
  } catch (error) {
    console.error('Error fetching delegations:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    // Return empty array instead of error to prevent frontend crashes
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Basic input validation and sanitization
    if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    if (!body.destination_country || typeof body.destination_country !== 'string') {
      return NextResponse.json({ error: 'Destination country is required' }, { status: 400 })
    }
    if (!body.destination_city || typeof body.destination_city !== 'string' || body.destination_city.trim().length === 0) {
      return NextResponse.json({ error: 'Destination city is required' }, { status: 400 })
    }
    if (!body.start_date || !body.end_date) {
      return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 })
    }
    // Time fields validation removed - not available in current schema
    if (!body.purpose || typeof body.purpose !== 'string' || body.purpose.trim().length === 0) {
      return NextResponse.json({ error: 'Purpose is required' }, { status: 400 })
    }
    if (typeof body.daily_allowance !== 'number' || body.daily_allowance <= 0) {
      return NextResponse.json({ error: 'Valid daily allowance is required' }, { status: 400 })
    }
    
    // Safely construct start/end DateTimes using provided times when available
    const startDateStr: string = body.start_date
    const endDateStr: string = body.end_date
    const startTimeStr: string = (body.start_time && typeof body.start_time === 'string' && body.start_time.trim() !== '') ? body.start_time : '09:00'
    const endTimeStr: string = (body.end_time && typeof body.end_time === 'string' && body.end_time.trim() !== '') ? body.end_time : '17:00'

    // Combine date and time into ISO-like strings
    const startIso = `${startDateStr}T${startTimeStr}`
    const endIso = `${endDateStr}T${endTimeStr}`

    const delegation = await prisma.delegation.create({
      data: {
        title: body.title.trim(),
        destination_country: body.destination_country,
        destination_city: body.destination_city.trim(),
        start_date: new Date(startIso),
        start_time: startTimeStr,
        end_date: new Date(endIso),
        end_time: endTimeStr,
        purpose: body.purpose.trim(),
        exchange_rate: 4.35, // Default fallback rate - will be replaced by NBP rates
        daily_allowance: parseFloat(body.daily_allowance),
        notes: body.notes ? body.notes.trim() : null
      }
    })
    
    return NextResponse.json(delegation, { status: 201 })
  } catch (error) {
    console.error('Error creating delegation:', error)
    return NextResponse.json({ error: 'Failed to create delegation' }, { status: 500 })
  }
}
