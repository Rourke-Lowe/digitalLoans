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
    
    console.log('PATCH /api/applications/[id] - Received data:', {
      id,
      dataKeys: Object.keys(data),
      firstName: data.firstName,
      lastName: data.lastName,
      streetNumber: data.streetNumber,
      annualIncome: data.annualIncome,
      hasUniversaData: !!data.universaData,
      changedFields: data.changedFields
    });
    
    // Remove fields that might not exist in the database yet to prevent errors
    const updateData = { ...data };
    
    // Temporarily store and remove these fields if Prisma doesn't recognize them
    const universaData = updateData.universaData;
    const changedFields = updateData.changedFields;
    
    // Try updating with all fields first
    let application;
    try {
      application = await prisma.loanApplication.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });
    } catch (prismaError: any) {
      // If it fails due to unknown fields, try without them
      if (prismaError.message?.includes('Unknown argument')) {
        console.log('Retrying without universaData and changedFields due to Prisma Client cache issue');
        delete updateData.universaData;
        delete updateData.changedFields;
        
        application = await prisma.loanApplication.update({
          where: { id },
          data: {
            ...updateData,
            updatedAt: new Date(),
          },
        });
        
        // Try to update these fields separately with raw SQL as a workaround
        if (universaData || changedFields) {
          try {
            await prisma.$executeRawUnsafe(
              `UPDATE LoanApplication SET universaData = ?, changedFields = ? WHERE id = ?`,
              universaData || null,
              changedFields || null,
              id
            );
            console.log('Successfully updated universaData and changedFields via raw SQL');
          } catch (rawError) {
            console.error('Raw SQL update also failed:', rawError);
          }
        }
      } else {
        throw prismaError;
      }
    }

    // Log activity
    await prisma.applicationActivity.create({
      data: {
        applicationId: id,
        userId: data.userId || application.userId,
        action: 'updated_application',
        details: `Updated step ${data.currentStep}`,
      },
    });

    console.log('Application updated successfully');
    return NextResponse.json(application);
  } catch (error) {
    console.error('Error updating application - Full error:', error);
    return NextResponse.json(
      { error: 'Failed to update application', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}