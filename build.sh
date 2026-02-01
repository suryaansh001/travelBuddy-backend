#!/bin/bash
# Render build script for backend

set -e  # Exit on error

echo "📦 Installing dependencies..."
npm ci

echo "🔨 Generating Prisma Client..."
npx prisma generate

echo "🗄️  Running database migrations..."
npx prisma migrate deploy

echo "🏗️  Building TypeScript..."
npm run build

echo "✅ Build complete!"
