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
  const provider = process.env.AI_PROVIDER;

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
      throw new Error(`No valid AI provider configured for embeddings (Provider: ${provider})`);
    }
  } catch (error) {
    console.error('Embedding generation failed:', error);
    return null;
  }
}

async function classifyContent(content: string, itemId: string = 'unknown') {
  const provider = process.env.AI_PROVIDER;

  const systemPrompt = `
    You are the "Intelligence Architect" for CognitoFlow. Your mission is to extract maximal semantic value from raw input.
    You must classify the input into one of these 5 categories: PROJECT, PERSON, IDEA, ADMIN, or CLARIFY.

    ### 1. Classification & Field Extraction:
    - **PROJECT**: Goals requiring multiple steps.
      * Extract: title, summary, outcome (clear goal), nextAction (immediate physical step), priority (High/Medium/Low), deadline (if mentioned), budget (numeric), riskLevel (Low/Medium/High).
    - **PERSON**: Contact or relationship notes.
      * Extract: title (Name), summary, role, company, email, phone, linkedin, lastContacted (if mentioned).
    - **IDEA**: Thoughts, creative sparks.
      * Extract: title, summary, potential (High/Medium/Low), area (e.g. Tech, Health), impactScore (1-10), effortScore (1-10), feasibility (High/Medium/Low).
    - **ADMIN**: Life maintenance, logs, legal, finance.
      * Extract: title, summary, category (e.g. Finance, Health), importance (High/Medium/Low), expiryDate (if mentioned), effectiveDate, confidentiality (Public/Internal/Confidential).
    - **CLARIFY**: Only if the input is uselessly vague.
      * Return: clarificationQuestion.

    ### 2. General Extraction:
    - title: Concise (3-7 words).
    - intent: One word context (Planning, Networking, Vision, etc.)
    - confidence: Your certainty 0.0 to 1.0.

    ### 3. Rules:
    - Return ONLY valid JSON.
    - Dates must be in ISO-8601 format.
    - Default status to "Active".
    
    Structure:
    {
      "reasoning": "Your internal thought process while analyzing the raw input.",
      "routingStrategy": "Explanation of why you chose the specific category and how it should be filed.",
      "type": "PROJECT" | "PERSON" | "IDEA" | "ADMIN" | "CLARIFY",
      "intent": "String",
      "title": "String",
      "summary": "String",
      "confidence": 0.95,
      "status": "Active" | "OnHold",
      "projectData": { "outcome": "string", "nextAction": "string", "priority": "High" | "Medium" | "Low", "deadline": "ISO-8601", "budget": 0, "riskLevel": "Low" | "Medium" | "High" },
      "personData": { "role": "string", "company": "string", "email": "string", "phone": "string", "linkedin": "string" },
      "ideaData": { "potential": "High" | "Medium" | "Low", "area": "string", "impactScore": 5, "effortScore": 3, "feasibility": "High" | "Medium" | "Low" },
      "adminData": { "category": "string", "importance": "High" | "Medium" | "Low", "expiryDate": "ISO-8601", "confidentiality": "Internal" },
      "clarificationQuestion": "string"
    }
  `;

  try {
    if (provider === 'GEMINI' && genAI) {
      console.log(`📡 Calling Gemini API (${itemId.slice(0, 8)})...`);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(systemPrompt + "\nInput: " + content);
      console.log(`✅ Gemini Response received.`);
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
      throw new Error(`No valid AI provider configured for classification (Provider: ${provider})`);
    }
  } catch (error) {
    console.error(`AI Classification failed (${provider}):`, error);
    throw error;
  }
}

