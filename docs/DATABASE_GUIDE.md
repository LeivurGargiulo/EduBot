# Discord Bot Database System Guide

## Overview

The Discord bot now uses `better-sqlite3` for persistent storage, replacing the previous in-memory configuration system. This ensures all bot data (configurations, courses, reminders, etc.) persists across restarts and server reboots.

## Database Structure

### Tables

The database (`data/bot.db`) contains the following tables:

- **`guild_configs`** - Main guild settings and configurations
- **`identity_roles`** - Role assignments and permissions
- **`verification_configs`** - Verification system settings
- **`custom_texts`** - Custom messages and responses
- **`courses`** - Course information and details
- **`course_enrollments`** - Student course enrollments
- **`commissions`** - Commission tracking data
- **`reminders`** - Scheduled reminders and notifications

### File Locations

- **Database**: `Bot/data/bot.db`
- **Backups**: `Bot/data/backups/`
- **Scripts**: `Bot/scripts/`

## Quick Start

### 1. Database Information

Check the current state of your database:

```bash
npm run db-info
```

This will show:
- Database file path and size
- Last modification time
- List of available backups

### 2. Create a Backup

Always backup before making changes:

```bash
npm run db-backup
```

This creates a timestamped backup in `data/backups/` and automatically rotates old backups.

### 3. Test Database Functionality

Run the comprehensive test suite:

```bash
npm run test-db
```

This tests all database operations including configurations, courses, reminders, and backups.

## Management Commands

### Available NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run test-db` | Run database functionality tests |
| `npm run db-info` | Display database information and backup status |
| `npm run db-backup` | Create a timestamped backup |
| `npm run db-cleanup` | Remove old backup files (30+ days) |

### PowerShell Script Options

The `scripts/manage-database.ps1` script supports these actions:

```powershell
# Basic usage
powershell -ExecutionPolicy Bypass -File scripts/manage-database.ps1 -Action <action>

# Available actions:
-Action info      # Show database information
-Action backup    # Create backup
-Action restore   # Restore from backup
-Action cleanup   # Clean old backups
```

## Detailed Usage

### Database Information

```bash
npm run db-info
```

**Output Example:**
```
Discord Bot Database Management Script
=====================================

INFO: Getting database information...
Database Information:
  Path: C:\Users\Leivur\Documents\Documents\Teaching\Discord\Bot\data\bot.db
  Size: 0.09 MB
  Last Modified: 2025-08-05 23:25:00
Backup files:
  bot_backup_2025-08-05_23-24-39.db - 0.09 MB - 2025-08-05 23:22:23

INFO: Script completed
```

### Creating Backups

#### Automatic Backup
```bash
npm run db-backup
```

**Features:**
- Creates timestamped backup: `bot_backup_YYYY-MM-DD_HH-mm-ss.db`
- Automatically keeps only the last 10 backups
- Shows backup location and size

#### Custom Backup Location
```powershell
powershell -ExecutionPolicy Bypass -File scripts/manage-database.ps1 -Action backup -BackupPath "C:\custom\backup\my_backup.db"
```

### Restoring from Backup

```powershell
# Restore with confirmation
powershell -ExecutionPolicy Bypass -File scripts/manage-database.ps1 -Action restore -RestorePath "data/backups/bot_backup_2025-08-05_23-24-39.db"

# Force restore (overwrites existing database)
powershell -ExecutionPolicy Bypass -File scripts/manage-database.ps1 -Action restore -RestorePath "data/backups/bot_backup_2025-08-05_23-24-39.db" -Force
```

**Safety Features:**
- Creates pre-restore backup automatically
- Requires `-Force` flag if current database exists
- Validates backup file existence

### Cleaning Old Backups

```bash
npm run db-cleanup
```

**Features:**
- Removes backups older than 30 days
- Shows count of removed files
- Displays current backup count

## Database Testing

### Running Tests

```bash
npm run test-db
```

**Test Coverage:**
- Database initialization
- Guild configuration storage/retrieval
- Course management
- Reminder system
- Configuration value updates
- Database backup functionality

### Test Output Example

