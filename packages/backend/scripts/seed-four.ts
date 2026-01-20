import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding 4 strategic items into SB-INBOX...');

    const items = [
        { content: "Plan a research trip to Tokyo for March 2026 with a budget of $5000 to study high-speed rail systems.", source: "SEED_STRATEGIC" },
        { content: "Met Sarah Chen, CTO at TechNova. email: sarah.chen@technova.io. Interested in AI collaboration.", source: "SEED_STRATEGIC" },
        { content: "A decentralized marketplace for medical research data. High impact for science but requires major blockchain infrastructure.", source: "SEED_STRATEGIC" },
        { content: "Renew the downtown office commercial lease before the October 31st deadline. Critical for physical operations.", source: "SEED_STRATEGIC" }
    ];

    // Clear existing to see these clearly
    await prisma.inboxItem.deleteMany({ where: { source: 'SEED_STRATEGIC' } });

    await prisma.inboxItem.createMany({
        data: items.map(i => ({ ...i, status: 'PENDING' }))
    });

    console.log('✅ 4 items seeded. Backend will now reason and extract data.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
