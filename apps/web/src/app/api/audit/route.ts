import { NextResponse } from 'next/server';
import { prisma } from '@second-brain/database';
import { getServerSession } from "next-auth/next";

export async function GET() {
  try {
    const session = await getServerSession() as any;
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logs = await prisma.auditLog.findMany({
      where: {
        OR: [
          { workflow: { userId: session.user.id } },
          { entityId: { in: (await prisma.entity.findMany({ where: { userId: session.user.id }, select: { id: true } })).map(e => e.id) } }
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
