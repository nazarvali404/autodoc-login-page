import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const auditors = await prisma.auditor.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(auditors);
  } catch (error) {
    console.error('Error fetching auditors:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const auditor = await prisma.auditor.create({
      data: {
        name: data.name,
        firmName: data.firmName,
        membershipNo: data.membershipNo,
        pan: data.pan || '—',
        email: data.email || '—',
        phone: data.phone || '—',
        address: data.address || '—',
        appointmentDate: data.appointmentDate || new Date().toISOString().split('T')[0],
        companyName: data.companyName,
        status: data.status || 'Active'
      }
    });
    return NextResponse.json(auditor, { status: 201 });
  } catch (error) {
    console.error('Error creating auditor:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
