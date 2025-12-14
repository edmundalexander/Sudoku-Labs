#!/bin/bash
# Script to clean up merged branches
# This script deletes remote branches that have been merged into main

set -e

echo "🧹 Branch Cleanup Script"
echo "========================"
echo ""
echo "This script will delete the following merged branches from the remote repository:"
echo ""
echo "  1. copilot/setup-optional-persistence-system (Merged via PR #1)"
echo "  2. copilot/set-up-copilot-instructions (Merged via PR #3)"
echo "  3. copilot/setup-sudoku-labs-wiki (Merged via PR #4)"
echo "  4. copilot/implement-natural-flow-sign-in (Merged via PR #5)"
echo ""
echo "⚠️  WARNING: This action is irreversible!"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check if we have the necessary permissions (test with a simple git command)
if ! git ls-remote --heads origin > /dev/null 2>&1; then
    echo "❌ Error: Cannot access remote repository. Check your authentication."
    exit 1
fi

# Prompt for confirmation
read -p "Do you want to proceed with branch deletion? (yes/no): " confirmation
if [ "$confirmation" != "yes" ]; then
    echo "❌ Aborted by user"
    exit 0
fi

echo ""
echo "🗑️  Deleting branches..."
echo ""

# Array of branches to delete
branches=(
    "copilot/setup-optional-persistence-system"
    "copilot/set-up-copilot-instructions"
    "copilot/setup-sudoku-labs-wiki"
    "copilot/implement-natural-flow-sign-in"
)

# Delete each branch
for branch in "${branches[@]}"; do
    echo "Deleting: $branch"
    if git push origin --delete "$branch" 2>&1; then
        echo "  ✅ Successfully deleted $branch"
    else
        echo "  ❌ Failed to delete $branch (may already be deleted)"
    fi
    echo ""
done

echo "✅ Branch cleanup complete!"
echo ""
echo "Remaining branches:"
git ls-remote --heads origin | sed 's|.*refs/heads/||' | sort
echo ""
echo "Expected branches: main, gh-pages, and any active development branches"
