import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const offices = await prisma.registeredOffice.findMany({
      orderBy: { companyName: 'asc' },
    });
    return NextResponse.json(offices);
  } catch (error) {
    console.error('Error fetching registered offices:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const office = await prisma.registeredOffice.create({
      data: {
        companyName: data.companyName,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        effectiveDate: data.effectiveDate || new Date().toISOString().split('T')[0],
        status: data.status || 'Current'
      }
    });
    return NextResponse.json(office, { status: 201 });
  } catch (error) {
    console.error('Error creating registered office:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
