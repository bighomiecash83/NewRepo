using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using DmfMusicPlatform.StreamGod.Ads;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;

namespace DmfMusicPlatform.StreamGod.Services
{
    public interface IAdActionExecutor
    {
        Task<AdActionExecutionResult> ApplyRecentActionsAsync(
            int hoursBack,
            bool dryRun = false,
            CancellationToken cancellationToken = default);
    }

    public class AdActionExecutionResult
    {
        public int ActionsProcessed { get; set; }
        public int CampaignsUpdated { get; set; }
        public int PausesApplied { get; set; }
        public int BudgetIncreases { get; set; }
        public int BudgetCuts { get; set; }
        public bool DryRun { get; set; }
        public DateTime WindowStartUtc { get; set; }
        public DateTime WindowEndUtc { get; set; }
    }

    public class AdActionExecutor : IAdActionExecutor
    {
        private readonly IAdDataContext _ctx;
        private readonly ILogger<AdActionExecutor> _logger;

        public AdActionExecutor(IAdDataContext ctx, ILogger<AdActionExecutor> logger)
        {
            _ctx = ctx;
            _logger = logger;
        }

        public async Task<AdActionExecutionResult> ApplyRecentActionsAsync(
            int hoursBack,
            bool dryRun = false,
            CancellationToken cancellationToken = default)
        {
            if (hoursBack <= 0) hoursBack = 24;

            var now = DateTime.UtcNow;
            var windowStart = now.AddHours(-hoursBack);

            var result = new AdActionExecutionResult
            {
                DryRun = dryRun,
                WindowStartUtc = windowStart,
                WindowEndUtc = now
            };

            try
            {
                // 1) Pull recent completed runs
                var runFilter = Builders<AdBotRun>.Filter.And(
                    Builders<AdBotRun>.Filter.Gte(r => r.StartedAt, windowStart),
                    Builders<AdBotRun>.Filter.Lte(r => r.StartedAt, now),
                    Builders<AdBotRun>.Filter.Eq(r => r.Status, AdBotRunStatus.Completed)
                );

                var runs = await _ctx.AdBotRuns
                    .Find(runFilter)
                    .SortByDescending(r => r.StartedAt)
                    .Limit(1000)
                    .ToListAsync(cancellationToken);

                if (!runs.Any())
                {
                    _logger.LogInformation("AdActionExecutor: no recent runs in the last {Hours}h.", hoursBack);
                    return result;
                }

                // 2) Flatten actions and group by campaign
                var allActions = runs
                    .SelectMany(r => r.Actions ?? new List<AdBotAction>())
                    .Where(a =>
                        a.Type == AdBotActionType.RecommendScale ||
                        a.Type == AdBotActionType.RecommendBudgetCut ||
                        a.Type == AdBotActionType.RecommendPause)
                    .ToList();

                if (!allActions.Any())
                {
                    _logger.LogInformation("AdActionExecutor: no actionable items found in recent runs.");
                    return result;
                }

                result.ActionsProcessed = allActions.Count;

                var actionsByCampaign = allActions
                    .Where(a => !string.IsNullOrWhiteSpace(a.CampaignId))
                    .GroupBy(a => a.CampaignId!)
                    .ToList();

                foreach (var group in actionsByCampaign)
                {
                    var campaignId = group.Key;
                    var campaign = await _ctx.AdCampaigns
                        .Find(c => c.Id == campaignId)
                        .FirstOrDefaultAsync(cancellationToken);

                    if (campaign == null)
                        continue;

                    var updated = false;

                    // Determine working daily budget
                    var currentBudget = campaign.CurrentDailyBudgetUsd > 0
                        ? campaign.CurrentDailyBudgetUsd
                        : campaign.BudgetDailyCapUsd;

                    decimal originalBudget = currentBudget;

                    foreach (var action in group)
                    {
                        switch (action.Type)
                        {
                            case AdBotActionType.RecommendScale:
                                if (!campaign.AllowAutoBudgetAdjustments)
                                    continue;

                                var inc = action.SuggestedBudgetIncreasePercent ?? 20;
                                currentBudget = ApplyPercentChange(currentBudget, inc, true);
                                result.BudgetIncreases++;
                                updated = true;
                                break;

                            case AdBotActionType.RecommendBudgetCut:
                                if (!campaign.AllowAutoBudgetAdjustments)
                                    continue;

                                var cut = action.SuggestedBudgetCutPercent ?? 20;
                                currentBudget = ApplyPercentChange(currentBudget, cut, false);
                                result.BudgetCuts++;
                                updated = true;
                                break;

                            case AdBotActionType.RecommendPause:
                                if (!campaign.AllowAutoPause)
                                    continue;

                                if (campaign.Status == AdCampaignStatus.Active)
                                {
                                    campaign.Status = AdCampaignStatus.Paused;
                                    result.PausesApplied++;
                                    updated = true;
                                }
                                break;
                        }
                    }

                    // Clamp budget to sane range
                    if (currentBudget < 5m) currentBudget = 5m; // minimum daily budget
                    if (currentBudget > campaign.BudgetTotalUsd && campaign.BudgetTotalUsd > 0)
                        currentBudget = campaign.BudgetTotalUsd;

                    if (updated)
                    {
                        campaign.CurrentDailyBudgetUsd = currentBudget;
                        campaign.UpdatedAt = DateTime.UtcNow;

                        result.CampaignsUpdated++;

                        if (dryRun)
                        {
                            _logger.LogInformation(
                                "AdActionExecutor (dry-run): campaign {CampaignId} from {Original} -> {New}, status={Status}",
                                campaign.Id, originalBudget, currentBudget, campaign.Status);
                        }
                        else
                        {
                            var updateDef = Builders<AdCampaign>.Update
                                .Set(c => c.CurrentDailyBudgetUsd, campaign.CurrentDailyBudgetUsd)
                                .Set(c => c.Status, campaign.Status)
                                .Set(c => c.UpdatedAt, campaign.UpdatedAt);

                            await _ctx.AdCampaigns.UpdateOneAsync(
                                c => c.Id == campaign.Id,
                                updateDef,
                                cancellationToken: cancellationToken);

                            _logger.LogInformation(
                                "AdActionExecutor: campaign {CampaignId} updated. Budget {Original} -> {New}, status={Status}",
                                campaign.Id, originalBudget, currentBudget, campaign.Status);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AdActionExecutor: error applying recent actions.");
                throw;
            }

            return result;
        }

        private decimal ApplyPercentChange(decimal current, int percent, bool increase)
        {
            var factor = (decimal)percent / 100m;
            if (increase)
            {
                return current + (current * factor);
            }
            else
            {
                return current - (current * factor);
            }
        }
    }
}
