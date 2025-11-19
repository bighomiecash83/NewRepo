/**
 * PricingPage.jsx
 * 
 * Complete pricing page component for DMF Artist Dashboard
 * Displays all tiers: distribution, migration, boosts, partnership
 * 
 * Ready to drop into your React app
 * Usage: <Route path="/pricing" element={<PricingPage />} />
 */

import React, { useEffect, useState } from 'react';
import './PricingPage.css'; // See CSS below

export function useDmfPricing() {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/config/pricing');

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        setPricing(data);
      } catch (err) {
        console.error('[PricingPage] Failed to load pricing:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { pricing, loading, error };
}

export default function PricingPage() {
  const { pricing, loading, error } = useDmfPricing();

  if (loading) {
    return (
      <div className="pricing-container loading">
        <div className="spinner">Loading pricing...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pricing-container error">
        <div className="error-box">
          <h2>?? Pricing Unavailable</h2>
          <p>Failed to load pricing: {error}</p>
          <p className="hint">Make sure the backend server is running</p>
        </div>
      </div>
    );
  }

  if (!pricing) {
    return (
      <div className="pricing-container error">
        <div className="error-box">
          <h2>No Pricing Data</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="pricing-container">
      {/* Header */}
      <header className="pricing-header">
        <h1>?? Pricing & Plans</h1>
        <p className="subtitle">
          Transparent pricing. No hidden fees. Keep more of your music revenue.
        </p>
        {pricing.label && (
          <p className="label-name">by {pricing.label.name}</p>
        )}
      </header>

      {/* Distribution Section */}
      <section className="pricing-section">
        <h2>?? Release Your Music</h2>
        <p className="section-desc">
          Submit your tracks to Spotify, Apple Music, YouTube, and 15+ other platforms
        </p>

        <div className="pricing-grid distribution-grid">
          {pricing.distribution && (
            <>
              {pricing.distribution.single && (
                <TierCard tier={pricing.distribution.single} />
              )}
              {pricing.distribution.ep && (
                <TierCard tier={pricing.distribution.ep} />
              )}
              {pricing.distribution.album && (
                <TierCard tier={pricing.distribution.album} />
              )}
              {pricing.distribution.mixtape && (
                <TierCard tier={pricing.distribution.mixtape} />
              )}
            </>
          )}
        </div>
      </section>

      {/* Catalog Migration Section */}
      <section className="pricing-section">
        <h2>?? Move Your Catalog to DMF</h2>
        <p className="section-desc">
          Transfer your existing music from another distributor. Keep all your stats.
        </p>

        <div className="pricing-grid migration-grid">
          {pricing.catalog_migration && (
            <>
              {pricing.catalog_migration.single && (
                <MigrationCard tier={pricing.catalog_migration.single} />
              )}
              {pricing.catalog_migration.ep && (
                <MigrationCard tier={pricing.catalog_migration.ep} />
              )}
              {pricing.catalog_migration.album && (
                <MigrationCard tier={pricing.catalog_migration.album} />
              )}
              {pricing.catalog_migration.full_catalog && (
                <MigrationCard tier={pricing.catalog_migration.full_catalog} />
              )}
            </>
          )}
        </div>
      </section>

      {/* Boost Packages Section */}
      {pricing.boost_packages && (
        <section className="pricing-section">
          <h2>? Amplify Your Release</h2>
          <p className="section-desc">
            Add ads & playlist pitching to supercharge your streams
          </p>

          <div className="boost-columns">
            {/* Ads */}
            <div className="boost-column">
              <h3>?? Ads Campaigns</h3>
              <div className="boost-grid">
                {pricing.boost_packages.ads &&
                  pricing.boost_packages.ads.map((boost) => (
                    <BoostCard key={boost.id} boost={boost} type="ads" />
                  ))}
              </div>
            </div>

            {/* Playlist Pitching */}
            <div className="boost-column">
              <h3>?? Playlist Pitching</h3>
              <div className="boost-grid">
                {pricing.boost_packages.playlist &&
                  pricing.boost_packages.playlist.map((boost) => (
                    <BoostCard key={boost.id} boost={boost} type="playlist" />
                  ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Growth Partnership Section */}
      {pricing.growth_partnership && (
        <section className="pricing-section partnership-section">
          <div className="partnership-card">
            <h2>{pricing.growth_partnership.name}</h2>
            <p className="partnership-explanation">
              {pricing.growth_partnership.explanation}
            </p>

            <div className="partnership-split">
              <div className="split-item artist">
                <div className="split-number">
                  {pricing.growth_partnership.artist_share_percent}%
                </div>
                <p className="split-label">You Keep</p>
              </div>
              <div className="split-divider">÷</div>
              <div className="split-item dmf">
                <div className="split-number">
                  {pricing.growth_partnership.dmf_share_percent}%
                </div>
                <p className="split-label">DMF (for growth we create)</p>
              </div>
            </div>

            <div className="partnership-terms">
              <h4>What This Means</h4>
              <ul>
                {pricing.growth_partnership.terms && (
                  <>
                    {pricing.growth_partnership.terms.no_ownership && (
                      <li>? <strong>You keep all your IP</strong> – we never own your music</li>
                    )}
                    {pricing.growth_partnership.terms.no_360_deal && (
                      <li>? <strong>No 360 deal</strong> – we don't take a cut of your merch/shows</li>
                    )}
                    {pricing.growth_partnership.terms.no_forced_services && (
                      <li>? <strong>Optional services</strong> – use what you want, skip the rest</li>
                    )}
                    {pricing.growth_partnership.terms.transparent_reporting && (
                      <li>? <strong>Full transparency</strong> – see exactly what we earned</li>
                    )}
                    {pricing.growth_partnership.terms.cancel_anytime && (
                      <li>? <strong>Cancel anytime</strong> – no long-term lock-in</li>
                    )}
                  </>
                )}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <section className="pricing-cta">
        <h2>Ready to Get Started?</h2>
        <p>Choose a plan above and submit your first release</p>
        <button className="cta-button">Upload Your Music Now</button>
      </section>

      {/* FAQ (optional) */}
      <section className="pricing-faq">
        <h2>? Frequently Asked Questions</h2>
        <div className="faq-items">
          <details>
            <summary>
              When do I pay?
            </summary>
            <p>
              You pay upfront when you submit your release. We process it within 2-5 business days
              and deliver to all major DSPs.
            </p>
          </details>

          <details>
            <summary>
              Can I get a refund?
            </summary>
            <p>
              Distribution is non-refundable once delivered to DSPs (usually instant). Services like
              ads and playlist pitching can be cancelled within 7 days for a pro-rated refund.
            </p>
          </details>

          <details>
            <summary>
              Is there a limit on how many releases I can submit?
            </summary>
            <p>
              No limit! Submit as many as you want. Check our bulk discount for 5+ releases.
            </p>
          </details>

          <details>
            <summary>
              Do you keep a percentage of my streams?
            </summary>
            <p>
              Only for streams we actively help generate (via ads, playlist pitching). Organic
              streams are 100% yours. See our Growth Partnership section above.
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// Component: TierCard (Distribution)
// ============================================================================

function TierCard({ tier }) {
  return (
    <div className="tier-card">
      <h3>{tier.name}</h3>
      <div className="price">${tier.price}</div>
      <p className="tier-desc">{tier.description}</p>

      <ul className="features">
        {tier.features &&
          tier.features.map((feature, idx) => (
            <li key={idx}>? {feature}</li>
          ))}
      </ul>

      <button className="tier-button">Choose {tier.name}</button>
    </div>
  );
}

// ============================================================================
// Component: MigrationCard (Catalog Transfer)
// ============================================================================

function MigrationCard({ tier }) {
  return (
    <div className="migration-card">
      <h3>{tier.name}</h3>
      <div className="price">${tier.price}</div>
      <p className="tier-desc">{tier.description}</p>

      <ul className="features">
        {tier.features &&
          tier.features.map((feature, idx) => (
            <li key={idx}>? {feature}</li>
          ))}
      </ul>

      <button className="tier-button">Migrate Now</button>
    </div>
  );
}

// ============================================================================
// Component: BoostCard (Ads / Playlist)
// ============================================================================

function BoostCard({ boost, type }) {
  return (
    <div className={`boost-card boost-${type}`}>
      <h4>{boost.name}</h4>
      <div className="boost-price">${boost.price}</div>

      {type === 'ads' && boost.estimated_views && (
        <p className="estimate">
          ?? <strong>~{boost.estimated_views}</strong> estimated views
        </p>
      )}

      {type === 'playlist' && boost.playlists && (
        <p className="estimate">
          ?? <strong>{boost.playlists}</strong> playlists targeted
        </p>
      )}

      <p className="boost-desc">{boost.description}</p>

      <ul className="features-short">
        {boost.features &&
          boost.features.slice(0, 3).map((f, idx) => (
            <li key={idx}>• {f}</li>
          ))}
      </ul>

      <button className="boost-button">Add to Cart</button>
    </div>
  );
}

export { TierCard, MigrationCard, BoostCard };
