using dmf_music_platform.Web.Models;
using MongoDB.Bson;
using MongoDB.Driver;

namespace dmf_music_platform.Web.Domain.Services;

public interface IRoyaltyService
{
    Task<GenerateStatementsResponse> GenerateStatementsAsync(GenerateStatementsRequest request);
    Task<RoyaltyStatement> GetStatementAsync(string statementId);
    Task<List<RoyaltyStatement>> GetArtistStatementsAsync(string artistId);
    Task<RoyaltyStatement> FinalizeStatementAsync(string statementId);
    Task<Payout> CreatePayoutAsync(string statementId, CreatePayoutRequest request);
    Task<ArtistEarningsSummaryResponse> GetArtistEarningsSummaryAsync(string artistId);
    Task<Payout> MarkPayoutAsPaidAsync(string payoutId);
}

public class MongoRoyaltyService : IRoyaltyService
{
    private readonly IMongoCollection<RoyaltyStatement> _statementsCollection;
    private readonly IMongoCollection<Payout> _payoutsCollection;
    private readonly IMongoClient _mongoClient;
    private readonly IMongoDatabase _mongoDatabase;

    public MongoRoyaltyService(IMongoClient mongoClient, IMongoDatabase mongoDatabase)
    {
        _mongoClient = mongoClient;
        _mongoDatabase = mongoDatabase;
        _statementsCollection = mongoDatabase.GetCollection<RoyaltyStatement>("royalty_statements");
        _payoutsCollection = mongoDatabase.GetCollection<Payout>("payouts");
    }

    /// <summary>
    /// Generate royalty statements for a period.
    /// For v1.2, simulates data; later will ingest from DSP imports.
    /// </summary>
    public async Task<GenerateStatementsResponse> GenerateStatementsAsync(GenerateStatementsRequest request)
    {
        var response = new GenerateStatementsResponse();

        // Simulate fetching artists and their revenue data
        // In production, this would aggregate from royalty_imports or DSP webhooks
        var mockArtists = new[] { "artist1", "artist2", "artist3" };
        var mockSources = new[] { "Spotify", "Apple Music", "YouTube" };

        var statementsByArtist = new Dictionary<string, RoyaltyStatement>();

        foreach (var artistId in mockArtists)
        {
            var statement = new RoyaltyStatement
            {
                Id = ObjectId.GenerateNewId(),
                ArtistId = artistId,
                PeriodStart = request.PeriodStart,
                PeriodEnd = request.PeriodEnd,
                DistributorCutPercent = 20m, // Default 20%
                Status = RoyaltyStatementStatus.Draft,
                CreatedAt = DateTime.UtcNow
            };

            // Generate mock line items
            var random = new Random(artistId.GetHashCode() + (int)request.PeriodStart.Ticks);
            var lineItemCount = random.Next(3, 10);

            decimal statementGross = 0;
            decimal statementDistributorCut = 0;

            for (int i = 0; i < lineItemCount; i++)
            {
                var revenue = Math.Round((decimal)random.Next(100, 5000) * 0.1m, 2);
                var distributorCut = Math.Round(revenue * (statement.DistributorCutPercent / 100m), 2);
                var netToArtist = revenue - distributorCut;

                var lineItem = new RoyaltyLineItem
                {
                    ReleaseId = $"release_{i}",
                    TrackId = $"track_{i}",
                    TrackTitle = $"Track {i + 1}",
                    Source = mockSources[i % mockSources.Length],
                    Territory = "GLOBAL",
                    Streams = random.Next(1000, 100000),
                    Revenue = revenue,
                    DistributorCutAmount = distributorCut,
                    NetToArtist = netToArtist,
                    Splits = new() // No splits in basic v1.2
                };

                statement.LineItems.Add(lineItem);
                statementGross += revenue;
                statementDistributorCut += distributorCut;
            }

            statement.GrossRevenue = Math.Round(statementGross, 2);
            statement.DistributorCutAmount = Math.Round(statementDistributorCut, 2);
            statement.NetToArtist = Math.Round(statementGross - statementDistributorCut, 2);

            await _statementsCollection.InsertOneAsync(statement);

            statementsByArtist[artistId] = statement;

            response.ArtistIds.Add(artistId);
            response.TotalGrossRevenue += statement.GrossRevenue;
            response.TotalDistributorCut += statement.DistributorCutAmount;
            response.TotalNetToArtists += statement.NetToArtist;
        }

        response.StatementsCreated = statementsByArtist.Count;
        return response;
    }

