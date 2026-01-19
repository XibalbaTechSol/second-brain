import { NextResponse } from 'next/server';
import { prisma } from '@second-brain/database';

export async function GET() {
  try {
    const items = await prisma.inboxItem.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching inbox items:', error);
    return NextResponse.json({ error: 'Failed to fetch inbox items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { content, source } = await request.json();
    
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const newItem = await prisma.inboxItem.create({
      data: {
        content,
        source: source || 'api',
      },
    });

    return NextResponse.json(newItem);
  } catch (error) {
    console.error('Error creating inbox item:', error);
    return NextResponse.json({ error: 'Failed to create inbox item' }, { status: 500 });
  }
}
