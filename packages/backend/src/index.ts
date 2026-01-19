import { prisma } from '@second-brain/database';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Ollama } from 'ollama';
import * as dotenv from 'dotenv';

dotenv.config();

console.log('🧠 CognitoFlow Intelligence Engine Starting...');
console.log(`🤖 AI Mode: ${process.env.AI_PROVIDER || 'MOCK'} (Options: GEMINI, OLLAMA, MOCK)`);

// --- AI SETUP ---
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const ollama = new Ollama({ host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434' });

// --- EMBEDDING ENGINE ---
async function generateEmbedding(text: string): Promise<string | null> {
  const provider = process.env.AI_PROVIDER || 'MOCK';
  
  try {
    if (provider === 'GEMINI' && genAI) {
      const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
      const result = await model.embedContent(text);
      return JSON.stringify(result.embedding.values);
    } 
    else if (provider === 'OLLAMA') {
      const response = await ollama.embeddings({
        model: process.env.OLLAMA_MODEL || 'llama3',
        prompt: text,
      });
      return JSON.stringify(response.embedding);
    }
    else {
      // Mock Embedding (Random vector for testing)
      return JSON.stringify(Array(768).fill(0).map(() => Math.random()));
    }
  } catch (error) {
    console.error('Embedding generation failed:', error);
    return null;
  }
}

async function classifyContent(content: string) {
  const provider = process.env.AI_PROVIDER || 'MOCK';

  const systemPrompt = `
    You are the "Sorter" in a Second Brain system.
    Analyze the following input and classify it into one of these types:
    - TASK: Something that needs to be done. (Fields: priority, isDone=false)
    - PROJECT: A multi-step goal or outcome. (Fields: status)
    - NOTE: Information to be remembered.
    - CONTACT: A person's details.
    
    You must also assign a CONFIDENCE score (0.0 to 1.0) indicating how sure you are about the classification.
    If the input is vague, ambiguous, or nonsense, give a low confidence score (< 0.7).
    
    Return ONLY a JSON object with this structure:
    {
      "type": "TASK" | "PROJECT" | "NOTE" | "CONTACT",
      "title": "Short concise title",
      "summary": "Brief summary of the content",
      "priority": "HIGH" | "MEDIUM" | "LOW" (only for TASK),
      "status": "Active" | "OnHold" (only for PROJECT),
      "confidence": 0.95
    }
  `;

  try {
    if (provider === 'GEMINI' && genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(systemPrompt + "\nInput: " + content);
      const text = result.response.text();
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
      
    } else if (provider === 'OLLAMA') {
      const response = await ollama.chat({
        model: process.env.OLLAMA_MODEL || 'llama3',
        messages: [{ role: 'user', content: systemPrompt + "\nInput: " + content }],
        format: 'json',
      });
      return JSON.parse(response.message.content);

    } else {
      // ADVANCED MOCK AI
      console.log('Using ADVANCED MOCK AI (Simulating Gemini/Ollama)');
      const lower = content.toLowerCase();
      let type = 'NOTE';
      let confidence = 0.85; // Default baseline
      let priority = 'MEDIUM';
      let summary = 'Auto-generated note';
      
      // 1. Classification Logic
      if (lower.match(/\b(buy|call|fix|clean|pay|send|email|draft|schedule|todo)\b/)) {
        type = 'TASK';
        confidence += 0.1;
      } else if (lower.match(/\b(project|plan|launch|build|design|roadmap|strategy)\b/)) {
        type = 'PROJECT';
        confidence += 0.1;
      } else if (lower.match(/\b(person|meet|contact|phone|address)\b/)) {
        type = 'CONTACT';
      }

      // 2. Confidence Adjustment (The Bouncer Simulation)
      if (content.length < 5) confidence -= 0.3; // Too short = ambiguous
      if (lower.includes('maybe') || lower.includes('?')) confidence -= 0.2; // Uncertainty
      
      // 3. Metadata Extraction
      if (lower.includes('urgent') || lower.includes('asap') || lower.includes('!')) {
        priority = 'HIGH';
      }
      
      // 4. Summarization Simulation
      const words = content.split(' ');
      summary = words.length > 5 ? words.slice(0, 5).join(' ') + '...' : content;

      // 5. Simulate Processing Delay for "Thinking" feel
      await new Promise(r => setTimeout(r, 800));

      return { 
        type, 
        title: content.slice(0, 40) + (content.length > 40 ? '...' : ''), 
        summary,
        priority,
        status: 'Active',
        confidence: Math.min(Math.max(confidence, 0.1), 1.0) // Clamp 0-1
      };
    }
  } catch (error) {
    console.error(`AI Classification failed (${provider}):`, error);
    return { type: 'NOTE', title: content.slice(0, 30), summary: 'Failed', confidence: 0.0 };
  }
}

// --- AUTOMATION ENGINE ---
async function runWorkflows(entityId: string, entityType: string, content: string) {
  console.log(`⚙️ Checking workflows for Entity:${entityId} (${entityType})...`);
  
  // 1. Fetch Active Workflows
  const workflows = await prisma.workflow.findMany({
    where: { isActive: true }
  });

  for (const flow of workflows) {
    try {
      // Check Trigger (Simplified)
      let conditionMet = true;
      if (flow.conditions) {
        const conditions = JSON.parse(flow.conditions as string);
        
        // Keyword Condition
        if (conditions.contains_keyword) {
          if (!content.toLowerCase().includes(conditions.contains_keyword.toLowerCase())) {
            conditionMet = false;
          }
        }
        
        // Type Condition
        if (conditions.type_is && conditions.type_is !== entityType) {
          conditionMet = false;
        }
      }

      if (conditionMet) {
        console.log(`⚡ Executing Workflow: "${flow.name}"`);
        
        // Execute Actions
        const actions = JSON.parse(flow.actions as string);
        for (const action of actions) {
          
          if (action.type === 'create_task') {
            await prisma.entity.create({
              data: {
                title: `[AUTO] ${action.params.title}`,
                type: 'TASK',
                content: `Generated by workflow "${flow.name}" from source entity ${entityId}`,
                task: { create: { isDone: false, priority: 'HIGH' } },
                linksTo: { 
                  create: { 
                    type: 'GENERATED_BY',
                    source: { connect: { id: entityId } }
                  } 
                }
              }
            });
            console.log(`   -> Action: Created Task "${action.params.title}"`);
          } 
          
          else if (action.type === 'create_note') {
             await prisma.entity.create({
              data: {
                title: `[LOG] ${action.params.title}`,
                type: 'NOTE',
                content: `Log entry from workflow "${flow.name}". Source: ${entityId}`,
                linksTo: { 
                  create: { 
                    type: 'LOGGED_BY',
                    source: { connect: { id: entityId } }
                  } 
                }
              }
            });
            console.log(`   -> Action: Created Note "${action.params.title}"`);
          }

          else if (action.type === 'notify') {
            await prisma.inboxItem.create({
              data: {
                content: `WORKFLOW NUDGE: ${action.params.message}`,
                source: 'SYSTEM_NUDGE',
                status: 'NEEDS_USER_REVIEW',
                confidence: 1.0
              }
            });
            console.log(`   -> Action: Created System Nudge "${action.params.message}"`);
          }

          // TODO: Implement 'add_tag' once Tag relation logic is refined
        }

        // Log Execution
        await prisma.auditLog.create({
          data: {
            action: 'WORKFLOW_EXECUTED',
            details: `Ran "${flow.name}" on Entity ${entityId}`,
            workflowId: flow.id,
            entityId: entityId
          }
        });
      }
    } catch (err) {
      console.error(`Error running workflow ${flow.name}:`, err);
    }
  }
}

// --- NUDGE ENGINE ("The Tap on the Shoulder") ---
async function runNudgeEngine() {
  // 1. Check for Stale Projects (No updates in 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const staleProjects = await prisma.entity.findMany({
    where: {
      type: 'PROJECT',
      updatedAt: { lt: sevenDaysAgo },
      project: { status: 'Active' }
    }
  });

  for (const proj of staleProjects) {
    // Check if we already nudged recently to avoid spam
    const existingNudge = await prisma.inboxItem.findFirst({
      where: {
        source: 'SYSTEM_NUDGE',
        content: { contains: proj.title },
        createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24h
      }
    });

    if (!existingNudge) {
      console.log(`👋 Nudging user about stale project: ${proj.title}`);
      await prisma.inboxItem.create({
        data: {
          content: `NUDGE: Project "${proj.title}" hasn't been updated in a week. Archive or update?`,
          source: 'SYSTEM_NUDGE',
          status: 'NEEDS_USER_REVIEW', // User must decide
          confidence: 1.0
        }
      });
    }
  }
}

