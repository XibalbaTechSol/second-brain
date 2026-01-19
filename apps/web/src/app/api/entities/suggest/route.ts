import { NextResponse } from 'next/server';
import { prisma } from '@second-brain/database';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  try {
    const entities = await prisma.entity.findMany({
      where: {
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
