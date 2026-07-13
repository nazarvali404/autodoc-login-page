import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const alterations = await prisma.alterationRecord.findMany({
      orderBy: { resolutionDate: 'desc' },
    });
    return NextResponse.json(alterations);
  } catch (error) {
    console.error('Error fetching alterations:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const alteration = await prisma.alterationRecord.create({
      data: {
        companyName: data.companyName,
        type: data.type,
        description: data.description,
        resolutionDate: data.resolutionDate || new Date().toISOString().split('T')[0],
        filingDate: data.filingDate || '',
        status: data.status || 'Pending'
      }
    });
    return NextResponse.json(alteration, { status: 201 });
  } catch (error) {
    console.error('Error creating alteration:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
