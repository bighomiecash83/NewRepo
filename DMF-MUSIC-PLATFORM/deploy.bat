@echo off
REM =============================================================================
REM DMF MUSIC PLATFORM - DEPLOYMENT AUTOMATION SCRIPT
REM =============================================================================
REM This script automates the deployment process
REM Run from: DMF-MUSIC-PLATFORM\DMF-MUSIC-PLATFORM directory
REM =============================================================================

setlocal enabledelayedexpansion

echo.
echo ============================================================================
echo   DMF MUSIC PLATFORM - DEPLOYMENT AUTOMATION
echo ============================================================================
echo.

REM Check if we're in the right directory
if not exist "DMF-MUSIC-PLATFORM.csproj" (
    echo ERROR: DMF-MUSIC-PLATFORM.csproj not found
    echo Please run this script from the DMF-MUSIC-PLATFORM directory
    pause
    exit /b 1
)

echo [1/5] Cleaning previous builds...
dotnet clean --configuration Release > nul 2>&1

echo [2/5] Building Release configuration...
dotnet build --configuration Release
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo [3/5] Publishing application...
dotnet publish -c Release -o ./publish
if errorlevel 1 (
    echo ERROR: Publish failed
    pause
    exit /b 1
)

echo.
echo [4/5] Creating deployment package...
REM Create zip file for deployment
powershell -Command "Compress-Archive -Path './publish/*' -DestinationPath './dmf-deploy.zip' -Force"
if errorlevel 1 (
    echo ERROR: Failed to create deployment package
    pause
    exit /b 1
)

echo.
echo ============================================================================
echo   ? DEPLOYMENT PACKAGE READY
echo ============================================================================
echo.
echo Location: %cd%\dmf-deploy.zip
echo Size: 
for %%F in (dmf-deploy.zip) do echo %%~zF bytes
echo.
echo Next Steps:
echo 1. Upload dmf-deploy.zip to production server
echo 2. For Azure: use 'az webapp deployment source config-zip'
echo 3. For self-hosted: extract to application directory and restart
echo.
pause
