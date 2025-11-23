/**
 * AdminPricingPlans.jsx
 * Admin CRUD panel for pricing plans (MongoDB-backed)
 */
import React, { useEffect, useState } from 'react';
import {
  getAdminPlans,
  createAdminPlan,
  updateAdminPlan,
  deleteAdminPlan,
  toggleAdminPlanActive
} from '../services/pricingPlansApi';

const emptyForm = {
  name: '',
  category: '',
  description: '',
  monthlyPrice: '',
  setupFee: '',
  featuresText: '',
  isActive: true,
  isRecommended: false,
  displayOrder: ''
};

export default function AdminPricingPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const data = await getAdminPlans();
      setPlans(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function startEdit(plan) {
    setEditingId(plan.id);
    setForm({
      name: plan.name || '',
      category: plan.category || '',
      description: plan.description || '',
      monthlyPrice: plan.monthlyPrice ?? '',
      setupFee: plan.setupFee ?? '',
      featuresText: (plan.features || []).join('\n'),
      isActive: plan.isActive,
      isRecommended: plan.isRecommended,
      displayOrder: plan.displayOrder ?? ''
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        monthlyPrice: form.monthlyPrice === '' ? null : Number(form.monthlyPrice),
        setupFee: form.setupFee === '' ? 0 : Number(form.setupFee),
        features: form.featuresText.split('\n').map(f => f.trim()).filter(Boolean),
        isActive: form.isActive,
        isRecommended: form.isRecommended,
        displayOrder: form.displayOrder === '' ? null : Number(form.displayOrder)
      };
      if (editingId) {
        await updateAdminPlan(editingId, payload);
      } else {
        await createAdminPlan(payload);
      }
      await load();
      resetForm();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this plan?')) return;
    await deleteAdminPlan(id);
    await load();
  }

  async function handleToggle(id) {
    await toggleAdminPlanActive(id);
    await load();
  }

  if (loading) return <div className="admin-pricing loading">Loading plans...</div>;
  if (error) return <div className="admin-pricing error">Error: {error}</div>;

  return (
    <div className="admin-pricing">
      <h1>Admin Pricing Plans</h1>
      <p>Manage pricing plans (CRUD & activation)</p>
      <div className="plans-table-wrapper">
        <table className="plans-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Monthly</th>
              <th>Setup</th>
              <th>Active</th>
              <th>Recommended</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.sort((a,b)=> (a.displayOrder ?? 999)-(b.displayOrder ?? 999)).map(p => (
              <tr key={p.id} className={!p.isActive ? 'inactive' : ''}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.monthlyPrice != null ? `$${p.monthlyPrice}` : '-'}</td>
                <td>{p.setupFee ? `$${p.setupFee}` : '-'}</td>
                <td>{p.isActive ? 'Yes' : 'No'}</td>
                <td>{p.isRecommended ? '★' : ''}</td>
                <td>{p.displayOrder ?? '-'}</td>
                <td>
                  <button onClick={() => startEdit(p)}>Edit</button>
                  <button onClick={() => handleToggle(p.id)}>{p.isActive ? 'Disable' : 'Enable'}</button>
                  <button onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <hr />
      <h2>{editingId ? 'Edit Plan' : 'Create Plan'}</h2>
      <form onSubmit={handleSave} className="plan-form">
        <div className="row">
          <label>Name
            <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
          </label>
          <label>Category
            <input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} required />
          </label>
        </div>
        <label>Description
          <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} />
        </label>
        <div className="row">
          <label>Monthly Price
            <input type="number" step="0.01" value={form.monthlyPrice} onChange={e=>setForm({...form,monthlyPrice:e.target.value})} />
          </label>
          <label>Setup Fee
            <input type="number" step="0.01" value={form.setupFee} onChange={e=>setForm({...form,setupFee:e.target.value})} />
          </label>
          <label>Display Order
            <input type="number" value={form.displayOrder} onChange={e=>setForm({...form,displayOrder:e.target.value})} />
          </label>
        </div>
        <label>Features (one per line)
          <textarea value={form.featuresText} onChange={e=>setForm({...form,featuresText:e.target.value})} rows={6} />
        </label>
        <div className="row">
          <label>
            <input type="checkbox" checked={form.isActive} onChange={e=>setForm({...form,isActive:e.target.checked})} /> Active
          </label>
          <label>
            <input type="checkbox" checked={form.isRecommended} onChange={e=>setForm({...form,isRecommended:e.target.checked})} /> Recommended
          </label>
        </div>
        <div className="actions">
          <button type="submit" disabled={saving}>{saving ? 'Saving...' : (editingId ? 'Update' : 'Create')}</button>
          {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
        </div>
      </form>
    </div>
  );
}
