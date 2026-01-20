'use server';

import { prisma } from '@second-brain/database';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function saveWorkflow(nodes: any[], edges: any[]) {
    const session = await getServerSession(authOptions) as any;
    if (!session?.user) {
        throw new Error('Unauthorized');
    }
    const userId = session.user.id;

    console.log(`Saving workflow for user ${userId}...`, nodes.length, edges.length);

    // 1. Clear existing workflows for this user to avoid duplication if we are "overwriting"
    // In a real app, you might want to update specific workflows by ID.
    await prisma.workflow.deleteMany({
        where: { userId }
    });

    // 2. Find all Trigger Nodes (aiRouter or schedule)
    const triggerNodes = nodes.filter((n) => n.type === 'aiRouter' || n.type === 'schedule' || n.type === 'trigger');

    for (const triggerNode of triggerNodes) {
        // Map Edges to Conditions & Actions
        const outgoingEdges = edges.filter((e) => e.source === triggerNode.id);

        for (const edge of outgoingEdges) {
            const triggerType = triggerNode.type === 'aiRouter' 
                ? edge.sourceHandle?.toUpperCase() // PROJECT, PERSON, etc.
                : triggerNode.type.toUpperCase(); // SCHEDULE, TRIGGER (ON_CLASSIFY)

            if (!triggerType) continue;

            const actions: any[] = [];
            let currentNodeId = edge.target;
            const visited = new Set();

            while (currentNodeId && !visited.has(currentNodeId)) {
                visited.add(currentNodeId);
                const node = nodes.find((n) => n.id === currentNodeId);
                if (!node) break;

                if (node.type === 'reasoning') {
                    actions.push({
                        type: 'ai_reasoning',
                        params: {
                            model: node.data.model,
                            prompt: node.data.promptTemplate
                        }
                    });
                } else if (node.type === 'action') {
                    actions.push({
                        type: node.data.actionType || ('create_' + (edge.sourceHandle || 'task').toLowerCase()),
                        params: {
                            title: node.data.label || 'Auto-created Item',
                            template: node.data.messageTemplate
                        }
                    });
                }

                // Find next node in chain
                const nextEdge = edges.find(e => e.source === currentNodeId);
                currentNodeId = nextEdge ? nextEdge.target : null;
            }

            if (actions.length > 0) {
                let conditions: any = {};
                let triggerName = 'ON_CLASSIFY';

                if (triggerNode.type === 'aiRouter') {
                    conditions = {
                        type_is: triggerType,
                        model_override: triggerNode.data.model,
                        system_prompt: triggerNode.data.systemPrompt
                    };
                } else if (triggerNode.type === 'trigger') {
                    triggerName = 'ON_CLASSIFY';
                    conditions = {};
                } else if (triggerNode.type === 'schedule') {
                    triggerName = 'SCHEDULE';
                    conditions = {
                        interval: triggerNode.data.interval,
                        time: triggerNode.data.time
                    };
                }

                await prisma.workflow.create({
                    data: {
                        name: `${triggerNode.data.label}: ${triggerType} Route`,
                        trigger: triggerName,
                        description: `Created via Automation Canvas`,
                        conditions: JSON.stringify(conditions),
                        actions: JSON.stringify(actions),
                        isActive: true,
                        userId: userId
                    }
                });
                console.log(`Created workflow for user ${userId} route ${triggerType} with ${actions.length} actions`);
            }
        }
    }

    return { success: true };
}