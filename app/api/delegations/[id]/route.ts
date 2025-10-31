import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const delegation = await prisma.delegation.findUnique({
      where: { id: params.id },
      include: {
        expenses: true
      }
    })
    
    if (!delegation) {
      return NextResponse.json({ error: 'Delegation not found' }, { status: 404 })
    }
    
    return NextResponse.json(delegation)
  } catch (error) {
    console.error('Error fetching delegation:', error)
    return NextResponse.json({ error: 'Failed to fetch delegation' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    // Safely construct start/end DateTimes using provided times when available
    const startDateStr: string = body.start_date
    const endDateStr: string = body.end_date
    const startTimeStr: string = (body.start_time && typeof body.start_time === 'string' && body.start_time.trim() !== '') ? body.start_time : '09:00'
    const endTimeStr: string = (body.end_time && typeof body.end_time === 'string' && body.end_time.trim() !== '') ? body.end_time : '17:00'

    // Combine date and time into ISO-like strings to avoid using current time
    const startIso = `${startDateStr}T${startTimeStr}`
    const endIso = `${endDateStr}T${endTimeStr}`

    const delegation = await prisma.delegation.update({
      where: { id: params.id },
      data: {
        title: body.title,
        destination_country: body.destination_country,
        destination_city: body.destination_city,
        start_date: new Date(startIso),
        end_date: new Date(endIso),
        purpose: body.purpose,
        // exchange_rate removed; rates now come from NBP API
        daily_allowance: parseFloat(body.daily_allowance),
        notes: body.notes || null
      }
    })
    
    return NextResponse.json(delegation)
  } catch (error) {
    console.error('Error updating delegation:', error)
    return NextResponse.json({ error: 'Failed to update delegation' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.delegation.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ message: 'Delegation deleted successfully' })
  } catch (error) {
    console.error('Error deleting delegation:', error)
    return NextResponse.json({ error: 'Failed to delete delegation' }, { status: 500 })
  }
}
