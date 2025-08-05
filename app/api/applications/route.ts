import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Generate application number
    const count = await prisma.loanApplication.count();
    const applicationNumber = `APP-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const application = await prisma.loanApplication.create({
      data: {
        applicationNumber,
        userId: data.userId,
        productId: data.productId,
        amount: data.amount,
        term: data.term,
        purpose: data.purpose,
        monthlyPayment: data.monthlyPayment,
        status: 'draft',
        currentStep: 1,
      },
    });

    return NextResponse.json({ id: application.id });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const applications = await prisma.loanApplication.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}