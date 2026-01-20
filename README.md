# 🧠 CognitoFlow

**The Intelligence Layer for your Second Brain.**

CognitoFlow is an active Second Brain SaaS that uses Gemini 2.0 to analyze, connect, and nudge you toward your goals. Unlike traditional note-taking tools that act as passive archives, CognitoFlow proactively reasons about your data to influence your behavior and momentum.

## 🚀 Key Features

- **Nord Design System**: A professional, high-contrast UI using the Nord color palette (Snow Storm, Frost, Aurora, Polar Night).
- **Intelligent Reasoning Engine**: Deep analysis of every capture using Gemini 2.0 Flash to extract intent, priority, and next actions.
- **Behavioral Nudges**: Proactive notifications that act as an AI performance coach, challenging your assumptions and suggesting practical first steps.
- **AI Automation Canvas**: A visual graph editor to build complex intelligence workflows (Router -> Reasoning -> Action).
- **Multi-Tenant SaaS Architecture**: Integrated User Auth (NextAuth), subscription tiers (Basic, Pro, Enterprise), and isolated user graphs.
- **7-Day Free Trial**: Automatic trial activation for new users with access to all Pro features.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS, React Flow, Lucide Icons.
- **Backend**: Node.js, Prisma ORM, Gemini 2.0 Flash (Google AI), Ollama (optional).
- **Database**: SQLite (Dev/Beta) with multi-tenancy support.
- **Process Management**: PM2 support for robust production cycles.

## 🏁 Getting Started

### 1. Prerequisites
- Node.js 20+
- Google Gemini API Key

### 2. Installation
```bash
npm install
```

### 3. Configuration
Create a `.env` file in `apps/web` and `packages/backend` (or use the deploy script to sync them):
```env
GEMINI_API_KEY=your_key_here
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Database Setup
```bash
cd packages/database
npx prisma db push
```

### 5. Running
```bash
npm run dev
```

## 🚢 Production Deployment

Use the included deployment script for a streamlined production setup:
```bash
chmod +x deploy.sh
./deploy.sh
```
This will automatically sync keys, migrate the database, build all packages, and start services using PM2.

---
© 2026 CognitoFlow SaaS. Built for the Post-AI Age.
