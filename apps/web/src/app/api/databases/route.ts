import { NextResponse } from 'next/server';
import { prisma } from '@second-brain/database';
import { getUser } from '@/lib/auth-helpers';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all Inbox Items with Audit Logs (if we had a relation, but we use entityId in AuditLog)
    // Actually AuditLog uses entityId. For InboxItems we can match via content or IDs if we linked them.
    // In our processInbox, we link processedEntityId to Entity.id.
    
    // 🛡️ Sentinel: Fetching only user-owned records to prevent data exposure
    const userEntities = await prisma.entity.findMany({
      where: { userId: user.id },
      select: { id: true }
    });

    const [inboxItems, entities, logs] = await Promise.all([
      prisma.inboxItem.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.entity.findMany({ 
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        include: { project: true, idea: true, person: true, admin: true, goal: true }
      }),
      prisma.auditLog.findMany({ 
        where: {
          OR: [
            { workflow: { userId: user.id } },
            { entityId: { in: userEntities.map(e => e.id) } }
          ]
        },
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
