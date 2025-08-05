import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const application = await prisma.loanApplication.findUnique({
      where: { id },
      include: {
        product: true,
        documents: true,
        reviews: {
          include: { reviewer: true },
        },
        activities: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    const application = await prisma.loanApplication.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    // Log activity
    await prisma.applicationActivity.create({
      data: {
        applicationId: id,
        userId: data.userId || application.userId,
        action: 'updated_application',
        details: `Updated step ${data.currentStep}`,
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}