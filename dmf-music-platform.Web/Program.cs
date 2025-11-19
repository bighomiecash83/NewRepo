using System.Text.Json;
using DmfMusicPlatform.Domain;
using DmfMusicPlatform.Web.Controllers;
using dmf_music_platform.Shared.Services;
using dmf_music_platform.Web.Services;
using dmf_music_platform.Web.Domain.Config;
using dmf_music_platform.Web.Domain.Services;
using dmf_music_platform.Web.Domain.Distributor;
using dmf_music_platform.Web.Domain.Distributor.Services;
using MongoDB.Driver;
using Microsoft.Extensions.Options;

try
{
    Console.WriteLine("[1] Starting Program.cs");
    var builder = WebApplication.CreateBuilder(args);
    Console.WriteLine("[2] Created WebApplicationBuilder");

    // Logging - ensure console output
    builder.Logging.ClearProviders();
    Console.WriteLine("[3] Cleared logging providers");
    builder.Logging.AddConsole();
    Console.WriteLine("[4] Added console logger");

    // Add services to the container.
    Console.WriteLine("[5] Adding services...");
    builder.Services.AddControllers();
    Console.WriteLine("[6] Added controllers");
    builder.Services.AddHttpClient();
    Console.WriteLine("[7] Added HTTP client");

    // CORS configuration (v2.0 Security)
    Console.WriteLine("[7.5a] Configuring CORS service...");
    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(policyBuilder =>
        {
            var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                ?? new[] { "http://localhost:3000", "http://localhost:5173" };
            policyBuilder
                .WithOrigins(allowedOrigins)
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        });
    });
    Console.WriteLine("[7.5b] CORS service configured");

    // Pricing service configuration
    Console.WriteLine("[7a] Configuring pricing service...");
    builder.Services.Configure<PricingDatabaseSettings>(
        builder.Configuration.GetSection("PricingDatabase"));
    builder.Services.AddSingleton<IPricingService, MongoPricingService>();
    Console.WriteLine("[7b] Pricing service registered");

    // Release service configuration (Distribution v1.1)
    Console.WriteLine("[7c] Configuring release service...");
    builder.Services.AddScoped<IReleaseService, MongoReleaseService>();
    Console.WriteLine("[7d] Release service registered");

    // Royalty service configuration (Royalty Payouts v1.2)
    Console.WriteLine("[7e] Configuring royalty service...");
    builder.Services.AddScoped<IRoyaltyService, MongoRoyaltyService>();
    Console.WriteLine("[7f] Royalty service registered");

    // StreamGod Dashboard service configuration (v2.0)
    Console.WriteLine("[7g] Configuring StreamGod dashboard service...");
    builder.Services.AddScoped<IStreamGodDashboardService>(sp =>
    {
        var mongoClient = sp.GetRequiredService<IMongoClient>();
        var configuration = sp.GetRequiredService<IConfiguration>();
        var dbName = configuration.GetSection("MongoDb:DatabaseName").Value ?? "dmf_music_platform";
        var database = mongoClient.GetDatabase(dbName);
        return new StreamGodDashboardService(database);
    });
    Console.WriteLine("[7h] StreamGod dashboard service registered");

    // JWT Authentication service (v2.0 Security)
    Console.WriteLine("[7i] Configuring JWT authentication...");
    builder.Services.AddScoped<IJwtAuthenticationService, JwtAuthenticationService>();
    builder.Services.AddScoped<IAuthorizationHelper, AuthorizationHelper>();
    Console.WriteLine("[7j] JWT authentication and authorization helpers registered");

    // --- Load DMF company config from JSON -------------------------
    Console.WriteLine("[8] About to load DMF company config...");
    var dmfConfigPath = Path.Combine(
        builder.Environment.ContentRootPath,
        "Config",
        "dmf_company_profile.json"
    );
    Console.WriteLine($"[9] DMF config path: {dmfConfigPath}");

    DmfCompanyConfig dmfConfig = new DmfCompanyConfig();
    if (File.Exists(dmfConfigPath))
    {
        try
        {
            Console.WriteLine($"✅ Found DMF config at: {dmfConfigPath}");
            var json = File.ReadAllText(dmfConfigPath);
            dmfConfig = JsonSerializer.Deserialize<DmfCompanyConfig>(
                json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            ) ?? new DmfCompanyConfig();
            Console.WriteLine($"✅ Loaded DMF company: {dmfConfig.CompanyProfile?.Branding?.ShortName ?? "Unknown"}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️  Failed to load DMF config: {ex.Message}");
        }
    }
    else
    {
        Console.WriteLine($"⚠️  DMF config not found at: {dmfConfigPath}");
    }

    builder.Services.AddSingleton(dmfConfig);
    Console.WriteLine("[10] Registered DMF config as singleton");

    // MongoDB setup
    Console.WriteLine("[11] Starting MongoDB configuration...");
    var mongoDbSettings = builder.Configuration.GetSection("MongoDb");
    Console.WriteLine("[12] Got MongoDb section from config");
    var mongoConnectionString = mongoDbSettings.GetValue<string>("ConnectionString");
    Console.WriteLine("[13] Got MongoDB connection string");
    var mongoDatabaseName = mongoDbSettings.GetValue<string>("DatabaseName");
    Console.WriteLine("[14] Got MongoDB database name");

    if (string.IsNullOrEmpty(mongoConnectionString))
    {
        Console.WriteLine("⚠️  [15a] MongoDB connection string not configured. Skipping MongoDB setup.");
    }
    else if (mongoConnectionString.Contains("REPLACE_WITH_PASSWORD"))
    {
        Console.WriteLine("⚠️  [15b] MongoDB connection string contains placeholder.");
    }
    else
    {
        Console.WriteLine("[15] MongoDB connection string OK, attempting to connect...");
        try
        {
            Console.WriteLine("[16] Creating MongoClient...");
            var mongoClient = new MongoClient(mongoConnectionString);
            Console.WriteLine("[17] Getting database instance...");
            var mongoDatabase = mongoClient.GetDatabase(mongoDatabaseName);
            Console.WriteLine("[18] Registering MongoDB services...");

            builder.Services.AddSingleton<IMongoDatabase>(mongoDatabase);
            Console.WriteLine("[19] Registered IMongoDatabase");
            builder.Services.AddScoped<IMongoDbService, MongoDbService>();
            Console.WriteLine($"[20] MongoDB configured for database: {mongoDatabaseName}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️  [20b] MongoDB setup failed: {ex.Message}");
        }
    }

    // Add device-specific services used by the dmf_music_platform.Shared project
    Console.WriteLine("[21] Adding IFormFactor service...");
    builder.Services.AddSingleton<IFormFactor, FormFactor>();
    Console.WriteLine("[22] Added IFormFactor");
    Console.WriteLine("[23] Adding IStreamGodBrain service...");
    builder.Services.AddScoped<IStreamGodBrain, StreamGodBrain>();
    Console.WriteLine("[24] Added IStreamGodBrain");

    // Load pricing and Ryia configs from Config/ folder
    Console.WriteLine("[25] Starting pricing and Ryia config load...");
    var configDir = Path.Combine(builder.Environment.ContentRootPath, "Config");
    Directory.CreateDirectory(configDir);
    Console.WriteLine("[26] Config directory created/verified");

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

    try
    {
        Console.WriteLine("[27] Loading dmf_pricing_config.json...");
        var pricingConfig = LoadJson<DmfPricingConfig>("dmf_pricing_config.json");
        Console.WriteLine("[28] Loaded pricing config");
        Console.WriteLine("[29] Loading ryia_config.json...");
        var ryiaConfig = LoadJson<RyiaConfig>("ryia_config.json");
        Console.WriteLine("[30] Loaded Ryia config");

        Console.WriteLine("[31] Registering pricing config...");
        builder.Services.AddSingleton(pricingConfig);
        Console.WriteLine("[32] Registering Ryia config...");
        builder.Services.AddSingleton(ryiaConfig);
        Console.WriteLine("[33] Registering DistributorPricingService...");
        builder.Services.AddScoped<DistributorPricingService>();
        Console.WriteLine("[34] Registering PayoutService...");
        builder.Services.AddScoped<PayoutService>();
        Console.WriteLine("[35] Registering RyiaService...");
        builder.Services.AddScoped<RyiaService>();
        Console.WriteLine("✅ [36] Pricing and Ryia configs loaded");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠️  [36b] Config loading warning: {ex.Message}");
    }

    Console.WriteLine("[37] About to call builder.Build()...");
    var app = builder.Build();
    Console.WriteLine("[38] builder.Build() completed successfully");

    // Configure the HTTP request pipeline.
    Console.WriteLine("[39] Configuring HTTP pipeline...");
    if (!app.Environment.IsDevelopment())
    {
        Console.WriteLine("[40] Production mode - adding exception handler and HSTS");
        app.UseExceptionHandler("/Error", createScopeForErrors: true);
        app.UseHsts();
    }
    else
    {
        Console.WriteLine("[41] Development mode - adding developer exception page");
        app.UseDeveloperExceptionPage();
    }
    Console.WriteLine("[42] Configured environment-specific middleware");

    Console.WriteLine("[43] Adding static files...");
    app.UseStaticFiles();
    
    // Add CORS configuration (v2.0 Security)
    Console.WriteLine("[43c] Configuring CORS...");
    var allowedOrigins = app.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
        ?? new[] { "http://localhost:3000", "http://localhost:5173" }; // Default for dev
    app.UseCors(builder =>
        builder
            .WithOrigins(allowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
    Console.WriteLine("[43d] CORS configured for {OriginCount} origin(s)", allowedOrigins.Length);
    
    // Add authentication and authorization middleware (v2.0 Security)
    Console.WriteLine("[43e] Adding authentication middleware...");
    app.UseAuthentication();
    app.UseAuthorization();
    Console.WriteLine("[43f] Authentication and authorization middleware added");
    
    // Seed pricing plans on startup
    Console.WriteLine("[43a] Seeding pricing plans...");
    try
    {
        using (var scope = app.Services.CreateScope())
        {
            var mongoService = scope.ServiceProvider.GetRequiredService<IMongoDbService>();
            var seeder = new dmf_music_platform.Web.Domain.Services.PricingPlanSeeder(mongoService);
            await seeder.SeedDefaultPlansAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠️  [43b] Pricing plan seeding warning: {ex.Message}");
    }
    
    Console.WriteLine("[44] Mapping controllers...");

    app.MapControllers();
    Console.WriteLine("[45] Controllers mapped");

    // Health check endpoint
    Console.WriteLine("[46] Mapping health endpoint...");
    app.MapGet("/health", () => Results.Ok(new { status = "ok", timestamp = DateTime.UtcNow }));
    Console.WriteLine("[47] Health endpoint mapped");

    Console.WriteLine("🚀 [48] DMF-MUSIC-PLATFORM backend starting...");
    Console.WriteLine($"   [49] Environment: {app.Environment.EnvironmentName}");
    Console.WriteLine("   [50] Endpoints:");
    Console.WriteLine("   ✓ GET /health");
    Console.WriteLine("   ✓ GET /api/company/profile");
    Console.WriteLine("   ✓ GET /api/company/services");
    Console.WriteLine("   ✓ GET /api/company/status");
    Console.WriteLine("");

    // Add shutdown handler to see when/why it stops
    Console.WriteLine("[51] Getting IHostApplicationLifetime service...");
    var lifetime = app.Services.GetRequiredService<IHostApplicationLifetime>();
    Console.WriteLine("[52] Got lifetime service");
    
    Console.WriteLine("[53] Registering ApplicationStopping callback...");
    lifetime.ApplicationStopping.Register(() =>
    {
        Console.WriteLine("");
        Console.WriteLine("⚠️  [54] APPLICATION STOPPING SIGNAL RECEIVED");
        Console.WriteLine("");
    });
    Console.WriteLine("[55] Registered ApplicationStopping");

    Console.WriteLine("[56] Registering ApplicationStopped callback...");
    lifetime.ApplicationStopped.Register(() =>
    {
        Console.WriteLine("");
        Console.WriteLine("⚠️  [57] APPLICATION FULLY STOPPED");
        Console.WriteLine("");
    });
    Console.WriteLine("[58] Registered ApplicationStopped");

    Console.WriteLine("[59] 📍 About to call app.Run() - this should block indefinitely...");
    Console.Out.Flush();
    System.Console.Out.Flush();
    
    app.Run();
    
    Console.WriteLine("[60] 📍 app.Run() RETURNED - this should NOT happen unless shutdown was triggered");
    Console.Out.Flush();
}
catch (Exception ex)
{
    Console.WriteLine("");
    Console.WriteLine("🔥 ================================================");
    Console.WriteLine("🔥 FATAL STARTUP ERROR");
    Console.WriteLine("🔥 ================================================");
    Console.WriteLine($"Message: {ex.Message}");
    Console.WriteLine($"Type: {ex.GetType().FullName}");
    Console.WriteLine("");
    Console.WriteLine("Stack Trace:");
    Console.WriteLine(ex.StackTrace);
    Console.WriteLine("🔥 ================================================");
    Console.WriteLine("");
    throw;
}
