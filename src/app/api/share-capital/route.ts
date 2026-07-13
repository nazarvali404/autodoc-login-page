import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const capitals = await prisma.shareCapital.findMany({
      orderBy: { companyName: 'asc' },
    });
    return NextResponse.json(capitals);
  } catch (error) {
    console.error('Error fetching share capital:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const capital = await prisma.shareCapital.create({
      data: {
        companyName: data.companyName,
        authorizedCapital: data.authorizedCapital,
        paidUpCapital: data.paidUpCapital,
        faceValue: Number(data.faceValue),
        totalShares: Number(data.totalShares),
        equityShares: Number(data.equityShares),
        preferenceShares: Number(data.preferenceShares)
      }
    });
    return NextResponse.json(capital, { status: 201 });
  } catch (error) {
    console.error('Error creating share capital:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
