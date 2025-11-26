import { useEffect, useState } from 'react'
import { revenueService } from '@/lib/api'

export function useRevenue() {
  const [data, setData] = useState({
    totalRevenue: 0,
    pendingPayouts: 0,
    topArtist: '',
    platformBreakdown: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [summary, platforms, pending] = await Promise.all([
          revenueService.getSummary(),
          revenueService.getByPlatform(),
          revenueService.getPending(),
        ])

        setData({
          totalRevenue: summary.data.total || 0,
          pendingPayouts: pending.data.amount || 0,
          topArtist: summary.data.topArtist || '',
          platformBreakdown: platforms.data || [],
        })
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [])

  return { data, loading, error }
}

export function useBots() {
  const [status, setStatus] = useState('Idle')
  const [metrics, setMetrics] = useState({})
  const [recommendations, setRecommendations] = useState([])

  useEffect(() => {
    const fetchBotData = async () => {
      try {
        const [statusRes, metricsRes, recsRes] = await Promise.all([
          revenueService.getByPlatform(), // placeholder
          revenueService.getByPlatform(),
          revenueService.getByPlatform(),
        ])
        // Process bot data
      } catch (err) {
        console.error('Failed to fetch bot data', err)
      }
    }

    fetchBotData()
  }, [])

  return { status, metrics, recommendations }
}
