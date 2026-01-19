import { NextResponse } from 'next/server';
import { prisma } from '@second-brain/database';

// GET Single Entity
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const entity = await prisma.entity.findUnique({
      where: { id },
      include: {
        task: true,
        project: true,
        tags: true,
        linksFrom: { include: { target: true } },
        linksTo: { include: { source: true } }
      }
    });

    if (!entity) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
    }

    return NextResponse.json(entity);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch entity' }, { status: 500 });
  }
}

// UPDATE Entity (Content, Title, Metadata)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, isDone, priority, status } = body;

    // Prepare update data
    const updateData: any = {
      title,
      content,
    };

    // Update Type-Specific Metadata if provided
    if (isDone !== undefined || priority !== undefined) {
      updateData.task = {
        update: {
          isDone,
          priority
        }
      };
    }

    if (status !== undefined) {
      updateData.project = {
        update: {
          status
        }
      };
    }

    const updatedEntity = await prisma.entity.update({
      where: { id },
      data: updateData,
      include: { task: true, project: true }
    });

    return NextResponse.json(updatedEntity);
  } catch (error) {
    console.error('Update failed:', error);
    return NextResponse.json({ error: 'Failed to update entity' }, { status: 500 });
  }
}

// DELETE Entity
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Cleanup metadata first (cascade should handle this usually, but being safe)
    await prisma.taskMetadata.deleteMany({ where: { entityId: id } });
    await prisma.projectMetadata.deleteMany({ where: { entityId: id } });
    
    // Delete links
    await prisma.link.deleteMany({ where: { OR: [{ sourceId: id }, { targetId: id }] } });

    await prisma.entity.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete entity' }, { status: 500 });
  }
}
