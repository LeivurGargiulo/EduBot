# Troubleshooting Guide

This guide provides solutions for common issues you may encounter with the Discord bot.

## Table of Contents

1. [Bot Won't Start](#bot-wont-start)
2. [Commands Not Working](#commands-not-working)
3. [Database Issues](#database-issues)
4. [Permission Errors](#permission-errors)
5. [Performance Issues](#performance-issues)
6. [Debugging Tools](#debugging-tools)
7. [Common Error Messages](#common-error-messages)

## Bot Won't Start

### Issue: Missing Environment Variables
**Symptoms:** Bot crashes immediately with "Missing required environment variables"
**Solution:**
1. Check your `.env` file exists in the bot root directory
2. Ensure all required variables are set:
   ```
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   GUILD_ID=your_guild_id_here
   ```
3. Restart the bot after making changes

### Issue: Invalid Bot Token
**Symptoms:** Bot fails to login with authentication errors
**Solution:**
1. Verify your bot token is correct in the Discord Developer Portal
2. Ensure the token hasn't been regenerated
3. Check for extra spaces or characters in the token

### Issue: Missing Dependencies
**Symptoms:** "Cannot find module" errors
**Solution:**
1. Run `npm install` to install all dependencies
2. Check `package.json` for missing dependencies
3. Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`

## Commands Not Working

### Issue: Commands Not Registered
**Symptoms:** Commands don't appear in Discord or return "Unknown interaction"
**Solution:**
1. Run the bot with `npm run dev` to see command deployment logs
2. Check that your bot has the `applications.commands` scope
3. Verify the bot is in the correct guild (for guild commands)
4. Wait up to 1 hour for global commands to propagate

### Issue: Permission Denied
**Symptoms:** "Missing Permissions" errors
**Solution:**
1. Check bot permissions in Discord server settings
2. Ensure bot has required permissions:
   - Send Messages
   - Use Slash Commands
   - Manage Roles (for role commands)
   - Manage Channels (for channel operations)
3. Check role hierarchy - bot's highest role must be above roles it manages

### Issue: Command Cooldown
**Symptoms:** "You are on cooldown" messages
**Solution:**
1. Wait for the cooldown period to expire
2. Check command cooldown settings in the command file
3. Use the debug command to see cooldown status

## Database Issues

### Issue: Database Connection Failed
**Symptoms:** "Database initialization failed" errors
**Solution:**
1. Run `npm run test-db` to test database functionality
2. Check file permissions on the `data` directory
3. Ensure SQLite is properly installed
4. Try deleting `bot.db` and restarting (will recreate database)

### Issue: Database Corruption
**Symptoms:** Unexpected errors or missing data
**Solution:**
1. Create a backup: `npm run db-backup`
2. Restore from a previous backup
3. Run database integrity tests: `npm run test-db-ops`
4. If corruption persists, delete database and reconfigure

### Issue: Missing Database Tables
**Symptoms:** "Table doesn't exist" errors
**Solution:**
1. Run `npm run test-db` to recreate tables
2. Check database initialization logs
3. Ensure the bot has write permissions to the data directory

## Permission Errors

### Issue: Bot Missing Permissions
**Symptoms:** "The bot doesn't have permission" errors
**Solution:**
1. Check bot role permissions in Discord
2. Ensure bot role is above roles it needs to manage
3. Grant additional permissions if needed:
   - Administrator (for full access)
   - Manage Roles
   - Manage Channels
   - Send Messages
   - Use Slash Commands

### Issue: User Missing Permissions
**Symptoms:** "You don't have permission" errors
**Solution:**
1. Check user's roles and permissions
2. Verify staff role configuration
3. Ensure user has required Discord permissions
4. Check role hierarchy

## Performance Issues

### Issue: Slow Command Response
**Symptoms:** Commands take longer than 3 seconds
**Solution:**
1. Use `/debug tipo:performance` to check performance metrics
2. Check system resources (CPU, memory)
3. Review command execution logs
4. Optimize database queries if needed

### Issue: High Memory Usage
**Symptoms:** Bot using excessive memory
**Solution:**
1. Monitor memory usage with `/debug tipo:system`
2. Check for memory leaks in command handlers
3. Restart bot periodically if needed
4. Review and optimize code

### Issue: Rate Limiting
**Symptoms:** "Rate limit" errors
**Solution:**
1. Reduce command usage frequency
2. Implement proper cooldowns
3. Check Discord API rate limits
4. Use guild commands instead of global commands

## Debugging Tools

### Using the Debug Command
The bot includes a comprehensive debug command for administrators:

```bash
/debug tipo:general          # General bot status
/debug tipo:performance      # Performance metrics
/debug tipo:system          # System information
/debug tipo:bot             # Bot status
/debug tipo:errors          # Recent errors
/debug tipo:config          # Configuration status
```

### Running Test Scripts
Use these scripts to test bot functionality:

```bash
# Test all bot functionality
npm run test-bot

# Test with verbose output
npm run test-bot-verbose

# Test specific components
npm run test-bot -TestType database
npm run test-bot -TestType commands
npm run test-bot -TestType events

# Test database operations
npm run test-db-ops
```

### Database Management
Manage your database with these commands:

```bash
# Get database information
npm run db-info

# Create backup
npm run db-backup

# Clean up old backups
npm run db-cleanup
```

## Common Error Messages

### Discord API Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| 10062 | Unknown interaction | Interaction expired, try again |
| 50013 | Missing permissions | Check bot permissions |
| 50001 | Missing access | Bot doesn't have access to resource |
| 10008 | Unknown message | Message was deleted or not found |
| 10003 | Unknown channel | Channel was deleted or bot lost access |
| 50035 | Invalid form body | Check command parameters |

### Database Errors

| Error | Description | Solution |
|-------|-------------|----------|
| "Database initialization failed" | Cannot create/access database | Check permissions and disk space |
| "Table doesn't exist" | Database schema missing | Run database tests to recreate |
| "Foreign key constraint failed" | Invalid data relationships | Check data integrity |

### Permission Errors

| Error | Description | Solution |
|-------|-------------|----------|
| "Missing Permissions" | Bot lacks required permissions | Grant permissions in Discord |
| "Role hierarchy" | Bot role too low | Move bot role higher in hierarchy |
| "No staff permission" | User lacks staff role | Assign staff role or check configuration |

## Getting Help

If you're still experiencing issues:

1. **Check the logs** - Look for error messages in the console
2. **Use debug tools** - Run the debug command and test scripts
3. **Review configuration** - Verify all settings are correct
4. **Check Discord status** - Ensure Discord services are operational
5. **Update dependencies** - Run `npm update` to get latest versions

### Log Files
The bot creates log files in the `logs` directory (if enabled):
- Check for error patterns
- Look for performance issues
- Monitor command usage

### Environment Variables
Ensure these are properly set:
```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
MODERATION_CHANNEL_ID=optional_mod_channel
SUPPORT_CHANNEL_ID=optional_support_channel
LOG_LEVEL=2
ENABLE_FILE_LOGGING=true
```

## Prevention Tips

1. **Regular backups** - Use `npm run db-backup` regularly
2. **Monitor performance** - Use debug commands to check bot health
3. **Test changes** - Run test scripts before deploying updates
4. **Keep dependencies updated** - Regular `npm update`
5. **Monitor logs** - Check for errors and performance issues

## Emergency Procedures

### Bot Not Responding
1. Check if bot process is running
2. Restart the bot
3. Check console for error messages
4. Verify Discord connection

### Database Corruption
1. Stop the bot immediately
2. Create backup of current database
3. Restore from previous backup
4. If no backup, recreate database and reconfigure

### Security Issues
1. Regenerate bot token in Discord Developer Portal
2. Update `.env` file with new token
3. Review bot permissions
4. Check for unauthorized access

