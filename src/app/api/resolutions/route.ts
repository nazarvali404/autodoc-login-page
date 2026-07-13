import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const resolutions = await prisma.resolution.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(resolutions);
  } catch (error) {
    console.error('Error fetching resolutions:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const resolution = await prisma.resolution.create({
      data: {
        title: data.title,
        type: data.type,
        companyName: data.companyName,
        date: data.date || new Date().toISOString().split('T')[0],
        status: data.status || 'Draft',
        description: data.description,
        documentUrl: data.documentUrl || null
      }
    });
    return NextResponse.json(resolution, { status: 201 });
  } catch (error) {
    console.error('Error creating resolution:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
