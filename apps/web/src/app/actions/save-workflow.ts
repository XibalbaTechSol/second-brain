'use server';

import { prisma } from '@second-brain/database';

export async function saveWorkflow(nodes: any[], edges: any[]) {
    console.log('Saving workflow...', nodes.length, edges.length);

    // 1. Find the AI Router Node
    const routerNode = nodes.find((n) => n.type === 'aiRouter');
    if (!routerNode) {
        throw new Error('Workflow must contain an AI Router node');
    }

    // 2. Map Edges to Conditions & Actions
    // We look for edges starting from the Router Node
    const routerEdges = edges.filter((e) => e.source === routerNode.id);

    for (const edge of routerEdges) {
        const triggerType = edge.sourceHandle?.toUpperCase(); 
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
                    type: node.data.actionType || ('create_' + triggerType.toLowerCase()),
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
            const conditions = {
                type_is: triggerType,
                model_override: routerNode.data.model,
                system_prompt: routerNode.data.systemPrompt
            };

            await prisma.workflow.create({
                data: {
                    name: `AI Flow: ${triggerType} Route`,
                    trigger: 'ON_CLASSIFY',
                    description: `Model: ${routerNode.data.model || 'Default'}`,
                    conditions: JSON.stringify(conditions),
                    actions: JSON.stringify(actions),
                    isActive: true
                }
            });
            console.log(`Created workflow for route ${triggerType} with ${actions.length} actions`);
        }
    }

    return { success: true };
}
