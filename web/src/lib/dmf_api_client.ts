// web/src/lib/dmf_api_client.ts
// Shared API client for ALL frontends (React, AI Studio, Bolt, VS Code, etc.)
// Single source of truth for backend communication

import axios, { AxiosInstance, AxiosError } from 'axios'

// Get base URL from environment or use localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

// Create axios instance with base configuration
export const dmfApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
})

// ===== REQUEST INTERCEPTOR =====
// Auto-inject authentication token on every request
dmfApi.interceptors.request.use((config) => {
  // Get token from localStorage (set during login)
  const token = localStorage.getItem('dmf_token')
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Optional: Log request in development
  if (import.meta.env.DEV) {
    console.log(`[DMF API] ${config.method?.toUpperCase()} ${config.url}`)
  }

  return config
})

// ===== RESPONSE INTERCEPTOR =====
// Handle common errors, token refresh, etc.
dmfApi.interceptors.response.use(
  (response) => {
    // Log successful response in development
    if (import.meta.env.DEV) {
      console.log(`[DMF API] ✓ ${response.status} ${response.config.url}`)
    }
    return response
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('dmf_token')
      window.location.href = '/login'
    }

    // Handle 403 Forbidden (insufficient permissions)
    if (error.response?.status === 403) {
      console.error('[DMF API] Access denied:', error.response.data)
    }

    // Handle 500+ Server errors
    if (error.response?.status && error.response.status >= 500) {
      console.error('[DMF API] Server error:', error.response.status, error.response.data)
    }

    // Log error in development
    if (import.meta.env.DEV) {
      console.error(`[DMF API] ✗ ${error.response?.status} ${error.config?.url}`)
      console.error('[DMF API] Error:', error.response?.data)
    }

    return Promise.reject(error)
  }
)

// ===== ARTIST API METHODS =====
export const artistApi = {
  // Get all artists (admin only)
  getAll: () => dmfApi.get('/api/artists'),

  // Get single artist by ID
  getById: (id: string) => dmfApi.get(`/api/artists/${id}`),

  // Get current logged-in artist
  getCurrentArtist: () => dmfApi.get('/api/artists/me'),

  // Update artist profile
  update: (id: string, data: any) => dmfApi.put(`/api/artists/${id}`, data),

  // Get artist's releases
  getReleases: (artistId: string) => dmfApi.get(`/api/artists/${artistId}/releases`),

  // Get artist's royalty statements
  getRoyalties: (artistId: string) => dmfApi.get(`/api/artists/${artistId}/royalties`),
}

// ===== RELEASE API METHODS =====
export const releaseApi = {
  // Get all releases (admin) or current artist's releases
  getAll: () => dmfApi.get('/api/releases'),

  // Get single release
  getById: (id: string) => dmfApi.get(`/api/releases/${id}`),

  // Create new release
  create: (data: any) => dmfApi.post('/api/releases', data),

  // Update release
  update: (id: string, data: any) => dmfApi.put(`/api/releases/${id}`, data),

  // Delete release
  delete: (id: string) => dmfApi.delete(`/api/releases/${id}`),

  // Schedule release for distribution
  schedule: (id: string, data: any) => dmfApi.post(`/api/releases/${id}/schedule`, data),

  // Publish to specific DSPs
  publish: (id: string, platforms: string[]) =>
    dmfApi.post(`/api/releases/${id}/publish`, { platforms }),

  // Get release's distribution status
  getDistributionStatus: (id: string) => dmfApi.get(`/api/releases/${id}/distribution`),
}

// ===== ROYALTY API METHODS =====
export const royaltyApi = {
  // Get current artist's earnings statement
  getMyStatement: () => dmfApi.get('/api/royalties/me'),

  // Get specific royalty statement
  getStatement: (id: string) => dmfApi.get(`/api/royalties/${id}`),

  // Get artist's statement history
  getHistory: (artistId: string, limit: number = 12) =>
    dmfApi.get(`/api/royalties/artist/${artistId}`, { params: { limit } }),

  // Get total earnings
  getTotalEarnings: (artistId: string) => dmfApi.get(`/api/royalties/artist/${artistId}/total`),

  // Get unpaid statements (admin)
  getUnpaidStatements: () => dmfApi.get('/api/royalties/unpaid'),

  // Trigger payout processing (admin)
  triggerPayout: (statementIds: string[]) =>
    dmfApi.post('/api/royalties/payout', { statementIds }),
}

// ===== CATALOG / STREAMGOD API METHODS =====
export const catalogApi = {
  // Get overall catalog health
  getHealth: () => dmfApi.get('/api/catalog/health'),

  // Get catalog analytics
  getAnalytics: () => dmfApi.get('/api/catalog/analytics'),

  // Get catalog recommendations
  getRecommendations: () => dmfApi.get('/api/catalog/recommendations'),

  // Get DSP coverage per release
  getDspCoverage: (releaseId: string) =>
    dmfApi.get(`/api/catalog/dsp-coverage/${releaseId}`),

  // Analyze catalog readiness
  analyzeReadiness: () => dmfApi.post('/api/catalog/analyze'),
}

// ===== HEALTH CHECK =====
export const healthApi = {
  // Check backend + MongoDB + Supabase connectivity
  check: () => dmfApi.get('/health'),
}

// ===== UTILITY FUNCTIONS =====

/**
 * Set authentication token (call this after login)
 */
export function setToken(token: string) {
  localStorage.setItem('dmf_token', token)
  dmfApi.defaults.headers.common.Authorization = `Bearer ${token}`
}

/**
 * Clear authentication token (call this on logout)
 */
export function clearToken() {
  localStorage.removeItem('dmf_token')
  delete dmfApi.defaults.headers.common.Authorization
}

/**
 * Get current authentication token
 */
export function getToken(): string | null {
  return localStorage.getItem('dmf_token')
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getToken()
}

/**
 * Set custom header for all requests
 */
export function setCustomHeader(name: string, value: string) {
  dmfApi.defaults.headers.common[name] = value
}

export default dmfApi
