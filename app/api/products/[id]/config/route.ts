import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const data = await request.json();

    // Check if configuration already exists
    const existing = await prisma.productConfiguration.findUnique({
      where: { productId: id },
    });

    let configuration;
    
    if (existing) {
      // Update existing configuration
      configuration = await prisma.productConfiguration.update({
        where: { productId: id },
        data: {
          additionalDocuments: data.additionalDocuments,
          additionalFinancialFields: data.additionalFinancialFields,
          fieldOverrides: data.fieldOverrides,
        },
      });
    } else {
      // Create new configuration
      configuration = await prisma.productConfiguration.create({
        data: {
          productId: id,
          additionalDocuments: data.additionalDocuments,
          additionalFinancialFields: data.additionalFinancialFields,
          fieldOverrides: data.fieldOverrides,
        },
      });
    }

    return NextResponse.json(configuration);
  } catch (error) {
    console.error('Error saving product configuration:', error);
    return NextResponse.json(
      { error: 'Failed to save product configuration' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const configuration = await prisma.productConfiguration.findUnique({
      where: { productId: id },
    });

    return NextResponse.json(configuration);
  } catch (error) {
    console.error('Error fetching product configuration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product configuration' },
      { status: 500 }
    );
  }
}