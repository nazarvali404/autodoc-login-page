import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const templates = await prisma.documentTemplate.findMany({
      include: { fields: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { fields, ...tempData } = data;

    const template = await prisma.documentTemplate.create({
      data: {
        name: tempData.name,
        category: tempData.category,
        createdAt: tempData.createdAt || new Date().toISOString().split('T')[0],
        updatedAt: tempData.updatedAt || new Date().toISOString().split('T')[0],
        status: tempData.status || 'Active',
        content: tempData.content || null,
        pdfData: tempData.pdfData || null
      }
    });

    if (fields && Array.isArray(fields)) {
      for (const field of fields) {
        await prisma.templateField.create({
          data: {
            name: field.name,
            type: field.type || 'text',
            required: field.required ?? true,
            defaultValue: field.defaultValue || null,
            optionsJson: field.optionsJson || null,
            templateId: template.id
          }
        });
      }
    }

    const createdTemplate = await prisma.documentTemplate.findUnique({
      where: { id: template.id },
      include: { fields: true }
    });

    return NextResponse.json(createdTemplate, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}