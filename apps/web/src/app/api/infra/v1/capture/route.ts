import { NextResponse } from 'next/server';
import { prisma } from '@second-brain/database';
import { validateInfraKey } from '@/lib/infra-auth';

export async function POST(request: Request) {
  const user = await validateInfraKey(request);
  if (!user) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 });
  }

  try {
    const { content, source } = await request.json();
    
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const newItem = await prisma.inboxItem.create({
      data: {
        content,
        source: source || 'infrastructure-api',
        userId: user.id
      },
    });

    return NextResponse.json({
      success: true,
      id: newItem.id,
      status: 'PENDING',
      message: 'Item captured and queued for AI reasoning.'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
