import { NextResponse } from 'next/server';
import { prisma } from '@second-brain/database';
import { getUser } from '@/lib/auth-helpers';

export async function GET() {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workflows = await prisma.workflow.findMany({
      where: { userId: user.id },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(workflows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, trigger, conditions, actions, isActive } = body;
    
    // Verify ownership before updating (prevent IDOR)
    const existingWorkflow = await prisma.workflow.findFirst({
      where: { id, userId: user.id }
    });

    if (!existingWorkflow) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    const updatedWorkflow = await prisma.workflow.update({
      where: { id },
      data: {
        name,
        trigger,
        conditions: typeof conditions === 'string' ? conditions : JSON.stringify(conditions),
        actions: typeof actions === 'string' ? actions : JSON.stringify(actions),
        isActive
      },
    });

    return NextResponse.json(updatedWorkflow);
  } catch (error) {
    console.error('Error updating workflow:', error);
    return NextResponse.json({ error: 'Failed to update workflow' }, { status: 500 });
  }
}
