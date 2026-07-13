import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const template = await prisma.documentTemplate.findUnique({
      where: { id },
      include: { fields: true },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
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
    const { fields, ...tempData } = data;

    // Verify template exists
    const existing = await prisma.documentTemplate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Update template using transaction
    const updated = await prisma.$transaction(async (tx) => {
      const template = await tx.documentTemplate.update({
        where: { id },
        data: {
          name: tempData.name,
          category: tempData.category,
          updatedAt: new Date().toISOString().split('T')[0],
          status: tempData.status,
          content: tempData.content,
          pdfData: tempData.pdfData,
        },
      });

      if (fields && Array.isArray(fields)) {
        // Delete all old fields
        await tx.templateField.deleteMany({
          where: { templateId: id },
        });

        // Insert new fields
        for (const field of fields) {
          await tx.templateField.create({
            data: {
              name: field.name,
              type: field.type || 'text',
              required: field.required ?? true,
              defaultValue: field.defaultValue || null,
              optionsJson: field.optionsJson || (field.options ? JSON.stringify(field.options) : null),
              templateId: id,
            },
          });
        }
      }

      return template;
    });

    const finalTemplate = await prisma.documentTemplate.findUnique({
      where: { id: updated.id },
      include: { fields: true },
    });

    return NextResponse.json(finalTemplate);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.documentTemplate.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}