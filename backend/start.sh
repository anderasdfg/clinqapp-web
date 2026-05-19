#!/bin/sh
set -e

echo "🚀 Starting ClinqApp Backend..."

# Verify critical environment variables
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set"
  exit 1
fi

if [ -z "$SUPABASE_URL" ]; then
  echo "❌ ERROR: SUPABASE_URL is not set"
  exit 1
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "❌ ERROR: SUPABASE_ANON_KEY is not set"
  exit 1
fi

echo "✅ Environment variables validated"

# Generate Prisma client with production DATABASE_URL
echo "📦 Generating Prisma client..."
npx prisma generate

echo "✅ Prisma client generated"

# Start the application (connection will be tested when app starts)
echo "🚀 Starting Node.js application..."
exec node dist/index.js
