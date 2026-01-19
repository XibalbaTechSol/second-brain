#!/bin/bash

# CognitoFlow Start Script
echo "🧠 Starting CognitoFlow Second Brain System..."

# 1. Check for Backend .env
if [ ! -f "packages/backend/.env" ]; then
    echo "⚠️  Warning: packages/backend/.env not found."
    echo "Creating from example..."
    cp packages/backend/.env.example packages/backend/.env
fi

# 2. Check for Web .env
if [ ! -f "apps/web/.env" ]; then
    echo "⚠️  Warning: apps/web/.env not found."
    echo "Creating basic .env for web..."
    echo "AI_PROVIDER=GEMINI" > apps/web/.env
    echo "GEMINI_API_KEY=AIzaSyCszqkHC_fZnFkwdhm0oLoRPNgyEQIyaPI" >> apps/web/.env
fi

# 3. Ensure Database is synced
echo "📦 Syncing database..."
cd packages/database && npx prisma db push && npx prisma generate
cd ../..

# 4. Start the stack
echo "🚀 Launching Web Dashboard and AI Backend..."
npm start
