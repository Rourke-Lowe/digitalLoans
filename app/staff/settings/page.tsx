import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import SettingsForm from './SettingsForm';

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    redirect('/');
  }

  const settings = await prisma.creditUnionSettings.findFirst();
  const products = await prisma.loanProduct.findMany({
    orderBy: { name: 'asc' },
  });

  return <SettingsForm settings={settings} products={products} />;
}