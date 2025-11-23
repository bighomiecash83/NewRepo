import React from 'react'
import { Outlet, Link, Navigate, useLocation } from 'react-router-dom'

export default function App() {
  const location = useLocation()
  // Redirect root to /pricing
  if (location.pathname === '/') {
    return <Navigate to='/pricing' replace />
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800">
      <header className="bg-white border-b py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#0b2545' }} className="flex items-center justify-center text-white font-bold">DMF</div>
          <h1 className="text-lg font-bold">DMF — Pricing</h1>
        </div>
        <nav className="flex items-center gap-3">
          <Link to="/pricing" className="btn-ghost">Public</Link>
          <Link to="/admin/pricing" className="btn-dmf">Admin</Link>
        </nav>
      </header>
      <main className="p-6 max-w-5xl mx-auto">
        <Outlet />
      </main>
    </div>
  )
}
