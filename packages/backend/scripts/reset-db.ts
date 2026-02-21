import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Starting full database reset...");

  // Delete in order to respect foreign key constraints
  await prisma.link.deleteMany({});
  await prisma.block.deleteMany({});
  await prisma.projectMetadata.deleteMany({});
  await prisma.personMetadata.deleteMany({});
  await prisma.ideaMetadata.deleteMany({});
  await prisma.adminMetadata.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.workflow.deleteMany({});
  await prisma.entity.deleteMany({});
  await prisma.inboxItem.deleteMany({});
  await prisma.tag.deleteMany({});

  console.log(
    "✨ All databases cleared. Your Second Brain is now empty and ready for manual testing.",
  );
}

main()
  .catch((e) => {
    console.error("❌ Reset failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
