import { NextResponse } from 'next/server';
import { prisma } from '@second-brain/database';
import { getUser } from '@/lib/auth-helpers';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let subscription = await prisma.subscription.findUnique({
      where: { userId: user.id }
    });

    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: { 
          userId: user.id,
          tier: 'FREE'
        }
      });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}
