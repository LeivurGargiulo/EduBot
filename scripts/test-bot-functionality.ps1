# Comprehensive Bot Functionality Test Script
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("all", "database", "commands", "events", "health", "permissions")]
    [string]$TestType = "all",
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose,
    
    [Parameter(Mandatory=$false)]
    [switch]$FixIssues
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BotDir = Split-Path -Parent $ScriptDir
$DataDir = Join-Path $BotDir "data"
$CommandsDir = Join-Path $BotDir "commands"
$EventsDir = Join-Path $BotDir "events"
$UtilsDir = Join-Path $BotDir "utils"

# Test results tracking
$TestResults = @{
    Total = 0
    Passed = 0
    Failed = 0
    Warnings = 0
    Issues = @()
}

function Write-TestResult {
    param(
        [string]$TestName,
        [string]$Status, # "PASS", "FAIL", "WARN"
        [string]$Message,
        [string]$Details = ""
    )
    
    $TestResults.Total++
    
    switch ($Status) {
        "PASS" { 
            Write-Host "✅ $TestName" -ForegroundColor Green
            $TestResults.Passed++
        }
        "FAIL" { 
            Write-Host "❌ $TestName" -ForegroundColor Red
            $TestResults.Failed++
            $TestResults.Issues += "$TestName - $Message"
        }
        "WARN" { 
            Write-Host "⚠️ $TestName" -ForegroundColor Yellow
            $TestResults.Warnings++
        }
    }
    
    if ($Message) {
        Write-Host "   $Message" -ForegroundColor Gray
    }
    
    if ($Details -and $Verbose) {
        Write-Host "   Details: $Details" -ForegroundColor DarkGray
    }
}

function Test-EnvironmentVariables {
    Write-Host "`n🔧 Testing Environment Variables..." -ForegroundColor Cyan
    
    $requiredVars = @("DISCORD_TOKEN", "CLIENT_ID", "GUILD_ID")
    $optionalVars = @("MODERATION_CHANNEL_ID", "SUPPORT_CHANNEL_ID", "SUPPORT_STAFF_ROLE_ID", "ADMIN_ROLE_ID", "MODERATOR_ROLE_ID")
    
    foreach ($var in $requiredVars) {
        if ([Environment]::GetEnvironmentVariable($var)) {
            Write-TestResult "Required ENV: $var" "PASS" "Variable is set"
        } else {
            Write-TestResult "Required ENV: $var" "FAIL" "Variable is missing"
        }
    }
    
    foreach ($var in $optionalVars) {
        if ([Environment]::GetEnvironmentVariable($var)) {
            Write-TestResult "Optional ENV: $var" "PASS" "Variable is set"
        } else {
            Write-TestResult "Optional ENV: $var" "WARN" "Variable is not set (optional)"
        }
    }
}

function Test-NodeModules {
    Write-Host "`n📦 Testing Node Modules..." -ForegroundColor Cyan
    
    $packageJsonPath = Join-Path $BotDir "package.json"
    if (Test-Path $packageJsonPath) {
        Write-TestResult "Package.json" "PASS" "Found package.json"
        
        $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
        $requiredDeps = @("discord.js", "better-sqlite3", "dotenv")
        
        foreach ($dep in $requiredDeps) {
            if ($packageJson.dependencies.$dep) {
                Write-TestResult "Dependency: $dep" "PASS" "Version: $($packageJson.dependencies.$dep)"
            } else {
                Write-TestResult "Dependency: $dep" "FAIL" "Missing required dependency"
            }
        }
    } else {
        Write-TestResult "Package.json" "FAIL" "package.json not found"
    }
    
    $nodeModulesPath = Join-Path $BotDir "node_modules"
    if (Test-Path $nodeModulesPath) {
        Write-TestResult "Node Modules" "PASS" "node_modules directory exists"
    } else {
        Write-TestResult "Node Modules" "FAIL" "node_modules directory missing - run 'npm install'"
    }
}

