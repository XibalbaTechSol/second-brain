import { NextResponse } from 'next/server';
import { prisma } from '@second-brain/database';

export async function GET() {
  try {
    const links = await prisma.link.findMany();
    return NextResponse.json(links);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { sourceId, targetId, type } = await request.json();
    const link = await prisma.link.create({
      data: { sourceId, targetId, type: type || 'RELATES_TO' }
    });
    return NextResponse.json(link);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 });
  }
}
