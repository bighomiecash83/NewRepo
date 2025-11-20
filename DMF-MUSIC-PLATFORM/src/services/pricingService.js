/**
 * DMF Pricing Service – Core Logic (Isomorphic)
 * 
 * Use this in BOTH:
 * - Node.js backend (server.js)
 * - .NET backend (C# services)
 * - React frontend (hooks)
 * 
 * Single source of truth for all pricing calculations.
 */

const path = require('path');

// Load pricing config (works in both Node and .NET context)
function loadPricingConfig() {
  try {
    const configPath = path.join(__dirname, '..', 'config', 'dmf_pricing_config.json');
    const config = require(configPath);
    return config;
  } catch (err) {
    console.error('[DMF] Failed to load pricing config:', err.message);
    return null;
  }
}

const pricingConfig = loadPricingConfig();

// ============================================================================
// PRICING CALCULATIONS (Used across all layers)
// ============================================================================

/**
 * Get release price based on track count
 * Distribution tiers: Single, EP, Album, Mixtape
 */
function getReleasePrice(trackCount) {
  if (!pricingConfig?.distribution) {
    throw new Error('Pricing configuration not loaded');
  }

  const dist = pricingConfig.distribution;

  if (trackCount <= 1) {
    return {
      tier: 'single',
      price: dist.single?.price || 9.99,
      name: dist.single?.name || 'Single Release',
      tracks: 1,
      description: dist.single?.description
    };
  }

  if (trackCount <= 6) {
    return {
      tier: 'ep',
      price: dist.ep?.price || 19.99,
      name: dist.ep?.name || 'EP Release',
      tracks: `2-6`,
      description: dist.ep?.description
    };
  }

  if (trackCount <= 12) {
    return {
      tier: 'album',
      price: dist.album?.price || 29.99,
      name: dist.album?.name || 'Album Release',
      tracks: `7-12`,
      description: dist.album?.description
    };
  }

  return {
    tier: 'mixtape',
    price: dist.mixtape?.price || 39.99,
    name: dist.mixtape?.name || 'Mixtape / Deluxe Release',
    tracks: '13+',
    description: dist.mixtape?.description
  };
}

/**
 * Get catalog migration price
 */
function getMigrationPrice(trackCount) {
  if (!pricingConfig?.catalog_migration) {
    throw new Error('Pricing configuration not loaded');
  }

  const mig = pricingConfig.catalog_migration;

  if (trackCount <= 1) {
    return {
      tier: 'single',
      price: mig.single?.price || 9.99,
      name: mig.single?.name || 'Single Catalog Transfer'
    };
  }

  if (trackCount <= 6) {
    return {
      tier: 'ep',
      price: mig.ep?.price || 14.99,
      name: mig.ep?.name || 'EP Catalog Transfer'
    };
  }

  if (trackCount <= 12) {
    return {
      tier: 'album',
      price: mig.album?.price || 19.99,
      name: mig.album?.name || 'Album Catalog Transfer'
    };
  }

  return {
    tier: 'full_catalog',
    price: mig.full_catalog?.price || 39.99,
    name: mig.full_catalog?.name || 'Full Catalog Transfer'
  };
}

/**
 * Get boost package options
 */
function getBoostPackages() {
  if (!pricingConfig?.boost_packages) {
    throw new Error('Pricing configuration not loaded');
  }

  return {
    ads: pricingConfig.boost_packages.ads || [],
    playlist: pricingConfig.boost_packages.playlist || []
  };
}

/**
 * Apply promotional discount
 */
