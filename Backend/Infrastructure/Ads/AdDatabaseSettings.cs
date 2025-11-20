using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace DmfMusicPlatform.StreamGod.Ads
{
    public class AdDatabaseSettings
    {
        public string ConnectionString { get; set; } = string.Empty;
        public string DatabaseName { get; set; } = "dmf_music_platform";

        public string AdBotsCollectionName { get; set; } = "ad_bots";
        public string AdPlaybooksCollectionName { get; set; } = "ad_playbooks";
        public string AdCampaignsCollectionName { get; set; } = "ad_campaigns";
        public string AdCreativesCollectionName { get; set; } = "ad_creatives";
        public string AdMetricsDailyCollectionName { get; set; } = "ad_metrics_daily";
        public string AdBotRunsCollectionName { get; set; } = "ad_bot_runs";
        public string AdPolicyFlagsCollectionName { get; set; } = "ad_policy_flags";
        public string AdCampaignChangeLogsCollectionName { get; set; } = "ad_campaign_change_logs";
    }

    public interface IAdDataContext
    {
        IMongoCollection<AdBot> AdBots { get; }
        IMongoCollection<AdPlaybook> AdPlaybooks { get; }
        IMongoCollection<AdCampaign> AdCampaigns { get; }
        IMongoCollection<AdCreative> AdCreatives { get; }
        IMongoCollection<AdMetricDaily> AdMetricsDaily { get; }
        IMongoCollection<AdBotRun> AdBotRuns { get; }
        IMongoCollection<AdPolicyFlag> AdPolicyFlags { get; }
        IMongoCollection<AdCampaignChangeLog> AdCampaignChangeLogs { get; }

        Task EnsureIndexesAsync(CancellationToken cancellationToken = default);
    }

    public class AdDataContext : IAdDataContext
    {
        private readonly IMongoDatabase _database;
        private readonly AdDatabaseSettings _settings;

        public AdDataContext(AdDatabaseSettings settings)
        {
            _settings = settings;

            var client = new MongoClient(settings.ConnectionString);
            _database = client.GetDatabase(settings.DatabaseName);

            AdBots = _database.GetCollection<AdBot>(settings.AdBotsCollectionName);
            AdPlaybooks = _database.GetCollection<AdPlaybook>(settings.AdPlaybooksCollectionName);
            AdCampaigns = _database.GetCollection<AdCampaign>(settings.AdCampaignsCollectionName);
            AdCreatives = _database.GetCollection<AdCreative>(settings.AdCreativesCollectionName);
            AdMetricsDaily = _database.GetCollection<AdMetricDaily>(settings.AdMetricsDailyCollectionName);
            AdBotRuns = _database.GetCollection<AdBotRun>(settings.AdBotRunsCollectionName);
            AdPolicyFlags = _database.GetCollection<AdPolicyFlag>(settings.AdPolicyFlagsCollectionName);
            AdCampaignChangeLogs = _database.GetCollection<AdCampaignChangeLog>(settings.AdCampaignChangeLogsCollectionName);
        }

        public IMongoCollection<AdBot> AdBots { get; }
        public IMongoCollection<AdPlaybook> AdPlaybooks { get; }
        public IMongoCollection<AdCampaign> AdCampaigns { get; }
        public IMongoCollection<AdCreative> AdCreatives { get; }
        public IMongoCollection<AdMetricDaily> AdMetricsDaily { get; }
        public IMongoCollection<AdBotRun> AdBotRuns { get; }
        public IMongoCollection<AdPolicyFlag> AdPolicyFlags { get; }
        public IMongoCollection<AdCampaignChangeLog> AdCampaignChangeLogs { get; }

        public async Task EnsureIndexesAsync(CancellationToken cancellationToken = default)
        {
            // ad_bots
            await AdBots.Indexes.CreateManyAsync(new[]
            {
                new CreateIndexModel<AdBot>(
                    Builders<AdBot>.IndexKeys.Ascending(b => b.Division).Ascending(b => b.Role)),
                new CreateIndexModel<AdBot>(
                    Builders<AdBot>.IndexKeys.Ascending(b => b.Platform).Ascending(b => b.Status)),
                new CreateIndexModel<AdBot>(
                    Builders<AdBot>.IndexKeys.Ascending(b => b.AssignedArtistIds)),
                new CreateIndexModel<AdBot>(
                    Builders<AdBot>.IndexKeys.Ascending(b => b.Status).Ascending(b => b.NextRunAfter))
            }, cancellationToken: cancellationToken);

            // ad_playbooks
            await AdPlaybooks.Indexes.CreateManyAsync(new[]
            {
                new CreateIndexModel<AdPlaybook>(
                    Builders<AdPlaybook>.IndexKeys.Ascending(p => p.Platform).Ascending(p => p.Division).Ascending(p => p.IsActive)),
                new CreateIndexModel<AdPlaybook>(
                    Builders<AdPlaybook>.IndexKeys.Ascending(p => p.Version))
            }, cancellationToken: cancellationToken);

            // ad_campaigns
            await AdCampaigns.Indexes.CreateManyAsync(new[]
            {
                new CreateIndexModel<AdCampaign>(
                    Builders<AdCampaign>.IndexKeys.Ascending(c => c.ArtistId).Ascending(c => c.Platform).Ascending(c => c.Status)),
                new CreateIndexModel<AdCampaign>(
                    Builders<AdCampaign>.IndexKeys.Ascending(c => c.StartDate).Ascending(c => c.EndDate))
            }, cancellationToken: cancellationToken);

            // ad_creatives
            await AdCreatives.Indexes.CreateManyAsync(new[]
            {
                new CreateIndexModel<AdCreative>(
                    Builders<AdCreative>.IndexKeys.Ascending(c => c.CampaignId).Ascending(c => c.Platform).Ascending(c => c.Status)),
                new CreateIndexModel<AdCreative>(
                    Builders<AdCreative>.IndexKeys.Ascending(c => c.ArtistId).Ascending(c => c.Status)),
                new CreateIndexModel<AdCreative>(
                    Builders<AdCreative>.IndexKeys.Ascending(c => c.Tags))
            }, cancellationToken: cancellationToken);

            // ad_metrics_daily
            await AdMetricsDaily.Indexes.CreateManyAsync(new[]
            {
                new CreateIndexModel<AdMetricDaily>(
                    Builders<AdMetricDaily>.IndexKeys.Ascending(m => m.ArtistId).Descending(m => m.Date)),
                new CreateIndexModel<AdMetricDaily>(
                    Builders<AdMetricDaily>.IndexKeys.Ascending(m => m.CampaignId).Descending(m => m.Date)),
                new CreateIndexModel<AdMetricDaily>(
                    Builders<AdMetricDaily>.IndexKeys.Ascending(m => m.CreativeId).Descending(m => m.Date))
            }, cancellationToken: cancellationToken);

            // ad_bot_runs
            await AdBotRuns.Indexes.CreateManyAsync(new[]
            {
                new CreateIndexModel<AdBotRun>(
                    Builders<AdBotRun>.IndexKeys.Ascending(r => r.BotId).Descending(r => r.StartedAt)),
                new CreateIndexModel<AdBotRun>(
                    Builders<AdBotRun>.IndexKeys.Ascending(r => r.PlaybookId).Descending(r => r.StartedAt)),
                new CreateIndexModel<AdBotRun>(
                    Builders<AdBotRun>.IndexKeys.Ascending(r => r.ArtistIds).Descending(r => r.StartedAt))
            }, cancellationToken: cancellationToken);

            // ad_policy_flags
            await AdPolicyFlags.Indexes.CreateManyAsync(new[]
            {
                new CreateIndexModel<AdPolicyFlag>(
                    Builders<AdPolicyFlag>.IndexKeys.Ascending(f => f.CreativeId).Descending(f => f.DetectedAt)),
                new CreateIndexModel<AdPolicyFlag>(
                    Builders<AdPolicyFlag>.IndexKeys.Ascending(f => f.ArtistId).Descending(f => f.DetectedAt).Ascending(f => f.Severity))
            }, cancellationToken: cancellationToken);

            // ad_campaign_change_logs
            await AdCampaignChangeLogs.Indexes.CreateManyAsync(new[]
            {
                new CreateIndexModel<AdCampaignChangeLog>(
                    Builders<AdCampaignChangeLog>.IndexKeys
                        .Ascending(l => l.CampaignId)
                        .Descending(l => l.ChangedAt)),
                new CreateIndexModel<AdCampaignChangeLog>(
                    Builders<AdCampaignChangeLog>.IndexKeys
                        .Ascending(l => l.ArtistId)
                        .Descending(l => l.ChangedAt)),
                new CreateIndexModel<AdCampaignChangeLog>(
                    Builders<AdCampaignChangeLog>.IndexKeys
                        .Descending(l => l.ChangedAt))
            }, cancellationToken: cancellationToken);
        }
    }
}
