# Discord Bot Database Documentation

## Overview

This directory contains comprehensive documentation for the Discord bot's new persistent database system using `better-sqlite3`. The system replaces the previous in-memory configuration storage with a robust, persistent SQLite database.

## Documentation Files

### 📖 [Complete Database Guide](DATABASE_GUIDE.md)
The comprehensive guide covering all aspects of the database system:
- Database structure and tables
- Management commands and scripts
- Detailed usage examples
- Troubleshooting and recovery procedures
- Best practices and maintenance schedules

### 🚀 [Setup Guide](DATABASE_SETUP.md)
Quick start guide for new users:
- First-time setup instructions
- Prerequisites and installation
- Verification steps
- Migration from old system

### 📋 [Quick Reference](DATABASE_QUICK_REFERENCE.md)
Concise reference card with:
- Essential commands
- Emergency procedures
- Common issues and solutions
- Maintenance schedules

## Quick Start

1. **Check database status:**
   ```bash
   npm run db-info
   ```

2. **Create a backup:**
   ```bash
   npm run db-backup
   ```

3. **Test the system:**
   ```bash
   npm run test-db
   ```

## Key Features

- ✅ **Persistent Storage** - All bot data survives restarts
- ✅ **Automatic Backups** - Timestamped backups with rotation
- ✅ **Easy Management** - Simple NPM commands and PowerShell scripts
- ✅ **Robust Recovery** - Comprehensive backup and restore procedures
- ✅ **Testing Tools** - Built-in test suite for validation
- ✅ **Fallback Support** - Graceful degradation if database unavailable

## Database Tables

| Table | Purpose |
|-------|---------|
| `guild_configs` | Main guild settings and configurations |
| `identity_roles` | Role assignments and permissions |
| `verification_configs` | Verification system settings |
| `custom_texts` | Custom messages and responses |
| `courses` | Course information and details |
| `course_enrollments` | Student course enrollments |
| `commissions` | Commission tracking data |
| `reminders` | Scheduled reminders and notifications |

## Management Commands

| Command | Description |
|---------|-------------|
| `npm run test-db` | Run database functionality tests |
| `npm run db-info` | Display database information and backup status |
| `npm run db-backup` | Create a timestamped backup |
| `npm run db-cleanup` | Remove old backup files (30+ days) |

## File Structure

```
Bot/
├── data/
│   ├── bot.db              # Main database file
│   └── backups/            # Backup directory
├── scripts/
│   ├── manage-database.ps1 # PowerShell management script
│   └── test-database.js    # Database test script
└── docs/
    ├── README.md           # This file
    ├── DATABASE_GUIDE.md   # Complete guide
    ├── DATABASE_SETUP.md   # Setup guide
    └── DATABASE_QUICK_REFERENCE.md # Quick reference
```

## Getting Help

1. **Start with the [Setup Guide](DATABASE_SETUP.md)** if you're new to the system
2. **Use the [Quick Reference](DATABASE_QUICK_REFERENCE.md)** for daily operations
3. **Consult the [Complete Guide](DATABASE_GUIDE.md)** for detailed information
4. **Run tests** to diagnose issues: `npm run test-db`

## Emergency Procedures

### Database Corruption
1. Stop the bot
2. Create backup: `npm run db-backup`
3. Restore from backup: `powershell -ExecutionPolicy Bypass -File scripts/manage-database.ps1 -Action restore -RestorePath "data/backups/bot_backup_YYYY-MM-DD_HH-mm-ss.db" -Force`
4. Test: `npm run test-db`
5. Restart bot

### Permission Issues
1. Run PowerShell as Administrator
2. Check file permissions on `Bot/data/` directory
3. Ensure no other applications are using the database

## Maintenance Schedule

- **Weekly**: Create backup (`npm run db-backup`)
- **Monthly**: Clean old backups (`npm run db-cleanup`)
- **Before updates**: Backup + test (`npm run db-backup` + `npm run test-db`)

---

**⚠️ Always backup before making changes!**

For detailed information, see the [Complete Database Guide](DATABASE_GUIDE.md).
