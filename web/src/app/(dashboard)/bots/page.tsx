'use client'

import { Zap, Play, Pause, BarChart3 } from 'lucide-react'

export default function BotPlayground() {
  const bots = [
    { id: 1, name: 'Engagement Bot #1', status: 'Active', engagements: 2340, uptime: '99.2%' },
    { id: 2, name: 'Growth Bot #2', status: 'Active', engagements: 1890, uptime: '98.9%' },
    { id: 3, name: 'Viral Bot #3', status: 'Paused', engagements: 890, uptime: '97.1%' },
    { id: 4, name: 'Trending Bot #4', status: 'Active', engagements: 3200, uptime: '99.5%' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
            <Zap className="w-10 h-10 text-dmf-primary" />
            StreamGod Bot Playground
          </h1>
          <p className="text-slate-400 mt-2">Launch, monitor, and control your 10,000 social engagement bots</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-dmf-gold">10k</p>
          <p className="text-slate-400 text-sm">Total Bots Active</p>
        </div>
      </div>

      {/* Master Controls */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="flex flex-col items-center gap-2 bg-dmf-success/20 border border-dmf-success rounded-lg p-4 hover:bg-dmf-success/30 transition">
          <Play className="w-6 h-6 text-dmf-success" />
          <span className="font-semibold text-white">Launch All</span>
        </button>
        <button className="flex flex-col items-center gap-2 bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 hover:bg-yellow-500/30 transition">
          <Pause className="w-6 h-6 text-yellow-400" />
          <span className="font-semibold text-white">Pause All</span>
        </button>
        <button className="flex flex-col items-center gap-2 bg-dmf-primary/20 border border-dmf-primary rounded-lg p-4 hover:bg-dmf-primary/30 transition">
          <BarChart3 className="w-6 h-6 text-dmf-primary" />
          <span className="font-semibold text-white">Analytics</span>
        </button>
        <button className="flex flex-col items-center gap-2 bg-slate-700 border border-slate-600 rounded-lg p-4 hover:bg-slate-600 transition">
          <span className="text-lg">⚙️</span>
          <span className="font-semibold text-white">Settings</span>
        </button>
      </div>

      {/* Bot Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bots.map((bot) => (
          <div key={bot.id} className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6 hover:border-dmf-primary/50 transition">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{bot.name}</h3>
                <p className="text-dmf-gold text-sm mt-1">{bot.engagements.toLocaleString()} engagements</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                bot.status === 'Active'
                  ? 'bg-dmf-success/20 text-dmf-success'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {bot.status}
              </span>
            </div>
            <div className="mb-4">
              <div className="text-sm text-slate-400 mb-2">Uptime: {bot.uptime}</div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-dmf-primary h-2 rounded-full" 
                  style={{ width: `${parseFloat(bot.uptime)}%` }}
                ></div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-dmf-success hover:bg-green-700 text-white font-semibold py-2 rounded transition text-sm">
                Start
              </button>
              <button className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 rounded transition text-sm">
                Pause
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Recommendations */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🤖</span>
          AI Recommendations
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-4 p-3 bg-slate-900/50 rounded">
            <span className="text-2xl">💡</span>
            <div>
              <p className="text-white font-semibold">Increase Engagement Bots</p>
              <p className="text-slate-400 text-sm">Trending Artist A has 23% more engagement potential - deploy 500 additional bots</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-3 bg-slate-900/50 rounded">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="text-white font-semibold">Optimize Peak Hours</p>
              <p className="text-slate-400 text-sm">Bots perform 34% better between 8PM-11PM - schedule major campaigns for these windows</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
