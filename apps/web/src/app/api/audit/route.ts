import { NextResponse } from 'next/server';
import { prisma } from '@second-brain/database';
import { getUser } from '@/lib/auth-helpers';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logs = await prisma.auditLog.findMany({
      where: {
        OR: [
          { workflow: { userId: user.id } },
          { entityId: { in: (await prisma.entity.findMany({ where: { userId: user.id }, select: { id: true } })).map(e => e.id) } }
        ]
      },
      orderBy: { timestamp: 'desc' },
      include: {
        workflow: true,
      },
      take: 50,
    });
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