function Test-DatabaseStructure {
    Write-Host "`n🗄️ Testing Database Structure..." -ForegroundColor Cyan
    
    $dbPath = Join-Path $DataDir "bot.db"
    
    if (Test-Path $dbPath) {
        Write-TestResult "Database File" "PASS" "Database file exists"
        
        $dbSize = (Get-Item $dbPath).Length
        if ($dbSize -gt 0) {
            $sizeKB = [math]::Round($dbSize/1KB, 2)
            $message = "Database is not empty " + $sizeKB + " KB"
            Write-TestResult "Database Size" "PASS" $message
        } else {
            Write-TestResult "Database Size" "WARN" "Database file is empty"
        }
        
        # Test database connection and structure
        try {
            $testScript = @'
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'bot.db');
const db = new Database(dbPath);

// Test basic operations
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('TABLES_FOUND:', tables.length);

const expectedTables = ['guild_configs', 'identity_roles', 'verification_configs', 'custom_texts', 'courses', 'course_enrollments', 'commissions', 'reminders'];
const foundTables = tables.map(t => t.name);

expectedTables.forEach(table => {
    if (foundTables.includes(table)) {
        console.log('TABLE_OK:', table);
    } else {
        console.log('TABLE_MISSING:', table);
    }
});

db.close();
'@
            
            $testScriptPath = Join-Path $BotDir "temp_db_test.js"
            $testScript | Out-File -FilePath $testScriptPath -Encoding UTF8
            
            $output = node $testScriptPath 2>&1
            Remove-Item $testScriptPath -Force
            
            if ($LASTEXITCODE -eq 0) {
                $tableCount = ($output | Select-String "TABLES_FOUND:").ToString().Split(":")[1].Trim()
                Write-TestResult "Database Tables" "PASS" "Found $tableCount tables"
                
                $missingTables = $output | Select-String "TABLE_MISSING:" | ForEach-Object { $_.ToString().Split(":")[1].Trim() }
                if ($missingTables) {
                    Write-TestResult "Missing Tables" "WARN" "Missing: $($missingTables -join ', ')"
                } else {
                    Write-TestResult "Table Structure" "PASS" "All expected tables present"
                }
            } else {
                Write-TestResult "Database Connection" "FAIL" "Failed to connect to database"
            }
        } catch {
            Write-TestResult "Database Test" "FAIL" "Error testing database: $($_.Exception.Message)"
        }
    } else {
        Write-TestResult "Database File" "FAIL" "Database file not found"
    }
}

function Test-CommandStructure {
    Write-Host "`n⚙️ Testing Command Structure..." -ForegroundColor Cyan
    
    $commandCategories = @("admin", "community", "education", "moderation", "utility")
    
    foreach ($category in $commandCategories) {
        $categoryPath = Join-Path $CommandsDir $category
        
        if (Test-Path $categoryPath) {
            Write-TestResult "Category: $category" "PASS" "Directory exists"
            
            $commandFiles = Get-ChildItem -Path $categoryPath -Filter "*.js"
            if ($commandFiles.Count -gt 0) {
                Write-TestResult "Commands in $category" "PASS" "Found $($commandFiles.Count) commands"
                
                foreach ($file in $commandFiles) {
                    $filePath = $file.FullName
                    $content = Get-Content $filePath -Raw
                    
                    # Test command structure
                    if ($content -match "module\.exports\s*=") {
                        Write-TestResult "  $($file.Name)" "PASS" "Valid module export"
                        
                        # Check for required properties
                        if ($content -match "data:\s*new\s+SlashCommandBuilder") {
                            Write-TestResult "    SlashCommandBuilder" "PASS" "Uses SlashCommandBuilder"
                        } else {
                            Write-TestResult "    SlashCommandBuilder" "FAIL" "Missing SlashCommandBuilder"
                        }
                        
                        if ($content -match "execute:\s*async") {
                            Write-TestResult "    Execute Function" "PASS" "Has async execute function"
                        } else {
                            Write-TestResult "    Execute Function" "FAIL" "Missing execute function"
                        }
                    } else {
                        Write-TestResult "  $($file.Name)" "FAIL" "Invalid module structure"
                    }
                }
            } else {
                Write-TestResult "Commands in $category" "WARN" "No commands found"
            }
        } else {
            Write-TestResult "Category: $category" "FAIL" "Directory missing"
        }
    }
}

