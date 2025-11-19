# DMF MongoDB Atlas Configuration Helper
# This script loads .env.dmf variables and verifies your MongoDB setup

param(
    [string]$Action = "load",
    [string]$MongoPassword = $null
)

$DMF_ROOT = "c:\Users\bigho\source\repos\dmf-music-platform"
$ENV_FILE = Join-Path $DMF_ROOT ".env.dmf"
$ENV_EXAMPLE = Join-Path $DMF_ROOT ".env.dmf.example"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DMF MongoDB Atlas Configuration" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

function Show-Usage {
    Write-Host "Usage: ./dmf_mongo_setup.ps1 -Action <action>" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Actions:" -ForegroundColor Green
    Write-Host "  load      - Load .env.dmf variables into current session" -ForegroundColor White
    Write-Host "  create    - Create .env.dmf template (guides you through setup)" -ForegroundColor White
    Write-Host "  verify    - Test MongoDB Atlas connection" -ForegroundColor White
    Write-Host "  help      - Show this help message" -ForegroundColor White
    Write-Host ""
}

function Test-EnvFile {
    if (-not (Test-Path $ENV_FILE)) {
        Write-Host "⚠️  .env.dmf not found!" -ForegroundColor Yellow
        Write-Host "Run: ./dmf_mongo_setup.ps1 -Action create" -ForegroundColor Cyan
        return $false
    }
    return $true
}

