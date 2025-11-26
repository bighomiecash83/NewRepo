import React, { useEffect, useState } from 'react'
import { releaseApi } from '@/lib/dmf_api_client'

export default function DistributionStatus() {
  const [releases, setReleases] = useState<any[]>([])
  const [selectedRelease, setSelectedRelease] = useState<any>(null)
  const [distStatus, setDistStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReleases()
  }, [])

  useEffect(() => {
    if (selectedRelease?.id) {
      fetchDistributionStatus(selectedRelease.id)
    }
  }, [selectedRelease])

  const fetchReleases = async () => {
    try {
      setLoading(true)
      const response = await releaseApi.getAll()
      setReleases(response.data || [])
      if (response.data && response.data.length > 0) {
        setSelectedRelease(response.data[0])
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load releases')
    } finally {
      setLoading(false)
    }
  }

  const fetchDistributionStatus = async (releaseId: string) => {
    try {
      const response = await releaseApi.getDistributionStatus(releaseId)
      setDistStatus(response.data)
    } catch (err: any) {
      setError(err.message || 'Failed to load distribution status')
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600">Loading distribution status...</p>
      </div>
    )
  }

  const dspList = [
    { name: 'Spotify', icon: '🎵' },
    { name: 'Apple Music', icon: '🎶' },
    { name: 'Amazon Music', icon: '📻' },
    { name: 'YouTube Music', icon: '▶️' },
    { name: 'Tidal', icon: '🌊' },
    { name: 'Bandcamp', icon: '🎸' },
  ]

  const getDspStatus = (platform: string) => {
    const status = distStatus?.platforms?.find(
      (p: any) => p.platform.toLowerCase() === platform.toLowerCase()
    )
    return status?.status || 'pending'
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'live':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Distribution Status</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Release List */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Your Releases</h2>
          <div className="space-y-2">
            {releases.length === 0 ? (
              <p className="text-slate-500 text-sm">No releases yet</p>
            ) : (
              releases.map((release: any) => (
                <button
                  key={release.id}
                  onClick={() => setSelectedRelease(release)}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    selectedRelease?.id === release.id
                      ? 'bg-blue-50 border-blue-300 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-semibold text-slate-900">{release.title}</p>
                  <p className="text-xs text-slate-500">{release.release_date}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Distribution Details */}
        <div className="lg:col-span-2">
          {!selectedRelease ? (
            <div className="bg-slate-50 rounded-lg p-8 text-center text-slate-600">
              <p>Select a release to view distribution status</p>
            </div>
          ) : (
            <>
              <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-2">{selectedRelease.title}</h2>
                <p className="text-slate-600 text-sm mb-4">
                  Released: {selectedRelease.release_date}
                </p>
                <p className="text-slate-700">{selectedRelease.description}</p>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-4">Platform Status</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {dspList.map((dsp) => {
                  const status = getDspStatus(dsp.name)
                  return (
                    <div
                      key={dsp.name}
                      className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-semibold text-slate-900 mb-1">
                            {dsp.icon} {dsp.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {distStatus?.platforms?.find(
                              (p: any) => p.platform.toLowerCase() === dsp.name.toLowerCase()
                            )?.published_date || 'Not published'}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-2 ${getStatusColor(status)}`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Overall Status */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-900 font-semibold text-sm">
                  Overall Status:{' '}
                  <span className="font-bold">
                    {distStatus?.overall_status?.toUpperCase() || 'PENDING'}
                  </span>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
