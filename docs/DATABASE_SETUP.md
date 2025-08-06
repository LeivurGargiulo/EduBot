# Database System Setup Guide

## First Time Setup

### Prerequisites

- Node.js installed
- PowerShell available (Windows)
- Write permissions to the `Bot/data/` directory

### Initial Setup

1. **Navigate to the Bot directory:**
   ```bash
   cd Bot
   ```

2. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

3. **Start the bot once to initialize the database:**
   ```bash
   npm start
   ```
   *Note: The database will be created automatically on first run*

4. **Stop the bot** (Ctrl+C) after it starts successfully

### Verify Installation

1. **Check database status:**
   ```bash
   npm run db-info
   ```

2. **Run database tests:**
   ```bash
   npm run test-db
   ```

3. **Create your first backup:**
   ```bash
   npm run db-backup
   ```

## What Gets Created

### Directory Structure
```
Bot/
├── data/
│   ├── bot.db              # Main database file
│   └── backups/            # Backup directory
├── scripts/
│   ├── manage-database.ps1 # PowerShell management script
│   └── test-database.js    # Database test script
└── docs/
    ├── DATABASE_GUIDE.md   # Complete guide
    ├── DATABASE_SETUP.md   # This file
    └── DATABASE_QUICK_REFERENCE.md # Quick reference
```

### Database Tables
The following tables are automatically created:

- **guild_configs** - Bot configuration settings
- **identity_roles** - Discord role assignments
- **verification_configs** - User verification settings
- **custom_texts** - Custom bot messages
- **courses** - Course information
- **course_enrollments** - Student enrollments
- **commissions** - Commission tracking
- **reminders** - Scheduled reminders

## Next Steps

### 1. Configure Your Bot

The bot will now store all configurations persistently. Your settings will survive restarts and server reboots.

### 2. Set Up Regular Backups

Add these commands to your maintenance routine:

```bash
# Weekly backup
npm run db-backup

# Monthly cleanup
npm run db-cleanup
```

### 3. Monitor Database Health

Regularly check your database:

```bash
# Check status
npm run db-info

# Test functionality
npm run test-db
```

## Troubleshooting

### Database Won't Initialize

**Symptoms:** Bot fails to start or database errors appear

**Solutions:**
1. Check file permissions on `Bot/data/` directory
2. Ensure Node.js and npm are properly installed
3. Run `npm install` to ensure all dependencies are installed
4. Check available disk space

### Permission Errors

**Symptoms:** "Access denied" or "Permission denied" errors

**Solutions:**
1. Run PowerShell as Administrator
2. Check folder permissions on `Bot/data/`
3. Ensure no other applications are using the database file

### PowerShell Issues

**Symptoms:** PowerShell execution policy errors

**Solutions:**
1. The scripts use `-ExecutionPolicy Bypass` automatically
2. If issues persist, run PowerShell as Administrator
3. Check if PowerShell is available on your system

## Migration from Old System

If you're upgrading from the previous in-memory system:

1. **No manual migration needed** - the bot handles this automatically
2. **Old configurations are preserved** as fallback
3. **New data is stored in the database**
4. **Gradual migration** - data moves to database as it's accessed

## Support

### Getting Help

1. **Check the complete guide:** `docs/DATABASE_GUIDE.md`
2. **Use the quick reference:** `docs/DATABASE_QUICK_REFERENCE.md`
3. **Run tests to diagnose issues:** `npm run test-db`
4. **Check bot logs** for detailed error messages

### Common Commands Reference

| Task | Command |
|------|---------|
| Check status | `npm run db-info` |
| Create backup | `npm run db-backup` |
| Test system | `npm run test-db` |
| Clean backups | `npm run db-cleanup` |

---

**✅ Setup Complete!** Your bot now has persistent storage with automatic backups and management tools.
