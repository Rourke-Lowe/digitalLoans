import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ApplyForm from './ApplyForm';

export default async function ApplyPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'member') {
    redirect('/');
  }

  const products = await prisma.loanProduct.findMany({
    where: { isActive: true },
  });

  return <ApplyForm products={products} userId={user.id} />;
}