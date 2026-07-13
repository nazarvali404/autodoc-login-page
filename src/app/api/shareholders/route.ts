import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const shareholders = await prisma.shareholder.findMany({
      include: { transferHistory: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(shareholders);
  } catch (error) {
    console.error('Error fetching shareholders:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const shareholder = await prisma.shareholder.create({
      data: {
        name: data.name,
        shares: Number(data.shares),
        percentage: data.percentage || 5.0,
        shareCertificate: data.shareCertificate,
        companyName: data.companyName,
        type: data.type || 'Individual'
      }
    });
    return NextResponse.json(shareholder, { status: 201 });
  } catch (error) {
    console.error('Error creating shareholder:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
