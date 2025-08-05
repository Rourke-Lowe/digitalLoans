import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { decision, notes, reviewerId } = await request.json();

    // Create review record
    const review = await prisma.applicationReview.create({
      data: {
        applicationId: params.id,
        reviewerId,
        decision,
        notes,
      },
    });

    // Update application status based on decision
    const statusMap = {
      approved: 'approved',
      denied: 'denied',
      more_info_needed: 'under_review',
    };

    await prisma.loanApplication.update({
      where: { id: params.id },
      data: {
        status: statusMap[decision as keyof typeof statusMap],
      },
    });

    // Log activity
    await prisma.applicationActivity.create({
      data: {
        applicationId: params.id,
        userId: reviewerId,
        action: `decision_${decision}`,
        details: notes,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}