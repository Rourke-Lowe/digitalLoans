import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const applicationId = formData.get('applicationId') as string;

    if (!file || !type || !applicationId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const fileName = `${applicationId}_${type}_${Date.now()}${path.extname(file.name)}`;
    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
    
    await writeFile(filePath, buffer);

    // Save to database
    const document = await prisma.document.create({
      data: {
        applicationId,
        type,
        fileName: file.name,
        filePath: `/uploads/${fileName}`,
        fileSize: file.size,
        mimeType: file.type,
      },
    });

    // Log activity
    await prisma.applicationActivity.create({
      data: {
        applicationId,
        userId: (await prisma.loanApplication.findUnique({ where: { id: applicationId } }))!.userId,
        action: 'uploaded_document',
        details: `Uploaded ${type}`,
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}