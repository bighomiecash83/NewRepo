using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DMF.Data
{
    /// <summary>
    /// Creates and manages MongoDB indexes for the ad bot system.
    /// Run this once during app startup via MongoDbIndexManager.EnsureIndexes().
    /// </summary>
    public class AdBotIndexManager
    {
        private readonly IMongoDatabase _database;

        public AdBotIndexManager(IMongoDatabase database)
        {
            _database = database;
        }

        /// <summary>
        /// Ensures all ad bot collection indexes are created.
        /// Call this during app startup.
        /// </summary>
        public async Task EnsureIndexesAsync()
        {
            await CreateAdBotsIndexes();
            await CreateAdPlaybooksIndexes();
            await CreateAdCampaignsIndexes();
            await CreateAdCreativesIndexes();
            await CreateAdMetricsDailyIndexes();
            await CreateAdBotRunsIndexes();
            await CreateAdPolicyFlagsIndexes();
        }

        private async Task CreateAdBotsIndexes()
        {
            var collection = _database.GetCollection<object>("ad_bots");

            var indexModels = new List<CreateIndexModel<object>>
            {
                new CreateIndexModel<object>(
                    Builders<object>.IndexKeys.Ascending("division").Ascending("role")
                ),
                new CreateIndexModel<object>(
                    Builders<object>.IndexKeys.Ascending("platform").Ascending("status")
                ),
                new CreateIndexModel<object>(
                    Builders<object>.IndexKeys.Ascending("assigned_artist_ids")
                ),
                new CreateIndexModel<object>(
                    Builders<object>.IndexKeys.Ascending("status").Ascending("next_run_after")
                )
            };

            await collection.Indexes.CreateManyAsync(indexModels);
        }

        private async Task CreateAdPlaybooksIndexes()
        {
            var collection = _database.GetCollection<object>("ad_playbooks");

            var indexModels = new List<CreateIndexModel<object>>
            {
                new CreateIndexModel<object>(
                    Builders<object>.IndexKeys
                        .Ascending("platform")
                        .Ascending("division")
                        .Ascending("is_active")
                ),
                new CreateIndexModel<object>(
                    Builders<object>.IndexKeys.Ascending("version")
                )
            };

            await collection.Indexes.CreateManyAsync(indexModels);
        }

        private async Task CreateAdCampaignsIndexes()
        {
            var collection = _database.GetCollection<object>("ad_campaigns");

            var indexModels = new List<CreateIndexModel<object>>
            {
                new CreateIndexModel<object>(
                    Builders<object>.IndexKeys
                        .Ascending("artist_id")
                        .Ascending("platform")
                        .Ascending("status")
                ),
                new CreateIndexModel<object>(
                    Builders<object>.IndexKeys.Ascending("start_date").Ascending("end_date")
                )
            };

            await collection.Indexes.CreateManyAsync(indexModels);
        }

        private async Task CreateAdCreativesIndexes()
        {
            var collection = _database.GetCollection<object>("ad_creatives");

            var indexModels = new List<CreateIndexModel<object>>
            {
                new CreateIndexModel<object>(
                    Builders<object>.IndexKeys
                        .Ascending("campaign_id")
                        .Ascending("platform")
                        .Ascending("status")
                ),
                new CreateIndexModel<object>(
                    Builders<object>.IndexKeys.Ascending("artist_id").Ascending("status")
                ),
                new CreateIndexModel<object>(
                    Builders<object>.IndexKeys.Ascending("tags")
                )
            };

            await collection.Indexes.CreateManyAsync(indexModels);
        }

        private async Task CreateAdMetricsDailyIndexes()
        {
            var collection = _database.GetCollection<object>("ad_metrics_daily");

            var indexModels = new List<CreateIndexModel<object>>
            {
                new CreateIndexModel<object>(
                    Builders<object>.IndexKeys.Ascending("artist_id").Descending("date")
                ),
                new CreateIndexModel<object>(
                    Builders<object>.IndexKeys.Ascending("campaign_id").Descending("date")
                ),
                new CreateIndexModel<object>(
                    Builders<object>.IndexKeys.Ascending("creative_id").Descending("date")
                )
            };

            await collection.Indexes.CreateManyAsync(indexModels);
        }

        private async Task CreateAdBotRunsIndexes()
        {
            var collection = _database.GetCollection<object>("ad_bot_runs");

            var indexModels = new List<CreateIndexModel<object>>
            {
                new CreateIndexModel<object>(
                    Builders<object>.IndexKeys.Ascending("bot_id").Descending("started_at")
                ),
                new CreateIndexModel<object>(
                    Builders<object>.IndexKeys.Ascending("artist_ids").Descending("started_at")
                ),
                new CreateIndexModel<object>(
                    Builders<object>.IndexKeys.Ascending("playbook_id").Descending("started_at")
                )
            };

            await collection.Indexes.CreateManyAsync(indexModels);
        }

        private async Task CreateAdPolicyFlagsIndexes()
        {
            var collection = _database.GetCollection<object>("ad_policy_flags");

            var indexModels = new List<CreateIndexModel<object>>
            {
                new CreateIndexModel<object>(
                    Builders<object>.IndexKeys.Ascending("creative_id").Descending("detected_at")
                ),
                new CreateIndexModel<object>(
                    Builders<object>.IndexKeys
                        .Ascending("artist_id")
                        .Descending("detected_at")
                        .Ascending("severity")
                )
            };

            await collection.Indexes.CreateManyAsync(indexModels);
        }
    }
}
