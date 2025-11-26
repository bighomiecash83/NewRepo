// web/src/components/artist-manager.tsx
'use client'

import React, { useEffect, useState } from "react"
import { artistService } from "@/lib/api"
import { Users } from "lucide-react"

export default function ArtistManager() {
  const [artists, setArtists] = useState<any[]>([])
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function fetchArtists() {
    try {
      setLoading(true)
      const response = await artistService.getAll()
      const data = response.data || response
      setArtists(Array.isArray(data) ? data : data.artists || [])
    } catch (err: any) {
      setError(err.message || "Failed to fetch artists")
      console.error("Fetch artists error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArtists()
  }, [])

  async function createArtist() {
    if (!name.trim()) {
      setError("Artist name is required")
      return
    }

    try {
      setLoading(true)
      setError("")
      const response = await artistService.create({ name, email: email || null })
      const data = response.data || response
      setName("")
      setEmail("")
      await fetchArtists()
    } catch (err: any) {
      setError(err.message || "Failed to create artist")
      console.error("Create artist error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-slate-800 border border-slate-700 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-bold text-white">Artist Manager</h3>
      </div>

      <div className="space-y-3 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Artist name"
          className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400"
          disabled={loading}
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (optional)"
          className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400"
          disabled={loading}
        />
        <button
          onClick={createArtist}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded font-semibold text-white transition"
        >
          {loading ? "Creating..." : "Create Artist"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded text-red-100 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-300">Artists ({artists.length})</h4>
        <ul className="max-h-96 overflow-y-auto">
          {artists.length === 0 ? (
            <li className="text-gray-400 text-sm p-2">No artists yet</li>
          ) : (
            artists.map((artist: any) => (
              <li key={artist._id || artist.id} className="border-b border-slate-700 py-2 px-2 hover:bg-slate-700 rounded">
                <div className="font-semibold text-white text-sm">{artist.name}</div>
                {artist.email && <div className="text-xs text-gray-400">{artist.email}</div>}
                <div className="text-xs text-gray-500">{artist._id || artist.id}</div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
