import React, {useEffect, useState} from 'react';
import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function AdminPricingPlans(){
  const [plans, setPlans] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('dmf_admin_token') || '');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('0');

  useEffect(()=>{ refresh(); }, []);

  function authHeader(){
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }

  function refresh(){
    axios.get(`${API_BASE}/pricing/admin/plans`, authHeader()).then(r=> setPlans(r.data)).catch(e=> console.error(e));
  }

  async function createPlan(e){
    e.preventDefault();
    try{
      await axios.post(`${API_BASE}/pricing/admin/plans`, { name, price: Number(price), active:true }, authHeader());
      setName(''); setPrice('0'); refresh();
    }catch(err){ console.error(err); alert('Create failed'); }
  }

  async function toggleActive(plan){
    try{
      await axios.put(`${API_BASE}/pricing/admin/plans/${plan._id}`, { active: !plan.active }, authHeader());
      refresh();
    }catch(err){ console.error(err); alert('Update failed'); }
  }

  async function deletePlan(plan){
    if(!confirm('Delete?')) return;
    try{
      await axios.delete(`${API_BASE}/pricing/admin/plans/${plan._id}`, authHeader());
      refresh();
    }catch(err){ console.error(err); alert('Delete failed'); }
  }

  return (
    <div style={{padding:20}}>
      <h2>Admin Pricing (paste admin JWT)</h2>
      <div style={{marginBottom:12}}>
        <input style={{width:420}} value={token} onChange={e=> setToken(e.target.value)} placeholder="paste admin jwt" />
        <button onClick={()=>{ localStorage.setItem('dmf_admin_token', token); refresh();}}>Apply</button>
      </div>

      <form onSubmit={createPlan}>
        <input value={name} onChange={e=> setName(e.target.value)} placeholder="plan name" required />
        <input type="number" value={price} onChange={e=> setPrice(e.target.value)} required />
        <button type="submit">Create</button>
      </form>

      <ul>
        {plans.map(p=> (
          <li key={p._id || p.id}>
            {p.name} — ${p.price} — {p.active ? 'Active' : 'Inactive'}
            <button onClick={()=> toggleActive(p)}>{p.active ? 'Deactivate' : 'Activate'}</button>
            <button onClick={()=> deletePlan(p)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
