using dmf_music_platform.Web.Models;
using dmf_music_platform.Web.Services;
using MongoDB.Driver;

namespace dmf_music_platform.Web.Domain.Services
{
    /// <summary>
    /// Seeds the pricing_plans MongoDB collection with default DMF pricing plans.
    /// Run this once on app startup if the collection is empty.
    /// </summary>
    public class PricingPlanSeeder
    {
        private readonly IMongoDbService _mongoService;

        public PricingPlanSeeder(IMongoDbService mongoService)
        {
            _mongoService = mongoService;
        }

        /// <summary>
        /// Seeds default pricing plans if the collection is empty.
        /// </summary>
        public async Task SeedDefaultPlansAsync()
        {
            var existingPlans = await _mongoService.GetPricingPlansAsync();
            if (existingPlans.Count > 0)
            {
                Console.WriteLine("✅ Pricing plans already exist in MongoDB. Skipping seed.");
                return;
            }

            Console.WriteLine("🌱 Seeding default pricing plans...");

            var defaultPlans = new List<PricingPlan>
            {
                new PricingPlan
                {
                    PlanId = "dmf-distribution-core",
                    Name = "Distribution Core",
                    Category = "Distribution",
                    MonthlyPriceUsd = 0m,
                    SetupFeeUsd = 49m,
                    Description = "Starter tier for indie artists. Upload releases, basic delivery to all major DSPs.",
                    Features = new List<string>
                    {
                        "Global DSP delivery (Spotify, Apple, YouTube, TikTok, etc.)",
                        "Basic catalog management",
                        "Standard release scheduling",
                        "Email support"
                    },
                    IsActive = true
                },
                new PricingPlan
                {
                    PlanId = "dmf-distribution-pro",
                    Name = "Distribution Pro",
                    Category = "Distribution",
                    MonthlyPriceUsd = 39m,
                    SetupFeeUsd = 0m,
                    Description = "Serious artists and small labels. Priority delivery, faster checks, better reporting.",
                    Features = new List<string>
                    {
                        "All Core features",
                        "Priority QC & delivery",
                        "Advanced royalties dashboard",
                        "Pre-save & smart links",
                        "Priority support"
                    },
                    IsActive = true
                },
                new PricingPlan
                {
                    PlanId = "dmf-marketing-campaign",
                    Name = "Campaign Engine",
                    Category = "Marketing",
                    MonthlyPriceUsd = 99m,
                    SetupFeeUsd = 199m,
                    Description = "Stream campaign playbooks handled by StreamGod's marketing engine.",
                    Features = new List<string>
                    {
                        "YouTube / Meta / TikTok campaign blueprints",
                        "Audience + geo targeting presets",
                        "Weekly performance summary",
                        "Basic creative guidance"
                    },
                    IsActive = true
                },
                new PricingPlan
                {
                    PlanId = "dmf-legal-guard",
                    Name = "Legal Guard",
                    Category = "Legal",
                    MonthlyPriceUsd = 59m,
                    SetupFeeUsd = 0m,
                    Description = "Baseline protection powered by The Gavel Syndicate.",
                    Features = new List<string>
                    {
                        "Template split sheets & agreements",
                        "Basic takedown request templates",
                        "Flag & log potential infringements",
                        "Quarterly IP health summary"
                    },
                    IsActive = true
                },
                new PricingPlan
                {
                    PlanId = "dmf-all-access",
                    Name = "All-Access Label OS",
                    Category = "Bundle",
                    MonthlyPriceUsd = 199m,
                    SetupFeeUsd = 299m,
                    Description = "Full DMF stack: distribution, marketing, and legal support in one bundle.",
                    Features = new List<string>
                    {
                        "All Distribution Pro features",
                        "All Campaign Engine features",
                        "All Legal Guard features",
                        "Priority roadmap consideration",
                        "Dedicated success contact (email)"
                    },
                    IsActive = true
                }
            };

            foreach (var plan in defaultPlans)
            {
                await _mongoService.CreatePricingPlanAsync(plan);
                Console.WriteLine($"  ✅ Created: {plan.Name} ({plan.Category})");
            }

            Console.WriteLine($"✅ Seeded {defaultPlans.Count} pricing plans successfully!");
        }
    }
}