// --- AUTOMATION ENGINE ---
async function runWorkflows(entityId: string, entityType: string, content: string, userId: string | null) {
  console.log(`⚙️ Checking workflows for Entity:${entityId} (${entityType}) for User:${userId}...`);

  const workflows = await prisma.workflow.findMany({
    where: { 
      isActive: true,
      trigger: 'ON_CLASSIFY',
      userId: userId // Only run user's own workflows
    }
  });

  console.log(`🔍 Found ${workflows.length} active classification workflows.`);

  for (const flow of workflows) {
    try {
      console.log(`📡 Inspecting Workflow: "${flow.name}"`);
      let conditionMet = true;
      if (flow.conditions) {
        const conditions = JSON.parse(flow.conditions as string);
        console.log(`   -> Conditions: ${flow.conditions}`);

        if (conditions.contains_keyword) {
          if (!content.toLowerCase().includes(conditions.contains_keyword.toLowerCase())) {
            console.log(`   -> Condition failed: keyword "${conditions.contains_keyword}" not found.`);
            conditionMet = false;
          }
        }

        if (conditions.type_is && conditions.type_is !== entityType) {
          console.log(`   -> Condition failed: type mismatch. Expected ${conditions.type_is}, got ${entityType}.`);
          conditionMet = false;
        }
      }

      if (conditionMet) {
        console.log(`⚡ Executing Workflow: "${flow.name}"`);

        const actions = JSON.parse(flow.actions as string);
        let workflowContext = {
          originalContent: content,
          reasoningInsights: "",
          entityType: entityType,
          entityId: entityId
        };

        for (const action of actions) {

          if (action.type.startsWith('create_')) {
            const targetType = action.type.replace('create_', '').toUpperCase();
            
            await prisma.entity.create({
              data: {
                title: `[AUTO] ${action.params.title}`,
                type: targetType,
                content: workflowContext.reasoningInsights || `Generated by workflow "${flow.name}" from source entity ${entityId}`,
                status: 'Active',
                confidence: 1.0,
                userId: userId,
                project: targetType === 'PROJECT' ? { create: { status: 'Active' } } : undefined,
                person: targetType === 'PERSON' ? { create: { role: 'Unknown' } } : undefined,
                linksTo: {
                  create: {
                    type: 'GENERATED_BY',
                    source: { connect: { id: entityId } }
                  }
                }
              }
            });
            console.log(`   -> Action: Created ${targetType} "${action.params.title}"`);
          }

          else if (action.type === 'notify') {
            let message = action.params.message || action.params.template || "Workflow notification";
            if (workflowContext.reasoningInsights) {
              message = message.replace('{{reasoning}}', workflowContext.reasoningInsights);
            }
            
            await prisma.inboxItem.create({
              data: {
                content: `WORKFLOW NUDGE: ${message}`,
                source: 'AI_RECEIPT',
                status: 'COMPLETED',
                confidence: 1.0,
                userId: userId
              }
            });
            console.log(`   -> Action: Created System Nudge "${message}"`);
          }

          else if (action.type === 'ai_reasoning') {
            console.log(`   -> Action: Performing Gemini Reasoning...`);
            const prompt = action.params.prompt || "Analyze this input and provide strategic insights.";
            
            const systemPrompt = `
              You are the "CognitoFlow Reasoning Engine".
              Context: ${workflowContext.entityType}
              Task: ${prompt}
              
              Input: "${workflowContext.originalContent}"
              
              Provide a concise analysis (under 50 words).
            `;

            const model = genAI!.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContent(systemPrompt);
            workflowContext.reasoningInsights = result.response.text().trim();

            await prisma.inboxItem.create({
              data: {
                content: `🧠 AI REASONING: ${workflowContext.reasoningInsights}`,
                source: 'AI_COACH',
                status: 'COMPLETED',
                confidence: 1.0,
                processedEntityId: entityId,
                userId: userId
              }
            });
            console.log(`   -> Action: Gemini reasoned: ${workflowContext.reasoningInsights}`);
          }

          else if (action.type === 'ai_nudge') {
            console.log(`   -> Action: Generating Intelligent AI Nudge...`);
            const template = action.params.template || "generate a 1-sentence strategic, high-value nudge or 'next thought' for the user. Be provocative but helpful. Keep it under 25 words.";
            
            const systemPrompt = `
              You are the "CognitoFlow Strategy Coach".
              Context: The user just added a new ${workflowContext.entityType} to their Second Brain.
              ${workflowContext.reasoningInsights ? `Previous Reasoning: ${workflowContext.reasoningInsights}` : ''}
              
              Task: ${template}
              
              Raw Content: "${workflowContext.originalContent}"
              
              Return ONLY the nudge text.
            `;

            const model = genAI!.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContent(systemPrompt);
            const nudgeText = result.response.text().trim();

            await prisma.inboxItem.create({
              data: {
                content: `🧠 AI STRATEGY: ${nudgeText}`,
                source: 'AI_COACH',
                status: 'COMPLETED',
                confidence: 1.0,
                processedEntityId: entityId,
                userId: userId
              }
            });

            await prisma.auditLog.create({
              data: {
                action: 'AI_NUDGE_GENERATED',
                details: `Nudge: "${nudgeText.slice(0, 50)}..." for ${entityType}`,
                entityId: entityId
              }
            });
            console.log(`   -> Action: AI Nudge generated: ${nudgeText}`);
          }
        }

        await prisma.auditLog.create({
          data: {
            action: 'WORKFLOW_EXECUTED',
            details: `Workflow "${flow.name}" executed for ${entityType}`,
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

// --- NUDGE ENGINE ("The Intelligence Coach") ---
async function runNudgeEngine() {
  const activeProjects = await prisma.entity.findMany({
    where: {
      type: 'PROJECT',
      status: 'Active'
    },
    include: {
      project: true
    }
  });

  for (const proj of activeProjects) {
    // Only nudge if not nudged in the last 24h
    const existingNudge = await prisma.inboxItem.findFirst({
      where: {
        source: 'AI_COACH',
        content: { contains: proj.title },
        createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    });

    if (existingNudge) continue;

    try {
      const systemPrompt = `
        You are the "CognitoFlow Performance Coach". 
        Analyze this project and decide if the user needs a strategic nudge.
        
        Project: "${proj.title}"
        Summary: "${proj.summary}"
        Outcome: "${proj.project?.outcome}"
        Next Action: "${proj.project?.nextAction}"
        Blockers: "${proj.project?.blockers}"
        Progress: ${proj.project?.progress}%
        
        If progress is low or blockers exist, write a 1-sentence supportive, tactical nudge.
        If everything looks perfect, return "NO_NUDGE".
        
        Return ONLY the nudge text or "NO_NUDGE".
      `;

      const model = genAI!.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(systemPrompt);
      const nudgeText = result.response.text().trim();

      if (nudgeText !== "NO_NUDGE" && nudgeText.length > 5) {
        console.log(`👋 AI Coach nudging: ${proj.title}`);
        await prisma.inboxItem.create({
          data: {
            content: `🧠 AI COACH: ${nudgeText} (re: ${proj.title})`,
            source: 'AI_COACH',
            status: 'PENDING',
            confidence: 1.0,
            userId: proj.userId
          }
        });
      }
    } catch (err) {
      console.error('Nudge generation failed', err);
    }
  }
}

// --- CALENDAR EVENT ENGINE ---
async function runCalendarEvents() {
  console.log('📅 Checking for due calendar events...');
  
  const events = await prisma.calendarEvent.findMany({
    where: { 
      status: 'PENDING',
      scheduledAt: { lte: new Date() }
    }
  });

  for (const event of events) {
    try {
      console.log(`⚡ Triggering Calendar Event: "${event.title}" for user ${event.userId}`);
      
      // Create the nudge/notification from the event
      await prisma.inboxItem.create({
        data: {
          content: `${event.type}: ${event.title}${event.description ? ` - ${event.description}` : ''}`,
          source: 'AI_CALENDAR',
          status: 'PENDING',
          confidence: 1.0,
          userId: event.userId
        }
      });

      await prisma.calendarEvent.update({
        where: { id: event.id },
        data: { status: 'COMPLETED' }
      });

      await prisma.auditLog.create({
        data: {
          action: 'CALENDAR_EVENT_TRIGGERED',
          details: `Event "${event.title}" (${event.type}) executed.`,
          entityId: event.id
        }
      });
    } catch (err) {
      console.error(`Error running calendar event ${event.id}:`, err);
    }
  }
}

// --- SCHEDULED WORKFLOW ENGINE ---
async function runScheduledWorkflows() {
  console.log('⏰ Checking for scheduled workflows...');
  
  const workflows = await prisma.workflow.findMany({
    where: { 
      isActive: true,
      trigger: 'SCHEDULE'
    }
  });

  const now = new Date();

  for (const flow of workflows) {
    try {
      const conditions = JSON.parse(flow.conditions || '{}');
      const interval = conditions.interval || 'day';
      const lastRun = flow.lastRunAt ? new Date(flow.lastRunAt) : new Date(0);
      
      let shouldRun = false;
      const diffMs = now.getTime() - lastRun.getTime();

      if (interval === 'minute' && diffMs >= 60 * 1000) shouldRun = true;
      else if (interval === 'hour' && diffMs >= 60 * 60 * 1000) shouldRun = true;
      else if (interval === 'day' && diffMs >= 24 * 60 * 60 * 1000) shouldRun = true;
      else if (interval === 'week' && diffMs >= 7 * 24 * 60 * 60 * 1000) shouldRun = true;

      if (shouldRun) {
        console.log(`⚡ Executing Scheduled Workflow: "${flow.name}" for user ${flow.userId}`);
        
        const actions = JSON.parse(flow.actions as string);
        let workflowContext = {
          originalContent: "Scheduled Execution",
          reasoningInsights: "",
          entityType: "SCHEDULE",
          entityId: "scheduled"
        };

        for (const action of actions) {
          // Re-use logic from runWorkflows or refactor to common function
          if (action.type === 'notify') {
            let message = action.params.message || action.params.template || "Scheduled notification";
            await prisma.inboxItem.create({
              data: {
                content: `📅 SCHEDULED: ${message}`,
                source: 'AI_RECEIPT',
                status: 'COMPLETED',
                confidence: 1.0,
                userId: flow.userId
              }
            });
          } else if (action.type === 'ai_nudge') {
             // For scheduled nudges, we might want to pick a random active project or just send a general tip
             const systemPrompt = `You are the "CognitoFlow Performance Coach". Provide a daily high-performance tip for the user. Keep it under 20 words.`;
             const model = genAI!.getGenerativeModel({ model: "gemini-2.0-flash" });
             const result = await model.generateContent(systemPrompt);
             const nudgeText = result.response.text().trim();

             await prisma.inboxItem.create({
               data: {
                 content: `🧠 COACH TIP: ${nudgeText}`,
                 source: 'AI_COACH',
                 status: 'COMPLETED',
                 confidence: 1.0,
                 userId: flow.userId
               }
             });
          }
          // ... handle other action types if needed
        }

        await prisma.workflow.update({
          where: { id: flow.id },
          data: { lastRunAt: now }
        });

        await prisma.auditLog.create({
          data: {
            action: 'WORKFLOW_EXECUTED',
            details: `Scheduled workflow "${flow.name}" executed successfully.`,
            workflowId: flow.id
          }
        });
      }
    } catch (err) {
      console.error(`Error running scheduled workflow ${flow.name}:`, err);
    }
  }
}

async function processInbox() {
  const pendingItems = await prisma.inboxItem.findMany({
    where: { status: 'PENDING' },
    take: 5
  });

  if (pendingItems.length > 0) {
    console.log(`📦 Found ${pendingItems.length} pending items to process.`);
  }

  for (const item of pendingItems) {
    await prisma.inboxItem.update({ where: { id: item.id }, data: { status: 'PROCESSING' } });

    await prisma.auditLog.create({
      data: {
        action: 'INBOX_CAPTURE',
        details: `Processing raw input: "${item.content.slice(0, 30)}"...`,
        confidence: 1.0
      }
    });

    try {
      const result = await classifyContent(item.content, item.id);
      console.log(`Classified "${item.content.slice(0, 20)}"..." -> ${result.type} (Confidence: ${result.confidence})`);

      // CHAT LOG: Reasoning
      await prisma.inboxItem.create({
        data: {
          content: `🧠 AI REASONING: ${result.reasoning}`,
          source: 'AI_REASONING',
          status: 'COMPLETED',
          confidence: result.confidence,
          userId: item.userId
        }
      });

      if (result.type === 'CLARIFY') {
        console.log(`💬 AI needs clarification (P=${result.confidence}): ${result.clarificationQuestion}`);
        await prisma.inboxItem.update({
          where: { id: item.id },
          data: {
            status: 'NEEDS_USER_REVIEW',
            confidence: result.confidence,
            processingError: result.clarificationQuestion
          }
        });

        await prisma.inboxItem.create({
          data: {
            content: `❓ CLARIFICATION NEEDED: ${result.clarificationQuestion}`,
            source: 'AI_RECEIPT',
            status: 'COMPLETED',
            confidence: 1.0
          }
        });
        continue;
      }

      // CHAT LOG: Routing Strategy
      await prisma.inboxItem.create({
        data: {
          content: `📍 ROUTING STRATEGY: ${result.routingStrategy}`,
          source: 'AI_ROUTING',
          status: 'COMPLETED',
          confidence: result.confidence,
          userId: item.userId
        }
      });

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
        continue;
      }

      const embeddingJSON = await generateEmbedding(item.content);

      const entity = await prisma.entity.create({
        data: {
          title: result.title,
          content: item.content,
          type: result.type,
          intent: result.intent,
          summary: result.summary,
          status: result.status || 'Active',
          confidence: result.confidence,
          embedding: embeddingJSON,
          userId: item.userId, // Preserve multi-tenancy
          project: result.type === 'PROJECT' ? {
            create: { 
              status: result.status || 'Active',
              deadline: result.projectData?.deadline ? new Date(result.projectData.deadline) : undefined,
              priority: result.projectData?.priority,
              outcome: result.projectData?.outcome,
              nextAction: result.projectData?.nextAction,
              budget: result.projectData?.budget,
              riskLevel: result.projectData?.riskLevel
            }
          } : undefined,
          person: result.type === 'PERSON' ? {
            create: { 
              role: result.personData?.role || 'Unknown', 
              company: result.personData?.company,
              email: result.personData?.email,
              phone: result.personData?.phone,
              linkedin: result.personData?.linkedin
            }
          } : undefined,
          idea: result.type === 'IDEA' ? {
            create: {
              potential: result.ideaData?.potential,
              area: result.ideaData?.area,
              impactScore: result.ideaData?.impactScore,
              effortScore: result.ideaData?.effortScore,
              feasibility: result.ideaData?.feasibility
            }
          } : undefined,
          admin: result.type === 'ADMIN' ? {
            create: {
              category: result.adminData?.category,
              importance: result.adminData?.importance,
              expiryDate: result.adminData?.expiryDate ? new Date(result.adminData.expiryDate) : undefined,
              confidentiality: result.adminData?.confidentiality
            }
          } : undefined
        }
      });

      await prisma.auditLog.create({
        data: {
          action: 'AI_CLASSIFIED',
          details: `Classified as ${result.type} (P=${result.confidence?.toFixed(2)})`,
          confidence: result.confidence,
          entityId: entity.id
        }
      });

      await prisma.inboxItem.update({
        where: { id: item.id },
        data: {
          status: 'COMPLETED',
          processedEntityId: entity.id,
          confidence: result.confidence
        }
      });

      await prisma.inboxItem.create({
        data: {
          content: `✅ PROCESSED: Created ${result.type} "${result.title}" (P=${result.confidence?.toFixed(2)})`,
          source: 'AI_RECEIPT',
          status: 'COMPLETED',
          confidence: 1.0,
          processedEntityId: entity.id,
          userId: item.userId
        }
      });

      await runWorkflows(entity.id, result.type, item.content, entity.userId);

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
  console.log('🚀 Backend Main Loop Started');

  let tick = 0;
  while (true) {
    try {
      await processInbox();
      if (tick % 10 === 0) {
        console.log('⏰ Running Nudge Engine...');
        await runNudgeEngine();
        await runScheduledWorkflows();
        await runCalendarEvents();
      }
    } catch (loopError) {
      console.error('❌ Error in Main Loop:', loopError);
    }
    tick++;
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

main();