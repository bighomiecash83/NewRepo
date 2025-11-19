# Visual Studio Pre-Build Hook Setup

This guide shows how to wire the DMF roster seeding into your Visual Studio build pipeline.

## Option 1: .csproj Pre-Build Event (Recommended)

Add this to your `.csproj` file inside the first `<PropertyGroup>`:

```xml
<PropertyGroup>
  <!-- ... existing properties ... -->
  
  <!-- DMF Roster Seeding -->
  <PreBuildEvent Condition="'$(Configuration)' == 'Debug'">
    <!-- Dev environment for Debug builds -->
    set NODE_ENV=dev
    if exist "$(SolutionDir)dmf_bootstrap_advanced.sh" (
      bash "$(SolutionDir)dmf_bootstrap_advanced.sh"
    ) else (
      echo Warning: dmf_bootstrap_advanced.sh not found in $(SolutionDir)
    )
  </PreBuildEvent>
  
  <PreBuildEvent Condition="'$(Configuration)' == 'Release'">
    <!-- Prod environment for Release builds -->
    set NODE_ENV=prod
    if exist "$(SolutionDir)dmf_bootstrap_advanced.sh" (
      bash "$(SolutionDir)dmf_bootstrap_advanced.sh"
    ) else (
      echo Warning: dmf_bootstrap_advanced.sh not found in $(SolutionDir)
    )
  </PreBuildEvent>
</PropertyGroup>
```

## Option 2: PowerShell Pre-Build Event

For more control, use PowerShell:

```xml
<PreBuildEvent Condition="'$(Configuration)' == 'Debug'">
  powershell -NoProfile -ExecutionPolicy Bypass -Command "
  $env:NODE_ENV = 'dev'
  if (Test-Path '$(SolutionDir)dmf_bootstrap_advanced.sh') {
    &amp; bash '$(SolutionDir)dmf_bootstrap_advanced.sh'
  } else {
    Write-Warning 'dmf_bootstrap_advanced.sh not found'
  }
  "
</PreBuildEvent>
```

## Option 3: Custom Build Target (Most Flexible)

Create `DMF.Roster.targets` in your project root:

```xml
<?xml version="1.0" encoding="utf-8"?>
<Project>
  
  <Target Name="SeedDMFRoster" BeforeTargets="Build">
    <Message Text="?? Seeding DMF Roster before build..." Importance="high" />
    
    <Exec 
      Command="bash dmf_bootstrap_advanced.sh" 
      WorkingDirectory="$(SolutionDir)" 
      ContinueOnError="true"
      Condition="Exists('$(SolutionDir)dmf_bootstrap_advanced.sh')" />
    
    <Message Text="? Roster seed complete" Importance="high" />
  </Target>

</Project>
```

Then add to your `.csproj`:

```xml
<Import Project="$(SolutionDir)DMF.Roster.targets" />
```

## Environment Variables by Configuration

- **Debug** ? `NODE_ENV=dev` (Development MongoDB)
- **Release** ? `NODE_ENV=prod` (Production MongoDB)
- **Custom** ? Set as needed

## How It Works

1. **You press F5 (Debug)** in Visual Studio
2. **Pre-build event triggers**
3. **dmf_bootstrap_advanced.sh runs** with NODE_ENV=dev
4. **MongoDB is seeded** with dmf_roster.json
5. **Build continues** with fresh roster data
6. **App launches** with live DMF data

## Testing

After adding the pre-build event:

1. Clean solution (`Ctrl+Alt+L`)
2. Build solution (`Ctrl+Shift+B`)
3. Watch the Output window for seeding logs
4. Should see: `[DMF] Roster seed complete`

## Troubleshooting

**Error: "bash is not recognized"**
- Ensure Git Bash or Windows Subsystem for Linux (WSL) is installed
- Add to PATH or use full path to bash.exe

**Error: "dmf_bootstrap_advanced.sh permission denied"**
- Run: `chmod +x dmf_bootstrap_advanced.sh`
- Or make sure file is executable in Git

**Pre-build event not running**
- Check Build Events in Project Properties
- Verify file paths are correct
- Check Configuration matches (Debug/Release)

## Production Consideration

For Release builds with sensitive prod data:
- Add confirmation prompt
- Log to file instead of console
- Or skip seeding entirely for production builds:

```xml
<PreBuildEvent Condition="'$(Configuration)' == 'Debug'">
  <!-- Only seed in Debug -->
</PreBuildEvent>
```

---

**Once configured**, every time you build, your roster is automatically synced. ??
