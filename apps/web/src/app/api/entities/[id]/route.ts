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
        project: true,
        idea: true,
        person: true,
        admin: true,
        goal: true,
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
    const { title, content, isDone, priority, status, tags } = body;

    // Prepare update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (status !== undefined) updateData.status = status;

    // Handle Tags Update (connectOrCreate)
    if (tags && Array.isArray(tags)) {
      // Filter out reserved tags/types if mixed in UI, but strictly we expect pure tags here
      // Assuming UI sends ["Tag1", "Tag2"]
      const cleanTags = tags.filter(t => t && t.trim().length > 0);
      updateData.tags = {
        set: [], // Clear current relations to reset to the new list
        connectOrCreate: cleanTags.map((t: string) => ({
          where: { name: t },
          create: { name: t }
        }))
      };
    }

    if (status !== undefined) {
      updateData.project = {
        update: { status }
      };
    }

    const updatedEntity = await prisma.entity.update({
      where: { id },
      data: updateData,
      include: { project: true, idea: true, person: true, admin: true, goal: true }
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
    await Promise.all([
      prisma.projectMetadata.deleteMany({ where: { entityId: id } }),
      prisma.ideaMetadata.deleteMany({ where: { entityId: id } }),
      prisma.personMetadata.deleteMany({ where: { entityId: id } }),
      prisma.adminMetadata.deleteMany({ where: { entityId: id } }),
      prisma.goalMetadata.deleteMany({ where: { entityId: id } }),
    ]);

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
