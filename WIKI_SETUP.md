# Wiki Setup and Maintenance Guide

This document explains how to set up and maintain the GitHub Wiki for Sudoku Logic Lab.

## Overview

The Wiki is maintained in two places:
1. **Repository `/wiki` directory**: Source of truth, version-controlled
2. **GitHub Wiki**: Public-facing documentation

## Initial Setup

### Step 1: Enable GitHub Wiki

1. Go to repository **Settings**
2. Scroll to **Features** section
3. Check ✅ **Wikis**
4. Click **Save**

### Step 2: Initialize the Wiki

1. Go to the **Wiki** tab in your repository
2. Click **Create the first page**
3. You'll see the default Home page editor

### Step 3: Clone Wiki Repository

GitHub Wiki is a separate Git repository:

```bash
# Clone the wiki repository
git clone https://github.com/edmund-alexander/Sudoku-Labs.wiki.git

cd Sudoku-Labs.wiki
```

### Step 4: Copy Wiki Files

Copy all wiki pages from the main repository:

```bash
# From the wiki repo directory
cp ../Sudoku-Labs/wiki/*.md .

# Add and commit
git add *.md
git commit -m "Initial wiki setup"
git push origin master
```

### Step 5: Verify

Visit your Wiki at: `https://github.com/edmund-alexander/Sudoku-Labs/wiki`

All pages should now be visible!

## Wiki Structure

### Current Pages

The wiki includes these pages:

```
Home.md                          # Landing page with navigation
Quick-Start-Guide.md            # 5-minute setup guide
API-Reference.md                # Complete API documentation
How-to-Play.md                  # User guide for playing the game
Architecture.md                 # System design (links to docs/)
Configuration-Guide.md          # Configuration details (links to docs/)
Deployment-Guide.md            # Deployment instructions (links to docs/)
Troubleshooting.md             # Common issues (links to docs/)
Backend-Setup.md               # Google Apps Script setup
Frontend-Setup.md              # GitHub Pages setup
Development-Setup.md           # Local development environment
Contributing.md                # Contribution guidelines
FAQ.md                         # Frequently asked questions
Changelog.md                   # Version history
```

### Page Categories

**Getting Started**
- Home
- Quick Start Guide
- How to Play

**Setup & Deployment**
- Backend Setup
- Frontend Setup
- Development Setup
- Deployment Guide

**Reference**
- API Reference
- Architecture
- Configuration Guide

**Support**
- Troubleshooting
- FAQ
- Changelog
- Contributing

## Maintenance Workflow

### Method 1: Edit in Repository (Recommended)

This keeps the wiki version-controlled with the main codebase:

1. **Edit in main repo**:
   ```bash
   cd Sudoku-Labs
   vim wiki/Home.md  # or your favorite editor
   git add wiki/Home.md
   git commit -m "docs: update Home wiki page"
   git push
   ```

2. **Sync to GitHub Wiki**:
   ```bash
   cd Sudoku-Labs.wiki
   cp ../Sudoku-Labs/wiki/*.md .
   git add *.md
   git commit -m "Sync from main repo"
   git push origin master
   ```

### Method 2: Edit Directly in GitHub Wiki

For quick fixes, edit directly on GitHub:

1. Go to Wiki page
2. Click **Edit**
3. Make changes
4. Click **Save**
5. Later, sync back to main repo:
   ```bash
   cd Sudoku-Labs.wiki
   git pull
   cp *.md ../Sudoku-Labs/wiki/
   cd ../Sudoku-Labs
   git add wiki/
   git commit -m "docs: sync wiki changes"
   git push
   ```

### Method 3: Automated Sync (Advanced)

Set up a GitHub Action to auto-sync:

