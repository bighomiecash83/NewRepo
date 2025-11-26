import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: '📊' },
  { name: 'Artists', path: '/artists', icon: '👥' },
  { name: 'Releases', path: '/releases', icon: '🎵' },
  { name: 'Bot Playground', path: '/bots', icon: '🤖' },
  { name: 'Revenue', path: '/revenue', icon: '💰' },
  { name: 'Contracts', path: '/contracts', icon: '📋' },
  { name: 'Pricing', path: '/pricing', icon: '💳' },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 h-screen overflow-y-auto">
      {/* DMF Logo */}
      <div className="p-6 border-b border-slate-700">
        <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-lg">DMF</span>
          </div>
          <div>
            <h1 className="text-white font-black">DMF</h1>
            <p className="text-xs text-slate-400">Record Label Hub</p>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-900">
        <p className="text-xs text-slate-400 text-center">DMF Music Platform v1.0</p>
      </div>
    </aside>
  )
}
