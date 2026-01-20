import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugSchedule() {
  console.log('🧪 Starting Schedule Nudge Debug Script...');

  // 1. Find a user to assign the workflow to
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('❌ No user found. Please login to the web app first.');
    return;
  }

  // 2. Clear existing scheduled workflows for this user
  await prisma.workflow.deleteMany({
    where: { userId: user.id, trigger: 'SCHEDULE' }
  });

  // 3. Create a minute-interval scheduled workflow
  console.log(`📝 Creating minute-interval workflow for user ${user.id}...`);
  await prisma.workflow.create({
    data: {
      name: 'Minute Nudge Test',
      trigger: 'SCHEDULE',
      isActive: true,
      conditions: JSON.stringify({ interval: 'minute' }),
      actions: JSON.stringify([
        {
          type: 'ai_nudge',
          params: { title: 'Scheduled Test' }
        }
      ]),
      userId: user.id
    }
  });

  console.log('⏳ Minute workflow created. Wait for the backend main loop to pick it up (up to 30s)...');
}

debugSchedule()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
