# Database Management Script for Discord Bot
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("backup", "restore", "info", "cleanup")]
    [string]$Action = "info",
    
    [Parameter(Mandatory=$false)]
    [string]$BackupPath = "",
    
    [Parameter(Mandatory=$false)]
    [string]$RestorePath = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BotDir = Split-Path -Parent $ScriptDir
$DataDir = Join-Path $BotDir "data"
$DbPath = Join-Path $DataDir "bot.db"
$BackupDir = Join-Path $DataDir "backups"

if (!(Test-Path $DataDir)) {
    New-Item -ItemType Directory -Path $DataDir -Force | Out-Null
    Write-Host "Created data directory: $DataDir"
}

if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    Write-Host "Created backup directory: $BackupDir"
}

function Write-Info {
    param([string]$Message)
    Write-Host "INFO: $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "SUCCESS: $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "WARNING: $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "ERROR: $Message" -ForegroundColor Red
}

function Get-DatabaseInfo {
    Write-Info "Getting database information..."
    
    if (!(Test-Path $DbPath)) {
        Write-Warning "Database file does not exist: $DbPath"
        return
    }
    
    $dbFile = Get-Item $DbPath
    $size = [math]::Round($dbFile.Length / 1MB, 2)
    $lastModified = $dbFile.LastWriteTime
    
    Write-Host "Database Information:" -ForegroundColor White
    Write-Host "  Path: $DbPath"
    Write-Host "  Size: $size MB"
    Write-Host "  Last Modified: $lastModified"
    
    $backups = Get-ChildItem -Path $BackupDir -Filter "bot_backup_*.db" -ErrorAction SilentlyContinue
    if ($backups) {
        Write-Host "Backup files:" -ForegroundColor White
        $backups | Sort-Object LastWriteTime -Descending | Select-Object -First 5 | ForEach-Object {
            $backupSize = [math]::Round($_.Length / 1MB, 2)
            $dateStr = $_.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss')
            Write-Host "  $($_.Name) - $backupSize MB - $dateStr"
        }
    } else {
        Write-Host "No backup files found" -ForegroundColor Yellow
    }
}

function Backup-Database {
    Write-Info "Creating database backup..."
    
    if (!(Test-Path $DbPath)) {
        Write-Error "Database file does not exist: $DbPath"
        return
    }
    
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $backupFileName = "bot_backup_$timestamp.db"
    $backupPath = Join-Path $BackupDir $backupFileName
    
    if ($BackupPath -and $BackupPath -ne "") {
        $backupPath = $BackupPath
    }
    
    try {
        Copy-Item -Path $DbPath -Destination $backupPath -Force
        $backupSize = [math]::Round((Get-Item $backupPath).Length / 1MB, 2)
        Write-Success "Database backed up successfully"
        Write-Host "  Backup location: $backupPath"
        Write-Host "  Backup size: $backupSize MB"
        
        $backups = Get-ChildItem -Path $BackupDir -Filter "bot_backup_*.db" | Sort-Object LastWriteTime -Descending
        if ($backups.Count -gt 10) {
            $oldBackups = $backups | Select-Object -Skip 10
            foreach ($oldBackup in $oldBackups) {
                Remove-Item $oldBackup.FullName -Force
                Write-Info "Removed old backup: $($oldBackup.Name)"
            }
        }
        
    } catch {
        Write-Error "Failed to backup database: $($_.Exception.Message)"
    }
}

function Restore-Database {
    Write-Info "Restoring database from backup..."
    
    if (!$RestorePath -or $RestorePath -eq "") {
        Write-Error "Restore path is required. Use -RestorePath parameter."
        return
    }
    
    if (!(Test-Path $RestorePath)) {
        Write-Error "Backup file does not exist: $RestorePath"
        return
    }
    
    if (Test-Path $DbPath) {
        if (!$Force) {
            Write-Warning "Current database exists. Use -Force to overwrite."
            return
        }
        
        $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
        $preRestoreBackup = Join-Path $BackupDir "pre_restore_backup_$timestamp.db"
        Copy-Item -Path $DbPath -Destination $preRestoreBackup -Force
        Write-Info "Created pre-restore backup: $preRestoreBackup"
    }
    
    try {
        Copy-Item -Path $RestorePath -Destination $DbPath -Force
        Write-Success "Database restored successfully from: $RestorePath"
    } catch {
        Write-Error "Failed to restore database: $($_.Exception.Message)"
    }
}

function Cleanup-Database {
    Write-Info "Cleaning up database..."
    
    if (!(Test-Path $DbPath)) {
        Write-Warning "Database file does not exist: $DbPath"
        return
    }
    
    try {
        $cutoffDate = (Get-Date).AddDays(-30)
        $oldBackups = Get-ChildItem -Path $BackupDir -Filter "bot_backup_*.db" | Where-Object { $_.LastWriteTime -lt $cutoffDate }
        
        if ($oldBackups) {
            foreach ($oldBackup in $oldBackups) {
                Remove-Item $oldBackup.FullName -Force
                Write-Info "Removed old backup: $($oldBackup.Name)"
            }
            Write-Success "Cleaned up $($oldBackups.Count) old backup files"
        } else {
            Write-Info "No old backup files to clean up"
        }
        
        $currentBackups = Get-ChildItem -Path $BackupDir -Filter "bot_backup_*.db"
        Write-Info "Current backup count: $($currentBackups.Count)"
        
    } catch {
        Write-Error "Error during cleanup: $($_.Exception.Message)"
    }
}

Write-Host "Discord Bot Database Management Script" -ForegroundColor White
Write-Host "=====================================" -ForegroundColor White
Write-Host ""

switch ($Action) {
    "info" {
        Get-DatabaseInfo
    }
    "backup" {
        Backup-Database
    }
    "restore" {
        Restore-Database
    }
    "cleanup" {
        Cleanup-Database
    }
    default {
        Write-Error "Unknown action: $Action"
        Write-Host "Available actions: info, backup, restore, cleanup"
    }
}

Write-Host ""
Write-Info "Script completed"
