import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const certs = await prisma.shareCertificate.findMany({
      orderBy: { certificateNo: 'asc' },
    });
    return NextResponse.json(certs);
  } catch (error) {
    console.error('Error fetching share certificates:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const cert = await prisma.shareCertificate.create({
      data: {
        certificateNo: data.certificateNo,
        companyName: data.companyName,
        holderName: data.holderName,
        shares: Number(data.shares),
        issueDate: data.issueDate || new Date().toISOString().split('T')[0],
        status: data.status || 'Active'
      }
    });
    return NextResponse.json(cert, { status: 201 });
  } catch (error) {
    console.error('Error creating share certificate:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
