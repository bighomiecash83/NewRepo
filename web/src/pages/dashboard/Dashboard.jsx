import React, { useEffect, useState } from 'react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 45230.50,
    activeArtists: 23,
    totalReleases: 89,
    activeBots: 10000,
    monthlyGrowth: 23.5,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // In production, fetch from your backend
    setLoading(false)
  }, [])

  const StatCard = ({ label, value, icon, trend }) => (
    <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-slate-600 text-sm font-semibold">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
      {trend && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <span>↑ {trend}% this month</span>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-600 mt-1">Real-time overview of your label operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-5 gap-4">
        <StatCard label="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon="💰" trend={stats.monthlyGrowth} />
        <StatCard label="Active Artists" value={stats.activeArtists} icon="👥" />
        <StatCard label="Total Releases" value={stats.totalReleases} icon="🎵" />
        <StatCard label="Active Bots" value={`${(stats.activeBots / 1000).toFixed(1)}k`} icon="🤖" />
        <StatCard label="Monthly Growth" value={`${stats.monthlyGrowth}%`} icon="📈" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center justify-center p-6 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition">
            <span className="text-2xl mb-2">➕</span>
            <span className="font-semibold text-slate-900">Add Artist</span>
          </button>
          <button className="flex flex-col items-center justify-center p-6 border border-slate-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition">
            <span className="text-2xl mb-2">🎵</span>
            <span className="font-semibold text-slate-900">Create Release</span>
          </button>
          <button className="flex flex-col items-center justify-center p-6 border border-slate-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition">
            <span className="text-2xl mb-2">🤖</span>
            <span className="font-semibold text-slate-900">Launch Bots</span>
          </button>
          <button className="flex flex-col items-center justify-center p-6 border border-slate-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition">
            <span className="text-2xl mb-2">📊</span>
            <span className="font-semibold text-slate-900">View Analytics</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Releases */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Releases</h3>
          <div className="space-y-3">
            {[
              { artist: 'Indie Artist', track: 'Midnight Dream', date: 'Nov 24' },
              { artist: 'Urban Creator', track: 'City Lights', date: 'Nov 23' },
              { artist: 'Jazz Master', track: 'Blue Notes', date: 'Nov 22' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition">
                <div>
                  <p className="font-semibold text-slate-900">{item.track}</p>
                  <p className="text-sm text-slate-500">{item.artist}</p>
                </div>
                <span className="text-xs text-slate-400">{item.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bot Activity */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Bot Activity</h3>
          <div className="space-y-3">
            {[
              { bot: 'Engagement Bot #1', status: 'Active', engagements: 2340 },
              { bot: 'Growth Bot #2', status: 'Active', engagements: 1890 },
              { bot: 'Viral Bot #3', status: 'Paused', engagements: 890 },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
                <div>
                  <p className="font-semibold text-slate-900">{item.bot}</p>
                  <p className="text-sm text-slate-500">{item.engagements.toLocaleString()} engagements</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
