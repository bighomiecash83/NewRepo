'use client'

import { Users, Plus, Search, Edit2, Trash2 } from 'lucide-react'

export default function Artists() {
  const artists = [
    { id: 1, name: 'Indie Artist', tracks: 5, streams: 125000, revenue: 1250 },
    { id: 2, name: 'Urban Creator', tracks: 12, streams: 450000, revenue: 4500 },
    { id: 3, name: 'Jazz Master', tracks: 8, streams: 320000, revenue: 3200 },
    { id: 4, name: 'Electronic Wizard', tracks: 15, streams: 890000, revenue: 8900 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
            <Users className="w-10 h-10 text-dmf-primary" />
            Artists
          </h1>
          <p className="text-slate-400 mt-2">Manage your label roster and track performance</p>
        </div>
        <button className="flex items-center gap-2 bg-dmf-primary hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition">
          <Plus className="w-5 h-5" />
          Add Artist
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg px-4 py-2">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search artists..."
          className="bg-transparent text-white placeholder-slate-500 outline-none w-full"
        />
      </div>

      {/* Artists Table */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50">
              <th className="text-left p-4 font-semibold text-slate-300">Artist</th>
              <th className="text-left p-4 font-semibold text-slate-300">Tracks</th>
              <th className="text-left p-4 font-semibold text-slate-300">Streams</th>
              <th className="text-left p-4 font-semibold text-slate-300">Revenue</th>
              <th className="text-left p-4 font-semibold text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {artists.map((artist) => (
              <tr key={artist.id} className="border-b border-slate-700 hover:bg-slate-700/30 transition">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-dmf-primary/20 flex items-center justify-center">
                      <span className="text-dmf-primary font-bold">{artist.name[0]}</span>
                    </div>
                    <span className="text-white font-semibold">{artist.name}</span>
                  </div>
                </td>
                <td className="p-4 text-slate-300">{artist.tracks}</td>
                <td className="p-4 text-slate-300">{artist.streams.toLocaleString()}</td>
                <td className="p-4 text-dmf-gold font-semibold">${artist.revenue.toLocaleString()}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-slate-700 rounded transition text-slate-300 hover:text-white">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-red-500/20 rounded transition text-slate-300 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
