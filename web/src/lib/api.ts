import axios from 'axios'
import { getIdToken } from './firebase'
import appConfig from '../../dmf_app_config.json'

const API_BASE = appConfig.apiBaseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
const DMF_API_KEY = appConfig.apiKey

// Create axios instance with auth headers
const createClient = () => {
  const instance = axios.create({
    baseURL: API_BASE,
    headers: {
      'Content-Type': 'application/json',
      'x-dmf-api-key': DMF_API_KEY,
    },
  })

  // Add Firebase auth token to requests if available
  instance.interceptors.request.use(async (config) => {
    try {
      const token = await getIdToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error)
    }
    return config
  })

  return instance
}

const client = createClient()

// Artists Service
export const artistService = {
  getAll: () => client.get('/artists'),
  getById: (id: string) => client.get(`/artists/${id}`),
  create: (data: any) => client.post('/artists/create', data),
  update: (id: string, data: any) => client.put(`/artists/${id}`, data),
  delete: (id: string) => client.delete(`/artists/${id}`),
}

// Releases Service
export const releaseService = {
  getAll: () => client.get('/releases'),
  getById: (id: string) => client.get(`/releases/${id}`),
  create: (data: any) => client.post('/releases/create', data),
  schedule: (id: string, data: any) => client.post(`/releases/${id}/schedule`, data),
  publish: (id: string, platforms: string[]) => client.post(`/releases/${id}/publish`, { platforms }),
}

// Revenue Service
export const revenueService = {
  getSummary: () => client.get('/api/revenue/summary'),
  getByArtist: (artistId: string) => client.get(`/api/revenue/artist/${artistId}`),
  getByPlatform: () => client.get('/api/revenue/platforms'),
  getPending: () => client.get('/api/revenue/pending'),
}

// Bots Service
export const botService = {
  getStatus: () => client.get('/bots/status'),
  launchAll: (count?: number) => client.post('/bots/start', { count: count || 100 }),
  pauseAll: () => client.post('/bots/stop', {}),
  getMetrics: () => client.get('/bots/metrics'),
  getRecommendations: () => client.get('/bots/status'),
}

// Contracts Service
export const contractService = {
  getAll: () => client.get('/api/contracts'),
  create: (data: any) => client.post('/api/contracts', data),
  sign: (id: string) => client.post(`/api/contracts/${id}/sign`),
}

export default client
