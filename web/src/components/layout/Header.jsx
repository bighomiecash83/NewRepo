import React, { useState } from 'react'

export default function Header() {
  const [showProfile, setShowProfile] = useState(false)

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">DMF Music Platform</h1>
        <p className="text-sm text-slate-500">Your record label command center</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Status Badge */}
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold text-green-700">All Systems Active</span>
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full text-white font-bold flex items-center justify-center hover:shadow-lg transition"
          >
            SG
          </button>
          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg p-4">
              <p className="font-semibold text-slate-900">StreamGod</p>
              <p className="text-sm text-slate-500">Admin</p>
              <hr className="my-2" />
              <button className="w-full text-left text-sm text-slate-600 hover:text-slate-900 py-2">Settings</button>
              <button className="w-full text-left text-sm text-red-600 hover:text-red-700 py-2">Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
