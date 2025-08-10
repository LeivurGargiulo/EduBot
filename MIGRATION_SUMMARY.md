# Configuration Migration Summary

## Overview
This document summarizes the migration from dynamic configuration commands to environment variables for the Discord bot.

## Changes Made

### 1. Environment Variables Setup

#### Created `.env.example`
- Added all new environment variables for bot configuration
- Organized by category (bot channels, staff roles, verification, voice, etc.)
- Includes both required and optional variables
- **Note:** Verification text content (title, description, button text) moved to embed strings for better maintainability

#### New Environment Variables
```
# Bot Channels Configuration
MODERATION_CHANNEL_ID=your_moderation_channel_id_here
SUPPORT_CHANNEL_ID=your_support_channel_id_here

# Staff Roles Configuration
STAFF_ROLE_ID=your_staff_role_id_here
ADMIN_ROLE_ID=your_admin_role_id_here
MODERATOR_ROLE_ID=your_moderator_role_id_here

# Verification System Configuration
VERIFICATION_CHANNEL_ID=your_verification_channel_id_here
VERIFIED_ROLE_ID=your_verified_role_id_here
VERIFICATION_ENABLED=true

# Voice Configuration
DYNAMIC_VOICE_TRIGGER_CHANNEL_ID=your_dynamic_voice_trigger_channel_id_here
DYNAMIC_VOICE_NAME_TEMPLATE=Canal de {usuario}
DYNAMIC_VOICE_USER_LIMIT=0

# Optional Configuration
FEEDBACK_FORM_URL=your_feedback_form_url_here
GUIDELINES_URL=your_guidelines_url_here
DOUBTS_CHANNEL_ID=your_doubts_channel_id_here
ANNOUNCEMENTS_CHANNEL_ID=your_announcements_channel_id_here
```

### 2. Configuration Manager Updates

#### Updated `utils/configManager.js`
- Added new methods for environment variable access:
  - `getVerificationChannelId()`
  - `getVerifiedRoleId()`
  - `getVerificationTitle()`
  - `getVerificationDescription()`
  - `getVerificationButtonText()`
  - `isVerificationEnabledFromEnv()`
  - `getDynamicVoiceTriggerChannelId()`
  - `getDynamicVoiceNameTemplate()`
  - `getDynamicVoiceUserLimit()`

- Updated existing methods to use environment variables:
  - `getStaffRoleId()` - now uses `STAFF_ROLE_ID` instead of `SUPPORT_STAFF_ROLE_ID`
  - `getVerificationConfig()` - merges database, environment variables, and embed strings
  - `isVerificationEnabled()` - checks both database and environment
  - `getVerificationTitle()`, `getVerificationDescription()`, `getVerificationButtonText()` - now use embed strings with custom text fallback

### 3. Event Handler Updates

#### Updated `events/voiceStateUpdate.js`
- Modified to read voice configuration from environment variables
- Maintains backward compatibility with existing dynamic configuration
- Automatically initializes configuration from environment variables

#### Updated `events/interactionCreate.js`
- Modified verification interaction handler to use new environment variable methods
- Updated to use `getVerificationConfig()` instead of direct database access

### 4. Command Updates

#### Updated `commands/admin/sendVerification.js`
- Changed to use the updated configManager methods
- Now uses `getVerificationConfig()` for consistent configuration access

#### Deleted `commands/admin/configuration.js`
- Removed the dynamic configuration command as requested
- All configuration now handled through environment variables

### 5. Database Schema Updates

#### Updated `utils/databaseManager.js`
- Simplified database schema:
  - Removed `guild_configs` table (replaced by environment variables)
  - Removed `verification_configs` table (replaced by environment variables)
  - Renamed to `guilds` table (simplified structure)
  - Updated foreign key references

- Updated methods:
  - `getGuildConfig()` - simplified to only return essential data
  - `setGuildConfig()` - simplified to only handle essential data
  - Preserved identity roles and custom texts functionality

### 6. Main Application Updates

#### Updated `index.js`
- Added new environment variables to validation list
- Updated optional variables list to include all new configuration options

### 7. Setup and Reset Scripts

#### Created `scripts/setup-environment.ps1`
- Interactive PowerShell script for environment setup
- Validates Discord IDs, URLs, and other inputs
- Generates complete `.env` file
- User-friendly interface with defaults and validation

#### Created `scripts/reset-database.ps1`
- PowerShell script for database reset
- Creates backup before reset
- Cleans up old configuration data
- Validates environment variables
- Preserves essential data

#### Created `scripts/reset-database.js`
- Node.js alternative for database reset
- Same functionality as PowerShell version
- Can be run with `--force` flag for non-interactive mode

### 8. Documentation Updates

#### Updated `README.md`
- Added migration section explaining changes
- Updated installation instructions
- Documented new environment variables
- Added database reset instructions
- Updated command documentation

## Commands Replaced

| Old Command | New Configuration Method |
|-------------|---------------------------|
| `/configuracion bot canales` | `MODERATION_CHANNEL_ID`, `SUPPORT_CHANNEL_ID` |
| `/configuracion roles staff` | `STAFF_ROLE_ID`, `ADMIN_ROLE_ID`, `MODERATOR_ROLE_ID` |
| `/configuracion roles verificacion` | `VERIFICATION_CHANNEL_ID`, `VERIFIED_ROLE_ID` (text in embed strings) |
| `/configuracion voz configurar` | `DYNAMIC_VOICE_TRIGGER_CHANNEL_ID`, etc. |

## Benefits of Migration

1. **Stability**: Configuration is now persistent and won't be lost on bot restart
2. **Version Control**: Configuration can be versioned with Git
3. **Easy Backup**: Simple text file configuration
4. **Consistent Deployment**: Same configuration across different environments
5. **Better Security**: Sensitive configuration in environment variables
6. **Simplified Management**: No need for complex database configuration

## Migration Steps

1. **Setup Environment Variables**:
   ```powershell
   .\scripts\setup-environment.ps1
   ```

2. **Reset Database** (optional but recommended):
   ```powershell
   .\scripts\reset-database.ps1
   ```

3. **Start the Bot**:
   ```bash
   node index.js
   ```

## Data Preservation

The migration preserves all essential data:
- ✅ Courses and enrollments
- ✅ Reminders and scheduled tasks
- ✅ Custom texts and messages
- ✅ Identity roles
- ✅ User data

Only configuration data that's now handled by environment variables was removed.

## Backward Compatibility

The system maintains backward compatibility:
- Existing dynamic voice configuration continues to work
- Database fallback for missing environment variables
- Gradual migration support

## Testing

To test the migration:
1. Run the setup script to configure environment variables
2. Reset the database to clean up old configuration
3. Start the bot and verify all features work correctly
4. Check that configuration is read from environment variables

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**: Run the setup script
2. **Database Errors**: Reset the database using the provided scripts
3. **Configuration Not Working**: Check environment variable names and values
4. **Permission Errors**: Ensure the bot has necessary Discord permissions

### Support

For issues related to the migration:
1. Check the backup created by the reset script
2. Verify environment variables are correctly set
3. Review the logs for specific error messages
4. Consult the updated documentation
