using Google.Cloud.PubSub.V1;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddScoped(_ =>
{
    var mongoUri = Environment.GetEnvironmentVariable("MONGO_URI") ?? "mongodb://localhost:27017";
    return new MongoClient(mongoUri);
});

builder.Services.AddHttpClient();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();
app.UseCors();

// Health check endpoint (required by Cloud Run)
app.MapGet("/health", () => Results.Ok(new { status = "ok", timestamp = DateTime.UtcNow }))
    .WithName("Health")
    .WithOpenApi();

// Pub/Sub handler for release distribution jobs
app.MapPost("/pubsub/releases", async (HttpContext context, MongoClient mongoClient) =>
{
    try
    {
        var json = await context.Request.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        // Decode Pub/Sub message
        if (root.TryGetProperty("message", out var msgProp) &&
            msgProp.TryGetProperty("data", out var dataProp))
        {
            var decodedData = System.Convert.FromBase64String(dataProp.GetString() ?? "");
            var releaseJson = System.Text.Encoding.UTF8.GetString(decodedData);
            using var releaseDoc = JsonDocument.Parse(releaseJson);
            var release = releaseDoc.RootElement;

            var releaseId = release.GetProperty("releaseId").GetString();
            var artistId = release.GetProperty("artistId").GetString();
            var title = release.GetProperty("title").GetString();

            Console.WriteLine($"Processing release: {releaseId} - {title} by {artistId}");

            // Write to MongoDB for async processing
            var client = mongoClient;
            var db = client.GetDatabase("dmf_platform");
            var collection = db.GetCollection<dynamic>("release_jobs");

            var job = new
            {
                releaseId,
                artistId,
                title,
                status = "processing",
                processedAt = DateTime.UtcNow,
                attempts = 1
            };

            await collection.InsertOneAsync(job);

            // Acknowledge message to Pub/Sub
            return Results.Ok(new { ack = true, releaseId });
        }

        return Results.BadRequest("Invalid Pub/Sub message format");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error processing release: {ex.Message}");
        return Results.StatusCode(500);
    }
})
.WithName("ProcessRelease")
.WithOpenApi();

// Pub/Sub handler for bot command jobs
app.MapPost("/pubsub/bots", async (HttpContext context, MongoClient mongoClient) =>
{
    try
    {
        var json = await context.Request.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        // Decode Pub/Sub message
        if (root.TryGetProperty("message", out var msgProp) &&
            msgProp.TryGetProperty("data", out var dataProp))
        {
            var decodedData = System.Convert.FromBase64String(dataProp.GetString() ?? "");
            var botCommandJson = System.Text.Encoding.UTF8.GetString(decodedData);
            using var cmdDoc = JsonDocument.Parse(botCommandJson);
            var command = cmdDoc.RootElement;

            var botId = command.GetProperty("botId").GetString();
            var action = command.GetProperty("action").GetString();
            var timestamp = command.GetProperty("timestamp").GetInt64();

            Console.WriteLine($"Processing bot command: {action} for bot {botId}");

            // Write to MongoDB
            var client = mongoClient;
            var db = client.GetDatabase("dmf_platform");
            var collection = db.GetCollection<dynamic>("bot_jobs");

            var job = new
            {
                botId,
                action,
                originalTimestamp = timestamp,
                processedAt = DateTime.UtcNow,
                status = "executing"
            };

            await collection.InsertOneAsync(job);

            // TODO: Integrate with OpenAI for actual bot orchestration
            // For now, just log the command

            return Results.Ok(new { ack = true, botId, action });
        }

        return Results.BadRequest("Invalid Pub/Sub message format");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error processing bot command: {ex.Message}");
        return Results.StatusCode(500);
    }
})
.WithName("ProcessBotCommand")
.WithOpenApi();

await app.RunAsync();
