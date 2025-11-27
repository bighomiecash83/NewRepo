using DmfMusicPlatform.StreamGod.Ads;
using DmfMusicPlatform.StreamGod.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;
using MongoDB.Bson;
using System.Linq;
using System;

var builder = WebApplication.CreateBuilder(args);

// Load environment-specific config
var env = builder.Environment;
builder.Configuration.AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true, reloadOnChange: true);
builder.Configuration.AddEnvironmentVariables();

// ======== MongoDB Configuration ========
var mongoSection = builder.Configuration.GetSection("MongoDB");
var mongoConnectionString = mongoSection.GetValue<string>("ConnectionString") 
    ?? Environment.GetEnvironmentVariable("MONGO_CONNECTION_STRING")
    ?? throw new InvalidOperationException("MongoDB connection string not configured");

// Expand environment variables in connection string (e.g., ${MONGODB_PROD_PASSWORD})
mongoConnectionString = ExpandEnvironmentVariables(mongoConnectionString);

var adDatabaseSettings = new AdDatabaseSettings
{
    ConnectionString = mongoConnectionString,
    DatabaseName = mongoSection.GetValue("DatabaseName", "dmf_music_platform") ?? "dmf_music_platform"
};

builder.Services.AddSingleton(adDatabaseSettings);
builder.Services.AddSingleton<IAdDataContext, AdDataContext>();

// Register IMongoClient for dependency injection
var mongoClient = new MongoClient(mongoConnectionString);
builder.Services.AddSingleton<IMongoClient>(mongoClient);

// Register MongoDbService
builder.Services.AddSingleton<MongoDbService>();

// ======== Services ========
builder.Services.AddScoped<IAdActionExecutor, AdActionExecutor>();

// ======== ASP.NET Core Services ========
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontends", policy =>
    {
        policy
            .WithOrigins(
                "https://dmf-music-platform.lovable.app",
                "https://dmf-hub.lovable.app"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddSwaggerGen();

var app = builder.Build();

// 🔐 Pull the required API key from configuration/env
var requiredApiKey =
    app.Configuration["DMF_APP_API_KEY"] ??
    Environment.GetEnvironmentVariable("DMF_APP_API_KEY");

if (string.IsNullOrWhiteSpace(requiredApiKey))
{
    throw new InvalidOperationException(
        "DMF_APP_API_KEY is not configured. Set it as an environment variable.");
}

// ======== Middleware ========
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontends");

// 🔐 Global API key middleware
app.Use(async (context, next) =>
{
    // Let health check + system status through without API key so dashboards can monitor
    if (context.Request.Path.StartsWithSegments("/health") || 
        context.Request.Path.StartsWithSegments("/system/status"))
    {
        await next.Invoke();
        return;
    }

    if (!context.Request.Headers.TryGetValue("x-dmf-api-key", out var providedKey) ||
        !string.Equals(providedKey, requiredApiKey, StringComparison.Ordinal))
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        await context.Response.WriteAsJsonAsync(new
        {
            error = "Invalid or missing API key"
        });
        return;
    }

    await next.Invoke();
});

app.UseAuthorization();

// ======== API Endpoints ========

// Health endpoint
app.MapGet("/health", () => Results.Ok(new
{
    status = "ok",
    service = "dmf-backend",
    timestamp = DateTime.UtcNow
}));

// Artists endpoint
app.MapGet("/artists", async (MongoDbService mongoDbService) =>
{
    try
    {
        var artistsCollection = mongoDbService.Database.GetCollection<BsonDocument>("artists");
        var artists = await artistsCollection.Find(new BsonDocument()).ToListAsync();
        return Results.Ok(artists.Select(a => a.ToDictionary()));
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});

// Releases endpoint
app.MapGet("/releases", async (MongoDbService mongoDbService) =>
{
    try
    {
        var releasesCollection = mongoDbService.Database.GetCollection<BsonDocument>("releases");
        var releases = await releasesCollection.Find(new BsonDocument()).ToListAsync();
        return Results.Ok(releases.Select(r => r.ToDictionary()));
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});

app.MapControllers();

// ======== Startup Tasks ========
try
{
    using (var scope = app.Services.CreateScope())
    {
        try
        {
            var adContext = scope.ServiceProvider.GetRequiredService<IAdDataContext>();
            await adContext.EnsureIndexesAsync();
            Console.WriteLine("✅ MongoDB indexes ensured");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️  MongoDB unavailable: {ex.Message}");
        }
    }
}
catch { }

Console.WriteLine("🚀 DMF Music Platform Backend v1 starting...");
await app.RunAsync();

// Helper: Expand environment variables in format ${VAR_NAME}
static string ExpandEnvironmentVariables(string input)
{
    if (string.IsNullOrEmpty(input)) return input;
    
    var result = System.Text.RegularExpressions.Regex.Replace(
        input,
        @"\$\{([^}]+)\}",
        match =>
        {
            var varName = match.Groups[1].Value;
            var value = Environment.GetEnvironmentVariable(varName) ?? match.Value;
            
            // URL-encode password if it's in a MongoDB connection string
            if (varName.Contains("MONGODB") && input.Contains("mongodb+srv"))
            {
                value = System.Web.HttpUtility.UrlEncode(value);
            }
            return value;
        }
    );
    return result;
}

