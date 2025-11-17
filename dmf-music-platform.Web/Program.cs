using dmf_music_platform.Shared.Services;
using dmf_music_platform.Web.Components;
using dmf_music_platform.Web.Services;
using dmf_music_platform.Web.Domain.Config;
using dmf_music_platform.Web.Domain.Services;
using dmf_music_platform.Web.Domain.Distributor;
using dmf_music_platform.Web.Domain.Distributor.Services;
using MongoDB.Driver;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using System.Text.Json;
using System.IO;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

builder.Services.AddControllers();
builder.Services.AddHttpClient();

// MongoDB setup
var mongoDbSettings = builder.Configuration.GetSection("MongoDb");
var mongoConnectionString = mongoDbSettings.GetValue<string>("ConnectionString");
var mongoDatabaseName = mongoDbSettings.GetValue<string>("DatabaseName");

if (string.IsNullOrEmpty(mongoConnectionString) || mongoConnectionString.Contains("REPLACE_WITH_PASSWORD"))
{
    throw new InvalidOperationException("MongoDB connection string not properly configured. Update appsettings.json with your MongoDB Atlas password.");
}

var mongoClient = new MongoClient(mongoConnectionString);
var mongoDatabase = mongoClient.GetDatabase(mongoDatabaseName);

builder.Services.AddSingleton<IMongoDatabase>(mongoDatabase);
builder.Services.AddScoped<IMongoDbService, MongoDbService>();

// Add device-specific services used by the dmf_music_platform.Shared project
builder.Services.AddSingleton<IFormFactor, FormFactor>();
builder.Services.AddScoped<IStreamGodBrain, StreamGodBrain>();

// Load pricing and Ryia configs from Config/ folder
var configDir = Path.Combine(builder.Environment.ContentRootPath, "Config");
Directory.CreateDirectory(configDir);

T LoadJson<T>(string fileName)
{
    var path = Path.Combine(configDir, fileName);
    if (!File.Exists(path))
    {
        throw new FileNotFoundException($"Required config not found: {path}");
    }
    var json = File.ReadAllText(path);
    var obj = JsonSerializer.Deserialize<T>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    if (obj == null) throw new InvalidOperationException($"Failed to deserialize {fileName}");
    return obj;
}

var pricingConfig = LoadJson<DmfPricingConfig>("dmf_pricing_config.json");
var ryiaConfig = LoadJson<RyiaConfig>("ryia_config.json");

builder.Services.AddSingleton(pricingConfig);
builder.Services.AddSingleton(ryiaConfig);
builder.Services.AddScoped<DistributorPricingService>();
builder.Services.AddScoped<PayoutService>();
builder.Services.AddScoped<RyiaService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseStaticFiles();
app.UseAntiforgery();

// ---------------------------------------------------------
// Razor Components Root Registration (Corrected)
// ---------------------------------------------------------
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.MapControllers();

app.Run();