function applyPromotionalDiscount(basePrice, numReleases = 1, isNewArtist = false) {
  if (!pricingConfig?.promotional_offers) {
    return basePrice;
  }

  const promos = pricingConfig.promotional_offers;

  // Check new artist discount (20% off first 3 releases)
  if (isNewArtist && promos.new_artist_discount?.enabled) {
    const discountPercent = promos.new_artist_discount.discount_percent || 20;
    return basePrice * (1 - discountPercent / 100);
  }

  // Check bulk discount
  if (promos.bulk_discount?.enabled && promos.bulk_discount.tiers) {
    const applicableTier = promos.bulk_discount.tiers
      .sort((a, b) => b.releases - a.releases)
      .find(t => numReleases >= t.releases);

    if (applicableTier) {
      const discountPercent = applicableTier.discount_percent || 0;
      return basePrice * (1 - discountPercent / 100);
    }
  }

  return basePrice;
}

/**
 * Get growth partnership split (artist vs DMF)
 */
function getGrowthSplit() {
  if (!pricingConfig?.growth_partnership) {
    return { artist: 100, dmf: 0 };
  }

  const gp = pricingConfig.growth_partnership;
  return {
    artist: gp.artist_share_percent || 90,
    dmf: gp.dmf_share_percent || 10,
    enabled: gp.enabled !== false,
    explanation: gp.explanation
  };
}

/**
 * Calculate order total with all factors
 */
function calculateOrderTotal(options) {
  const {
    trackCount = 1,
    includeBoosts = false,
    boostIds = [],
    isNewArtist = false,
    numReleases = 1,
    orderType = 'distribution' // 'distribution' or 'migration'
  } = options;

  let releasePrice = 0;
  let releaseInfo = null;

  // Get base price
  if (orderType === 'distribution') {
    releaseInfo = getReleasePrice(trackCount);
    releasePrice = releaseInfo.price;
  } else if (orderType === 'migration') {
    releaseInfo = getMigrationPrice(trackCount);
    releasePrice = releaseInfo.price;
  } else {
    throw new Error(`Unknown order type: ${orderType}`);
  }

  // Apply promotional discount
  const discountedPrice = applyPromotionalDiscount(
    releasePrice,
    numReleases,
    isNewArtist
  );

  const releaseDiscount = releasePrice - discountedPrice;

  // Add boosts
  let boostTotal = 0;
  let boostDetails = [];

  if (includeBoosts && boostIds.length > 0) {
    const boosts = getBoostPackages();
    const allBoosts = [...(boosts.ads || []), ...(boosts.playlist || [])];

    boostIds.forEach(boostId => {
      const boost = allBoosts.find(b => b.id === boostId);
      if (boost) {
        boostTotal += boost.price || 0;
        boostDetails.push({
          id: boost.id,
          name: boost.name,
          price: boost.price
        });
      }
    });
  }

  const total = discountedPrice + boostTotal;
  const growthSplit = getGrowthSplit();

  return {
    orderType,
    releaseInfo,
    releasePrice,
    releaseDiscount,
    discountPercent: numReleases > 1 ? (releaseDiscount / releasePrice * 100).toFixed(1) : 0,
    boosts: boostDetails,
    boostTotal,
    subtotal: discountedPrice,
    total,
    currency: pricingConfig?.currency || 'USD',
    growthSplit: {
      artistPercent: growthSplit.artist,
      dmfPercent: growthSplit.dmf
    },
    estimation: {
      artistEarning: (total * growthSplit.artist / 100).toFixed(2),
      dmfEarning: (total * growthSplit.dmf / 100).toFixed(2)
    }
  };
}

/**
 * Get all pricing (for dashboard/display)
 */
function getAllPricing() {
  if (!pricingConfig) {
    throw new Error('Pricing configuration not loaded');
  }

  const { industry_products, ...publicPricing } = pricingConfig;

  return {
    version: pricingConfig.dmf_pricing_config_version,
    currency: pricingConfig.currency,
    ...publicPricing
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Config
  loadPricingConfig,
  pricingConfig,
  getAllPricing,

  // Core calculations
  getReleasePrice,
  getMigrationPrice,
  getBoostPackages,
  applyPromotionalDiscount,
  getGrowthSplit,
  calculateOrderTotal
};
