'use client'

import { Check } from 'lucide-react'

export default function Pricing() {
  const plans = [
    {
      name: 'Indie',
      price: '$49',
      period: '/month',
      description: 'Perfect for independent artists',
      features: [
        '1 Artist Account',
        'Up to 5 Active Tracks',
        '100 Bot Engagements/month',
        'Email Support',
        'Basic Analytics',
      ],
    },
    {
      name: 'Pro Creator',
      price: '$199',
      period: '/month',
      description: 'For growing labels and collectives',
      featured: true,
      features: [
        '10 Artist Accounts',
        'Unlimited Tracks',
        '1,000 Bot Engagements/month',
        'Priority Email Support',
        'Advanced Analytics',
        'Royalty Tracking',
        'Release Scheduling',
      ],
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For established labels',
      features: [
        'Unlimited Artists',
        'Unlimited Tracks',
        'Unlimited Bot Engagements',
        '24/7 Dedicated Support',
        'Full Custom Integration',
        'Blockchain Contracts',
        'Revenue Optimization AI',
        'White-label Options',
      ],
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-white mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-slate-400">Choose the plan that fits your label</p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-lg border transition transform hover:scale-105 ${
              plan.featured
                ? 'bg-gradient-to-br from-dmf-primary/20 to-blue-900 border-dmf-primary shadow-lg shadow-dmf-primary/20'
                : 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-dmf-primary/50'
            }`}
          >
            <div className="p-8">
              {plan.featured && (
                <div className="mb-4 inline-block px-4 py-1 bg-dmf-primary text-white text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
              )}
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-slate-400 text-sm mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="text-5xl font-black text-dmf-gold">{plan.price}</span>
                <span className="text-slate-400">{plan.period}</span>
              </div>
              <button
                className={`w-full font-bold py-3 rounded-lg transition mb-6 ${
                  plan.featured
                    ? 'bg-dmf-primary hover:bg-blue-700 text-white'
                    : 'border border-dmf-primary text-dmf-primary hover:bg-dmf-primary/10'
                }`}
              >
                Get Started
              </button>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-slate-300">
                    <Check className="w-5 h-5 text-dmf-success flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'Can I upgrade or downgrade my plan?', a: 'Yes, upgrade or downgrade at any time. Changes take effect immediately.' },
            { q: 'Is there a free trial?', a: '14-day free trial available for all plans. No credit card required.' },
            { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and wire transfers for enterprise.' },
            { q: 'What if I need custom features?', a: 'Contact our sales team for enterprise custom integrations and white-label options.' },
          ].map((item, i) => (
            <details key={i} className="border border-slate-700 rounded-lg p-4 cursor-pointer group">
              <summary className="font-semibold text-white flex items-center gap-2">
                {item.q}
                <span className="ml-auto group-open:rotate-180 transition">▼</span>
              </summary>
              <p className="text-slate-400 mt-3">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}
