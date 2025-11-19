// src/services/pricingService.ts
import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:5001/api", // change if your backend URL is different
});

export interface PricingPlan {
  id: string;
  name: string;
  category: string;
  monthlyPriceUsd: number;
  setupFeeUsd: number;
  description: string;
  features: string[];
  isRecommended: boolean;
}

export interface PricingPlanAdmin extends PricingPlan {
  isActive: boolean;
  displayOrder: number;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface PricingPlanCreateUpdate {
  id?: string;
  name: string;
  category: string;
  monthlyPriceUsd: number;
  setupFeeUsd: number;
  description?: string;
  features?: string[];
  isActive: boolean;
  isRecommended: boolean;
  displayOrder: number;
}

// ---------- Public ----------
export async function getPublicPlans(): Promise<PricingPlan[]> {
  const res = await api.get<PricingPlan[]>("/pricing");
  return res.data;
}

export async function getPublicPlansByCategory(
  category: string
): Promise<PricingPlan[]> {
  const res = await api.get<PricingPlan[]>(`/pricing/category/${category}`);
  return res.data;
}

// ---------- Admin ----------
export async function getAdminPlans(): Promise<PricingPlanAdmin[]> {
  const res = await api.get<PricingPlanAdmin[]>("/pricing/admin");
  return res.data;
}

export async function getAdminPlan(
  id: string
): Promise<PricingPlanAdmin | null> {
  const res = await api.get<PricingPlanAdmin>(`/pricing/admin/${id}`);
  return res.data;
}

export async function createPlan(
  payload: PricingPlanCreateUpdate
): Promise<PricingPlanAdmin> {
  const res = await api.post<PricingPlanAdmin>("/pricing/admin", payload);
  return res.data;
}

export async function updatePlan(
  id: string,
  payload: PricingPlanCreateUpdate
): Promise<PricingPlanAdmin> {
  const res = await api.put<PricingPlanAdmin>(
    `/pricing/admin/${id}`,
    payload
  );
  return res.data;
}

export async function togglePlanActive(id: string): Promise<void> {
  await api.patch(`/pricing/admin/${id}/toggle-active`);
}

export async function deletePlan(id: string): Promise<void> {
  await api.delete(`/pricing/admin/${id}`);
}
