import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const document = await prisma.generatedDocument.findUnique({
      where: { id },
      include: { template: true },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching generated document:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json();
    const { title, content, status } = data;

    const existing = await prisma.generatedDocument.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const updated = await prisma.generatedDocument.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        content: content !== undefined ? content : existing.content,
        status: status !== undefined ? status : existing.status,
      },
      include: { template: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating generated document:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.generatedDocument.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting generated document:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
