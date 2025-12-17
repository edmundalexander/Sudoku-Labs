# Quick Reference: Branch Cleanup

## For Repository Maintainers

### Immediate Action Required

4 merged branches need cleanup:
```bash
copilot/setup-optional-persistence-system
copilot/set-up-copilot-instructions
copilot/setup-sudoku-labs-wiki
copilot/implement-natural-flow-sign-in
```

### Quick Cleanup (Choose One)

**Option A - GitHub UI (Easiest)**
1. Visit: https://github.com/edmund-alexander/Sudoku-Labs/actions/workflows/cleanup-branches.yml
2. Click "Run workflow"
3. Select `dry_run: false`
4. Click "Run workflow" button
5. ✅ Done! Check the workflow run for details

**Option B - Command Line**
```bash
git push origin --delete \
  copilot/setup-optional-persistence-system \
  copilot/set-up-copilot-instructions \
  copilot/setup-sudoku-labs-wiki \
  copilot/implement-natural-flow-sign-in
```

**Option C - Script**
```bash
./scripts/cleanup-merged-branches.sh
```

### Automatic Maintenance

✅ Workflow configured to run automatically every Sunday at 00:00 UTC
- No manual action needed going forward
- Will only delete fully merged branches
- Protects `main` and `gh-pages`

## For Contributors

After your PR is merged:

1. **Delete your branch** (GitHub does this automatically if enabled)
2. **Clean up locally**:
   ```bash
   git checkout main
   git pull
   git fetch --prune
   git branch -d your-feature-branch
   ```

## Documentation

- **Full Guide**: [../BRANCH_CLEANUP.md](../BRANCH_CLEANUP.md)
- **Contributing Guide**: [../wiki/Contributing.md](../wiki/Contributing.md)
- **Workflow File**: [../.github/workflows/cleanup-branches.yml](../.github/workflows/cleanup-branches.yml)
- **Cleanup Script**: [../scripts/cleanup-merged-branches.sh](../scripts/cleanup-merged-branches.sh)

## Status

- ✅ 4 merged branches identified
- ✅ Automated workflow created
- ✅ Manual tools provided
- ✅ Documentation complete
- ⏳ Awaiting execution by maintainer

---
*Created: 2025-12-14*
*Last Updated: 2025-12-14*
