import { NextResponse } from 'next/server';
import { prisma } from '@second-brain/database';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const events = await prisma.calendarEvent.findMany({
      where: { userId: session.user.id },
      orderBy: { scheduledAt: 'asc' },
    });
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, scheduledAt, type } = await request.json();
    
    if (!title || !scheduledAt) {
      return NextResponse.json({ error: 'Title and Scheduled Date are required' }, { status: 400 });
    }

    const newEvent = await prisma.calendarEvent.create({
      data: {
        title,
        description,
        scheduledAt: new Date(scheduledAt),
        type: type || 'TASK',
        userId: session.user.id
      },
    });

    return NextResponse.json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