// --- MAIN LOOP ---
async function processInbox() {
  const pendingItems = await prisma.inboxItem.findMany({
    where: { status: 'PENDING' },
    take: 5
  });

  if (pendingItems.length === 0) return;

  for (const item of pendingItems) {
    await prisma.inboxItem.update({ where: { id: item.id }, data: { status: 'PROCESSING' } });

    try {
      // 1. Classify
      const result = await classifyContent(item.content);
      console.log(`Classified "${item.content.slice(0, 20)}"..." -> ${result.type} (Confidence: ${result.confidence})`);

      // 2. THE BOUNCER (Confidence Check)
      if (result.confidence < 0.8) {
        console.log(`🚫 Confidence too low (${result.confidence}). Sent for manual review.`);
        await prisma.inboxItem.update({
          where: { id: item.id },
          data: { 
            status: 'NEEDS_USER_REVIEW',
            confidence: result.confidence,
            processingError: `Low confidence (${result.confidence}). Suggested: ${result.type}`
          }
        });
        continue; // Skip auto-creation
      }

      // 3. Create Entity (If passed Bouncer)
      const embeddingJSON = await generateEmbedding(item.content);
      
      const entity = await prisma.entity.create({
        data: {
          title: result.title,
          content: item.content,
          type: result.type,
          summary: result.summary,
          embedding: embeddingJSON, // Store vector
          task: result.type === 'TASK' ? {
            create: { isDone: false, priority: result.priority || 'MEDIUM' }
          } : undefined,
          project: result.type === 'PROJECT' ? {
            create: { status: result.status || 'Active' }
          } : undefined
        }
      });

      // 4. Mark Complete
      await prisma.inboxItem.update({
        where: { id: item.id },
        data: { 
          status: 'COMPLETED', 
          processedEntityId: entity.id,
          confidence: result.confidence
        }
      });

      // 5. Trigger Automation
      await runWorkflows(entity.id, result.type, item.content);

    } catch (err) {
      console.error(`Error processing item ${item.id}:`, err);
      await prisma.inboxItem.update({
        where: { id: item.id },
        data: { status: 'FAILED', processingError: String(err) }
      });
    }
  }
}

async function main() {
  // ... (Seeding code remains same) ...

  let tick = 0;
  while (true) {
    await processInbox();
    
    // Run Nudge Engine every ~30 seconds (mock timeframe, real would be hours)
    if (tick % 10 === 0) {
      await runNudgeEngine();
    }
    
    tick++;
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

main();