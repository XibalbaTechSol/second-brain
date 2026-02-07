import { DatabaseView } from '@/components/database/DatabaseView';
import { prisma } from '@second-brain/database';
import { formatToMMDDYYYY } from '@/lib/date-utils';

export const dynamic = 'force-dynamic';

export default async function DatabasesPage() {
  const entities = await prisma.entity.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      tags: true,
      project: true,
      person: true,
      idea: true,
      admin: true
    }
  });

  const data = entities.map((e: any) => ({
    id: e.id,
    name: e.title,
    tags: [e.type, ...(e.tags?.map((t: any) => t.name) || [])],
    status: e.status || 'Active',
    role: e.person?.role,
    company: e.person?.company,
    outcome: e.project?.outcome,
    created: formatToMMDDYYYY(e.createdAt),
    type: e.type,
    metadata: {
        person: e.person,
        project: e.project,
        idea: e.idea,
        admin: e.admin
    }
  }));

  return (
    <main className="h-screen w-full">
      <DatabaseView initialData={data} />
    </main>
  );
}
