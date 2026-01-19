import { NextResponse } from 'next/server';
import { prisma } from '@second-brain/database';

export async function POST(request: Request) {
  try {
    const { entityId, correctType, correctTitle } = await request.json();
    
    // 1. Fetch original entity
    const entity = await prisma.entity.findUnique({ where: { id: entityId } });
    if (!entity) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // 2. Log Correction (The Receipt)
    await prisma.auditLog.create({
      data: {
        action: 'USER_CORRECTION',
        details: `User corrected type from ${entity.type} to ${correctType}`,
        entityId: entityId
      }
    });

    // 3. Update Entity
    const updated = await prisma.entity.update({
      where: { id: entityId },
      data: { 
        type: correctType,
        title: correctTitle || entity.title
      }
    });

    // 4. (Future) Store this in a "Training Data" table for LLM fine-tuning
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Correction failed' }, { status: 500 });
  }
}
