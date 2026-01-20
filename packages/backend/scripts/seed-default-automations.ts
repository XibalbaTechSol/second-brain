import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('🤖 Seeding Intelligent Behavioral Automations...');

    // 1. Clear existing workflows
    await prisma.workflow.deleteMany({});

    // 2. Default Project Intelligence Flow
    await prisma.workflow.create({
        data: {
            name: 'Project Behavior Coach',
            trigger: 'ON_CLASSIFY',
            isActive: true,
            conditions: JSON.stringify({ type_is: 'PROJECT' }),
            actions: JSON.stringify([
                {
                    type: 'ai_reasoning',
                    params: {
                        prompt: 'Analyze this project for "Bias towards Action". Identify the single smallest physical step the user can take in the next 10 minutes to prove this is possible. Also, identify one major assumption they are making.'
                    }
                },
                {
                    type: 'ai_nudge',
                    params: {
                        template: '{{reasoning}} Based on that, what is your FIRST move today?'
                    }
                },
                {
                    type: 'create_project',
                    params: {
                        title: 'Intelligent Project'
                    }
                }
            ])
        }
    });

    // 3. Idea High-Impact Flow
    await prisma.workflow.create({
        data: {
            name: 'Idea Impact Catalyst',
            trigger: 'ON_CLASSIFY',
            isActive: true,
            conditions: JSON.stringify({ type_is: 'IDEA' }),
            actions: JSON.stringify([
                {
                    type: 'ai_reasoning',
                    params: {
                        prompt: 'Evaluate this idea for uniqueness and scalability. If this idea were 10x more ambitious, what would it look like?'
                    }
                },
                {
                    type: 'ai_nudge',
                    params: {
                        template: 'Your idea has potential, but: {{reasoning}} How can you 10x the scope?'
                    }
                },
                {
                    type: 'create_idea',
                    params: {
                        title: 'Scalable Idea'
                    }
                }
            ])
        }
    });

    // 4. Admin Efficiency Flow
    await prisma.workflow.create({
        data: {
            name: 'Admin Automation Scout',
            trigger: 'ON_CLASSIFY',
            isActive: true,
            conditions: JSON.stringify({ type_is: 'ADMIN' }),
            actions: JSON.stringify([
                {
                    type: 'ai_reasoning',
                    params: {
                        prompt: 'Is this admin task recurring? Suggest a way to automate this using Zappier, a script, or a specific process change so the user never has to do it manually again.'
                    }
                },
                {
                    type: 'notify',
                    params: {
                        template: 'Efficiency Alert: {{reasoning}}'
                    }
                },
                {
                    type: 'create_admin',
                    params: {
                        title: 'Optimized Admin Task'
                    }
                }
            ])
        }
    });

    console.log('✅ Default Intelligent Automations Seeded.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
