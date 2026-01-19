import { NextResponse } from 'next/server';
import { prisma } from '@second-brain/database';

export async function GET() {
  try {
    // Fetch all Inbox Items with Audit Logs (if we had a relation, but we use entityId in AuditLog)
    // Actually AuditLog uses entityId. For InboxItems we can match via content or IDs if we linked them.
    // In our processInbox, we link processedEntityId to Entity.id.
    
    const [inboxItems, entities, logs] = await Promise.all([
      prisma.inboxItem.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.entity.findMany({ 
        orderBy: { updatedAt: 'desc' },
        include: { task: true, project: true }
      }),
      prisma.auditLog.findMany({ 
        orderBy: { timestamp: 'desc' },
        include: { workflow: true }
      })
    ]);

    // Group logs by entityId for easy access
    const logsByEntity = logs.reduce((acc: any, log: any) => {
      const eid = log.entityId || 'system';
      if (!acc[eid]) acc[eid] = [];
      acc[eid].push(log);
      return acc;
    }, {});

    return NextResponse.json({
      inbox: inboxItems,
      projects: entities.filter(e => e.type === 'PROJECT'),
      ideas: entities.filter(e => e.type === 'NOTE'),
      resources: entities.filter(e => e.type === 'RESOURCE'),
      people: entities.filter(e => e.type === 'CONTACT'),
      logsByEntity
    });
  } catch (error) {
    console.error('Database fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch database data' }, { status: 500 });
  }
}