function Load-EnvVariables {
    Write-Host "📂 Loading environment from .env.dmf..." -ForegroundColor Cyan
    
    if (-not (Test-EnvFile)) {
        return $false
    }

    $envContent = Get-Content $ENV_FILE
    $count = 0

    foreach ($line in $envContent) {
        # Skip comments and empty lines
        if ($line.StartsWith("#") -or [string]::IsNullOrWhiteSpace($line)) {
            continue
        }

        # Parse KEY=VALUE or KEY="VALUE"
        if ($line -match '^\s*([^=]+)=(.+)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim().Trim('"')
            
            # Skip the constructed MONGO_URL (requires variable substitution)
            if ($key -eq "MONGO_URL") {
                continue
            }
            
            [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "  ✓ $key" -ForegroundColor Green
            $count++
        }
    }

    # Now construct MONGO_URL from components
    if ($env:DMF_DB_USER -and $env:DMF_DB_PASSWORD -and $env:DMF_DB_HOST -and $env:DMF_DB_NAME) {
        $MONGO_URL = "mongodb+srv://$($env:DMF_DB_USER):$($env:DMF_DB_PASSWORD)@$($env:DMF_DB_HOST)/$($env:DMF_DB_NAME)?retryWrites=true&w=majority"
        [System.Environment]::SetEnvironmentVariable("MONGO_URL", $MONGO_URL, "Process")
        Write-Host "  ✓ MONGO_URL (constructed from components)" -ForegroundColor Green
        $count++
    }

    Write-Host "`n✅ Loaded $count environment variables`n" -ForegroundColor Green
    return $true
}

function Create-EnvFile {
    Write-Host "🔧 Setting up MongoDB Atlas configuration..." -ForegroundColor Cyan
    Write-Host ""

    if (Test-Path $ENV_FILE) {
        Write-Host "⚠️  .env.dmf already exists!" -ForegroundColor Yellow
        $confirm = Read-Host "Overwrite? (y/n)"
        if ($confirm -ne "y") {
            Write-Host "Cancelled." -ForegroundColor Yellow
            return
        }
    }

    # Guided setup
    Write-Host "Enter your MongoDB Atlas credentials:" -ForegroundColor Yellow
    Write-Host ""

    $username = Read-Host "  MongoDB Username (default: bighomiecash8346)"
    if ([string]::IsNullOrWhiteSpace($username)) {
        $username = "bighomiecash8346"
    }

    $password = Read-Host "  MongoDB Password (REAL password, will be stored locally)" -AsSecureString
    $passwordPlain = [System.Net.NetworkCredential]::new("", $password).Password

    if ([string]::IsNullOrWhiteSpace($passwordPlain)) {
        Write-Host "❌ Password cannot be empty!" -ForegroundColor Red
        return
    }

    $dbName = Read-Host "  Database Name (default: dmf_music_platform)"
    if ([string]::IsNullOrWhiteSpace($dbName)) {
        $dbName = "dmf_music_platform"
    }

    $dbHost = Read-Host "  Cluster Host (default: dmf-music-platform.pfqrhc.mongodb.net)"
    if ([string]::IsNullOrWhiteSpace($dbHost)) {
        $dbHost = "dmf-music-platform.pfqrhc.mongodb.net"
    }

    # Create the .env.dmf file
    $envContent = @"
# MongoDB Atlas Configuration (DO NOT COMMIT)
# Created: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

# ===== MONGODB ATLAS CREDENTIALS =====
DMF_DB_USER=$username
DMF_DB_PASSWORD=$passwordPlain
DMF_DB_NAME=$dbName
DMF_DB_HOST=$dbHost

# ===== CONSTRUCTED MONGO URL =====
MONGO_URL="mongodb+srv://$($username):$($passwordPlain)@$($dbHost)/$($dbName)?retryWrites=true&w=majority"

# ===== SERVICE ENDPOINTS =====
LOVABLE_BACKEND_URL=http://localhost:4000
DOTNET_BRAIN_URL=http://localhost:5183
FIREBASE_BACKEND_URL=https://your-firebase-functions-url
PAYMENTS_BACKEND_URL=http://localhost:5200

# ===== GATEWAY =====
DMF_GATEWAY_PORT=5000
DMF_API_KEY=your-secret-api-key-CHANGE-IN-PRODUCTION

# ===== ENVIRONMENT =====
NODE_ENV=development
ENVIRONMENT=local
"@

    Set-Content -Path $ENV_FILE -Value $envContent -Encoding UTF8

    Write-Host ""
    Write-Host "✅ Created .env.dmf" -ForegroundColor Green
    Write-Host "📍 Location: $ENV_FILE" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⚠️  IMPORTANT:" -ForegroundColor Yellow
    Write-Host "   • .env.dmf contains real passwords" -ForegroundColor White
    Write-Host "   • It's in .gitignore (never commit it)" -ForegroundColor White
    Write-Host "   • Keep it safe!" -ForegroundColor White
    Write-Host ""
    Write-Host "Next step: ./dmf_mongo_setup.ps1 -Action load" -ForegroundColor Cyan
}

function Test-MongoDB {
    Write-Host "🧪 Testing MongoDB Atlas connection..." -ForegroundColor Cyan
    Write-Host ""

    if (-not (Load-EnvVariables)) {
        Write-Host "❌ Failed to load environment" -ForegroundColor Red
        return
    }

    if (-not $env:MONGO_URL) {
        Write-Host "❌ MONGO_URL not set" -ForegroundColor Red
        return
    }

    Write-Host "Testing connection string:" -ForegroundColor Yellow
    Write-Host "  mongodb+srv://$($env:DMF_DB_USER):***@$($env:DMF_DB_HOST)/$($env:DMF_DB_NAME)" -ForegroundColor Cyan
    Write-Host ""

    # Try to connect using mongosh if available
    $mongosh = Get-Command mongosh -ErrorAction SilentlyContinue

    if ($mongosh) {
        Write-Host "Running: mongosh --connectionString=\$MONGO_URL --eval 'db.adminCommand(\"ping\")'" -ForegroundColor Gray
        Write-Host ""
        
        $output = mongosh --connectionString=$env:MONGO_URL --eval 'db.adminCommand("ping")' 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ MongoDB Atlas connection successful!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Output:" -ForegroundColor Yellow
            Write-Host $output -ForegroundColor Green
        } else {
            Write-Host "❌ Connection failed" -ForegroundColor Red
            Write-Host ""
            Write-Host "Error:" -ForegroundColor Yellow
            Write-Host $output -ForegroundColor Red
        }
    } else {
        Write-Host "ℹ️  mongosh not found in PATH" -ForegroundColor Yellow
        Write-Host "Install it with: npm install -g mongodb-cli-tools" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Or test manually:" -ForegroundColor Yellow
        Write-Host "  1. Open MongoDB Atlas dashboard: https://cloud.mongodb.com" -ForegroundColor White
        Write-Host "  2. Navigate to: Collections → dmf_music_platform database" -ForegroundColor White
        Write-Host "  3. You should see your data there" -ForegroundColor White
    }

    Write-Host ""
}

# Main logic
switch ($Action) {
    "load" {
        Load-EnvVariables
        Write-Host "💡 Tip: Use \`Get-ChildItem env: | Where-Object Name -like 'DMF*'\` to see all DMF variables" -ForegroundColor Cyan
    }
    "create" {
        Create-EnvFile
    }
    "verify" {
        Test-MongoDB
    }
    "help" {
        Show-Usage
    }
    default {
        Write-Host "❌ Unknown action: $Action`n" -ForegroundColor Red
        Show-Usage
    }
}

Write-Host ""
