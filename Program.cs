using DmfMusicPlatform.StreamGod.Ads;
using DmfMusicPlatform.StreamGod.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;
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

// ======== Services ========
builder.Services.AddScoped<IAdActionExecutor, AdActionExecutor>();

// ======== ASP.NET Core Services ========
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000", "https://localhost:3000", "http://localhost:5173")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
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
app.UseCors("AllowFrontend");

// 🔐 Global API key middleware
app.Use(async (context, next) =>
{
    // Let health check through without API key so you can debug
    if (context.Request.Path.StartsWithSegments("/health"))
    {
        await next();
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

    await next();
});

app.UseAuthorization();
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

