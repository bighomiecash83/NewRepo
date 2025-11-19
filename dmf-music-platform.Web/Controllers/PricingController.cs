using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Bson.Serialization.Attributes;

namespace DmfMusicPlatform.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PricingController : ControllerBase
    {
        private readonly IPricingService _pricingService;

        public PricingController(IPricingService pricingService)
        {
            _pricingService = pricingService;
        }

        // ===========================
        // PUBLIC ENDPOINTS (CLIENT)
        // ===========================

        /// <summary>
        /// Public: Get all ACTIVE pricing plans (for website/app).
        /// GET /api/pricing
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PricingPlanDto>>> GetAllPublic()
        {
            var plans = await _pricingService.GetAllAsync();
            var dtos = plans
                .Where(p => p.IsActive)
                .OrderBy(p => p.DisplayOrder)
                .ThenBy(p => p.MonthlyPriceUsd)
                .Select(ToDto)
                .ToList();

            return Ok(dtos);
        }

        /// <summary>
        /// Public: Get single ACTIVE plan by id/slug.
        /// GET /api/pricing/{id}
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<PricingPlanDto>> GetByIdPublic(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest("Plan id is required.");

            var plan = await _pricingService.GetByIdAsync(id);
            if (plan == null || !plan.IsActive)
                return NotFound($"No active pricing plan found with id '{id}'.");

            return Ok(ToDto(plan));
        }

        /// <summary>
        /// Public: Get categories that have at least one ACTIVE plan.
        /// GET /api/pricing/categories
        /// </summary>
        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<string>>> GetCategoriesPublic()
        {
            var categories = await _pricingService.GetCategoriesAsync(onlyActive: true);
            return Ok(categories);
        }

        /// <summary>
        /// Public: Get ACTIVE plans by category.
        /// GET /api/pricing/category/{category}
        /// </summary>
        [HttpGet("category/{category}")]
        public async Task<ActionResult<IEnumerable<PricingPlanDto>>> GetByCategoryPublic(string category)
        {
            if (string.IsNullOrWhiteSpace(category))
                return BadRequest("Category is required.");

            var plans = await _pricingService.GetByCategoryAsync(category, onlyActive: true);
            var dtos = plans
                .OrderBy(p => p.DisplayOrder)
                .ThenBy(p => p.MonthlyPriceUsd)
                .Select(ToDto)
                .ToList();

            if (!dtos.Any())
                return NotFound($"No active pricing plans found in category '{category}'.");

            return Ok(dtos);
        }

        // ===========================
        // ADMIN ENDPOINTS (OWNER)
        // Prefix: /api/pricing/admin/...
        // ===========================
        // NOTE: Once you wire authentication, put [Authorize] on this region.

        /// <summary>
        /// Admin: Get ALL plans (active + inactive).
        /// GET /api/pricing/admin
        /// </summary>
        [HttpGet("admin")]
        public async Task<ActionResult<IEnumerable<PricingPlanAdminDto>>> GetAllAdmin()
        {
            var plans = await _pricingService.GetAllAdminAsync();
            var dtos = plans
                .OrderByDescending(p => p.IsActive)
                .ThenBy(p => p.DisplayOrder)
                .ThenBy(p => p.MonthlyPriceUsd)
                .Select(ToAdminDto)
                .ToList();

            return Ok(dtos);
        }

        /// <summary>
        /// Admin: Get plan by id (even if inactive).
        /// GET /api/pricing/admin/{id}
        /// </summary>
        [HttpGet("admin/{id}")]
        public async Task<ActionResult<PricingPlanAdminDto>> GetAdminById(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest("Plan id is required.");

            var plan = await _pricingService.GetByIdAsync(id);
            if (plan == null)
                return NotFound($"No pricing plan found with id '{id}'.");

            return Ok(ToAdminDto(plan));
        }

        /// <summary>
        /// Admin: Create new plan.
        /// POST /api/pricing/admin
        /// </summary>
        [HttpPost("admin")]
        public async Task<ActionResult<PricingPlanAdminDto>> Create([FromBody] PricingPlanCreateUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // If Id (slug) not provided, generate from name.
            var id = string.IsNullOrWhiteSpace(dto.Id)
                ? Slugify(dto.Name)
                : dto.Id.Trim();

            var existing = await _pricingService.GetByIdAsync(id);
            if (existing != null)
                return Conflict($"A pricing plan with id '{id}' already exists.");

            var now = DateTime.UtcNow;

            var plan = new PricingPlan
            {
                Id = id,
                Name = dto.Name,
                Category = dto.Category,
                MonthlyPriceUsd = dto.MonthlyPriceUsd,
                SetupFeeUsd = dto.SetupFeeUsd,
                Description = dto.Description ?? string.Empty,
                Features = dto.Features?.ToList() ?? new List<string>(),
                IsActive = dto.IsActive,
                IsRecommended = dto.IsRecommended,
                DisplayOrder = dto.DisplayOrder,
                CreatedAtUtc = now,
                UpdatedAtUtc = now
            };

            await _pricingService.CreateAsync(plan);

            return CreatedAtAction(nameof(GetAdminById),
                new { id = plan.Id },
                ToAdminDto(plan));
        }

        /// <summary>
        /// Admin: Update existing plan (full update).
        /// PUT /api/pricing/admin/{id}
        /// </summary>
        [HttpPut("admin/{id}")]
        public async Task<ActionResult<PricingPlanAdminDto>> Update(string id, [FromBody] PricingPlanCreateUpdateDto dto)
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest("Plan id is required.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existing = await _pricingService.GetByIdAsync(id);
            if (existing == null)
                return NotFound($"No pricing plan found with id '{id}'.");

            existing.Name = dto.Name;
            existing.Category = dto.Category;
            existing.MonthlyPriceUsd = dto.MonthlyPriceUsd;
            existing.SetupFeeUsd = dto.SetupFeeUsd;
            existing.Description = dto.Description ?? string.Empty;
            existing.Features = dto.Features?.ToList() ?? new List<string>();
            existing.IsActive = dto.IsActive;
            existing.IsRecommended = dto.IsRecommended;
            existing.DisplayOrder = dto.DisplayOrder;
            existing.UpdatedAtUtc = DateTime.UtcNow;

            var success = await _pricingService.UpdateAsync(id, existing);
            if (!success)
                return Problem($"Failed to update pricing plan '{id}'.", statusCode: 500);

            return Ok(ToAdminDto(existing));
        }

        /// <summary>
        /// Admin: Toggle active flag quickly.
        /// PATCH /api/pricing/admin/{id}/toggle-active
        /// </summary>
        [HttpPatch("admin/{id}/toggle-active")]
        public async Task<ActionResult> ToggleActive(string id)
        {
            var plan = await _pricingService.GetByIdAsync(id);
            if (plan == null)
                return NotFound($"No pricing plan found with id '{id}'.");

            plan.IsActive = !plan.IsActive;
            plan.UpdatedAtUtc = DateTime.UtcNow;

            var success = await _pricingService.UpdateAsync(id, plan);
            if (!success)
                return Problem($"Failed to toggle active state for '{id}'.", statusCode: 500);

            return NoContent();
        }

        /// <summary>
        /// Admin: Hard delete a plan.
        /// DELETE /api/pricing/admin/{id}
        /// </summary>
        [HttpDelete("admin/{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var success = await _pricingService.DeleteAsync(id);
            if (!success)
                return NotFound($"No pricing plan found with id '{id}'.");

            return NoContent();
        }

        // ===========================
        // Mapping Helpers (Entity → DTO)
        // ===========================

        private static PricingPlanDto ToDto(PricingPlan p) => new()
        {
            Id = p.Id,
            Name = p.Name,
            Category = p.Category,
            MonthlyPriceUsd = p.MonthlyPriceUsd,
            SetupFeeUsd = p.SetupFeeUsd,
            Description = p.Description,
            Features = p.Features ?? new List<string>(),
            IsRecommended = p.IsRecommended
        };

        private static PricingPlanAdminDto ToAdminDto(PricingPlan p) => new()
        {
            Id = p.Id,
            Name = p.Name,
            Category = p.Category,
            MonthlyPriceUsd = p.MonthlyPriceUsd,
            SetupFeeUsd = p.SetupFeeUsd,
            Description = p.Description,
            Features = p.Features ?? new List<string>(),
            IsActive = p.IsActive,
            IsRecommended = p.IsRecommended,
            DisplayOrder = p.DisplayOrder,
            CreatedAtUtc = p.CreatedAtUtc,
            UpdatedAtUtc = p.UpdatedAtUtc
        };

        private static string Slugify(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return Guid.NewGuid().ToString("N");

            var lower = input.Trim().ToLowerInvariant();
            var chars = lower
                .Select(c => char.IsLetterOrDigit(c) ? c : '-')
                .ToArray();

            var slug = new string(chars);
            while (slug.Contains("--"))
                slug = slug.Replace("--", "-");

            slug = slug.Trim('-');

            return string.IsNullOrWhiteSpace(slug)
                ? Guid.NewGuid().ToString("N")
                : $"dmf-{slug}";
        }
    }

    // ===========================
    // SERVICE INTERFACE + IMPL
    // ===========================

    public interface IPricingService
    {
        Task<List<PricingPlan>> GetAllAsync();                       // active only
        Task<List<PricingPlan>> GetAllAdminAsync();                  // all
        Task<PricingPlan?> GetByIdAsync(string id);
        Task<List<string>> GetCategoriesAsync(bool onlyActive);
        Task<List<PricingPlan>> GetByCategoryAsync(string category, bool onlyActive);
        Task CreateAsync(PricingPlan plan);
        Task<bool> UpdateAsync(string id, PricingPlan plan);
        Task<bool> DeleteAsync(string id);
    }

    public class MongoPricingService : IPricingService
    {
        private readonly IMongoCollection<PricingPlan> _collection;

        private static readonly List<PricingPlan> DefaultPlans = new()
        {
            new PricingPlan
            {
                Id = "dmf-distribution-core",
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
                IsActive = true,
                IsRecommended = false,
                DisplayOrder = 10,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            },
            new PricingPlan
            {
                Id = "dmf-distribution-pro",
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
                IsActive = true,
                IsRecommended = true,
                DisplayOrder = 20,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            },
            new PricingPlan
            {
                Id = "dmf-marketing-campaign",
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
                IsActive = true,
                IsRecommended = false,
                DisplayOrder = 30,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            },
            new PricingPlan
            {
                Id = "dmf-legal-guard",
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
                IsActive = true,
                IsRecommended = false,
                DisplayOrder = 40,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            },
            new PricingPlan
            {
                Id = "dmf-all-access",
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
                IsActive = true,
                IsRecommended = true,
                DisplayOrder = 5,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            }
        };

        public MongoPricingService(IOptions<PricingDatabaseSettings> dbOptions)
        {
            var settings = dbOptions.Value;
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            _collection = database.GetCollection<PricingPlan>(settings.CollectionName);
        }

        private async Task EnsureSeededAsync()
        {
            var count = await _collection.CountDocumentsAsync(FilterDefinition<PricingPlan>.Empty);
            if (count == 0)
            {
                await _collection.InsertManyAsync(DefaultPlans);
            }
        }

        public async Task<List<PricingPlan>> GetAllAsync()
        {
            await EnsureSeededAsync();

            var filter = Builders<PricingPlan>.Filter.Eq(p => p.IsActive, true);
            return await _collection
                .Find(filter)
                .SortBy(p => p.DisplayOrder)
                .ThenBy(p => p.MonthlyPriceUsd)
                .ToListAsync();
        }

        public async Task<List<PricingPlan>> GetAllAdminAsync()
        {
            await EnsureSeededAsync();

            return await _collection
                .Find(FilterDefinition<PricingPlan>.Empty)
                .ToListAsync();
        }

        public async Task<PricingPlan?> GetByIdAsync(string id)
        {
            await EnsureSeededAsync();

            return await _collection
                .Find(p => p.Id == id)
                .FirstOrDefaultAsync();
        }

        public async Task<List<string>> GetCategoriesAsync(bool onlyActive)
        {
            await EnsureSeededAsync();

            var filter = onlyActive
                ? Builders<PricingPlan>.Filter.Eq(p => p.IsActive, true)
                : FilterDefinition<PricingPlan>.Empty;

            var categories = await _collection
                .Distinct<string>("Category", filter)
                .ToListAsync();

            return categories
                .Where(c => !string.IsNullOrWhiteSpace(c))
                .OrderBy(c => c)
                .ToList();
        }

        public async Task<List<PricingPlan>> GetByCategoryAsync(string category, bool onlyActive)
        {
            await EnsureSeededAsync();

            var baseFilter = Builders<PricingPlan>.Filter.Eq(
                p => p.Category, category);

            var filter = onlyActive
                ? Builders<PricingPlan>.Filter.And(
                    baseFilter,
                    Builders<PricingPlan>.Filter.Eq(p => p.IsActive, true))
                : baseFilter;

            return await _collection
                .Find(filter)
                .SortBy(p => p.DisplayOrder)
                .ThenBy(p => p.MonthlyPriceUsd)
                .ToListAsync();
        }

        public async Task CreateAsync(PricingPlan plan)
        {
            await EnsureSeededAsync();
            await _collection.InsertOneAsync(plan);
        }

        public async Task<bool> UpdateAsync(string id, PricingPlan plan)
        {
            var result = await _collection.ReplaceOneAsync(p => p.Id == id, plan);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var result = await _collection.DeleteOneAsync(p => p.Id == id);
            return result.IsAcknowledged && result.DeletedCount > 0;
        }
    }

    // ===========================
    // SETTINGS + ENTITY + DTOS
    // ===========================

    public class PricingDatabaseSettings
    {
        public string ConnectionString { get; set; } = string.Empty;
        public string DatabaseName { get; set; } = "dmf_music_platform";
        public string CollectionName { get; set; } = "pricing_plans";
    }

    [BsonIgnoreExtraElements]
    public class PricingPlan
    {
        /// <summary>
        /// Stable id/slug like "dmf-distribution-core".
        /// </summary>
        public string Id { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        public decimal MonthlyPriceUsd { get; set; }

        public decimal SetupFeeUsd { get; set; }

        public string Description { get; set; } = string.Empty;

        public List<string> Features { get; set; } = new();

        public bool IsActive { get; set; } = true;

        public bool IsRecommended { get; set; } = false;

        public int DisplayOrder { get; set; } = 0;

        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
    }

    // What the public app sees
    public class PricingPlanDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal MonthlyPriceUsd { get; set; }
        public decimal SetupFeeUsd { get; set; }
        public string Description { get; set; } = string.Empty;
        public IEnumerable<string> Features { get; set; } = new List<string>();
        public bool IsRecommended { get; set; }
    }

    // What the admin UI sees
    public class PricingPlanAdminDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal MonthlyPriceUsd { get; set; }
        public decimal SetupFeeUsd { get; set; }
        public string Description { get; set; } = string.Empty;
        public IEnumerable<string> Features { get; set; } = new List<string>();
        public bool IsActive { get; set; }
        public bool IsRecommended { get; set; }
        public int DisplayOrder { get; set; }
        public DateTime CreatedAtUtc { get; set; }
        public DateTime UpdatedAtUtc { get; set; }
    }

    // What admin sends when creating/updating
    public class PricingPlanCreateUpdateDto
    {
        /// <summary>
        /// Optional. If empty, slug will be generated from Name.
        /// </summary>
        public string? Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        public decimal MonthlyPriceUsd { get; set; }

        public decimal SetupFeeUsd { get; set; }

        public string? Description { get; set; }

        public IEnumerable<string>? Features { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsRecommended { get; set; } = false;

        public int DisplayOrder { get; set; } = 0;
    }
}
