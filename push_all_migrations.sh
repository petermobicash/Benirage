#!/bin/bash

# Script to push all migrations to Supabase in correct order
# Usage: ./push_all_migrations.sh [database_password]

set -e  # Exit on error

echo "=========================================="
echo "Supabase Migration Push Script"
echo "=========================================="
echo ""

# Check if password is provided
if [ -z "$1" ]; then
    echo "❌ Error: Database password required"
    echo "Usage: ./push_all_migrations.sh YOUR_DATABASE_PASSWORD"
    echo ""
    echo "Get your password from:"
    echo "https://supabase.com/dashboard/project/qlnpzqorijdcbcgajuei/settings/database"
    exit 1
fi

DB_PASSWORD="$1"
PROJECT_REF="qlnpzqorijdcbcgajuei"

echo "📋 Step 1: Linking to Supabase project..."
supabase link --project-ref "$PROJECT_REF" --password "$DB_PASSWORD"

if [ $? -eq 0 ]; then
    echo "✅ Successfully linked to project"
else
    echo "❌ Failed to link project. Check if database is active."
    exit 1
fi

echo ""
echo "📤 Step 2: Pushing migrations..."
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Migrations pushed successfully"
else
    echo "❌ Failed to push migrations"
    exit 1
fi

echo ""
echo "🌱 Step 3: Running seed file..."
supabase db seed

if [ $? -eq 0 ]; then
    echo "✅ Seed data loaded successfully"
else
    echo "⚠️  Warning: Seed file may have failed (this is sometimes OK if data already exists)"
fi

echo ""
echo "=========================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Verify in dashboard: https://supabase.com/dashboard/project/$PROJECT_REF"
echo "2. Check tables in Table Editor"
echo "3. Test your application"
echo ""