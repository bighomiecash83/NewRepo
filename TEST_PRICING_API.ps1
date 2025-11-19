# DMF Pricing System API Test Script
# Tests all pricing endpoints

$baseUrl = "http://localhost:5183"
$headers = @{ "Content-Type" = "application/json" }

Write-Host "🧪 DMF Pricing System API Tests" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Get all public plans
Write-Host "📋 TEST 1: Get All Public Plans" -ForegroundColor Yellow
try {
    $resp = Invoke-WebRequest -Uri "$baseUrl/api/pricing" -Method GET -Headers $headers -ErrorAction Stop
    $plans = $resp.Content | ConvertFrom-Json
    Write-Host "✅ SUCCESS" -ForegroundColor Green
    Write-Host "   Response Code: $($resp.StatusCode)"
    Write-Host "   Plans Found: $($plans.Count)"
    $plans | ForEach-Object { Write-Host "     - $($_.name) ($($_.category)): `$$($_.monthlyPriceUsd)/mo" }
    Write-Host ""
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Get categories
Write-Host "📂 TEST 2: Get All Categories" -ForegroundColor Yellow
try {
    $resp = Invoke-WebRequest -Uri "$baseUrl/api/pricing/categories" -Method GET -Headers $headers -ErrorAction Stop
    $categories = $resp.Content | ConvertFrom-Json
    Write-Host "✅ SUCCESS" -ForegroundColor Green
    Write-Host "   Categories: $($categories -join ', ')"
    Write-Host ""
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 3: Get by category
Write-Host "🏷️  TEST 3: Get Plans by Category (Distribution)" -ForegroundColor Yellow
try {
    $resp = Invoke-WebRequest -Uri "$baseUrl/api/pricing/category/Distribution" -Method GET -Headers $headers -ErrorAction Stop
    $plans = $resp.Content | ConvertFrom-Json
    Write-Host "✅ SUCCESS" -ForegroundColor Green
    Write-Host "   Plans in Distribution: $($plans.Count)"
    $plans | ForEach-Object { Write-Host "     - $($_.name): `$$($_.monthlyPriceUsd)/mo" }
    Write-Host ""
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 4: Get plan by ID
Write-Host "🔍 TEST 4: Get Specific Plan by ID" -ForegroundColor Yellow
try {
    $resp = Invoke-WebRequest -Uri "$baseUrl/api/pricing/dmf-distribution-core" -Method GET -Headers $headers -ErrorAction Stop
    $plan = $resp.Content | ConvertFrom-Json
    Write-Host "✅ SUCCESS" -ForegroundColor Green
    Write-Host "   Plan: $($plan.name)"
    Write-Host "   Category: $($plan.category)"
    Write-Host "   Price: `$$($plan.monthlyPriceUsd)/mo + `$$($plan.setupFeeUsd) setup"
    Write-Host "   Features: $($plan.features.Count)"
    Write-Host ""
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 5: Get all admin plans (unfiltered)
Write-Host "👨‍💼 TEST 5: Get All Admin Plans" -ForegroundColor Yellow
try {
    $resp = Invoke-WebRequest -Uri "$baseUrl/api/pricing/admin" -Method GET -Headers $headers -ErrorAction Stop
    $plans = $resp.Content | ConvertFrom-Json
    Write-Host "✅ SUCCESS" -ForegroundColor Green
    Write-Host "   Total Plans: $($plans.Count)"
    $plans | ForEach-Object { Write-Host "     - $($_.name) [Active: $($_.isActive)] [Recommended: $($_.isRecommended)]" }
    Write-Host ""
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 6: Create new plan
Write-Host "➕ TEST 6: Create New Pricing Plan" -ForegroundColor Yellow
$newPlan = @{
    name = "Test Plan"
    category = "Testing"
    monthlyPriceUsd = 49.99
    setupFeeUsd = 99.99
    description = "A test pricing plan"
    features = @("Feature 1", "Feature 2")
    isActive = $true
    isRecommended = $false
    displayOrder = 99
} | ConvertTo-Json

try {
    $resp = Invoke-WebRequest -Uri "$baseUrl/api/pricing/admin" -Method POST -Headers $headers -Body $newPlan -ErrorAction Stop
    $created = $resp.Content | ConvertFrom-Json
    Write-Host "✅ SUCCESS" -ForegroundColor Green
    Write-Host "   Created Plan ID: $($created.id)"
    Write-Host "   Name: $($created.name)"
    Write-Host "   Price: `$$($created.monthlyPriceUsd)/mo"
    $testPlanId = $created.id
    Write-Host ""
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
    Write-Host ""
    $testPlanId = $null
}

# Test 7: Update plan
if ($testPlanId) {
    Write-Host "✏️  TEST 7: Update Pricing Plan" -ForegroundColor Yellow
    $updatePlan = @{
        name = "Test Plan (Updated)"
        category = "Testing"
        monthlyPriceUsd = 59.99
        setupFeeUsd = 99.99
        description = "Updated test plan"
        features = @("Feature 1", "Feature 2", "Feature 3")
        isActive = $true
        isRecommended = $true
        displayOrder = 100
    } | ConvertTo-Json

    try {
        $resp = Invoke-WebRequest -Uri "$baseUrl/api/pricing/admin/$testPlanId" -Method PUT -Headers $headers -Body $updatePlan -ErrorAction Stop
        $updated = $resp.Content | ConvertFrom-Json
        Write-Host "✅ SUCCESS" -ForegroundColor Green
        Write-Host "   Updated Plan: $($updated.name)"
        Write-Host "   New Price: `$$($updated.monthlyPriceUsd)/mo"
        Write-Host "   Recommended: $($updated.isRecommended)"
        Write-Host ""
    } catch {
        Write-Host "❌ FAILED: $_" -ForegroundColor Red
        Write-Host ""
    }

    # Test 8: Toggle Active status
    Write-Host "🔄 TEST 8: Toggle Plan Active Status" -ForegroundColor Yellow
    try {
        $resp = Invoke-WebRequest -Uri "$baseUrl/api/pricing/admin/$testPlanId/toggle-active" -Method PATCH -Headers $headers -ErrorAction Stop
        $toggled = $resp.Content | ConvertFrom-Json
        Write-Host "✅ SUCCESS" -ForegroundColor Green
        Write-Host "   Plan: $($toggled.name)"
        Write-Host "   IsActive: $($toggled.isActive)"
        Write-Host ""
    } catch {
        Write-Host "❌ FAILED: $_" -ForegroundColor Red
        Write-Host ""
    }

    # Test 9: Delete plan
    Write-Host "🗑️  TEST 9: Delete Pricing Plan" -ForegroundColor Yellow
    try {
        $resp = Invoke-WebRequest -Uri "$baseUrl/api/pricing/admin/$testPlanId" -Method DELETE -Headers $headers -ErrorAction Stop
        Write-Host "✅ SUCCESS" -ForegroundColor Green
        Write-Host "   Plan deleted (or marked inactive)"
        Write-Host ""
    } catch {
        Write-Host "❌ FAILED: $_" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ API Test Complete!" -ForegroundColor Cyan
