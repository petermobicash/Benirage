#!/bin/bash

# Refactoring Migration Script
# This script helps apply the refactoring changes to your project

echo "🚀 Starting Benirage Refactoring Migration..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Backup existing files
echo "📦 Step 1: Creating backups..."
if [ -f "src/App.tsx" ]; then
    cp src/App.tsx src/App.backup.tsx
    echo -e "${GREEN}✓${NC} Backed up App.tsx to App.backup.tsx"
fi

if [ -f "src/index.css" ]; then
    cp src/index.css src/index.backup.css
    echo -e "${GREEN}✓${NC} Backed up index.css to index.backup.css"
fi

echo ""

# Step 2: Apply new App.tsx
echo "🔄 Step 2: Applying refactored App.tsx..."
if [ -f "src/App.refactored.tsx" ]; then
    mv src/App.refactored.tsx src/App.tsx
    echo -e "${GREEN}✓${NC} Applied refactored App.tsx"
else
    echo -e "${RED}✗${NC} App.refactored.tsx not found"
fi

echo ""

# Step 3: Update main.tsx imports
echo "📝 Step 3: Updating main.tsx imports..."
if [ -f "src/main.tsx" ]; then
    # Check if already updated
    if grep -q "styles/base.css" src/main.tsx; then
        echo -e "${YELLOW}⚠${NC} main.tsx already updated"
    else
        # Create a backup
        cp src/main.tsx src/main.backup.tsx
        
        # Update imports (this is a simple replacement, manual verification recommended)
        sed -i.bak "s|import './index.css';|import './styles/base.css';\nimport './styles/mobile.css';|g" src/main.tsx
        rm src/main.tsx.bak 2>/dev/null
        
        echo -e "${GREEN}✓${NC} Updated main.tsx imports"
        echo -e "${YELLOW}⚠${NC} Please verify the changes in main.tsx"
    fi
fi

echo ""

# Step 4: Verify new files exist
echo "✅ Step 4: Verifying new files..."
files_to_check=(
    "src/config/app.config.ts"
    "src/config/routes.config.tsx"
    "src/utils/responsive.ts"
    "src/styles/base.css"
    "src/styles/mobile.css"
)

all_exist=true
for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
    else
        echo -e "${RED}✗${NC} $file missing"
        all_exist=false
    fi
done

echo ""

# Step 5: Summary
echo "📊 Migration Summary:"
echo "===================="
if [ "$all_exist" = true ]; then
    echo -e "${GREEN}✓${NC} All refactored files are in place"
    echo ""
    echo "Next steps:"
    echo "1. Review the changes in src/App.tsx"
    echo "2. Verify src/main.tsx imports"
    echo "3. Test the application: npm run dev"
    echo "4. Run type check: npm run type-check"
    echo "5. Build for production: npm run build"
    echo ""
    echo "📖 See REFACTORING_SUMMARY.md for detailed documentation"
else
    echo -e "${RED}✗${NC} Some files are missing. Please check the refactoring process."
fi

echo ""
echo "🎉 Migration script completed!"