function Test-EventStructure {
    Write-Host "`n🎯 Testing Event Structure..." -ForegroundColor Cyan
    
    if (Test-Path $EventsDir) {
        Write-TestResult "Events Directory" "PASS" "Events directory exists"
        
        $eventFiles = Get-ChildItem -Path $EventsDir -Filter "*.js"
        if ($eventFiles.Count -gt 0) {
            Write-TestResult "Event Files" "PASS" "Found $($eventFiles.Count) event files"
            
            $expectedEvents = @("ready.js", "interactionCreate.js", "guildMemberAdd.js", "voiceStateUpdate.js")
            
            foreach ($expectedEvent in $expectedEvents) {
                $eventPath = Join-Path $EventsDir $expectedEvent
                if (Test-Path $eventPath) {
                    Write-TestResult "  $expectedEvent" "PASS" "Event file exists"
                    
                    $content = Get-Content $eventPath -Raw
                    if ($content -match "module\.exports\s*=") {
                        Write-TestResult "    Structure" "PASS" "Valid module structure"
                    } else {
                        Write-TestResult "    Structure" "FAIL" "Invalid module structure"
                    }
                } else {
                    Write-TestResult "  $expectedEvent" "WARN" "Event file missing"
                }
            }
        } else {
            Write-TestResult "Event Files" "FAIL" "No event files found"
        }
    } else {
        Write-TestResult "Events Directory" "FAIL" "Events directory missing"
    }
}

function Test-UtilityFiles {
    Write-Host "`n🛠️ Testing Utility Files..." -ForegroundColor Cyan
    
    $requiredUtils = @("databaseManager.js", "configManager.js", "errorHandler.js", "logger.js", "permissions.js", "reminderSystem.js")
    
    foreach ($util in $requiredUtils) {
        $utilPath = Join-Path $UtilsDir $util
        if (Test-Path $utilPath) {
            Write-TestResult "Utility: $util" "PASS" "Utility file exists"
            
            $content = Get-Content $utilPath -Raw
            if ($content -match "module\.exports\s*=") {
                Write-TestResult "  Structure" "PASS" "Valid module export"
            } else {
                Write-TestResult "  Structure" "FAIL" "Invalid module structure"
            }
        } else {
            Write-TestResult "Utility: $util" "FAIL" "Utility file missing"
        }
    }
}

function Test-MainFiles {
    Write-Host "`n📁 Testing Main Files..." -ForegroundColor Cyan
    
    $mainFiles = @("index.js", "package.json", "README.md")
    
    foreach ($file in $mainFiles) {
        $filePath = Join-Path $BotDir $file
        if (Test-Path $filePath) {
            Write-TestResult "Main File: $file" "PASS" "File exists"
        } else {
            Write-TestResult "Main File: $file" "FAIL" "File missing"
        }
    }
}

function Test-SyntaxErrors {
    Write-Host "`n🔍 Testing for Syntax Errors..." -ForegroundColor Cyan
    
    $jsFiles = Get-ChildItem -Path $BotDir -Recurse -Filter "*.js" | Where-Object { $_.FullName -notlike "*node_modules*" }
    
    foreach ($file in $jsFiles) {
        try {
            $output = node -c $file.FullName 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-TestResult "Syntax: $($file.Name)" "PASS" "No syntax errors"
            } else {
                Write-TestResult "Syntax: $($file.Name)" "FAIL" "Syntax error found"
                if ($Verbose) {
                    Write-Host "   Error: $output" -ForegroundColor Red
                }
            }
        } catch {
            Write-TestResult "Syntax: $($file.Name)" "FAIL" "Error checking syntax: $($_.Exception.Message)"
        }
    }
}

