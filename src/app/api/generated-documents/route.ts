import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const documents = await prisma.generatedDocument.findMany({
      include: { template: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching generated documents:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { title, content, status, templateId } = data;

    if (!title || !content || !templateId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const document = await prisma.generatedDocument.create({
      data: {
        title,
        content,
        status: status || 'Draft',
        createdAt: new Date().toISOString(),
        templateId,
      },
      include: { template: true },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error creating generated document:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}