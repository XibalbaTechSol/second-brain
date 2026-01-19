import { NextResponse } from 'next/server';
import { prisma } from '@second-brain/database';

export async function GET() {
  try {
    const entities = await prisma.entity.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        task: true,
        project: true
      }
    });
    return NextResponse.json(entities);
  } catch (error) {
    console.error('Error fetching entities:', error);
    return NextResponse.json({ error: 'Failed to fetch entities' }, { status: 500 });
  }
}
