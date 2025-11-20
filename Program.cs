using DmfMusicPlatform.StreamGod.Ads;
using DmfMusicPlatform.StreamGod.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;

var builder = WebApplication.CreateBuilder(args);

// Load environment-specific config
var env = builder.Environment;
if (!env.IsProduction())
{
    builder.Configuration.AddJsonFile("appsettings.Development.json", optional: true);
    builder.Configuration.AddJsonFile(".env.json", optional: true);
}

// ======== MongoDB Configuration ========
var mongoSection = builder.Configuration.GetSection("MongoDB");
var mongoConnectionString = mongoSection.GetValue<string>("ConnectionString") 
    ?? Environment.GetEnvironmentVariable("MONGO_CONNECTION_STRING")
    ?? throw new InvalidOperationException("MongoDB connection string not configured");

var adDatabaseSettings = new AdDatabaseSettings
{
    ConnectionString = mongoConnectionString,
    DatabaseName = mongoSection.GetValue("DatabaseName", "dmf_music_platform") ?? "dmf_music_platform"
};

builder.Services.AddSingleton(adDatabaseSettings);
builder.Services.AddSingleton<IAdDataContext, AdDataContext>();

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

// ======== Middleware ========
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

// ======== Startup Tasks ========
using (var scope = app.Services.CreateScope())
{
    var adContext = scope.ServiceProvider.GetRequiredService<IAdDataContext>();
    try
    {
        await adContext.EnsureIndexesAsync();
        Console.WriteLine("✅ MongoDB indexes ensured");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠️  Warning: MongoDB connection failed ({ex.Message}). API will still start but may not function properly.");
        Console.WriteLine($"   Ensure MongoDB is running on localhost:27017 or update appsettings.json with valid connection string.");
    }
}

Console.WriteLine("🚀 DMF Music Platform Backend v1 starting on https://localhost:5001");
await app.RunAsync("https://localhost:5001");

