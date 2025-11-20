# Ad Bot Infrastructure – Program.cs Integration Guide

## Overview

Wire the Ad Bot models into your .NET backend using MongoDB Atlas.

---

## Step 1: appsettings.json

Add this section to your `appsettings.json`:

```json
{
  "AdDatabase": {
    "ConnectionString": "mongodb+srv://bighomiecash8346:<YOUR_PASSWORD>@dmf-music-platform.pfqrhc.mongodb.net/",
    "DatabaseName": "dmf_music_platform",
    "AdBotsCollectionName": "ad_bots",
    "AdPlaybooksCollectionName": "ad_playbooks",
    "AdCampaignsCollectionName": "ad_campaigns",
    "AdCreativesCollectionName": "ad_creatives",
    "AdMetricsDailyCollectionName": "ad_metrics_daily",
    "AdBotRunsCollectionName": "ad_bot_runs",
    "AdPolicyFlagsCollectionName": "ad_policy_flags"
  }
}
```

**Note:** Reuse your existing MongoDB Atlas connection string (same database, new collections).

---

## Step 2: Program.cs – Add Services

Add these lines to your `Program.cs` (after `var builder = WebApplication.CreateBuilder(args);`):

```csharp
using DmfMusicPlatform.StreamGod.Ads;
using Microsoft.Extensions.Options;

// ...

var builder = WebApplication.CreateBuilder(args);

// Existing services...
// builder.Services.Configure<PricingDatabaseSettings>(...)
// etc.

// ========== ADD THIS BLOCK ==========

// Configure Ad Bot database settings
builder.Services.Configure<AdDatabaseSettings>(
    builder.Configuration.GetSection("AdDatabase"));

// Register IAdDataContext as singleton
builder.Services.AddSingleton<IAdDataContext>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<AdDatabaseSettings>>().Value;
    return new AdDataContext(settings);
});

// ========== END AD BOT BLOCK ==========

// Rest of your services...
builder.Services.AddControllers();
builder.Services.AddSwaggerGen();
// etc.
```

---

## Step 3: Create Indexes on Startup

After `var app = builder.Build();`, add:

```csharp
// Ensure ad bot indexes are created on startup
using (var scope = app.Services.CreateScope())
{
    var adContext = scope.ServiceProvider.GetRequiredService<IAdDataContext>();
    await adContext.EnsureIndexesAsync();
    Console.WriteLine("✓ Ad Bot indexes created.");
}

app.MapControllers();
app.Run();
```

---

## Complete Program.cs Example

```csharp
using DmfMusicPlatform.StreamGod.Ads;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

// Services
builder.Services.AddControllers();

// Pricing database
builder.Services.Configure<PricingDatabaseSettings>(
    builder.Configuration.GetSection("MongoDatabase"));
builder.Services.AddSingleton<IMongoPricingService, MongoPricingService>();

// Ad Bot database
builder.Services.Configure<AdDatabaseSettings>(
    builder.Configuration.GetSection("AdDatabase"));
builder.Services.AddSingleton<IAdDataContext>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<AdDatabaseSettings>>().Value;
    return new AdDataContext(settings);
});

// Swagger
builder.Services.AddSwaggerGen();

// Authentication (JWT, CORS, etc.)
builder.Services.AddAuthentication("Bearer")
    .AddScheme<AuthenticationSchemeOptions, JwtAuthenticationHandler>("Bearer", null);
builder.Services.AddAuthorization();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

// Create ad bot indexes
using (var scope = app.Services.CreateScope())
{
    var adContext = scope.ServiceProvider.GetRequiredService<IAdDataContext>();
    await adContext.EnsureIndexesAsync();
    Console.WriteLine("✓ Ad Bot indexes created.");
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
```

---

## Usage in Controllers/Services

Once wired up, inject `IAdDataContext` in any controller or service:

```csharp
using DmfMusicPlatform.StreamGod.Ads;

[ApiController]
[Route("api/[controller]")]
public class AdBotsController : ControllerBase
{
    private readonly IAdDataContext _adContext;

    public AdBotsController(IAdDataContext adContext)
    {
        _adContext = adContext;
    }

    [HttpGet("{botId}")]
    public async Task<ActionResult<AdBot>> GetBot(string botId)
    {
        var bot = await _adContext.AdBots
            .Find(b => b.Id == botId)
            .FirstOrDefaultAsync();

        if (bot == null)
            return NotFound();

        return Ok(bot);
    }

    [HttpPost]
    public async Task<ActionResult<AdBot>> CreateBot(AdBot bot)
    {
        bot.Id = Guid.NewGuid().ToString();
        bot.CreatedAt = DateTime.UtcNow;
        bot.UpdatedAt = DateTime.UtcNow;

        await _adContext.AdBots.InsertOneAsync(bot);
        return CreatedAtAction(nameof(GetBot), new { botId = bot.Id }, bot);
    }
}
```

---

## Next: StreamGod Orchestrator

Once this is wired up, the natural next step is:

**StreamGodAdOrchestrator.cs** – a service that:

1. Loads active bots by `Status == Active` and `NextRunAfter <= Now`
2. For each bot:
   - Load its `AdPlaybook`
   - Pull relevant `AdCampaign`, `AdCreative`, `AdMetricDaily` records
   - Apply playbook rules
   - Generate `AdBotAction` recommendations
   - Write `AdBotRun` record
3. Expose admin endpoints to view:
   - "What did the bot army do today?"
   - "Which campaigns are winning?"
   - "What policies were flagged?"

This completes the loop: **Data Model → Execution → Audit Trail → Dashboard**.
