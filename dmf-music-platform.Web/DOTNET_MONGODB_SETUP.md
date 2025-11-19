/**
 * .NET StreamGod Brain - MongoDB Service Registration
 * 
 * This shows how to wire MongoDB Atlas into your .NET brain services
 * Add this to Program.cs during service configuration
 * 
 * Also install NuGet: dotnet add package MongoDB.Driver
 */

// In Program.cs (C# 11+ minimal hosting model):

using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

// ===== MONGODB ATLAS CONFIGURATION =====
var mongoConnection = builder.Configuration["DMF:MongoConnection"];
var dbName = builder.Configuration["DMF:DbName"] ?? "dmf_music_platform";

// Validate that MongoDB connection is configured
if (string.IsNullOrEmpty(mongoConnection))
{
    throw new InvalidOperationException(
        "❌ Missing DMF:MongoConnection in appsettings. " +
        "Set it from environment variable: DMF__MongoConnection"
    );
}

Console.WriteLine($"🔗 Configuring MongoDB: {dbName}");

// Register MongoDB client as singleton
builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var settings = MongoClientSettings.FromConnectionString(mongoConnection);
    settings.ConnectTimeout = TimeSpan.FromSeconds(10);
    settings.SocketTimeout = TimeSpan.FromSeconds(30);
    
    try
    {
        var client = new MongoClient(settings);
        // Verify connection on startup
        client.GetDatabase(dbName).RunCommandAsync(
            new MongoDB.Bson.BsonDocument("ping", 1)
        ).GetAwaiter().GetResult();
        
        Console.WriteLine("✅ MongoDB Atlas connection verified");
        return client;
    }
    catch (Exception ex)
    {
        Console.Error.WriteLine($"❌ MongoDB connection failed: {ex.Message}");
        throw;
    }
});

// Register database as singleton
builder.Services.AddSingleton(sp =>
{
    var client = sp.GetRequiredService<IMongoClient>();
    return client.GetDatabase(dbName);
});

// Register collections as singletons for easy injection
builder.Services.AddSingleton(sp =>
{
    var db = sp.GetRequiredService<IMongoDatabase>();
    return db.GetCollection<dynamic>("releases");
});

builder.Services.AddSingleton(sp =>
{
    var db = sp.GetRequiredService<IMongoDatabase>();
    return db.GetCollection<dynamic>("tracks");
});

builder.Services.AddSingleton(sp =>
{
    var db = sp.GetRequiredService<IMongoDatabase>();
    return db.GetCollection<dynamic>("artists");
});

builder.Services.AddSingleton(sp =>
{
    var db = sp.GetRequiredService<IMongoDatabase>();
    return db.GetCollection<dynamic>("payouts");
});

// Add other services...
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();

// ===== EXAMPLE CONTROLLER USING MONGODB =====

/*
[ApiController]
[Route("api/[controller]")]
public class CatalogController : ControllerBase
{
    private readonly IMongoCollection<Release> _releases;

    public CatalogController(IMongoClient client)
    {
        var db = client.GetDatabase("dmf_music_platform");
        _releases = db.GetCollection<Release>("releases");
    }

    [HttpGet("releases")]
    public async Task<ActionResult<List<Release>>> GetReleases()
    {
        try
        {
            var releases = await _releases
                .Find(r => r.Status == "published")
                .SortByDescending(r => r.ReleaseDate)
                .ToListAsync();

            return Ok(new
            {
                success = true,
                count = releases.Count,
                data = releases
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("releases")]
    public async Task<ActionResult<Release>> CreateRelease([FromBody] Release release)
    {
        try
        {
            release.CreatedAt = DateTime.UtcNow;
            release.UpdatedAt = DateTime.UtcNow;
            release.Status = "draft";

            await _releases.InsertOneAsync(release);

            return CreatedAtAction(nameof(GetReleases), new { id = release.Id }, release);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}

public class Release
{
    public ObjectId Id { get; set; }
    public string Title { get; set; }
    public string ArtistId { get; set; }
    public DateTime ReleaseDate { get; set; }
    public string Type { get; set; } // "single", "ep", "album", "mixtape"
    public string Status { get; set; } // "draft", "pending", "published", "archived"
    public List<string> Tracks { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
*/
