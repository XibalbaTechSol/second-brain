import { NextResponse } from 'next/server';
import { prisma } from '@second-brain/database';

export async function GET() {
  try {
    const workflows = await prisma.workflow.findMany({
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
    const body = await request.json();
    const { id, name, trigger, conditions, actions, isActive } = body;
    
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
