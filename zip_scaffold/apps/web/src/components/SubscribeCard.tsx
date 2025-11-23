"use client";

import { useState } from "react";
import { Check } from "lucide-react";

interface Plan {
  name: string;
  price: number;
  features: string[];
}

const PLANS: Plan[] = [
  {
    name: "Free",
    price: 0,
    features: [
      "Up to 5 releases",
      "Basic analytics",
      "Standard distribution",
    ],
  },
  {
    name: "Pro",
    price: 9.99,
    features: [
      "Unlimited releases",
      "Advanced analytics",
      "Priority support",
      "AI-powered insights",
    ],
  },
  {
    name: "Enterprise",
    price: 49.99,
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "Custom integrations",
      "White-label options",
    ],
  },
];

export default function SubscribeCard() {
  const [selectedPlan, setSelectedPlan] = useState<string>("Pro");

  return (
    <div className="bg-dmf-accent rounded-lg p-6">
      <h2 className="text-2xl font-bold text-dmf-secondary mb-6">Subscription Plans</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-lg p-6 border-2 transition cursor-pointer ${
              selectedPlan === plan.name
                ? "border-dmf-secondary bg-dmf-primary"
                : "border-gray-600 bg-dmf-primary/50 hover:border-dmf-secondary"
            }`}
            onClick={() => setSelectedPlan(plan.name)}
          >
            <h3 className="text-xl font-bold text-dmf-secondary mb-2">{plan.name}</h3>
            <div className="text-3xl font-bold text-white mb-4">
              ${plan.price}
              <span className="text-sm text-gray-400">/month</span>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-gray-300">
                  <Check size={20} className="text-dmf-secondary" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-2 rounded font-semibold transition ${
                selectedPlan === plan.name
                  ? "bg-dmf-secondary text-dmf-primary hover:bg-dmf-secondary/90"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
            >
              Select Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
