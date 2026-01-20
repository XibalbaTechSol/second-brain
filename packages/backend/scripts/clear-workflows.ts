import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('🗑️ Clearing all workflows...');
    const result = await prisma.workflow.deleteMany({});
    console.log(`✅ Deleted ${result.count} workflows.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
