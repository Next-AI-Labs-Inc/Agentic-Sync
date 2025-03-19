# Repository Remote Synchronization

This document explains how to keep the personal and organization remotes synchronized.

## Remote Setup

This repository uses multiple remote repositories:

- **origin**: Your personal fork (https://github.com/jryanhaber/tasks.git)
- **organization**: The organization repository (https://github.com/Next-AI-Labs-Inc/tasks.git)

## Synchronizing Changes

To ensure your changes are pushed to both remotes, use the provided sync script:

```bash
# From the repository root
./scripts/sync-remotes.sh
```

Or use the shorthand alias:

```bash
# From the repository root
./scripts/gsync
```

## Manual Push to Both Remotes

If you prefer to push manually, use these commands:

```bash
# Push to origin
git push origin main

# Push to organization
git push organization main
```

## Checking Remote Configuration

To verify your remote configuration:

```bash
# List all remotes
git remote -v

# Expected output should include:
# origin      https://github.com/jryanhaber/tasks.git (fetch)
# origin      https://github.com/jryanhaber/tasks.git (push)
# organization  https://github.com/Next-AI-Labs-Inc/tasks.git (fetch)
# organization  https://github.com/Next-AI-Labs-Inc/tasks.git (push)
```

## Adding a New Remote

If either remote is missing, you can add it with:

```bash
# Add personal remote
git remote add origin https://github.com/jryanhaber/tasks.git

# Add organization remote
git remote add organization https://github.com/Next-AI-Labs-Inc/tasks.git
```

## Troubleshooting

If you encounter issues synchronizing:

1. **Diverged Branches**: If the branches have diverged, you may need to merge changes:
   ```bash
   git pull origin main
   git pull organization main
   # Resolve any conflicts
   git push origin main
   git push organization main
   ```

2. **Authentication Issues**: Ensure you have the correct authentication set up for both remotes.

3. **Permission Issues**: Verify you have write access to both repositories.