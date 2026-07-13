import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const directors = await prisma.director.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(directors);
  } catch (error) {
    console.error('Error fetching directors:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const director = await prisma.director.create({
      data: {
        name: data.name,
        din: data.din,
        pan: data.pan,
        aadhaar: data.aadhaar || '—',
        email: data.email,
        phone: data.phone || '—',
        address: data.address || '—',
        appointmentDate: data.appointmentDate || new Date().toISOString().split('T')[0],
        resignationDate: data.resignationDate || null,
        companyId: data.companyId || 'company-1',
        companyName: data.companyName,
        status: data.status || 'Active'
      }
    });
    return NextResponse.json(director, { status: 201 });
  } catch (error) {
    console.error('Error creating director:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}