# Scripts

Utility scripts for development, setup, and maintenance.

## 📂 Directory Structure

```
scripts/
├── setup-admin.sh               # 🔧 Admin console setup
├── README.md                    # This file
│
├── setup/                       # Setup and configuration scripts
│   └── production-setup.sh      # Interactive production config setup
│
└── dev/                         # Development utilities
    ├── diagnostic.sh            # Health check and diagnostics
    └── cleanup-merged-branches.sh # Git branch cleanup
```

## 🚀 Quick Reference

### Admin Console Setup

#### 🔧 Admin Setup - `setup-admin.sh`
**Simple and reliable admin console setup**

#### 🔧 Admin Setup - `setup-admin.sh`
**Simple and reliable admin console setup**

```bash
bash scripts/setup-admin.sh
```

**What it does:**
- ✅ Configures frontend admin credentials
- ✅ Generates secure password hash (SHA-256)
- ✅ Creates gitignored config files
- ✅ Works in all environments (local, Codespaces, etc.)

**Then you manually:**
- Copy Code.gs to Google Apps Script
- Set Script Properties
- Run setupSheets_() function
- Deploy Web App

**Time:** ~10 minutes total

**Documentation:** [docs/ADMIN_QUICKSTART.md](../docs/ADMIN_QUICKSTART.md)

---

### Setup Scripts

#### Production Setup (`setup/production-setup.sh`)
Interactive script to configure the app for production deployment.

```bash
./scripts/setup/production-setup.sh
```

**Features:**
- Prompts for GAS_URL and BASE_PATH
- Creates `config/config.local.js` with production values
- Validates configuration format
- Provides deployment instructions

### Development Scripts

#### Diagnostic Tool (`dev/diagnostic.sh`)
Health check script that tests GAS backend connectivity.

```bash
./scripts/dev/diagnostic.sh
```

**Usage:**
```bash
# Basic health check
./scripts/dev/diagnostic.sh

# Test specific GAS URL
GAS_URL="https://script.google.com/.../exec" ./scripts/dev/diagnostic.sh
```

**Checks:**
- GAS endpoint availability
- Puzzle generation
- Leaderboard access
- Chat functionality

#### Background Generator (`dev/generate_backgrounds.py`)
Generate AI-powered theme backgrounds using Google Gemini.

```bash
python scripts/dev/generate_backgrounds.py --api-key YOUR_KEY
```

**Features:**
- Generates backgrounds for all theme combinations
- Uses Google Gemini for high-quality images
- Outputs to `public/assets/themes/<visual>/<audio>/`
- Configurable via `theme_combos.json`

See [dev/README.md](dev/README.md) for detailed usage.

#### Branch Cleanup (`dev/cleanup-merged-branches.sh`)
Clean up merged Git branches safely.

```bash
./scripts/dev/cleanup-merged-branches.sh
```

**Features:**
- Lists merged branches
- Prompts for confirmation
- Deletes local and remote branches
- Protects main/master branches

## 🛠️ Making Scripts Executable

All scripts should have execute permissions:

```bash
chmod +x scripts/setup/*.sh
chmod +x scripts/dev/*.sh
```

## 📝 Adding New Scripts

When adding new scripts:

1. **Place in appropriate directory:**
   - `setup/` - Installation, configuration, initial setup
   - `dev/` - Development tools, testing, utilities

2. **Follow naming conventions:**
   - Use kebab-case: `my-script.sh`
   - Be descriptive: `setup-database.sh` not `setup.sh`
   - Include file extension

3. **Add documentation:**
   - Update this README
   - Add usage comments in the script
   - Include help text (`--help` flag)

4. **Use bash best practices:**
   ```bash
   #!/bin/bash
   set -e  # Exit on error
   
   # Script description
   # Usage: ./script.sh [options]
   ```

## 🔗 Related Documentation

- [Development Guide](../docs/development/) - Development workflows
- [Deployment Checklist](../docs/deployment/checklist.md) - Deployment steps
- [Configuration Guide](../config/README.md) - Configuration options
