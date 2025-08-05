import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const application = await prisma.loanApplication.update({
      where: { id },
      data: {
        status: 'submitted',
        submittedAt: new Date(),
      },
    });

    // Log activity
    await prisma.applicationActivity.create({
      data: {
        applicationId: id,
        userId: application.userId,
        action: 'submitted_application',
        details: 'Application submitted for review',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}