import { NextResponse } from 'next/server';
import { prisma } from '@second-brain/database';
import { getServerSession } from "next-auth/next";

export async function GET() {
  try {
    const session = await getServerSession() as any;
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entities = await prisma.entity.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        project: true,
        person: true,
        idea: true,
        admin: true,
        goal: true,
        tags: true
      }
    });
    return NextResponse.json(entities);
  } catch (error) {
    console.error('Error fetching entities:', error);
    return NextResponse.json({ error: 'Failed to fetch entities' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession() as any;
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, type, content, status } = await request.json();
    
    const entity = await prisma.entity.create({
      data: {
        title: title || 'Untitled',
        type: type || 'IDEA',
        content: content || '',
        status: status || 'Active',
        confidence: 1.0, // Manual creation
        userId: session.user.id,
        
        // Initialize empty metadata based on type
        project: type === 'PROJECT' ? { create: { status: 'Active' } } : undefined,
        person: type === 'PERSON' ? { create: { role: 'Unknown' } } : undefined,
        idea: type === 'IDEA' ? { create: { potential: 'Medium' } } : undefined,
        admin: type === 'ADMIN' ? { create: { importance: 'Medium' } } : undefined,
      }
    });

    return NextResponse.json(entity);
  } catch (error) {
    console.error('Error creating entity:', error);
    return NextResponse.json({ error: 'Failed to create entity' }, { status: 500 });
  }
}