```
🧪 Testing Database Functionality
================================

1. Initializing database...
✅ Database tables created successfully
✅ Database initialized successfully

2. Testing guild configuration...
✅ Test configuration set: Success
✅ Configuration retrieved: Success
  - Moderation channel: 111111111111111111
  - Support channel: 222222222222222222
  - Identity roles count: 2
  - Verification enabled: 1
  - Custom texts count: 1

3. Testing courses...
✅ Course added: ID: 6
✅ Courses retrieved: 6 courses found

4. Testing reminders...
✅ Reminder added: ID: 6
✅ Reminders retrieved: 6 reminders found

🎉 All database tests completed successfully!
```

## Troubleshooting

### Common Issues

#### 1. Database Not Found
**Error:** "Database file does not exist"
**Solution:** Run the bot once to initialize the database, or check if the `data/` directory exists.

#### 2. Permission Errors
**Error:** "Access denied" or "Permission denied"
**Solution:** 
- Ensure you have write permissions to the `Bot/data/` directory
- Run PowerShell as Administrator if needed
- Check file locks (close any applications using the database)

#### 3. PowerShell Execution Policy
**Error:** "Execution policy" related errors
**Solution:** The scripts use `-ExecutionPolicy Bypass` to handle this automatically.

#### 4. Database Corruption
**Symptoms:** Bot crashes or data inconsistencies
**Solution:**
1. Stop the bot
2. Create a backup of the corrupted database
3. Restore from a previous backup
4. Restart the bot

### Recovery Procedures

#### Emergency Database Recovery

1. **Stop the bot immediately**
2. **Create backup of current state:**
   ```bash
   npm run db-backup
   ```
3. **Restore from last known good backup:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/manage-database.ps1 -Action restore -RestorePath "data/backups/bot_backup_YYYY-MM-DD_HH-mm-ss.db" -Force
   ```
4. **Test the database:**
   ```bash
   npm run test-db
   ```
5. **Restart the bot**

#### Data Migration

If you need to migrate from the old in-memory system:

1. The bot automatically migrates data when it starts
2. Old in-memory configurations are preserved as fallback
3. New data is stored in the database
4. No manual migration required

## Best Practices

### Regular Maintenance

1. **Weekly Backups**
   ```bash
   npm run db-backup
   ```

2. **Monthly Cleanup**
   ```bash
   npm run db-cleanup
   ```

3. **Regular Testing**
   ```bash
   npm run test-db
   ```

### Before Updates

1. **Always backup before updates:**
   ```bash
   npm run db-backup
   ```

2. **Test after updates:**
   ```bash
   npm run test-db
   ```

### Monitoring

1. **Check database size regularly:**
   ```bash
   npm run db-info
   ```

2. **Monitor backup count:**
   - Keep at least 5 recent backups
   - Clean up old backups monthly

## Advanced Usage

### Direct PowerShell Commands

```powershell
# Show all available backups
Get-ChildItem "data/backups/" -Filter "bot_backup_*.db" | Sort-Object LastWriteTime -Descending

# Check database file size
(Get-Item "data/bot.db").Length / 1MB

# Manual backup with custom name
Copy-Item "data/bot.db" "data/backups/manual_backup_$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss').db"
```

### Database File Management

- **Location**: `Bot/data/bot.db`
- **Format**: SQLite 3 database
- **Size**: Typically 0.1-1 MB depending on data
- **Backup Format**: Direct file copy (`.db` files)

### Performance Notes

- **WAL Mode**: Enabled for better concurrency
- **Indexes**: Automatically created for performance
- **Memory Usage**: Minimal (SQLite is very efficient)
- **Concurrent Access**: Safe for multiple bot instances

## Support

### Getting Help

1. **Check the logs** for detailed error messages
2. **Run tests** to identify specific issues
3. **Create backups** before troubleshooting
4. **Check file permissions** and disk space

### Log Files

- **Bot logs**: Check console output for database-related messages
- **PowerShell logs**: Use `-Verbose` flag for detailed output
- **Database errors**: Logged to console with ❌ emoji

### Emergency Contacts

- **Database corruption**: Restore from backup
- **Permission issues**: Check file system permissions
- **Performance issues**: Check disk space and file locks

---

## Quick Reference

| Task | Command |
|------|---------|
| Check database status | `npm run db-info` |
| Create backup | `npm run db-backup` |
| Test database | `npm run test-db` |
| Clean old backups | `npm run db-cleanup` |
| Restore from backup | `powershell -ExecutionPolicy Bypass -File scripts/manage-database.ps1 -Action restore -RestorePath "path/to/backup.db" -Force` |

**Remember:** Always backup before making changes!