    public async Task<RoyaltyStatement> GetStatementAsync(string statementId)
    {
        if (!ObjectId.TryParse(statementId, out var objectId))
            throw new ArgumentException("Invalid statement ID format");

        return await _statementsCollection.Find(s => s.Id == objectId).FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException($"Statement {statementId} not found");
    }

    public async Task<List<RoyaltyStatement>> GetArtistStatementsAsync(string artistId)
    {
        return await _statementsCollection
            .Find(s => s.ArtistId == artistId)
            .SortByDescending(s => s.PeriodEnd)
            .ToListAsync();
    }

    public async Task<RoyaltyStatement> FinalizeStatementAsync(string statementId)
    {
        if (!ObjectId.TryParse(statementId, out var objectId))
            throw new ArgumentException("Invalid statement ID format");

        var statement = await GetStatementAsync(statementId);

        if (statement.Status != RoyaltyStatementStatus.Draft)
            throw new InvalidOperationException($"Cannot finalize statement with status {statement.Status}");

        var update = Builders<RoyaltyStatement>.Update
            .Set(s => s.Status, RoyaltyStatementStatus.Finalized)
            .Set(s => s.FinalizedAt, DateTime.UtcNow);

        await _statementsCollection.UpdateOneAsync(s => s.Id == objectId, update);

        return await GetStatementAsync(statementId);
    }

    public async Task<Payout> CreatePayoutAsync(string statementId, CreatePayoutRequest request)
    {
        var statement = await GetStatementAsync(statementId);

        if (statement.Status != RoyaltyStatementStatus.Finalized)
            throw new InvalidOperationException("Can only create payout for finalized statements");

        if (statement.PayoutId != null)
            throw new InvalidOperationException("Payout already exists for this statement");

        var payout = new Payout
        {
            Id = ObjectId.GenerateNewId(),
            ArtistId = statement.ArtistId,
            Amount = statement.NetToArtist,
            ScheduledFor = request.ScheduledFor,
            Method = request.Method,
            Status = PayoutStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        await _payoutsCollection.InsertOneAsync(payout);

        // Link payout to statement
        var statementUpdate = Builders<RoyaltyStatement>.Update
            .Set(s => s.PayoutId, payout.Id.ToString())
            .Set(s => s.Status, RoyaltyStatementStatus.Paid);

        await _statementsCollection.UpdateOneAsync(s => s.Id == statement.Id, statementUpdate);

        return payout;
    }

    public async Task<ArtistEarningsSummaryResponse> GetArtistEarningsSummaryAsync(string artistId)
    {
        var statements = await GetArtistStatementsAsync(artistId);

        var summary = new ArtistEarningsSummaryResponse
        {
            ArtistId = artistId,
            LifetimeEarnings = statements.Sum(s => s.NetToArtist),
            TotalStatements = statements.Count
        };

        // Current period (last statement)
        if (statements.Count > 0)
        {
            var lastStatement = statements.FirstOrDefault();
            summary.CurrentPeriodEarnings = lastStatement?.NetToArtist ?? 0;
            summary.LastPayoutDate = lastStatement?.FinalizedAt ?? DateTime.MinValue;
        }

        // Pending payouts
        var payouts = await _payoutsCollection
            .Find(p => p.ArtistId == artistId && p.Status == PayoutStatus.Pending)
            .ToListAsync();

        summary.PendingPayouts = payouts.Sum(p => p.Amount);

        return summary;
    }

    public async Task<Payout> MarkPayoutAsPaidAsync(string payoutId)
    {
        if (!ObjectId.TryParse(payoutId, out var objectId))
            throw new ArgumentException("Invalid payout ID format");

        var update = Builders<Payout>.Update
            .Set(p => p.Status, PayoutStatus.Paid)
            .Set(p => p.PaidAt, DateTime.UtcNow);

        var result = await _payoutsCollection.FindOneAndUpdateAsync(
            p => p.Id == objectId,
            update,
            new FindOneAndUpdateOptions<Payout, Payout> { ReturnDocument = ReturnDocument.After }
        );

        return result ?? throw new KeyNotFoundException($"Payout {payoutId} not found");
    }
}
