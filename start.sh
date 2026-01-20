#!/bin/bash

# CognitoFlow Robust Start Script
echo "🧠 Starting CognitoFlow Second Brain System..."

# 1. Cleanup
echo "🧹 Cleaning up existing processes..."
pkill -f "ts-node-dev" || true
pkill -f "next-dev" || true
pkill -f "next-server" || true
# Wait for ports to be released
sleep 3

# 2. Environment Verification
echo "🔐 Checking environment files..."
if [ ! -f ".env" ]; then
    echo "⚠️  Root .env missing. Creating from keys..."
    echo "AI_PROVIDER=GEMINI" > .env
    echo "GEMINI_API_KEY=AIzaSyCszqkHC_fZnFkwdhm0oLoRPNgyEQIyaPI" >> .env
fi

# Ensure package envs exist
cp .env packages/backend/.env 2>/dev/null || true
cp .env apps/web/.env 2>/dev/null || true

# 3. Database Initialization & Seeding
echo "📦 Resetting and Seeding Database..."
cd packages/database
npx prisma db push --accept-data-loss
npx prisma generate
cd ../..

# Clear all data (Entities and Metadata) via a small temporary script or prisma call
# For simplicity, we'll run the seed script which we'll ensure clears what it needs.
# But we also need to clear Entities to avoid stale data.
npm exec ts-node-dev -- --project packages/backend/tsconfig.json -e "import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); async function c(){ await p.link.deleteMany({}); await p.taskMetadata.deleteMany({}); await p.projectMetadata.deleteMany({}); await p.personMetadata.deleteMany({}); await p.resourceMetadata.deleteMany({}); await p.entity.deleteMany({}); await p.inboxItem.deleteMany({}); console.log('🗑️ All data cleared'); } c().finally(()=>p.\$disconnect())"

# Seed 5 items (Disabled for clean validation)
# npm exec ts-node-dev -- --project packages/backend/tsconfig.json packages/backend/scripts/seed-inbox.ts

# 4. Start Services and Stream Logs
echo "🚀 Launching Services and Streaming to debug.log..."

# Clear debug.log if exists
> debug.log

# Use concurrently to run both and pipe to debug.log
npm run start:stack >> debug.log 2>&1
