# Project: Second Brain SaaS (CognitoFlow)

Based on the "Active Second Brain" concept and the goal of combining messaging, workspace (AFFINE-like), and automation (Zapier-like).

## Core Philosophy
- **Capture**: Frictionless input via a Chat/Messaging Interface (Mobile/Web).
- **Process**: AI "Sorter" and "Router" (Backend Automation).
- **Store**: Structured Knowledge Base (Web Workspace).
- **Act**: Automated workflows and behavioral nudges.

## Architecture: Monorepo (TurboRepo)
- **`apps/web`**: The main SaaS dashboard.
  - **Features**: 
    - Knowledge Graph / Doc Editor (Block-based, inspired by AFFINE).
    - Automation Builder (Drag-and-drop "Zapier" style using React Flow).
    - Chat View (Mirror of mobile).
  - **Tech**: Next.js, Tailwind, React Flow, Tiptap/BlockSuite.
- **`apps/mobile`**: The capture device.
  - **Features**: 
    - Chat interface with the "AI Assistant".
    - Quick capture (Voice, Text, Image).
  - **Tech**: React Native (Expo).
- **`packages/backend`**: The Intelligence Engine.
  - **Features**:
    - AI Processing Chain (LangChain/Vercel AI SDK).
    - Workflow Execution Engine (The "Automation" runner).
    - Database ORM (Prisma/Postgres).
  - **Tech**: Node.js (Hono or Express).

## Immediate Roadmap
1. **Scaffold Project**: Initialize TurboRepo with Web and Mobile apps.
2. **Prototype Web (The Brain)**: 
   - Build the Layout (Sidebar, Canvas).
   - Implement the "Automation" page with React Flow.
3. **Prototype Mobile (The Mouth)**:
   - Build the Chat Interface.
4. **Prototype Backend (The Mind)**:
   - Set up the AI loop (Input -> Classify -> Store).

## User Decision Point
- **AFFINE Integration**: Instead of forking the massive AFFINE codebase (which is complex to strip down for a SaaS), we will build a **lightweight, purpose-built workspace** using modern block editors. This ensures you own the stack and can iterate fast on the *SaaS* features (automation/AI) rather than maintaining a document editor fork.
