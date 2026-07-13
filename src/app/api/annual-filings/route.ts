import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const filings = await prisma.annualFiling.findMany({
      orderBy: { dueDate: 'asc' },
    });
    return NextResponse.json(filings);
  } catch (error) {
    console.error('Error fetching annual filings:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const filing = await prisma.annualFiling.create({
      data: {
        companyName: data.companyName,
        formType: data.formType,
        filingDate: data.filingDate || '',
        dueDate: data.dueDate,
        status: data.status || 'Pending',
        financialYear: data.financialYear
      }
    });
    return NextResponse.json(filing, { status: 201 });
  } catch (error) {
    console.error('Error creating annual filing:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
