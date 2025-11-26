'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Users, Music, Zap, DollarSign, FileText, Settings } from 'lucide-react'

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
  { name: 'Artists', path: '/artists', icon: Users },
  { name: 'Releases', path: '/releases', icon: Music },
  { name: 'Bot Playground', path: '/bots', icon: Zap },
  { name: 'Revenue', path: '/revenue', icon: DollarSign },
  { name: 'Contracts', path: '/contracts', icon: FileText },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-72 bg-gradient-to-b from-dmf-dark via-slate-900 to-dmf-dark border-r border-slate-700 h-screen overflow-y-auto flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition">
          <div className="w-12 h-12 bg-gradient-to-br from-dmf-primary to-blue-700 rounded-lg flex items-center justify-center font-black text-lg">
            <span className="text-white">DMF</span>
          </div>
          <div>
            <h1 className="text-white font-black text-lg">DMF</h1>
            <p className="text-xs text-slate-400">Record Label Hub</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path || (pathname && pathname.startsWith(item.path + '/'))
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-dmf-primary/20 border border-dmf-primary text-dmf-primary font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
        <p className="text-xs text-slate-500 text-center pt-2">DMF Music Platform v1.0</p>
      </div>
    </aside>
  )
}