```yaml
# .github/workflows/sync-wiki.yml
name: Sync Wiki

on:
  push:
    paths:
      - 'wiki/**'
    branches:
      - main

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Clone wiki
        run: |
          git clone https://${{ secrets.GITHUB_TOKEN }}@github.com/${{ github.repository }}.wiki.git wiki-repo
      
      - name: Copy files
        run: |
          cp wiki/*.md wiki-repo/
      
      - name: Commit and push
        run: |
          cd wiki-repo
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add *.md
          git diff --quiet && git diff --staged --quiet || (git commit -m "Sync from main repo" && git push)
```

## Adding New Pages

### Step 1: Create the Page

In the main repository:

```bash
cd Sudoku-Labs/wiki
vim New-Feature-Guide.md
```

### Step 2: Add to Home Navigation

Edit `Home.md` to link to the new page:

```markdown
### New Section
- **[New Feature Guide](New-Feature-Guide)** - Description here
```

### Step 3: Commit and Sync

```bash
# In main repo
git add wiki/New-Feature-Guide.md wiki/Home.md
git commit -m "docs: add New Feature Guide to wiki"
git push

# Sync to wiki
cd ../Sudoku-Labs.wiki
cp ../Sudoku-Labs/wiki/*.md .
git add *.md
git commit -m "Add New Feature Guide"
git push
```

## Wiki Best Practices

### Content Guidelines

✅ **Do:**
- Use clear, concise language
- Include code examples
- Add screenshots where helpful
- Link between related pages
- Keep content up-to-date
- Use consistent formatting
- Add a "Last Updated" note for time-sensitive content

❌ **Don't:**
- Duplicate content (link instead)
- Include sensitive information (API keys, credentials)
- Use absolute links (use relative wiki links)
- Leave broken links
- Use complex jargon without explanation

### Formatting Standards

**Headers:**
```markdown
# Page Title (H1 - only one per page)
## Major Section (H2)
### Subsection (H3)
#### Minor Section (H4)
```

**Code Blocks:**
```markdown
\`\`\`bash
# Shell commands
git clone https://github.com/user/repo.git
\`\`\`

\`\`\`javascript
// JavaScript code
const result = await fetch(url);
\`\`\`
```

**Links:**
```markdown
[Internal Wiki Link](Other-Page)
[External Link](https://example.com)
[Repo File](../docs/ARCHITECTURE.md)
```

**Lists:**
```markdown
- Unordered list item
- Another item
  - Nested item

1. Ordered list item
2. Another item
   1. Nested item
```

**Callouts:**
```markdown
> **Note**: Important information here

> **Warning**: Critical warning here

> **Tip**: Helpful tip here
```

### Naming Conventions

- Use **Title-Case-With-Hyphens** for page names
- Be descriptive: `Backend-Setup.md` not `Setup.md`
- Match GitHub's automatic slug generation
- Avoid special characters except hyphens

## Linking to Documentation

Since we have both `/docs` and `/wiki`:

### Link to `/docs` from Wiki:
```markdown
See the [Deployment Checklist](https://github.com/edmund-alexander/Sudoku-Labs/blob/main/docs/DEPLOYMENT_CHECKLIST.md) for details.
```

### Link to Wiki from `/docs`:
```markdown
For more information, see the [Wiki](https://github.com/edmund-alexander/Sudoku-Labs/wiki).
```

### Wiki Internal Links:
```markdown
See [API Reference](API-Reference) for endpoint details.
```

## Content Sync Strategy

### When to Put Content Where

**Main Repo `/docs/`:**
- Technical specifications
- Deployment checklists
- Architecture diagrams
- Code-related documentation
- Content that should be version-controlled with code

**GitHub Wiki (`/wiki/`):**
- User guides
- Tutorials
- FAQs
- How-to articles
- Community content
- Frequently updated content

**README.md:**
- Quick overview
- Installation basics
- Links to detailed docs
- Badges and status

**Both (with links):**
- Important information can be in `/docs/` with a wiki page that links to it
- Example: Architecture is in `docs/ARCHITECTURE.md`, wiki page links there

