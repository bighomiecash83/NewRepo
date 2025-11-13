@echo off
REM DMF Music Platform - Automated Launch Script (Windows)
REM Verifies all components, configures environment, and starts the app

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo   ?? DMF MUSIC PLATFORM - LAUNCH
echo ==========================================
echo.

REM Colors would require external tool, so we'll use text markers instead

REM Step 1: Verify .NET 10
echo Step 1: Verifying .NET 10...
for /f "tokens=*" %%i in ('dotnet --version') do set DOTNET_VERSION=%%i

echo   Found: !DOTNET_VERSION!
if "!DOTNET_VERSION:~0,2!"=="10" (
    echo   ? .NET 10 verified
) else (
    echo   ? ERROR: .NET 10 required but found !DOTNET_VERSION!
    pause
    exit /b 1
)

REM Step 2: Check project structure
echo.
echo Step 2: Verifying project structure...
if exist "DMF-MUSIC-PLATFORM\DMF-MUSIC-PLATFORM.csproj" (
    echo   ? Backend project found
) else (
    echo   ? ERROR: Backend project not found
    pause
    exit /b 1
)

if exist "DMF-MUSIC-PLATFORM.Client\DMF-MUSIC-PLATFORM.Client.csproj" (
    echo   ? Client project found
) else (
    echo   ? ERROR: Client project not found
    pause
    exit /b 1
)

REM Step 3: Restore packages
echo.
echo Step 3: Restoring NuGet packages...
dotnet restore --no-cache >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   ? Packages restored
) else (
    echo   ? ERROR: Package restore failed
    pause
    exit /b 1
)

REM Step 4: Build project
echo.
echo Step 4: Building project...
dotnet build --configuration Debug --no-restore >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   ? Build successful
) else (
    echo   ? ERROR: Build failed
    echo   Run 'dotnet build' for details
    pause
    exit /b 1
)

REM Step 5: Configuration check
echo.
echo Step 5: Checking configuration...
if exist "DMF-MUSIC-PLATFORM\appsettings.json" (
    echo   ? Configuration found
) else (
    echo   ? ERROR: appsettings.json not found
    pause
    exit /b 1
)

REM Step 6: Environment setup
echo.
echo Step 6: Setting up environment...
set ASPNETCORE_ENVIRONMENT=Development
set ASPNETCORE_URLS=https://localhost:5001
echo   ? Environment configured

REM Step 7: Trust dev certificate
echo.
echo Step 7: Setting up SSL certificate...
dotnet dev-certs https --trust >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   ? HTTPS certificate configured
) else (
    echo   ??  Certificate trust failed (non-critical)
)

REM Final check
echo.
echo ==========================================
echo   ? ALL CHECKS PASSED - LAUNCHING APP
echo ==========================================
echo.
echo   ?? The app will be available at:
echo      https://localhost:5001
echo.
echo   ??  Press Ctrl+C to stop the app
echo.
timeout /t 3 /nobreak

REM Launch the app
echo Launching application...
cd DMF-MUSIC-PLATFORM
dotnet run --no-build --configuration Debug

REM If we get here, app was stopped
echo.
echo App stopped.
pause
