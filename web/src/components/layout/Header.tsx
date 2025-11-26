'use client'

import { Bell, Search, User } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [showUser, setShowUser] = useState(false)

  return (
    <header className="bg-gradient-to-r from-slate-900 to-dmf-dark border-b border-slate-700 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
      <div className="flex-1">
        <h2 className="text-xl font-bold text-white">DMF Music Platform</h2>
        <p className="text-xs text-slate-400">Your record label command center</p>
      </div>

      <div className="flex items-center gap-6">
        {/* Status Badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-dmf-success/10 border border-dmf-success rounded-lg">
          <div className="w-2 h-2 bg-dmf-success rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold text-dmf-success">All Systems Active</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-white transition hover:bg-slate-800 rounded-lg">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUser(!showUser)}
            className="w-10 h-10 bg-gradient-to-br from-dmf-primary to-blue-700 rounded-full text-white font-bold flex items-center justify-center hover:shadow-lg transition"
          >
            SG
          </button>
          {showUser && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-4 z-30">
              <p className="font-semibold text-white">StreamGod Admin</p>
              <p className="text-sm text-slate-400 mb-4">admin@dmf.music</p>
              <hr className="border-slate-700 mb-2" />
              <button className="w-full text-left text-sm text-slate-300 hover:text-white py-2">Settings</button>
              <button className="w-full text-left text-sm text-slate-300 hover:text-white py-2">Documentation</button>
              <button className="w-full text-left text-sm text-red-400 hover:text-red-300 py-2 border-t border-slate-700 mt-2 pt-2">Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
