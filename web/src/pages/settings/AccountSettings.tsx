import React, { useEffect, useState } from 'react'
import { artistApi } from '@/lib/dmf_api_client'

export default function AccountSettings() {
  const [artist, setArtist] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchArtist()
  }, [])

  const fetchArtist = async () => {
    try {
      setLoading(true)
      const response = await artistApi.getCurrentArtist()
      setArtist(response.data)
      setFormData(response.data)
    } catch (err: any) {
      setError(err.message || 'Failed to load artist profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError('')
      setMessage('')

      await artistApi.update(artist.id, formData)
      setMessage('Profile saved successfully!')
      setArtist(formData)
    } catch (err: any) {
      setError(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Account Settings</h1>

      {message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Stage Name</label>
              <input
                type="text"
                name="stage_name"
                value={formData.stage_name || ''}
                onChange={handleChange}
                placeholder="Your artist name"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="Your legal name"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio || ''}
                onChange={handleChange}
                placeholder="Tell us about your music..."
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Payment Information</h2>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-600 mb-2">
                Payouts are sent to your bank account registered with us.
              </p>
              <button
                type="button"
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                Update Payment Method →
              </button>
            </div>
          </div>
        </div>

        {/* API Access */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">API Access</h2>

          <div className="space-y-4">
            <p className="text-sm text-slate-600 mb-4">
              Use your API key to integrate DMF Music Platform with your own apps.
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm break-all">
              <p className="text-slate-500 text-xs mb-2">Your API Key</p>
              <p className="text-slate-900">dmf_live_••••••••••••••••</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition"
              >
                View Full Key
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-900 rounded-lg font-semibold text-sm transition"
              >
                Regenerate Key
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg font-semibold transition"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => setFormData(artist)}
            className="px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-900 rounded-lg font-semibold transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
