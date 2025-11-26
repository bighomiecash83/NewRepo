'use client'

import { useEffect, useState } from 'react'
import { BarChart3, Music, Users, Zap, TrendingUp, DollarSign } from 'lucide-react'
import ArtistManager from '@/components/artist-manager'
import ReleaseBuilder from '@/components/release-builder'
import BotPlayground from '@/components/bot-playground'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeArtists: 0,
    totalReleases: 0,
    activeBots: 0,
  })

  useEffect(() => {
    // Fetch stats from backend
    setStats({
      totalRevenue: 45230.50,
      activeArtists: 23,
      totalReleases: 89,
      activeBots: 10000,
    })
  }, [])

  const StatCard = ({ label, value, icon: Icon, trend }: any) => (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6 hover:border-dmf-primary/50 transition">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-slate-400 text-sm font-semibold">{label}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
        <Icon className="w-8 h-8 text-dmf-primary" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-dmf-gold text-sm">
          <TrendingUp className="w-4 h-4" />
          <span>{trend}% this month</span>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white">Dashboard</h1>
        <p className="text-slate-400 mt-2">Real-time overview of your label operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Revenue" 
          value={`$${stats.totalRevenue.toLocaleString()}`} 
          icon={DollarSign}
          trend={23.5}
        />
        <StatCard 
          label="Active Artists" 
          value={stats.activeArtists} 
          icon={Users}
        />
        <StatCard 
          label="Total Releases" 
          value={stats.totalReleases} 
          icon={Music}
        />
        <StatCard 
          label="Active Bots" 
          value={`${(stats.activeBots / 1000).toFixed(1)}k`} 
          icon={Zap}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '➕', label: 'Add Artist', href: '/artists/new' },
            { icon: '🎵', label: 'Create Release', href: '/releases/new' },
            { icon: '🤖', label: 'Launch Bots', href: '/bots' },
            { icon: '📊', label: 'View Analytics', href: '/revenue' },
          ].map((action, i) => (
            <a
              key={i}
              href={action.href}
              className="flex flex-col items-center justify-center p-6 border border-slate-700 rounded-lg hover:bg-dmf-primary/10 hover:border-dmf-primary/50 transition"
            >
              <span className="text-3xl mb-2">{action.icon}</span>
              <span className="font-semibold text-slate-200 text-sm text-center">{action.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Releases */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recent Releases</h3>
          <div className="space-y-3">
            {[
              { artist: 'Indie Artist', track: 'Midnight Dream', date: 'Nov 24' },
              { artist: 'Urban Creator', track: 'City Lights', date: 'Nov 23' },
              { artist: 'Jazz Master', track: 'Blue Notes', date: 'Nov 22' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-slate-700 rounded-lg hover:bg-slate-700/50 transition">
                <div>
                  <p className="font-semibold text-white">{item.track}</p>
                  <p className="text-sm text-slate-400">{item.artist}</p>
                </div>
                <span className="text-xs text-slate-500">{item.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bot Activity */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Bot Activity</h3>
          <div className="space-y-3">
            {[
              { bot: 'Engagement Bot #1', status: 'Active', metric: '2.3k engagements' },
              { bot: 'Growth Bot #2', status: 'Active', metric: '1.8k followers' },
              { bot: 'Viral Bot #3', status: 'Paused', metric: '890 interactions' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-slate-700 rounded-lg">
                <div>
                  <p className="font-semibold text-white">{item.bot}</p>
                  <p className="text-sm text-slate-400">{item.metric}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  item.status === 'Active' 
                    ? 'bg-dmf-success/20 text-dmf-success' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Production Control Center */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-white mb-6">Production Control Center</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ArtistManager />
          <ReleaseBuilder />
        </div>
      </div>

      {/* Bot Control */}
      <div>
        <BotPlayground />
      </div>
    </div>
  )
}
