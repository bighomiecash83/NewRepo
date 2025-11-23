import React, {useEffect, useState} from 'react';
import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function PricingPlansPage(){
  const [plans, setPlans] = useState([]);
  useEffect(()=>{
    axios.get(`${API_BASE}/pricing/public/plans`).then(r=> setPlans(r.data)).catch(console.error);
  },[]);
  return (
    <div style={{padding:20}}>
      <h2>Public Plans</h2>
      <ul>
        {plans.map(p=> <li key={p._id || p.id}>{p.name} — ${p.price}</li>)}
      </ul>
    </div>
  );
}
