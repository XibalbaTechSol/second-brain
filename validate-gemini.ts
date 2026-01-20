import { PrismaClient } from '@second-brain/database';

const prisma = new PrismaClient();

async function validateGemini() {
    console.log('🧪 Starting Gemini AI Multi-Type Validation...');

    const testCases = [
        {
            content: 'Buy milk and eggs for the pancake breakfast tomorrow',
            expectedType: 'TASK',
            expectedIntent: 'ShoppingList'
        },
        {
            content: 'Launch the new marketing campaign by next Friday',
            expectedType: 'PROJECT',
            expectedIntent: 'WorkProject'
        },
        {
            content: 'John Smith, Lead Developer at Innovation Corp, john.smith@example.com',
            expectedType: 'PERSON',
            expectedIntent: 'Networking'
        },
        {
            content: 'Deep Learning Specialization by Andrew Ng on Coursera: https://www.coursera.org/specializations/deep-learning',
            expectedType: 'RESOURCE',
            expectedIntent: 'LearningGoal'
        },
        {
            content: 'Property tax assessment for 2025: $4,500 due in April',
            expectedType: 'ADMIN',
            expectedIntent: 'FinanceLog'
        }
    ];

    for (const testCase of testCases) {
        console.log(`\n📝 Testing: "${testCase.content}"`);
        
        const item = await prisma.inboxItem.create({
            data: {
                content: testCase.content,
                source: 'VALIDATION_SCRIPT',
                status: 'PENDING'
            }
        });
        console.log(`   -> Created Item ID: ${item.id}`);

        let attempts = 0;
        const maxAttempts = 30; // 30 * 2s = 60s
        let processed = false;

        while (attempts < maxAttempts) {
            const check = await prisma.inboxItem.findUnique({ where: { id: item.id } });

            if (check?.status === 'COMPLETED' && check.processedEntityId) {
                const entity = await prisma.entity.findUnique({
                    where: { id: check.processedEntityId }
                });

                if (entity) {
                    console.log(`   ✅ Status: COMPLETED`);
                    console.log(`   ✅ Type: ${entity.type} (Expected: ${testCase.expectedType})`);
                    console.log(`   ✅ Intent: ${entity.intent}`);
                    console.log(`   ✅ Summary: ${entity.summary}`);
                    
                    if (entity.type !== testCase.expectedType) {
                        console.warn(`   ⚠️ Type mismatch: Got ${entity.type}, expected ${testCase.expectedType}`);
                    }
                }
                processed = true;
                break;
            } else if (check?.status === 'NEEDS_USER_REVIEW') {
                console.log(`   ⚠️ Needed Review (Confidence: ${check.confidence})`);
                processed = true;
                break;
            } else if (check?.status === 'FAILED') {
                console.error(`   ❌ FAILED: ${check.processingError}`);
                processed = true;
                break;
            }

            process.stdout.write('.');
            await new Promise(r => setTimeout(r, 2000));
            attempts++;
        }

        if (!processed) {
            console.error(`\n❌ TIMED OUT waiting for processing.`);
        }
    }
}

validateGemini()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
