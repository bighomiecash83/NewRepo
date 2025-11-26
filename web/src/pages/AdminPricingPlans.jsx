import React, { useEffect, useState } from 'react'
import api, { setAuthToken } from '../services/pricingPlansApi.js'
import { useToast } from '../components/ToastProvider'

export default function AdminPricingPlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('0')
  const [token, setToken] = useState('')
  const [authError, setAuthError] = useState(null)
  const toast = useToast()

  useEffect(() => {
    // Initialize token from localStorage (client-side only)
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('dmf_admin_token') || '' : ''
    setToken(storedToken)
    
    if (storedToken) {
      setAuthToken(storedToken)
    } else {
      setAuthToken(null)
    }
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function refresh() {
    setLoading(true)
    api.getAdminPlans().then(data => setPlans(data)).catch(e => {
      console.error(e)
      setAuthError(e.response && e.response.status === 401 ? 'Unauthorized — invalid or missing token' : null)
    }).finally(() => setLoading(false))
  }

  async function createPlan(e) {
    e.preventDefault()
    const tempId = 'tmp_' + Date.now()
    const newPlan = { _id: tempId, name, price: Number(price), active: true }
    setPlans(prev => [newPlan, ...prev])
    setName(''); setPrice('0')
    try {
      const created = await api.createAdminPlan({ name: newPlan.name, price: newPlan.price, active: true })
      setPlans(prev => prev.map(p => p._id === tempId ? created : p))
      toast.push('Plan created')
    } catch (err) {
      setPlans(prev => prev.filter(p => p._id !== tempId))
      console.error(err); toast.push('Create failed', { type: 'error' })
    }
  }

  async function toggleActive(plan) {
    const id = plan._id || plan.id
    setPlans(prev => prev.map(p => p._id === id ? { ...p, active: !p.active } : p))
    try {
      await api.toggleAdminPlan(id)
      toast.push('Updated')
    } catch (err) {
      setPlans(prev => prev.map(p => p._id === id ? { ...p, active: plan.active } : p))
      console.error(err); toast.push('Update failed', { type: 'error' })
    }
  }

  async function deletePlan(plan) {
    if (!confirm('Delete plan?')) return
    const id = plan._id || plan.id
    const snapshot = plans
    setPlans(prev => prev.filter(p => p._id !== id))
    try {
      await api.deleteAdminPlan(id)
      toast.push('Deleted')
    } catch (err) {
      setPlans(snapshot)
      console.error(err); toast.push('Delete failed', { type: 'error' })
    }
  }

  function applyToken() {
    setAuthToken(token || null)
    if (token) {
      localStorage.setItem('dmf_admin_token', token)
    } else {
      localStorage.removeItem('dmf_admin_token')
    }
    refresh()
  }

  function clearToken() {
    setToken('')
    applyToken()
  }

  if (loading) return <div>Loading admin plans...</div>

  return (
    <div className="table-card">
      <div className="card-header">
        <h2 className="text-xl font-semibold">Admin Pricing</h2>
        <div className="flex items-center gap-2">
          <input className="px-3 py-2 border rounded-md" style={{ width: 420 }} value={token} onChange={e => setToken(e.target.value)} placeholder="Paste admin JWT here (for testing)" />
          <button onClick={applyToken} className="btn-dmf">Apply</button>
          <button onClick={clearToken} className="btn-ghost">Clear</button>
        </div>
      </div>

      {authError && <div className="mb-3 text-sm text-red-600">{authError}</div>}

      <form onSubmit={createPlan} className="flex gap-3 mb-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Plan name" required className="px-3 py-2 border rounded-md flex-1" />
        <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" required className="px-3 py-2 border rounded-md w-32" />
        <button type="submit" className="btn-dmf">Create</button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="text-sm text-gray-600">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Price</th>
              <th className="p-2">Active</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map(p => (
              <tr key={p._id || p.id} className={`border-t ${p.active ? '' : 'opacity-60'}`}>
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.price}</td>
                <td className="p-3">{p.active ? <span className="text-green-600 font-medium">Active</span> : <span className="text-gray-500">Inactive</span>}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={() => toggleActive(p)} className="btn-ghost text-sm">{p.active ? 'Deactivate' : 'Activate'}</button>
                    <button onClick={() => deletePlan(p)} className="px-3 py-2 rounded-btn text-sm border border-red-200 text-red-600">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
