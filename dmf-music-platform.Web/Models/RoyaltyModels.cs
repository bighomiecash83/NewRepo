using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace dmf_music_platform.Web.Models;

/// <summary>
/// DMF Royalty Payouts v1.2 - Complete royalty calculation and payout system
/// </summary>
/// 
public enum RoyaltyStatementStatus
{
    Draft,
    Finalized,
    Paid
}

public enum PayoutStatus
{
    Pending,
    Processing,
    Paid,
    Failed
}

[BsonIgnoreExtraElements]
public class RoyaltyStatement
{
    [BsonId]
    public ObjectId Id { get; set; }

    [BsonElement("artistId")]
    public string ArtistId { get; set; } = string.Empty;

    [BsonElement("periodStart")]
    public DateTime PeriodStart { get; set; }

    [BsonElement("periodEnd")]
    public DateTime PeriodEnd { get; set; }

    [BsonElement("grossRevenue")]
    public decimal GrossRevenue { get; set; }

    [BsonElement("distributorCutAmount")]
    public decimal DistributorCutAmount { get; set; }

    [BsonElement("distributorCutPercent")]
    public decimal DistributorCutPercent { get; set; } = 20m; // default 20%

    [BsonElement("netToArtist")]
    public decimal NetToArtist { get; set; }

    [BsonElement("lineItems")]
    public List<RoyaltyLineItem> LineItems { get; set; } = new();

    [BsonElement("status")]
    public RoyaltyStatementStatus Status { get; set; } = RoyaltyStatementStatus.Draft;

    [BsonElement("payoutId")]
    public string? PayoutId { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("finalizedAt")]
    public DateTime? FinalizedAt { get; set; }
}

[BsonIgnoreExtraElements]
public class RoyaltyLineItem
{
    [BsonElement("releaseId")]
    public string ReleaseId { get; set; } = string.Empty;

    [BsonElement("trackId")]
    public string TrackId { get; set; } = string.Empty;

    [BsonElement("trackTitle")]
    public string TrackTitle { get; set; } = string.Empty;

    [BsonElement("source")]
    public string Source { get; set; } = string.Empty; // Spotify, YouTube, Apple Music, etc.

    [BsonElement("territory")]
    public string Territory { get; set; } = "GLOBAL";

    [BsonElement("streams")]
    public long Streams { get; set; }

    [BsonElement("revenue")]
    public decimal Revenue { get; set; }

    [BsonElement("distributorCutAmount")]
    public decimal DistributorCutAmount { get; set; }

    [BsonElement("netToArtist")]
    public decimal NetToArtist { get; set; }

    [BsonElement("splits")]
    public List<OwnershipSplit> Splits { get; set; } = new();
}

[BsonIgnoreExtraElements]
public class OwnershipSplit
{
    [BsonElement("participantId")]
    public string ParticipantId { get; set; } = string.Empty;

    [BsonElement("participantName")]
    public string ParticipantName { get; set; } = string.Empty;

    [BsonElement("sharePercent")]
    public decimal SharePercent { get; set; }

    [BsonElement("amount")]
    public decimal Amount { get; set; }
}

[BsonIgnoreExtraElements]
public class Payout
{
    [BsonId]
    public ObjectId Id { get; set; }

    [BsonElement("artistId")]
    public string ArtistId { get; set; } = string.Empty;

    [BsonElement("amount")]
    public decimal Amount { get; set; }

    [BsonElement("scheduledFor")]
    public DateTime ScheduledFor { get; set; }

    [BsonElement("paidAt")]
    public DateTime? PaidAt { get; set; }

    [BsonElement("status")]
    public PayoutStatus Status { get; set; } = PayoutStatus.Pending;

    [BsonElement("method")]
    public string Method { get; set; } = "manual"; // manual, stripe, paypal, etc.

    [BsonElement("externalReference")]
    public string? ExternalReference { get; set; } // Stripe txn ID, ACH ref, etc.

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("failureReason")]
    public string? FailureReason { get; set; }
}

// DTOs for API requests/responses

public class GenerateStatementsRequest
{
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
}

public class GenerateStatementsResponse
{
    public int StatementsCreated { get; set; }
    public decimal TotalGrossRevenue { get; set; }
    public decimal TotalDistributorCut { get; set; }
    public decimal TotalNetToArtists { get; set; }
    public List<string> ArtistIds { get; set; } = new();
}

public class FinalizeStatementRequest
{
    public string Notes { get; set; } = string.Empty;
}

public class CreatePayoutRequest
{
    public string StatementId { get; set; } = string.Empty;
    public DateTime ScheduledFor { get; set; }
    public string Method { get; set; } = "manual";
}

public class ArtistEarningsSummaryResponse
{
    public string ArtistId { get; set; } = string.Empty;
    public decimal LifetimeEarnings { get; set; }
    public decimal CurrentPeriodEarnings { get; set; }
    public decimal PendingPayouts { get; set; }
    public DateTime LastPayoutDate { get; set; }
    public int TotalStatements { get; set; }
}

public class StatementDetailResponse
{
    public string Id { get; set; } = string.Empty;
    public string ArtistId { get; set; } = string.Empty;
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
    public decimal GrossRevenue { get; set; }
    public decimal DistributorCutAmount { get; set; }
    public decimal DistributorCutPercent { get; set; }
    public decimal NetToArtist { get; set; }
    public RoyaltyStatementStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? FinalizedAt { get; set; }
    public List<RoyaltyLineItem> LineItems { get; set; } = new();
    public PayoutInfo? Payout { get; set; }
}

public class PayoutInfo
{
    public string Id { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime ScheduledFor { get; set; }
    public DateTime? PaidAt { get; set; }
    public PayoutStatus Status { get; set; }
}
