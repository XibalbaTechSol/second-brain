import { DatabaseView } from '@/components/database/DatabaseView';
import { prisma } from '@second-brain/database';
import { notFound } from 'next/navigation';
import { formatToMMDDYYYY } from '@/lib/date-utils';

export const dynamic = 'force-dynamic';

export default async function DatabaseTypePage({ params }: { params: Promise<{ type: string }> }) {
    const { type } = await params;
    const typeSlug = type.toLowerCase();

    // Map slug to Prisma Enum and Display Name
    let typeEnum: string | undefined;
    let viewTitle = 'Database';

    switch (typeSlug) {
        case 'projects': typeEnum = 'PROJECT'; viewTitle = 'Projects'; break;
        case 'people': typeEnum = 'PERSON'; viewTitle = 'People'; break;
        case 'ideas': typeEnum = 'IDEA'; viewTitle = 'Ideas'; break;
        case 'admin': typeEnum = 'ADMIN'; viewTitle = 'Admin'; break;
        case 'inbox': typeEnum = undefined; viewTitle = 'SB-INBOX'; break; 
        default: return notFound();
    }

    // Build Query
    const whereClause: any = {};
    if (typeSlug === 'inbox') {
        // Fetch from InboxItem table? 
        // The user might want the "Inbox Database" which is usually unprocessed items?
        // Or processed items marked as Inbox?
        // Let's assume valid 'Entities' don't live in Inbox usually, but 'InboxItem' does.
        // However, the DatabaseView expects standard structure.
        // For now, let's query Entities of type 'NOTE' that are untreated? 
        // No, let's fetch ALL entities for now if undefined, OR strictly Fetch InboxItems and map them.
        // Better: The User "SB-Inbox" usually means the `InboxItem` table.
        // But DatabaseView handles `Entity` shape.
        // Let's fetch pure InboxItems for 'inbox'.
    } else {
        whereClause.type = typeEnum;
    }

    let data = [];

    if (typeSlug === 'inbox') {
        const inboxItems = await prisma.inboxItem.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit to 50 for performance
        });
        data = inboxItems.map((item: any) => ({
            id: item.id,
            name: item.content,
            tags: [item.status, item.source],
            status: item.status,
            created: formatToMMDDYYYY(item.createdAt),
            type: 'INBOX_ITEM'
        }));
    } else {
        const entities = await prisma.entity.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
                tags: true,
                project: true,
                person: true,
                idea: true,
                admin: true
            }
        });

        data = entities.map((e: any) => {
            return {
                id: e.id,
                name: e.title,
                tags: [e.type, ...(e.tags?.map((t: any) => t.name) || [])],
                status: e.status || 'Active',
                created: formatToMMDDYYYY(e.createdAt),
                type: e.type,
                confidence: e.confidence,
                
                // Flattened Metadata
                outcome: e.project?.outcome,
                nextAction: e.project?.nextAction,
                budget: e.project?.budget,
                riskLevel: e.project?.riskLevel,
                
                role: e.person?.role,
                company: e.person?.company,
                email: e.person?.email,
                
                potential: e.idea?.potential,
                impactScore: e.idea?.impactScore,
                effortScore: e.idea?.effortScore,
                
                category: e.admin?.category,
                importance: e.admin?.importance,
                expiryDate: formatToMMDDYYYY(e.admin?.expiryDate),

                metadata: {
                    person: e.person,
                    project: e.project,
                    idea: e.idea,
                    admin: e.admin
                }
            };
        });
    }

    return (
        <main className="h-screen w-full">
            <DatabaseView initialData={data} viewTitle={viewTitle} viewType={typeEnum || 'INBOX'} />
        </main>
    );
}
