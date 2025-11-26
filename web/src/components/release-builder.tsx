// web/src/components/release-builder.tsx
'use client'

import React, { useState } from "react"
import { releaseService } from "@/lib/api"
import { Music } from "lucide-react"

export default function ReleaseBuilder() {
  const [title, setTitle] = useState("")
  const [artistId, setArtistId] = useState("")
  const [releaseDate, setReleaseDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function createRelease() {
    if (!title.trim() || !artistId.trim()) {
      setError("Title and Artist ID are required")
      return
    }

    try {
      setLoading(true)
      setError("")
      setSuccess("")
      
      const response = await releaseService.create({
        title,
        artistId,
        releaseDate: releaseDate || null,
      })
      
      const data = response.data || response
      setSuccess(`Release created: ${data.id || data._id}`)
      setTitle("")
      setArtistId("")
      setReleaseDate("")
    } catch (err: any) {
      setError(err.message || "Failed to create release")
      console.error("Create release error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-slate-800 border border-slate-700 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Music className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-bold text-white">Release Builder</h3>
      </div>

      <div className="space-y-3 mb-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Release title"
          className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400"
          disabled={loading}
        />
        <input
          value={artistId}
          onChange={(e) => setArtistId(e.target.value)}
          placeholder="Artist ID"
          className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400"
          disabled={loading}
        />
        <input
          type="date"
          value={releaseDate}
          onChange={(e) => setReleaseDate(e.target.value)}
          className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400"
          disabled={loading}
        />
        <button
          onClick={createRelease}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-2 rounded font-semibold text-white transition"
        >
          {loading ? "Creating..." : "Create Release"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded text-red-100 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-900 border border-green-700 rounded text-green-100 text-sm">
          {success}
        </div>
      )}
    </div>
  )
}
