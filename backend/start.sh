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

# Test database connection
echo "🔌 Testing database connection..."
npx prisma db execute --stdin <<EOF
SELECT 1;
EOF

if [ $? -eq 0 ]; then
  echo "✅ Database connection successful"
else
  echo "❌ Database connection failed"
  exit 1
fi

# Start the application
echo "🚀 Starting Node.js application..."
exec node dist/index.js
