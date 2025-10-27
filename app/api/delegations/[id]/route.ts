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
    
    const delegation = await prisma.delegation.update({
      where: { id: params.id },
      data: {
        title: body.title,
        destination_country: body.destination_country,
        destination_city: body.destination_city,
        start_date: new Date(body.start_date),
        start_time: body.start_time,
        end_date: new Date(body.end_date),
        end_time: body.end_time,
        purpose: body.purpose,
        exchange_rate: parseFloat(body.exchange_rate),
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
