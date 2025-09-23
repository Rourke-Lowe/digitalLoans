import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ApplicationForm from './ApplicationForm';

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'member') {
    redirect('/');
  }

  const { id } = await params;

  const application = await prisma.loanApplication.findUnique({
    where: { id },
    include: { 
      product: {
        include: {
          configuration: true,
        },
      },
    },
  });

  if (!application || application.userId !== user.id) {
    redirect('/member');
  }

  const settings = await prisma.creditUnionSettings.findFirst();

  return <ApplicationForm application={application} settings={settings} user={user} />;
}