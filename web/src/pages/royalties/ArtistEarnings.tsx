import React, { useEffect, useState } from 'react'
import { royaltyApi } from '@/lib/dmf_api_client'

export default function ArtistEarnings() {
  const [statement, setStatement] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEarnings()
  }, [])

  const fetchEarnings = async () => {
    try {
      setLoading(true)
      // Get current statement
      const response = await royaltyApi.getMyStatement()
      setStatement(response.data)

      // Get history (last 12 months)
      const historyResponse = await royaltyApi.getHistory('', 12)
      setHistory(historyResponse.data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load earnings')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600">Loading earnings...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Artist Earnings</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
          {error}
        </div>
      )}

      {/* Current Statement */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <p className="text-slate-600 text-sm font-semibold mb-2">Gross Earnings</p>
          <p className="text-3xl font-bold text-slate-900">
            ${statement?.gross_earnings?.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-slate-500 mt-2">Period: {statement?.period_start}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <p className="text-slate-600 text-sm font-semibold mb-2">Fees & Deductions</p>
          <p className="text-3xl font-bold text-red-600">
            -${statement?.fees?.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-slate-500 mt-2">Platform fees</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <p className="text-slate-600 text-sm font-semibold mb-2">Net Earnings</p>
          <p className="text-3xl font-bold text-green-600">
            ${statement?.net_earnings?.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-slate-500 mt-2">Payout: {statement?.payout_date || 'Pending'}</p>
        </div>
      </div>

      {/* Statement Details */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Statement Details</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-600">Status</span>
            <span className="font-semibold">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  statement?.status === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : statement?.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-slate-100 text-slate-800'
                }`}
              >
                {statement?.status?.toUpperCase()}
              </span>
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Period</span>
            <span className="font-semibold">
              {statement?.period_start} to {statement?.period_end}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Total Streams</span>
            <span className="font-semibold">{statement?.total_streams?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Statement History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-2 text-slate-600 font-semibold">Period</th>
                <th className="text-right py-3 px-2 text-slate-600 font-semibold">Gross</th>
                <th className="text-right py-3 px-2 text-slate-600 font-semibold">Fees</th>
                <th className="text-right py-3 px-2 text-slate-600 font-semibold">Net</th>
                <th className="text-center py-3 px-2 text-slate-600 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-500">
                    No statement history yet
                  </td>
                </tr>
              ) : (
                history.map((stmt: any, i: number) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-2 font-medium text-slate-900">
                      {stmt.period_start}
                    </td>
                    <td className="text-right py-3 px-2">${stmt.gross_earnings?.toFixed(2)}</td>
                    <td className="text-right py-3 px-2 text-red-600">${stmt.fees?.toFixed(2)}</td>
                    <td className="text-right py-3 px-2 font-semibold text-green-600">
                      ${stmt.net_earnings?.toFixed(2)}
                    </td>
                    <td className="text-center py-3 px-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          stmt.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {stmt.status?.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