function Test-BotStartup {
    Write-Host "`n🚀 Testing Bot Startup..." -ForegroundColor Cyan
    
    $indexPath = Join-Path $BotDir "index.js"
    if (Test-Path $indexPath) {
        try {
            # Test if the bot can be required without errors
            $testScript = @'
try {
    require('./index.js');
    console.log('STARTUP_OK');
} catch (error) {
    console.log('STARTUP_ERROR:', error.message);
}
'@
            
            $testScriptPath = Join-Path $BotDir "temp_startup_test.js"
            $testScript | Out-File -FilePath $testScriptPath -Encoding UTF8
            
            $output = node $testScriptPath 2>&1
            Remove-Item $testScriptPath -Force
            
            if ($output -match "STARTUP_OK") {
                Write-TestResult "Bot Startup" "PASS" "Bot can be loaded without errors"
            } else {
                $startupError = ($output | Select-String "STARTUP_ERROR:").ToString().Split(":")[1].Trim()
                Write-TestResult "Bot Startup" "FAIL" "Startup error: $startupError"
            }
        } catch {
            Write-TestResult "Bot Startup" "FAIL" "Error testing startup: $($_.Exception.Message)"
        }
    } else {
        Write-TestResult "Bot Startup" "FAIL" "index.js not found"
    }
}

function Show-TestSummary {
    Write-Host "`n📊 Test Summary" -ForegroundColor White
    Write-Host "==============" -ForegroundColor White
    Write-Host "Total Tests: $($TestResults.Total)" -ForegroundColor White
    Write-Host "✅ Passed: $($TestResults.Passed)" -ForegroundColor Green
    Write-Host "❌ Failed: $($TestResults.Failed)" -ForegroundColor Red
    Write-Host "⚠️ Warnings: $($TestResults.Warnings)" -ForegroundColor Yellow
    
    if ($TestResults.Failed -eq 0 -and $TestResults.Warnings -eq 0) {
        Write-Host "`n🎉 All tests passed! Bot is ready to run." -ForegroundColor Green
    } elseif ($TestResults.Failed -eq 0) {
        Write-Host "`n⚠️ Tests completed with warnings. Bot should work but check warnings." -ForegroundColor Yellow
    } else {
        Write-Host "`n❌ Tests failed. Please fix the issues before running the bot." -ForegroundColor Red
        
        if ($TestResults.Issues.Count -gt 0) {
            Write-Host "`nIssues found:" -ForegroundColor Red
            foreach ($issue in $TestResults.Issues) {
                Write-Host "  • $issue" -ForegroundColor Red
            }
        }
    }
}

# Main execution
Write-Host "Discord Bot Functionality Test Suite" -ForegroundColor White
Write-Host "===================================" -ForegroundColor White
Write-Host ""

switch ($TestType) {
    "all" {
        Test-EnvironmentVariables
        Test-NodeModules
        Test-DatabaseStructure
        Test-CommandStructure
        Test-EventStructure
        Test-UtilityFiles
        Test-MainFiles
        Test-SyntaxErrors
        Test-BotStartup
    }
    "database" {
        Test-DatabaseStructure
    }
    "commands" {
        Test-CommandStructure
    }
    "events" {
        Test-EventStructure
    }
    "health" {
        Test-EnvironmentVariables
        Test-NodeModules
        Test-MainFiles
        Test-SyntaxErrors
        Test-BotStartup
    }
    "permissions" {
        Test-EnvironmentVariables
        Test-CommandStructure
        Test-EventStructure
    }
}

Show-TestSummary