## Updating the Wiki

### Regular Maintenance

**Weekly:**
- Check for broken links
- Update version numbers
- Review and respond to wiki discussions

**Monthly:**
- Update screenshots if UI changed
- Refresh troubleshooting section
- Review analytics to improve popular pages

**Per Release:**
- Update Changelog
- Update version numbers
- Add new features to relevant pages
- Update API reference if changed

### Wiki Cleanup

Periodically review and:
- Remove outdated content
- Consolidate duplicate information
- Improve unclear explanations
- Add missing cross-references
- Update code examples

## Backup and Recovery

### Backup the Wiki

```bash
# Clone wiki repo
git clone https://github.com/edmund-alexander/Sudoku-Labs.wiki.git wiki-backup

# Or create archive
cd Sudoku-Labs.wiki
tar -czf ../wiki-backup-$(date +%Y%m%d).tar.gz .
```

### Restore from Backup

```bash
# From main repo backup
cd Sudoku-Labs.wiki
cp ../Sudoku-Labs/wiki/*.md .
git add *.md
git commit -m "Restore from main repo"
git push origin master
```

## Troubleshooting

### Issue: Wiki not showing changes

**Solution:**
- Clear browser cache
- Wait a few minutes for GitHub to update
- Check commits were pushed to wiki repo

### Issue: Broken links

**Solution:**
- Use relative links within wiki
- Check page names match exactly (case-sensitive)
- Verify linked pages exist

### Issue: Images not displaying

**Solution:**
- Upload images to main repo `/wiki/images/`
- Use full URLs: `![Alt](https://raw.githubusercontent.com/user/repo/main/wiki/images/image.png)`
- Or use GitHub Issues to host images

### Issue: Wiki repo conflicts

**Solution:**
```bash
cd Sudoku-Labs.wiki
git fetch origin
git reset --hard origin/master
# Re-apply your changes
```

## Advanced Features

### Table of Contents

GitHub Wiki automatically generates TOC from headers. Use `## Headers` to structure content.

### Sidebar

Create `_Sidebar.md` for a custom sidebar:

```markdown
### Navigation

**Getting Started**
- [Home](Home)
- [Quick Start](Quick-Start-Guide)

**Guides**
- [API Reference](API-Reference)
- [How to Play](How-to-Play)
```

### Footer

Create `_Footer.md` for a custom footer:

```markdown
---
[Home](Home) | [API](API-Reference) | [Issues](https://github.com/edmund-alexander/Sudoku-Labs/issues)

© 2025 Sudoku Logic Lab
```

### Search

GitHub Wiki has built-in search. Ensure:
- Descriptive page titles
- Keywords in content
- Clear headers

## Permissions

### Public Wiki
By default, wiki is public (anyone can read).

### Restrict Editing
In Settings → Wikis:
- ✅ Restrict editing to collaborators only

### Enable for All
- ⚠️ Allow anyone to edit (not recommended without moderation)

## Analytics

Track wiki usage:
1. Use GitHub Insights for repository views
2. Add Google Analytics (optional)
3. Monitor frequent search terms
4. Review frequently accessed pages

## Getting Help

- **GitHub Wiki Docs**: [docs.github.com/en/communities/documenting-your-project-with-wikis](https://docs.github.com/en/communities/documenting-your-project-with-wikis)
- **Markdown Guide**: [www.markdownguide.org](https://www.markdownguide.org)
- **Repository Issues**: [Report problems](https://github.com/edmund-alexander/Sudoku-Labs/issues)

## Next Steps

1. ✅ Follow this guide to set up the wiki
2. 📝 Keep content in sync between repo and wiki
3. 🔄 Regularly update and maintain
4. 📊 Monitor usage and improve popular pages
5. 🤝 Accept community contributions

---

**Questions?** Open an [issue](https://github.com/edmund-alexander/Sudoku-Labs/issues) or discussion!
