import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { type, ...updates } = data;

    let settings = await prisma.creditUnionSettings.findFirst();

    if (!settings) {
      settings = await prisma.creditUnionSettings.create({
        data: {
          name: 'Digital Credit Union',
          ...updates,
        },
      });
    } else {
      settings = await prisma.creditUnionSettings.update({
        where: { id: settings.id },
        data: updates,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}