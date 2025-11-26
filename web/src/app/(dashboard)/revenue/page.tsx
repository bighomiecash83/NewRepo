'use client'

import { DollarSign, TrendingUp, PieChart } from 'lucide-react'

export default function Revenue() {
  const revenueData = [
    { source: 'Spotify', amount: 18500, percentage: 41, color: 'bg-green-500' },
    { source: 'Apple Music', amount: 12300, percentage: 27, color: 'bg-blue-500' },
    { source: 'YouTube Music', amount: 8900, percentage: 20, color: 'bg-red-500' },
    { source: 'Other Platforms', amount: 5530, percentage: 12, color: 'bg-purple-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white flex items-center gap-3">
          <DollarSign className="w-10 h-10 text-dmf-primary" />
          Revenue Dashboard
        </h1>
        <p className="text-slate-400 mt-2">Track earnings across all platforms and artists</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm font-semibold">Total This Month</p>
          <p className="text-4xl font-black text-dmf-gold mt-2">$45,230</p>
          <p className="text-dmf-success text-sm mt-2 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            +23.5% vs last month
          </p>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm font-semibold">Pending Payouts</p>
          <p className="text-4xl font-black text-blue-400 mt-2">$8,450</p>
          <p className="text-slate-400 text-sm mt-2">Next payout: Dec 15</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm font-semibold">Top Artist</p>
          <p className="text-2xl font-bold text-white mt-2">Urban Creator</p>
          <p className="text-slate-400 text-sm mt-2">$8,940 this month</p>
        </div>
      </div>

      {/* Revenue by Platform */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <PieChart className="w-6 h-6 text-dmf-primary" />
          Revenue by Platform
        </h2>
        <div className="space-y-4">
          {revenueData.map((item) => (
            <div key={item.source}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold">{item.source}</span>
                <span className="text-dmf-gold font-bold">${item.amount.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div 
                  className={`${item.color} h-3 rounded-full`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <div className="text-sm text-slate-400 mt-1">{item.percentage}% of total</div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue by Artist */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Top Artists</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left p-3 font-semibold text-slate-300">Artist</th>
              <th className="text-left p-3 font-semibold text-slate-300">Streams</th>
              <th className="text-left p-3 font-semibold text-slate-300">Revenue</th>
              <th className="text-left p-3 font-semibold text-slate-300">Growth</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Urban Creator', streams: 2100000, revenue: 8940, growth: '+34%' },
              { name: 'Indie Artist', streams: 890000, revenue: 3890, growth: '+12%' },
              { name: 'Jazz Master', streams: 650000, revenue: 2860, growth: '+8%' },
            ].map((artist) => (
              <tr key={artist.name} className="border-b border-slate-700 hover:bg-slate-700/30">
                <td className="p-3 text-white font-semibold">{artist.name}</td>
                <td className="p-3 text-slate-300">{artist.streams.toLocaleString()}</td>
                <td className="p-3 text-dmf-gold font-semibold">${artist.revenue.toLocaleString()}</td>
                <td className="p-3 text-dmf-success font-semibold">{artist.growth}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
