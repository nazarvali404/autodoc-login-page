import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const client = await prisma.client.create({
      data: {
        name: data.name,
        company: data.company,
        contact: data.contact || data.name,
        email: data.email,
        phone: data.phone,
        address: data.address || '—',
        status: data.status || 'Active',
        createdAt: data.createdAt || new Date().toISOString().split('T')[0]
      }
    });
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}