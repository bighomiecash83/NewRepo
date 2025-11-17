#!/usr/bin/env pwsh
<#
.SYNOPSIS
DMF Music Platform Publish Script
Builds and publishes the app for Windows EXE or Docker deployment

.PARAMETER Target
Target output: 'win' (Windows x64 EXE) or 'docker' (Docker image)

.PARAMETER Version
Version number for Docker image (default: latest)

.EXAMPLE
./dmf_publish.ps1 -Target win
./dmf_publish.ps1 -Target docker -Version 1.0.0
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("win", "docker")]
    [string]$Target,
    
    [string]$Version = "latest"
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent
$projRoot = $scriptDir
$webProjPath = Join-Path $projRoot "dmf-music-platform.Web"
$publishDir = Join-Path $projRoot "publish"

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "DMF Music Platform Publisher" -ForegroundColor Cyan
Write-Host "Target: $Target | Version: $Version" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# Clean publish directory
if (Test-Path $publishDir) {
    Write-Host "Cleaning publish directory..." -ForegroundColor Yellow
    Remove-Item -Path $publishDir -Recurse -Force | Out-Null
}
New-Item -ItemType Directory -Path $publishDir -Force | Out-Null

if ($Target -eq "win") {
    Write-Host "📦 Building Windows x64 self-contained executable..." -ForegroundColor Green
    
    $winPublishDir = Join-Path $publishDir "win-x64"
    
    & dotnet publish `
        -c Release `
        -o $winPublishDir `
        -r win-x64 `
        --self-contained `
        -p:PublishTrimmed=false `
        -p:PublishSingleFile=true `
        -p:SelfContained=true `
        -p:IncludeNativeLibrariesForSelfExtract=true `
        $webProjPath
    
    if ($LASTEXITCODE -eq 0) {
        $exePath = Join-Path $winPublishDir "dmf-music-platform.Web.exe"
        Write-Host "`n✅ Windows EXE created successfully!`n" -ForegroundColor Green
        Write-Host "Location: $exePath" -ForegroundColor Cyan
        Write-Host "Size: $((Get-Item $exePath).Length / 1MB)MB" -ForegroundColor Cyan
        Write-Host "`nTo run:" -ForegroundColor Yellow
        Write-Host "  $exePath" -ForegroundColor White
        Write-Host "`nFor Owner Mode:" -ForegroundColor Yellow
        Write-Host "  Set environment variables:" -ForegroundColor White
        Write-Host "    `$env:DMF_OWNER = 'TRUE'" -ForegroundColor White
        Write-Host "    `$env:ASPNETCORE_ENVIRONMENT = 'Production'" -ForegroundColor White
        Write-Host "    `$env:MONGODB_URI = 'your-mongodb-atlas-uri'" -ForegroundColor White
        Write-Host "  Then run the EXE" -ForegroundColor White
    } else {
        Write-Host "`n❌ Windows build failed!`n" -ForegroundColor Red
        exit 1
    }
}

elseif ($Target -eq "docker") {
    Write-Host "🐳 Building Docker image..." -ForegroundColor Green
    
    # First, publish to folder
    $dockerPublishDir = Join-Path $publishDir "docker"
    
    & dotnet publish `
        -c Release `
        -o $dockerPublishDir `
        -p:PublishProfile=DefaultContainer `
        $webProjPath
    
    # Create Dockerfile if it doesn't exist
    $dockerfilePath = Join-Path $webProjPath "Dockerfile"
    if (-not (Test-Path $dockerfilePath)) {
        Write-Host "Creating Dockerfile..." -ForegroundColor Yellow
        
        $dockerfile = @"
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["dmf-music-platform.Web/dmf-music-platform.Web.csproj", "dmf-music-platform.Web/"]
COPY ["dmf-music-platform.Shared/dmf-music-platform.Shared.csproj", "dmf-music-platform.Shared/"]
RUN dotnet restore "dmf-music-platform.Web/dmf-music-platform.Web.csproj"
COPY . .
WORKDIR "/src/dmf-music-platform.Web"
RUN dotnet build "dmf-music-platform.Web.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "dmf-music-platform.Web.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Set working directory and health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "dmf-music-platform.Web.dll"]
"@
        
        $dockerfile | Set-Content -Path $dockerfilePath -Encoding UTF8
    }
    
    # Build Docker image
    $imageName = "dmfmusicplatform/api"
    $imageTag = "$imageName`:$Version"
    
    Write-Host "Building image: $imageTag" -ForegroundColor Cyan
    
    & docker build -f $dockerfilePath -t $imageTag -t "$imageName`:latest" $projRoot
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Docker image created successfully!`n" -ForegroundColor Green
        
        & docker images | grep dmfmusicplatform | head -2 | ForEach-Object {
            Write-Host $_ -ForegroundColor Cyan
        }
        
        Write-Host "`nTo deploy:" -ForegroundColor Yellow
        Write-Host "  docker login" -ForegroundColor White
        Write-Host "  docker push $imageTag" -ForegroundColor White
        
        Write-Host "`nEnvironment variables for production:" -ForegroundColor Yellow
        Write-Host "  ASPNETCORE_ENVIRONMENT=Production" -ForegroundColor White
        Write-Host "  MONGODB_URI=<your-mongodb-atlas-uri>" -ForegroundColor White
        Write-Host "  DMF_OWNER=TRUE" -ForegroundColor White
        Write-Host "  ASPNETCORE_URLS=http://+:8080" -ForegroundColor White
    } else {
        Write-Host "`n❌ Docker build failed!`n" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Publish complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan
