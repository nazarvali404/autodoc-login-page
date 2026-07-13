import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const company = await prisma.company.create({
      data: {
        name: data.name,
        cin: data.cin,
        type: data.type,
        status: data.status || 'Active',
        incorporationDate: data.incorporationDate || new Date().toISOString().split('T')[0],
        registeredOffice: data.registeredOffice || '—',
        email: data.email,
        phone: data.phone || '—',
        authorizedCapital: data.authorizedCapital || '₹1,000,000',
        paidUpCapital: data.paidUpCapital || '₹100,000'
      }
    });
    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}