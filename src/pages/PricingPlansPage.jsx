/**
 * PricingPlansPage.jsx
 * Public pricing plans display using MongoDB-backed API
 */
import React, { useEffect, useState } from 'react';
import { getPublicPlans } from '../services/pricingPlansApi';

export default function PricingPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getPublicPlans();
        setPlans(data || []);
      } catch (e) {
        setError(e.message || 'Failed to load plans');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="pricing-plans loading">Loading pricing...</div>;
  if (error) return <div className="pricing-plans error">Error: {error}</div>;

  const grouped = plans.reduce((acc, p) => {
    acc[p.category] = acc[p.category] || [];
    acc[p.category].push(p);
    return acc;
  }, {});

  return (
    <div className="pricing-plans">
      <h1>Pricing & Plans</h1>
      <p className="subtitle">Transparent plans powered by DMF</p>
      {Object.entries(grouped).map(([category, items]) => (
        <section key={category} className="pricing-category">
          <h2>{category}</h2>
          <div className="plans-grid">
            {items.sort((a,b)=> (a.displayOrder ?? 999) - (b.displayOrder ?? 999)).map(plan => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function PlanCard({ plan }) {
  return (
    <div className={`plan-card ${plan.isRecommended ? 'recommended' : ''}`}>
      {plan.isRecommended && <div className="badge">Recommended</div>}
      <h3>{plan.name}</h3>
      <div className="prices">
        {plan.monthlyPrice != null && <div className="monthly">${plan.monthlyPrice}/mo</div>}
        {plan.setupFee != null && plan.setupFee > 0 && <div className="setup">Setup ${plan.setupFee}</div>}
      </div>
      <p className="description">{plan.description}</p>
      <ul className="features">
        {(plan.features || []).map((f,i) => <li key={i}>• {f}</li>)}
      </ul>
      <button className="select-btn">Get Started</button>
    </div>
  );
}
