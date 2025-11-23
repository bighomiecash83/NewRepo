import React, { useEffect, useState } from 'react'
import api from '../services/pricingPlansApi.js'

export default function PricingPlansPage() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    api.getPublicPlans().then(data => { if (mounted) setPlans(data) }).catch(err => {
      console.error('public plans err', err)
    }).finally(() => mounted && setLoading(false))
    return () => mounted = false
  }, [])

  if (loading) return <div>Loading public plans...</div>

  return (
    <div className="table-card">
      <div className="card-header">
        <h2 className="text-xl font-semibold">Public Plans</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-sm text-gray-600">
              <th>Name</th>
              <th>Price</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {plans.map(p => (
              <tr key={p._id || p.id} className="border-t py-2">
                <td className="py-3">{p.name}</td>
                <td>{p.price}</td>
                <td>{p.active ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
