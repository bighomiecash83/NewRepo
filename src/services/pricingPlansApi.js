/**
 * pricingPlansApi.js
 * Frontend API client for MongoDB-backed pricing plans
 * Public + Admin endpoints
 */

import axios from 'axios';

// Resolve backend base URL from multiple conventions (Vite, CRA, plain env)
const resolvedBase =
  (typeof import !== 'undefined' && import.meta?.env?.VITE_API_BASE_URL) ||
  process.env.VITE_API_BASE_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  'http://localhost:5183';

const BASE_URL = resolvedBase.replace(/\/$/, '') + '/api/pricing';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
});

// Public Endpoints
export async function getPublicPlans() {
  const { data } = await client.get('/public/plans');
  return data;
}

export async function getPublicPlanById(id) {
  const { data } = await client.get(`/public/plans/${id}`);
  return data;
}

export async function getPublicCategories() {
  const { data } = await client.get('/public/categories');
  return data;
}

export async function getPublicPlansByCategory(category) {
  const { data } = await client.get(`/public/categories/${encodeURIComponent(category)}`);
  return data;
}

// Admin Endpoints
export async function getAdminPlans() {
  const { data } = await client.get('/admin/plans');
  return data;
}

export async function createAdminPlan(payload) {
  const { data } = await client.post('/admin/plans', payload);
  return data;
}

export async function updateAdminPlan(id, payload) {
  const { data } = await client.put(`/admin/plans/${id}`, payload);
  return data;
}

export async function deleteAdminPlan(id) {
  const { data } = await client.delete(`/admin/plans/${id}`);
  return data;
}

export async function toggleAdminPlanActive(id) {
  const { data } = await client.patch(`/admin/plans/${id}/toggle-active`);
  return data;
}

// Utilities
export function groupByCategory(plans) {
  return plans.reduce((acc, p) => {
    acc[p.category] = acc[p.category] || [];
    acc[p.category].push(p);
    return acc;
  }, {});
}

export function sortPlans(plans) {
  return [...plans].sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
}

export default {
  getPublicPlans,
  getPublicPlanById,
  getPublicCategories,
  getPublicPlansByCategory,
  getAdminPlans,
  createAdminPlan,
  updateAdminPlan,
  deleteAdminPlan,
  toggleAdminPlanActive,
  groupByCategory,
  sortPlans
};
