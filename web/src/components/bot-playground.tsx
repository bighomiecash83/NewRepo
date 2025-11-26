// web/src/components/bot-playground.tsx
'use client'

import React, { useEffect, useState } from "react"
import { botService } from "@/lib/api"
import { Zap } from "lucide-react"

export default function BotPlayground() {
  const [status, setStatus] = useState("unknown")
  const [num, setNum] = useState(100)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  async function refresh() {
    try {
      setRefreshing(true)
      const response = await botService.getStatus()
      const data = response.data || response
      setStatus(data.status || "idle")
      setError("")
    } catch (err: any) {
      setStatus("error")
      setError(err.message || "Failed to fetch status")
      console.error("Fetch bot status error:", err)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [])

  async function start() {
    try {
      setLoading(true)
      setError("")
      const response = await botService.launchAll(num)
      const data = response.data || response
      await refresh()
    } catch (err: any) {
      setError(err.message || "Failed to start bots")
      console.error("Start bots error:", err)
    } finally {
      setLoading(false)
    }
  }

  async function stop() {
    try {
      setLoading(true)
      setError("")
      await botService.pauseAll()
      await refresh()
    } catch (err: any) {
      setError(err.message || "Failed to stop bots")
      console.error("Stop bots error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-slate-800 border border-slate-700 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-bold text-white">StreamGod Bot Playground</h3>
      </div>

      <div className="mb-6 p-4 bg-slate-700 rounded border border-slate-600">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-300">Status</div>
            <div className={`text-2xl font-bold mt-1 ${
              status.includes("online") ? "text-green-400" : 
              status === "idle" ? "text-gray-400" : 
              "text-red-400"
            }`}>
              {status}
            </div>
          </div>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="px-3 py-1 bg-slate-600 hover:bg-slate-500 disabled:bg-gray-600 rounded text-xs text-white transition"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div>
          <label className="text-sm text-gray-300 block mb-2">Number of bots</label>
          <input
            type="number"
            value={num}
            onChange={(e) => setNum(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
            disabled={loading}
            min="1"
            max="10000"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={start}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded font-semibold text-white transition"
          >
            {loading ? "Starting..." : "Start"}
          </button>
          <button
            onClick={stop}
            disabled={loading}
            className="flex-1 bg-red-700 hover:bg-red-800 disabled:bg-gray-600 px-4 py-2 rounded font-semibold text-white transition"
          >
            {loading ? "Stopping..." : "Stop"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-900 border border-red-700 rounded text-red-100 text-sm">
          {error}
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-900 border border-blue-700 rounded text-blue-100 text-xs">
        <div className="font-semibold mb-1">Info:</div>
        <div>Bots are controlled via StreamGod orchestration. Click Start to launch a fleet.</div>
      </div>
    </div>
  )
}
