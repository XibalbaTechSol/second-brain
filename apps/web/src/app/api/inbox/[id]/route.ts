import { NextResponse } from 'next/server';
import { prisma } from '@second-brain/database';
import { getUser } from '@/lib/auth-helpers';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();
    
    // Verify item exists and belongs to user to prevent IDOR
    const existingItem = await prisma.inboxItem.findFirst({
      where: { id, userId: user.id }
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Inbox item not found or unauthorized' }, { status: 404 });
    }

    const updatedItem = await prisma.inboxItem.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update inbox item' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify item exists and belongs to user to prevent IDOR
    const existingItem = await prisma.inboxItem.findFirst({
      where: { id, userId: user.id }
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Inbox item not found or unauthorized' }, { status: 404 });
    }

    await prisma.inboxItem.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete inbox item' }, { status: 500 });
  }
}
