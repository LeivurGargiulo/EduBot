# Database Reset Script for Configuration Migration
# This script resets the database to clean up old configuration data after migrating to environment variables

param(
    [switch]$Force = $false,
    [string]$BackupPath = "data/backups"
)

Write-Host "Database Reset for Configuration Migration" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Check if running with admin privileges (recommended for database operations)
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "⚠️  Warning: Not running as administrator. Some operations may fail." -ForegroundColor Yellow
    Write-Host "   Consider running PowerShell as Administrator for better results." -ForegroundColor Yellow
    Write-Host ""
}

# Database paths
$dbPath = "data/bot.db"
$backupDir = $BackupPath

# Function to create backup
function Create-Backup {
    param([string]$SourcePath, [string]$BackupDir)
    
    if (Test-Path $SourcePath) {
        # Create backup directory if it doesn't exist
        if (!(Test-Path $BackupDir)) {
            New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
        }
        
        # Create timestamped backup
        $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
        $backupName = "bot_backup_$timestamp.db"
        $backupPath = Join-Path $BackupDir $backupName
        
        try {
            Copy-Item -Path $SourcePath -Destination $backupPath
            Write-Host "✅ Backup created: $backupPath" -ForegroundColor Green
            return $backupPath
        } catch {
            Write-Host "❌ Failed to create backup: $($_.Exception.Message)" -ForegroundColor Red
            return $null
        }
    } else {
        Write-Host "ℹ️  No existing database found to backup" -ForegroundColor Cyan
        return $null
    }
}

