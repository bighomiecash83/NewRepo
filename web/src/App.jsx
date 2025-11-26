import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'

export default function App() {
  const location = useLocation()
  const isHome = location.pathname === '/' || location.pathname === '/playground'

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800">
      <header className="bg-white border-b py-4 px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4 hover:opacity-80 transition">
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#0366d6' }} className="flex items-center justify-center text-white font-black text-lg">
            SG
          </div>
          <div>
            <h1 className="text-lg font-bold">StreamGod</h1>
            <p className="text-xs text-slate-500">AI Playground</p>
          </div>
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/" className={`px-3 py-2 rounded transition ${isHome ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
            Home
          </Link>
          <Link to="/pricing" className={`px-3 py-2 rounded transition ${location.pathname === '/pricing' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
            Pricing
          </Link>
          <Link to="/admin/pricing" className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition font-semibold">
            Admin
          </Link>
        </nav>
      </header>
      <main className="p-6 max-w-6xl mx-auto">
        <Outlet />
      </main>
    </div>
  )
}
