using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using dmf_music_platform.Web.Models;
using dmf_music_platform.Web.Services;

namespace DmfMusicPlatform.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PricingController : ControllerBase
    {
        private readonly IMongoDbService _mongoService;

        public PricingController(IMongoDbService mongoService)
        {
            _mongoService = mongoService;
        }

        /// <summary>
        /// Get all active pricing plans.
        /// GET /api/pricing
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PricingPlanDto>>> GetAll()
        {
            var plans = await _mongoService.GetPricingPlansAsync();
            return Ok(plans.Select(p => MapToDto(p)).ToList());
        }

        /// <summary>
        /// Get a single plan by planId.
        /// GET /api/pricing/{id}
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<PricingPlanDto>> GetById(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest("Plan id is required.");

            var plan = await _mongoService.GetPricingPlanByIdAsync(id);

            if (plan == null)
                return NotFound($"No pricing plan found with id '{id}'.");

            return Ok(MapToDto(plan));
        }

        /// <summary>
        /// Get all unique categories.
        /// GET /api/pricing/categories
        /// </summary>
        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<string>>> GetCategories()
        {
            var categories = await _mongoService.GetPricingCategoriesAsync();
            return Ok(categories.OrderBy(c => c).ToList());
        }

        /// <summary>
        /// Get plans by category.
        /// GET /api/pricing/category/{category}
        /// </summary>
        [HttpGet("category/{category}")]
        public async Task<ActionResult<IEnumerable<PricingPlanDto>>> GetByCategory(string category)
        {
            if (string.IsNullOrWhiteSpace(category))
                return BadRequest("Category is required.");

            var matches = await _mongoService.GetPricingPlansByCategoryAsync(category);

            if (matches.Count == 0)
                return NotFound($"No pricing plans found in category '{category}'.");

            return Ok(matches.Select(p => MapToDto(p)).ToList());
        }

        /// <summary>
        /// Create a new pricing plan (admin endpoint).
        /// POST /api/pricing
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<string>> Create([FromBody] CreatePricingPlanRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.PlanId))
                return BadRequest("PlanId is required.");

            var plan = new PricingPlan
            {
                PlanId = request.PlanId,
                Name = request.Name,
                Category = request.Category,
                MonthlyPriceUsd = request.MonthlyPriceUsd,
                SetupFeeUsd = request.SetupFeeUsd,
                Description = request.Description,
                Features = request.Features ?? new List<string>(),
                IsActive = true
            };

            var planId = await _mongoService.CreatePricingPlanAsync(plan);
            return CreatedAtAction(nameof(GetById), new { id = planId }, plan);
        }

        /// <summary>
        /// Update an existing pricing plan (admin endpoint).
        /// PUT /api/pricing/{id}
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] CreatePricingPlanRequest request)
        {
            if (string.IsNullOrWhiteSpace(id) || request == null)
                return BadRequest("Plan id and request body are required.");

            var existing = await _mongoService.GetPricingPlanByIdAsync(id);
            if (existing == null)
                return NotFound($"No pricing plan found with id '{id}'.");

            existing.Name = request.Name ?? existing.Name;
            existing.Category = request.Category ?? existing.Category;
            existing.MonthlyPriceUsd = request.MonthlyPriceUsd;
            existing.SetupFeeUsd = request.SetupFeeUsd;
            existing.Description = request.Description ?? existing.Description;
            existing.Features = request.Features ?? existing.Features;

            await _mongoService.UpdatePricingPlanAsync(id, existing);
            return NoContent();
        }

        /// <summary>
        /// Soft-delete a pricing plan (mark as inactive).
        /// DELETE /api/pricing/{id}
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest("Plan id is required.");

            var existing = await _mongoService.GetPricingPlanByIdAsync(id);
            if (existing == null)
                return NotFound($"No pricing plan found with id '{id}'.");

            await _mongoService.DeletePricingPlanAsync(id);
            return NoContent();
        }

        /// <summary>
        /// Map PricingPlan MongoDB model to DTO for API response.
        /// </summary>
        private PricingPlanDto MapToDto(PricingPlan plan)
        {
            return new PricingPlanDto
            {
                Id = plan.PlanId,
                Name = plan.Name,
                Category = plan.Category,
                MonthlyPriceUsd = plan.MonthlyPriceUsd,
                SetupFeeUsd = plan.SetupFeeUsd,
                Description = plan.Description,
                Features = plan.Features
            };
        }
    }

    /// <summary>
    /// DTO for API responses (avoids exposing MongoDB ObjectId).
    /// </summary>
    public class PricingPlanDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal MonthlyPriceUsd { get; set; }
        public decimal SetupFeeUsd { get; set; }
        public string Description { get; set; } = string.Empty;
        public IEnumerable<string> Features { get; set; } = new List<string>();
    }

    /// <summary>
    /// Request DTO for creating/updating pricing plans.
    /// </summary>
    public class CreatePricingPlanRequest
    {
        public string PlanId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal MonthlyPriceUsd { get; set; }
        public decimal SetupFeeUsd { get; set; }
        public string Description { get; set; } = string.Empty;
        public List<string> Features { get; set; } = new();
    }
}
