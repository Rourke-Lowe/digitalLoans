import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ReviewInterface from './ReviewInterface';

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  if (!user || user.role === 'member') {
    redirect('/');
  }

  const { id } = await params;

  const application = await prisma.loanApplication.findUnique({
    where: { id },
    include: {
      user: true,
      product: true,
      documents: true,
      reviews: {
        include: { reviewer: true },
        orderBy: { createdAt: 'desc' },
      },
      activities: {
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!application) {
    redirect('/staff');
  }

  const settings = await prisma.creditUnionSettings.findFirst();

  return <ReviewInterface application={application} currentUser={user} settings={settings} />;
}