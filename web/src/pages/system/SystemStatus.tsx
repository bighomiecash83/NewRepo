import React, { useEffect, useState } from 'react'
import { healthApi } from '@/lib/dmf_api_client'

interface SystemStatus {
  coreApi?: string
  streamGod?: string
  distribution?: string
  royalties?: string
  mongo?: string
  supabase?: string
  lastCheck?: string
}

export default function SystemStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    fetchSystemStatus()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchSystemStatus, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [autoRefresh])

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/system/status`)
      const data = await response.json()
      setStatus({
        coreApi: data.coreApi,
        streamGod: data.streamGod,
        distribution: data.distribution,
        royalties: data.royalties,
        mongo: data.mongo,
        supabase: data.supabase,
        lastCheck: new Date().toLocaleTimeString(),
      })
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to fetch system status')
    } finally {
      setLoading(false)
    }
  }

  const StatusBadge = ({ label, status }: { label: string; status?: string }) => {
    const isOnline = status?.toLowerCase() === 'ok' || status?.toLowerCase() === 'live'
    return (
      <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg">
        <span className="font-semibold text-slate-900">{label}</span>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}
          ></div>
          <span
            className={`text-sm font-bold ${
              isOnline ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {status?.toUpperCase() || 'UNKNOWN'}
          </span>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600">Loading system status...</p>
      </div>
    )
  }

  const allOnline =
    status?.coreApi?.toLowerCase() === 'ok' &&
    status?.mongo?.toLowerCase() === 'ok' &&
    status?.supabase?.toLowerCase() === 'ok'

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-slate-900">System Status</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setAutoRefresh(!autoRefresh)
            }}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
              autoRefresh
                ? 'bg-blue-100 text-blue-700'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {autoRefresh ? '🔄 Auto-refresh ON' : '⏸ Auto-refresh OFF'}
          </button>
          <button
            onClick={fetchSystemStatus}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
          >
            Refresh Now
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
          {error}
        </div>
      )}

      {/* Overall Status */}
      <div
        className={`p-6 rounded-lg mb-8 border-2 ${
          allOnline
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}
      >
        <p className="text-lg font-bold mb-2">Overall Status</p>
        <p
          className={`text-3xl font-bold ${
            allOnline ? 'text-green-700' : 'text-red-700'
          }`}
        >
          {allOnline ? '✅ All Systems Operational' : '⚠️ Some Services Degraded'}
        </p>
        {status?.lastCheck && (
          <p className="text-sm text-slate-600 mt-2">
            Last checked: {status.lastCheck}
          </p>
        )}
      </div>

      {/* Core Services */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Core Services</h2>
        <div className="space-y-3">
          <StatusBadge label="Core API" status={status?.coreApi} />
          <StatusBadge label="MongoDB" status={status?.mongo} />
          <StatusBadge label="Supabase" status={status?.supabase} />
        </div>
      </div>

      {/* Business Services */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Business Services</h2>
        <div className="space-y-3">
          <StatusBadge label="StreamGod Service" status={status?.streamGod} />
          <StatusBadge label="Distribution Service" status={status?.distribution} />
          <StatusBadge label="Royalties Service" status={status?.royalties} />
        </div>
      </div>

      {/* Detailed Info */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Detailed Status</h2>
        <div className="space-y-2 font-mono text-sm">
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600">Last Check</span>
            <span className="text-slate-900">{status?.lastCheck || 'Never'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600">Core API</span>
            <span className="text-slate-900">{status?.coreApi || 'UNKNOWN'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600">MongoDB</span>
            <span className="text-slate-900">{status?.mongo || 'UNKNOWN'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600">Supabase</span>
            <span className="text-slate-900">{status?.supabase || 'UNKNOWN'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600">StreamGod</span>
            <span className="text-slate-900">{status?.streamGod || 'UNKNOWN'}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-600">Distribution</span>
            <span className="text-slate-900">{status?.distribution || 'UNKNOWN'}</span>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-bold text-slate-900 mb-2">Status Guide</h3>
        <ul className="text-sm text-slate-700 space-y-1">
          <li>
            <span className="font-semibold">✅ OK:</span> Service is running normally
          </li>
          <li>
            <span className="font-semibold">⚠️ DEGRADED:</span> Service is running but slow
          </li>
          <li>
            <span className="font-semibold">❌ DOWN:</span> Service is unavailable
          </li>
        </ul>
      </div>
    </div>
  )
}
