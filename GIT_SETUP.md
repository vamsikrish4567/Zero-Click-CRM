# Git Setup Guide

Follow these steps to upload your Zero-Click CRM project to GitHub.

## Prerequisites

- Git installed on your computer
- GitHub account created
- Repository created on GitHub (you can create it empty, without README)

## Step 1: Initialize Git Repository (if not already done)

```bash
cd C:\Users\1038937\Workspace-personal\Hacknation
git init
```

## Step 2: Configure Git (First Time Only)

```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## Step 3: Add All Files

```bash
git add .
```

## Step 4: Create First Commit

```bash
git commit -m "Initial commit: Zero-Click CRM with AI Agent and Multi-CRM Integration"
```

## Step 5: Connect to GitHub

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

## Step 6: Push to GitHub

```bash
# For first push
git branch -M main
git push -u origin main

# For subsequent pushes
git push
```

## Alternative: Using SSH (Recommended for Security)

If you have SSH keys set up with GitHub:

```bash
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Important Notes

### ✅ Files That WILL Be Committed:
- ✅ All source code (frontend & backend)
- ✅ README.md and documentation
- ✅ package.json and requirements.txt
- ✅ Configuration files (tailwind.config.js, vite.config.ts, etc.)
- ✅ CRM data files (backend/data/*.json) - Contains demo data

### ⛔ Files That WILL NOT Be Committed (in .gitignore):
- ⛔ node_modules/ (frontend dependencies)
- ⛔ venv/ (Python virtual environment)
- ⛔ .env files (sensitive credentials)
- ⛔ service-account-key.json (Google Cloud credentials)
- ⛔ *.log files
- ⛔ Build outputs (dist/, __pycache__/)

## Before You Push - Security Checklist

1. **Remove Sensitive Data**: Make sure you don't have any API keys or passwords in your code
2. **Check .gitignore**: Verify the .gitignore file is working
3. **Review Files**: Run `git status` to see what will be committed
4. **Test .env.example**: Make sure .env.example has placeholder values, not real credentials

## Verify What Will Be Committed

```bash
# See what files will be added
git status

# See what's ignored
git status --ignored
```

## Common Commands

### Making Changes After Initial Push

```bash
# Check what changed
git status

# Add specific files
git add filename.py

# Or add all changes
git add .

# Commit with message
git commit -m "Description of changes"

# Push to GitHub
git push
```

### Branching for Features

```bash
# Create and switch to new branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push branch to GitHub
git push -u origin feature/new-feature

# Switch back to main
git checkout main
```

## Troubleshooting

### If remote already exists:
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### If you need to undo last commit (before push):
```bash
git reset --soft HEAD~1
```

### If you accidentally committed sensitive data:
```bash
# Remove file from Git but keep locally
git rm --cached path/to/sensitive-file

# Add to .gitignore
echo "path/to/sensitive-file" >> .gitignore

# Commit the change
git add .gitignore
git commit -m "Remove sensitive file from tracking"
```

## Creating a Good README Badge

Once pushed, you can add badges to your README:

```markdown
![Python](https://img.shields.io/badge/python-3.9+-blue.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![FastAPI](https://img.shields.io/badge/fastapi-0.109.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
```

## Next Steps After Pushing

1. **Add Repository Description** on GitHub
2. **Add Topics/Tags**: ai, crm, gemini, fastapi, react, typescript
3. **Enable GitHub Pages** (if you want to host docs)
4. **Set up GitHub Actions** for CI/CD (optional)
5. **Add CONTRIBUTING.md** if you want contributors
6. **Add LICENSE file** (MIT recommended)

## Quick Reference

```bash
# Complete workflow
git init                          # Initialize repo
git add .                         # Stage all files
git commit -m "Your message"      # Commit changes
git remote add origin <url>       # Connect to GitHub
git push -u origin main           # Push to GitHub

# Daily workflow
git pull                          # Get latest changes
git add .                         # Stage changes
git commit -m "Description"       # Commit
git push                          # Push to GitHub
```

## Example First Push Commands

```bash
# All in one go:
cd C:\Users\1038937\Workspace-personal\Hacknation
git init
git add .
git commit -m "Initial commit: Zero-Click CRM - AI-powered CRM with multi-platform integration"
git remote add origin https://github.com/YOUR_USERNAME/zero-click-crm.git
git branch -M main
git push -u origin main
```

---

**Need Help?**
- [GitHub Documentation](https://docs.github.com/en)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Desktop](https://desktop.github.com/) - GUI alternative to command line


