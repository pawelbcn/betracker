import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const delegations = await prisma.delegation.findMany({
      include: {
        expenses: true
      },
      orderBy: {
        start_date: 'desc'
      }
    })
    
    return NextResponse.json(delegations)
  } catch (error) {
    console.error('Error fetching delegations:', error)
    return NextResponse.json({ error: 'Failed to fetch delegations' }, { status: 500 })
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
    if (!body.start_time || !body.end_time) {
      return NextResponse.json({ error: 'Start and end times are required' }, { status: 400 })
    }
    if (!body.purpose || typeof body.purpose !== 'string' || body.purpose.trim().length === 0) {
      return NextResponse.json({ error: 'Purpose is required' }, { status: 400 })
    }
    if (typeof body.exchange_rate !== 'number' || body.exchange_rate <= 0) {
      return NextResponse.json({ error: 'Valid exchange rate is required' }, { status: 400 })
    }
    if (typeof body.daily_allowance !== 'number' || body.daily_allowance <= 0) {
      return NextResponse.json({ error: 'Valid daily allowance is required' }, { status: 400 })
    }
    
    const delegation = await prisma.delegation.create({
      data: {
        title: body.title.trim(),
        destination_country: body.destination_country,
        destination_city: body.destination_city.trim(),
        start_date: new Date(body.start_date),
        start_time: body.start_time,
        end_date: new Date(body.end_date),
        end_time: body.end_time,
        purpose: body.purpose.trim(),
        exchange_rate: parseFloat(body.exchange_rate),
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
