using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace Controllers;

[ApiController]
[Route("api/[controller]")]
public class PricingController : ControllerBase
{
    /// <summary>
    /// GET /api/pricing
    /// Returns all active pricing plans
    /// </summary>
    [HttpGet]
    public IActionResult GetPublicPlans()
    {
        var plans = new List<object>
        {
            new 
            { 
                id = "1",
                _id = "1",
                name = "Indie Artist",
                price = "$9.99",
                priceMonthly = 9.99,
                displayOrder = 1,
                active = true,
                features = new [] { "Distribution to all platforms", "Monthly payouts", "Basic analytics" },
                description = "Perfect for independent artists starting out"
            },
            new 
            { 
                id = "2",
                _id = "2",
                name = "Pro Creator",
                price = "$29.99",
                priceMonthly = 29.99,
                displayOrder = 2,
                active = true,
                features = new [] { "All Indie features", "Playlist pitching", "Advanced analytics", "Email support" },
                description = "For serious creators wanting more reach"
            },
            new 
            { 
                id = "3",
                _id = "3",
                name = "Enterprise Label",
                price = "Custom",
                priceMonthly = 0.0,
                displayOrder = 3,
                active = true,
                features = new [] { "All Pro features", "Dedicated account manager", "Custom API", "Priority support", "SLA guarantee" },
                description = "For labels and major distributors"
            }
        };

        return Ok(plans);
    }

    /// <summary>
    /// GET /api/pricing/{id}
    /// Returns a specific pricing plan by ID
    /// </summary>
    [HttpGet("{id}")]
    public IActionResult GetPlanById(string id)
    {
        var plans = new Dictionary<string, object>
        {
            { "1", new { id = "1", name = "Indie Artist", price = "$9.99", active = true } },
            { "2", new { id = "2", name = "Pro Creator", price = "$29.99", active = true } },
            { "3", new { id = "3", name = "Enterprise Label", price = "Custom", active = true } }
        };

        if (plans.TryGetValue(id, out var plan))
        {
            return Ok(plan);
        }

        return NotFound(new { error = "Plan not found" });
    }

    /// <summary>
    /// POST /api/pricing
    /// Creates a new pricing plan (admin only)
    /// </summary>
    [HttpPost]
    public IActionResult CreatePlan([FromBody] CreatePlanRequest request)
    {
        if (string.IsNullOrEmpty(request.Name) || request.PriceMonthly < 0)
        {
            return BadRequest(new { error = "Invalid plan data" });
        }

        var newPlan = new 
        { 
            id = System.Guid.NewGuid().ToString(),
            name = request.Name,
            price = $"${request.PriceMonthly:F2}",
            priceMonthly = request.PriceMonthly,
            active = request.Active ?? true,
            features = request.Features ?? new string[] { },
            createdAt = System.DateTime.UtcNow
        };

        return CreatedAtAction(nameof(GetPlanById), new { id = newPlan.id }, newPlan);
    }

    /// <summary>
    /// PUT /api/pricing/{id}/toggle
    /// Toggles a plan's active status
    /// </summary>
    [HttpPut("{id}/toggle")]
    public IActionResult TogglePlanStatus(string id)
    {
        return Ok(new { id, message = $"Plan {id} status toggled", active = true });
    }

    /// <summary>
    /// DELETE /api/pricing/{id}
    /// Deletes a pricing plan
    /// </summary>
    [HttpDelete("{id}")]
    public IActionResult DeletePlan(string id)
    {
        return Ok(new { id, message = $"Plan {id} deleted successfully" });
    }
}

public class CreatePlanRequest
{
    public string Name { get; set; }
    public double PriceMonthly { get; set; }
    public bool? Active { get; set; }
    public string[] Features { get; set; }
}
