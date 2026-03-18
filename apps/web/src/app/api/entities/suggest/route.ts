import { NextResponse } from 'next/server';
import { prisma } from '@second-brain/database';
import { getUser } from '@/lib/auth-helpers';

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  try {
    const entities = await prisma.entity.findMany({
      where: {
        userId: user.id,
        title: {
          contains: query,
        },
      },
      take: 5,
      select: {
        id: true,
        title: true,
        type: true,
      },
    });

    return NextResponse.json(entities);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}
