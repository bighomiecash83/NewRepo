// src/components/PricingGrid.tsx
import React, { useEffect, useState } from "react";
import { getPublicPlans, PricingPlan } from "../services/pricingService";

const formatCurrency = (value: number) =>
  `$${value.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

export const PricingGrid: React.FC = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPublicPlans();
        setPlans(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load pricing right now.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-16">
        <p className="text-gray-500 text-lg">Loading pricing…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center items-center py-16">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (!plans.length) {
    return (
      <div className="w-full flex justify-center items-center py-16">
        <p className="text-gray-400 text-lg">
          No active plans are available right now.
        </p>
      </div>
    );
  }

  // Group by category for subtle sectioning (optional)
  const grouped = plans.reduce<Record<string, PricingPlan[]>>((acc, plan) => {
    if (!acc[plan.category]) acc[plan.category] = [];
    acc[plan.category].push(plan);
    return acc;
  }, {});

  return (
    <section className="w-full max-w-6xl mx-auto py-12 px-4 lg:px-0">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
          DMF Service Plans
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Built for real artists, real labels, and real streams. No bots. No
          games.
        </p>
      </div>

      <div className="space-y-10">
        {Object.entries(grouped).map(([category, catPlans]) => (
          <div key={category}>
            <h3 className="text-xl font-semibold text-[#ffd700] mb-4">
              {category}
            </h3>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {catPlans.map((plan) => (
                <article
                  key={plan.id}
                  className={`relative rounded-2xl border border-[#1f2937] bg-gradient-to-br from-[#020617] to-[#020617]/80 shadow-lg shadow-black/40 p-6 flex flex-col hover:shadow-xl hover:-translate-y-1 transition transform ${
                    plan.isRecommended
                      ? "border-[#ffd700] ring-2 ring-[#ffd700]/40"
                      : ""
                  }`}
                >
                  {plan.isRecommended && (
                    <span className="absolute -top-3 right-4 bg-[#ffd700] text-black text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wide">
                      Recommended
                    </span>
                  )}

                  <div className="mb-4">
                    <h4 className="text-2xl font-bold text-white mb-1">
                      {plan.name}
                    </h4>
                    <p className="text-sm text-gray-400 uppercase tracking-wide">
                      {plan.category}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-extrabold text-white">
                      {formatCurrency(plan.monthlyPriceUsd)}
                    </span>
                    <span className="text-gray-400 text-sm">/ month</span>
                  </div>

                  {plan.setupFeeUsd > 0 && (
                    <p className="text-xs text-gray-300 mb-3">
                      One-time setup:{" "}
                      <span className="font-semibold text-[#ffd700]">
                        {formatCurrency(plan.setupFeeUsd)}
                      </span>
                    </p>
                  )}

                  <p className="text-sm text-gray-300 mb-4">
                    {plan.description}
                  </p>

                  <ul className="space-y-2 text-sm text-gray-200 mb-6 flex-1">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <button className="w-full mt-auto py-2.5 rounded-xl bg-[#1d4ed8] hover:bg-[#2563eb] text-white font-semibold text-sm uppercase tracking-wide shadow-md shadow-blue-500/40 transition">
                    Get Started
                  </button>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