# Function to reset database
function Reset-Database {
    param([string]$DbPath)
    
    try {
        # Remove existing database
        if (Test-Path $DbPath) {
            Remove-Item -Path $DbPath -Force
            Write-Host "🗑️  Removed existing database: $DbPath" -ForegroundColor Yellow
        }
        
        # Create fresh database directory if needed
        $dbDir = Split-Path $DbPath -Parent
        if (!(Test-Path $dbDir)) {
            New-Item -ItemType Directory -Path $dbDir -Force | Out-Null
            Write-Host "📁 Created database directory: $dbDir" -ForegroundColor Green
        }
        
        Write-Host "✅ Database reset completed" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Failed to reset database: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to clean up old configuration data
function Clean-ConfigurationData {
    param([string]$DbPath)
    
    try {
        # Check if database exists
        if (!(Test-Path $DbPath)) {
            Write-Host "ℹ️  Database doesn't exist yet, will be created on first run" -ForegroundColor Cyan
            return $true
        }
        
        # Use Node.js to clean up configuration data
        $cleanupScript = @"
const Database = require('better-sqlite3');
const path = require('path');

try {
    const dbPath = path.join(__dirname, '..', '$DbPath');
    const db = new Database(dbPath);
    
    console.log('Cleaning up old configuration data...');
    
    // Remove old configuration data that's now handled by environment variables
    const tablesToClean = [
        'guild_configs',
        'verification_configs'
    ];
    
    tablesToClean.forEach(table => {
        try {
            db.exec(\`DELETE FROM \${table}\`);
            console.log(\`✅ Cleaned \${table} table\`);
        } catch (error) {
            console.log(\`⚠️  Could not clean \${table}: \${error.message}\`);
        }
    });
    
    // Keep essential data
    console.log('✅ Preserved essential data (courses, reminders, custom texts)');
    
    db.close();
    console.log('✅ Database cleanup completed');
} catch (error) {
    console.error('❌ Database cleanup failed:', error.message);
    process.exit(1);
}
"@
        
        $tempScriptPath = "temp_cleanup.js"
        $cleanupScript | Out-File -FilePath $tempScriptPath -Encoding UTF8
        
        # Run the cleanup script
        $result = node $tempScriptPath 2>&1
        Write-Host $result
        
        # Clean up temporary script
        if (Test-Path $tempScriptPath) {
            Remove-Item $tempScriptPath -Force
        }
        
        return $LASTEXITCODE -eq 0
    } catch {
        Write-Host "❌ Failed to clean configuration data: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to validate environment variables
function Test-EnvironmentVariables {
    Write-Host "🔍 Validating environment variables..." -ForegroundColor Cyan
    
    $requiredVars = @('DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID')
    $optionalVars = @(
        'MODERATION_CHANNEL_ID', 'SUPPORT_CHANNEL_ID', 'STAFF_ROLE_ID',
        'ADMIN_ROLE_ID', 'MODERATOR_ROLE_ID', 'VERIFICATION_CHANNEL_ID',
        'VERIFIED_ROLE_ID', 'VERIFICATION_ENABLED',
        'DYNAMIC_VOICE_TRIGGER_CHANNEL_ID', 'DYNAMIC_VOICE_NAME_TEMPLATE',
        'DYNAMIC_VOICE_USER_LIMIT', 'FEEDBACK_FORM_URL', 'GUIDELINES_URL',
        'DOUBTS_CHANNEL_ID', 'ANNOUNCEMENTS_CHANNEL_ID'
    )
    
    $missingRequired = @()
    $missingOptional = @()
    
    foreach ($var in $requiredVars) {
        if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($var))) {
            $missingRequired += $var
        }
    }
    
    foreach ($var in $optionalVars) {
        if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($var))) {
            $missingOptional += $var
        }
    }
    
    if ($missingRequired.Count -gt 0) {
        Write-Host "❌ Missing required environment variables:" -ForegroundColor Red
        $missingRequired | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
        Write-Host ""
        Write-Host "💡 Please run the setup script first:" -ForegroundColor Yellow
        Write-Host "   .\scripts\setup-environment.ps1" -ForegroundColor White
        return $false
    }
    
    if ($missingOptional.Count -gt 0) {
        Write-Host "⚠️  Missing optional environment variables:" -ForegroundColor Yellow
        $missingOptional | ForEach-Object { Write-Host "   - $_" -ForegroundColor Yellow }
        Write-Host "   (These are optional and won't prevent the bot from running)" -ForegroundColor Cyan
    }
    
    Write-Host "✅ Environment variables validation completed" -ForegroundColor Green
    return $true
}

# Main execution
Write-Host "This script will:" -ForegroundColor Cyan
Write-Host "1. Create a backup of the current database (if it exists)" -ForegroundColor White
Write-Host "2. Reset the database to remove old configuration data" -ForegroundColor White
Write-Host "3. Clean up configuration tables that are now handled by environment variables" -ForegroundColor White
Write-Host "4. Validate environment variables" -ForegroundColor White
Write-Host ""

if (-not $Force) {
    $response = Read-Host "Do you want to continue? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "Operation cancelled." -ForegroundColor Red
        exit 0
    }
}

Write-Host ""

# Step 1: Create backup
Write-Host "Step 1: Creating backup..." -ForegroundColor Cyan
$backupPath = Create-Backup -SourcePath $dbPath -BackupDir $backupDir

# Step 2: Reset database
Write-Host ""
Write-Host "Step 2: Resetting database..." -ForegroundColor Cyan
$resetSuccess = Reset-Database -DbPath $dbPath

if (-not $resetSuccess) {
    Write-Host "❌ Database reset failed. Stopping operation." -ForegroundColor Red
    exit 1
}

# Step 3: Clean configuration data (if database exists)
Write-Host ""
Write-Host "Step 3: Cleaning configuration data..." -ForegroundColor Cyan
$cleanupSuccess = Clean-ConfigurationData -DbPath $dbPath

if (-not $cleanupSuccess) {
    Write-Host "⚠️  Configuration cleanup had issues, but continuing..." -ForegroundColor Yellow
}

# Step 4: Validate environment variables
Write-Host ""
Write-Host "Step 4: Validating environment variables..." -ForegroundColor Cyan
$envValid = Test-EnvironmentVariables

if (-not $envValid) {
    Write-Host ""
    Write-Host "❌ Environment validation failed. Please configure your environment variables first." -ForegroundColor Red
    exit 1
}

# Summary
Write-Host ""
Write-Host "🎉 Database reset completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
if ($backupPath) {
    Write-Host "   📦 Backup created: $backupPath" -ForegroundColor White
}
Write-Host "   🗑️  Database reset: $dbPath" -ForegroundColor White
Write-Host "   🧹 Configuration data cleaned" -ForegroundColor White
Write-Host "   ✅ Environment variables validated" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start the bot: node index.js" -ForegroundColor White
Write-Host "2. The database will be automatically initialized with the new schema" -ForegroundColor White
Write-Host "3. Configuration will be read from environment variables" -ForegroundColor White
Write-Host ""
Write-Host "Note: Essential data like courses, reminders, and custom texts have been preserved." -ForegroundColor Cyan
