import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const transfers = await prisma.shareTransfer.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(transfers);
  } catch (error) {
    console.error('Error fetching share transfers:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const transfer = await prisma.shareTransfer.create({
      data: {
        date: data.date || new Date().toISOString().split('T')[0],
        from: data.from,
        to: data.to,
        shares: Number(data.shares),
        certificateNo: data.certificateNo,
        shareholderId: data.shareholderId || null
      }
    });
    return NextResponse.json(transfer, { status: 201 });
  } catch (error) {
    console.error('Error creating share transfer:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
