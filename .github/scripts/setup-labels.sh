#!/bin/bash
# Setup script to create required labels for the auto-debug system
# Run: GITHUB_TOKEN=your_token ./setup-labels.sh

REPO="edmund-alexander/Sudoku-Labs"

# Create labels
gh label create "auto-detected" \
  --repo "$REPO" \
  --description "Issue automatically detected by monitoring system" \
  --color "d73a4a" \
  --force

gh label create "awaiting-agent" \
  --repo "$REPO" \
  --description "Issue is queued for Copilot coding agent" \
  --color "fbca04" \
  --force

gh label create "agent-working" \
  --repo "$REPO" \
  --description "Copilot coding agent is actively working on this" \
  --color "0e8a16" \
  --force

gh label create "agent-completed" \
  --repo "$REPO" \
  --description "Agent has completed work, PR created" \
  --color "1d76db" \
  --force

echo "✅ Labels created successfully!"
echo ""
echo "Next steps:"
echo "1. Add FIREBASE_SERVICE_ACCOUNT secret to GitHub repository"
echo "2. Enable GitHub Actions for the repository"
echo "3. The auto-debug system will run every 15 minutes"
