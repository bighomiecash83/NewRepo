import axios from 'axios'
const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '')
const client = axios.create({ baseURL: base })

let _authToken = null

export function setAuthToken(token){
  _authToken = token
  if(token){
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete client.defaults.headers.common['Authorization']
  }
}

export default {
  async getPublicPlans(){
    const r = await client.get('/api/pricing/public/plans')
    return r.data
  },
  async getAdminPlans(){
    const r = await client.get('/api/pricing/admin/plans')
    return r.data
  },
  async createAdminPlan(payload){
    const r = await client.post('/api/pricing/admin/plans', payload)
    return r.data
  },
  async toggleAdminPlan(id){
    const r = await client.put(`/api/pricing/admin/plans/${id}/toggle`)
    return r.data
  },
  async deleteAdminPlan(id){
    const r = await client.delete(`/api/pricing/admin/plans/${id}`)
    return r.data
  }
}

export function sortPlans(plans = []){
  return [...plans].sort((a,b)=> (a.displayOrder ?? 999) - (b.displayOrder ?? 999))
}
