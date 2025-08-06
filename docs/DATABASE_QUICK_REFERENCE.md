# Database System Quick Reference

## Essential Commands

| Task | Command |
|------|---------|
| **Check database status** | `npm run db-info` |
| **Create backup** | `npm run db-backup` |
| **Test database** | `npm run test-db` |
| **Clean old backups** | `npm run db-cleanup` |

## PowerShell Commands

| Task | Command |
|------|---------|
| **Show database info** | `powershell -ExecutionPolicy Bypass -File scripts/manage-database.ps1 -Action info` |
| **Create backup** | `powershell -ExecutionPolicy Bypass -File scripts/manage-database.ps1 -Action backup` |
| **Restore from backup** | `powershell -ExecutionPolicy Bypass -File scripts/manage-database.ps1 -Action restore -RestorePath "path/to/backup.db" -Force` |
| **Clean old backups** | `powershell -ExecutionPolicy Bypass -File scripts/manage-database.ps1 -Action cleanup` |

## File Locations

- **Database**: `Bot/data/bot.db`
- **Backups**: `Bot/data/backups/`
- **Scripts**: `Bot/scripts/`

## Emergency Recovery

1. **Stop the bot**
2. **Backup current state**: `npm run db-backup`
3. **Restore from backup**: `powershell -ExecutionPolicy Bypass -File scripts/manage-database.ps1 -Action restore -RestorePath "data/backups/bot_backup_YYYY-MM-DD_HH-mm-ss.db" -Force`
4. **Test**: `npm run test-db`
5. **Restart bot**

## Maintenance Schedule

- **Weekly**: `npm run db-backup`
- **Monthly**: `npm run db-cleanup`
- **Before updates**: `npm run db-backup` + `npm run test-db`

## Common Issues

| Issue | Solution |
|-------|----------|
| "Database file does not exist" | Run bot once to initialize |
| "Access denied" | Check file permissions |
| "Execution policy" | Scripts handle this automatically |
| Database corruption | Restore from backup |

## Database Tables

- `guild_configs` - Guild settings
- `identity_roles` - Role assignments  
- `verification_configs` - Verification settings
- `custom_texts` - Custom messages
- `courses` - Course data
- `course_enrollments` - Student enrollments
- `commissions` - Commission tracking
- `reminders` - Scheduled reminders

---

**⚠️ Always backup before making changes!**
