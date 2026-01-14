#!/bin/bash
set -e

# Configuration
REPO_DIR="/Users/evaldomacielfilho/Downloads/crm JurisNexo/jurisnexo"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
COMMIT_MSG="feat(crm): Implement Full Leads & Pipeline Module (Backend/Frontend/DB) - $TIMESTAMP"

echo "============================================"
echo "🔄 Starting Git Sync..."
echo "============================================"

cd "$REPO_DIR"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Not a git repository."
    exit 1
fi

# Add all changes
echo "➕ Adding changes..."
git add .

# Commit changes
echo "💾 Committing..."
git commit -m "$COMMIT_MSG" || echo "⚠️ No changes to commit."

# Push changes
echo "🚀 Pushing to origin..."
git push origin main || git push origin master

echo "✅ Sync completed successfully!"
