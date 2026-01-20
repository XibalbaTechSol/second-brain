#!/bin/bash

# CognitoFlow Production Deployment Script
echo "🚀 Starting deployment of Second Brain Monorepo..."

# 1. Environment Sync & Check
echo "🔍 Syncing environment keys..."
WEB_KEY=$(grep GEMINI_API_KEY apps/web/.env | cut -d '=' -f 2)
BACKEND_KEY=$(grep GEMINI_API_KEY packages/backend/.env | cut -d '=' -f 2)

# If web has a key but backend doesn't, or they differ, sync them
if [ ! -z "$WEB_KEY" ] && [ "$WEB_KEY" != "$BACKEND_KEY" ]; then
    echo "📡 Syncing Gemini Key from Web to Backend..."
    sed -i "s/GEMINI_API_KEY=.*/GEMINI_API_KEY=$WEB_KEY/" packages/backend/.env
elif [ ! -z "$BACKEND_KEY" ] && [ -z "$WEB_KEY" ]; then
    echo "📡 Syncing Gemini Key from Backend to Web..."
    sed -i "s/GEMINI_API_KEY=.*/GEMINI_API_KEY=$BACKEND_KEY/" apps/web/.env
fi

if [ -z "$WEB_KEY" ] && [ -z "$BACKEND_KEY" ]; then
    echo "❌ Error: No GEMINI_API_KEY found in either .env file."
    exit 1
fi

# 2. Install Dependencies
echo "📦 Installing dependencies..."
npm install

# 3. Database Preparation
echo "🗄️ Preparing database..."
cd packages/database
npx prisma generate
npx prisma db push
cd ../..

# 4. Build Monorepo
echo "🏗️ Building all packages..."
npm run build

# 5. Start Production Services
if command -v pm2 &> /dev/null
then
    echo "✅ Build complete. Starting with PM2..."
    pm2 delete ecosystem.config.js 2>/dev/null || true
    pm2 start ecosystem.config.js
    pm2 save
    echo "📈 Services are running under PM2. Use 'pm2 status' to check."
else
    echo "⚠️  PM2 not found. Starting with standard npm script..."
    npm run start:prod
fi
