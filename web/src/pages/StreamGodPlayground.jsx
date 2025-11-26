import React, { useEffect, useState } from 'react'

export default function StreamGodPlayground() {
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    // Greeting based on time of day
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-6">
      {/* Header with greeting */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black mb-4">
            {greeting}, <span className="text-blue-400">Creator</span>
          </h1>
          <p className="text-xl text-slate-300 mb-2">Welcome to StreamGod AI Playground</p>
          <p className="text-slate-400">Your personal AI service engine for music, marketing & growth</p>
        </div>

        {/* Main Service Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: AI Brain */}
          <div className="bg-slate-800 border border-blue-500/30 rounded-lg p-8 hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/20 transition">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🧠</span>
            </div>
            <h3 className="text-xl font-bold mb-3">StreamGod Brain</h3>
            <p className="text-slate-300 mb-4">
              AI-powered assistant that understands your music catalog, market trends, and creator needs
            </p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded transition font-semibold">
              Launch Brain
            </button>
          </div>

          {/* Card 2: Catalog Analysis */}
          <div className="bg-slate-800 border border-purple-500/30 rounded-lg p-8 hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-500/20 transition">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Catalog Analysis</h3>
            <p className="text-slate-300 mb-4">
              Deep insights into release readiness, track metadata quality, and distribution optimization
            </p>
            <button className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded transition font-semibold">
              Analyze Catalog
            </button>
          </div>

          {/* Card 3: Ad Bot Control */}
          <div className="bg-slate-800 border border-green-500/30 rounded-lg p-8 hover:border-green-400/60 hover:shadow-lg hover:shadow-green-500/20 transition">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Ad Bot Control</h3>
            <p className="text-slate-300 mb-4">
              Manage automated bots for social media growth, engagement, and fan acquisition campaigns
            </p>
            <button className="w-full bg-green-600 hover:bg-green-700 py-2 rounded transition font-semibold">
              Launch Bots
            </button>
          </div>
        </div>

        {/* Service Features */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">✨ What StreamGod Does</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="text-blue-400 text-2xl flex-shrink-0">✓</div>
              <div>
                <h4 className="font-semibold mb-1">Intelligent Catalog Management</h4>
                <p className="text-slate-300 text-sm">Automatically analyzes releases, tracks, and metadata for distribution readiness</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-blue-400 text-2xl flex-shrink-0">✓</div>
              <div>
                <h4 className="font-semibold mb-1">Social Growth Automation</h4>
                <p className="text-slate-300 text-sm">Orchestrate bot swarms for authentic engagement and follower growth</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-blue-400 text-2xl flex-shrink-0">✓</div>
              <div>
                <h4 className="font-semibold mb-1">Smart Ad Campaigns</h4>
                <p className="text-slate-300 text-sm">AI-designed ads and campaigns that target your ideal audience</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-blue-400 text-2xl flex-shrink-0">✓</div>
              <div>
                <h4 className="font-semibold mb-1">Real-time Performance Insights</h4>
                <p className="text-slate-300 text-sm">Live dashboards showing engagement, reach, and conversion metrics</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-blue-400 text-2xl flex-shrink-0">✓</div>
              <div>
                <h4 className="font-semibold mb-1">Royalty Intelligence</h4>
                <p className="text-slate-300 text-sm">Track earnings, predict payouts, and optimize revenue streams</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-blue-400 text-2xl flex-shrink-0">✓</div>
              <div>
                <h4 className="font-semibold mb-1">Market Trend Analysis</h4>
                <p className="text-slate-300 text-sm">Stay ahead with AI-powered insights on genre trends and opportunities</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Status */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-6 text-center border border-slate-700">
            <div className="text-3xl font-bold text-blue-400 mb-2">24/7</div>
            <p className="text-slate-300 text-sm">Always On</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 text-center border border-slate-700">
            <div className="text-3xl font-bold text-green-400 mb-2">∞</div>
            <p className="text-slate-300 text-sm">Scalable</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 text-center border border-slate-700">
            <div className="text-3xl font-bold text-purple-400 mb-2">AI</div>
            <p className="text-slate-300 text-sm">Powered</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 text-center border border-slate-700">
            <div className="text-3xl font-bold text-yellow-400 mb-2">🚀</div>
            <p className="text-slate-300 text-sm">Ready</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-slate-700">
          <p className="text-slate-400">
            StreamGod — The AI Engine for Music Creators
          </p>
        </div>
      </div>
    </div>
  )
}
