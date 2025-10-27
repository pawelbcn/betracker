import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  // User registration is disabled until user model is available
  return NextResponse.json(
    { error: 'Rejestracja użytkowników jest tymczasowo wyłączona. Użyj demo logowania: pawel / ooo000' },
    { status: 503 }
  );
}
