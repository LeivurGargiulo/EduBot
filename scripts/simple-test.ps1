# Simple Bot Test Script
Write-Host "Discord Bot Simple Test" -ForegroundColor White
Write-Host "=====================" -ForegroundColor White
Write-Host ""

# Test 1: Check if .env file exists
$envFile = Join-Path (Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)) ".env"
if (Test-Path $envFile) {
    Write-Host "✅ .env file exists" -ForegroundColor Green
} else {
    Write-Host "❌ .env file missing" -ForegroundColor Red
    Write-Host "   Create a .env file with DISCORD_TOKEN, CLIENT_ID, and GUILD_ID" -ForegroundColor Yellow
}

# Test 2: Check if node_modules exists
$nodeModules = Join-Path (Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)) "node_modules"
if (Test-Path $nodeModules) {
    Write-Host "✅ node_modules exists" -ForegroundColor Green
} else {
    Write-Host "❌ node_modules missing - run 'npm install'" -ForegroundColor Red
}

# Test 3: Check if database exists
$dbFile = Join-Path (Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)) "data\bot.db"
if (Test-Path $dbFile) {
    Write-Host "✅ Database file exists" -ForegroundColor Green
} else {
    Write-Host "❌ Database file missing" -ForegroundColor Red
}

# Test 4: Check if index.js exists
$indexFile = Join-Path (Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)) "index.js"
if (Test-Path $indexFile) {
    Write-Host "✅ index.js exists" -ForegroundColor Green
} else {
    Write-Host "❌ index.js missing" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test completed!" -ForegroundColor White

