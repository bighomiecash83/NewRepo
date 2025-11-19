// src/components/AdminPricingPanel.tsx
import React, { useEffect, useState } from "react";
import {
  getAdminPlans,
  createPlan,
  updatePlan,
  togglePlanActive,
  deletePlan,
  PricingPlanAdmin,
  PricingPlanCreateUpdate,
} from "../services/pricingService";

const emptyForm: PricingPlanCreateUpdate = {
  name: "",
  category: "",
  monthlyPriceUsd: 0,
  setupFeeUsd: 0,
  description: "",
  features: [],
  isActive: true,
  isRecommended: false,
  displayOrder: 0,
};

export const AdminPricingPanel: React.FC = () => {
  const [plans, setPlans] = useState<PricingPlanAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PricingPlanCreateUpdate>(emptyForm);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await getAdminPlans();
      setPlans(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load plans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleEdit = (plan: PricingPlanAdmin) => {
    setEditingId(plan.id);
    setForm({
      id: plan.id,
      name: plan.name,
      category: plan.category,
      monthlyPriceUsd: plan.monthlyPriceUsd,
      setupFeeUsd: plan.setupFeeUsd,
      description: plan.description,
      features: plan.features,
      isActive: plan.isActive,
      isRecommended: plan.isRecommended,
      displayOrder: plan.displayOrder,
    });
  };

  const handleNew = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "monthlyPriceUsd" ||
            name === "setupFeeUsd" ||
            name === "displayOrder"
          ? Number(value)
          : value,
    }));
  };

  const handleFeaturesChange = (value: string) => {
    const list = value
      .split("\n")
      .map((v) => v.trim())
      .filter(Boolean);
    setForm((prev) => ({ ...prev, features: list }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updatePlan(editingId, form);
      } else {
        await createPlan(form);
      }
      await loadPlans();
      setEditingId(null);
      setForm(emptyForm);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to save plan.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await togglePlanActive(id);
      await loadPlans();
    } catch (err) {
      console.error(err);
      setError("Failed to toggle active state.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this plan? This cannot be undone.")) return;
    try {
      await deletePlan(id);
      await loadPlans();
    } catch (err) {
      console.error(err);
      setError("Failed to delete plan.");
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto py-10 px-4 lg:px-0 text-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Pricing Admin</h2>
        <button
          onClick={handleNew}
          className="px-4 py-2 rounded-xl bg-[#1d4ed8] hover:bg-[#2563eb] text-sm font-semibold shadow-md"
        >
          New Plan
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-900/40 border border-red-500/60 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">Loading plans…</p>
      ) : (
        <div className="overflow-x-auto mb-10">
          <table className="min-w-full text-sm bg-[#020617] border border-gray-800 rounded-xl overflow-hidden">
            <thead className="bg-[#020617] border-b border-gray-800">
              <tr>
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Category</th>
                <th className="px-3 py-2 text-right">Monthly</th>
                <th className="px-3 py-2 text-right">Setup</th>
                <th className="px-3 py-2 text-center">Active</th>
                <th className="px-3 py-2 text-center">Recommended</th>
                <th className="px-3 py-2 text-right">Order</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-gray-800 hover:bg-gray-900/50"
                >
                  <td className="px-3 py-2 text-xs text-gray-400">{p.id}</td>
                  <td className="px-3 py-2">{p.name}</td>
                  <td className="px-3 py-2 text-gray-300">{p.category}</td>
                  <td className="px-3 py-2 text-right">
                    ${p.monthlyPriceUsd.toFixed(0)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    ${p.setupFeeUsd.toFixed(0)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => handleToggleActive(p.id)}
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        p.isActive
                          ? "bg-green-600/80 text-white"
                          : "bg-gray-700 text-gray-200"
                      }`}
                    >
                      {p.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {p.isRecommended ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-[#ffd700] text-black font-semibold">
                        Yes
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">No</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">{p.displayOrder}</td>
                  <td className="px-3 py-2 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="px-2 py-1 rounded-lg text-xs bg-blue-700 hover:bg-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-2 py-1 rounded-lg text-xs bg-red-700 hover:bg-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {!plans.length && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-4 text-center text-gray-400"
                  >
                    No plans found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Form */}
      <div className="bg-[#020617] border border-gray-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-3">
          {editingId ? "Edit Plan" : "Create New Plan"}
        </h3>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm text-gray-300">Name *</label>
            <input
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-300">Category *</label>
            <input
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Distribution / Marketing / Legal / Bundle"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-300">
              Monthly Price (USD)
            </label>
            <input
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
              name="monthlyPriceUsd"
              type="number"
              min={0}
              value={form.monthlyPriceUsd}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-300">
              Setup Fee (USD)
            </label>
            <input
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
              name="setupFeeUsd"
              type="number"
              min={0}
              value={form.setupFeeUsd}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm text-gray-300">Description</label>
            <textarea
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white focus:border-blue-500 outline-none min-h-[70px]"
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm text-gray-300">
              Features (one per line)
            </label>
            <textarea
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white focus:border-blue-500 outline-none min-h-[100px]"
              value={(form.features || []).join("\n")}
              onChange={(e) => handleFeaturesChange(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4 md:col-span-2">
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="rounded"
              />
              Active
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                name="isRecommended"
                checked={form.isRecommended}
                onChange={handleChange}
                className="rounded"
              />
              Recommended
            </label>

            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span>Display Order</span>
              <input
                className="w-20 rounded-lg bg-gray-900 border border-gray-700 px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"
                name="displayOrder"
                type="number"
                value={form.displayOrder}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            {editingId && (
              <button
                type="button"
                onClick={handleNew}
                className="px-4 py-2 rounded-xl border border-gray-600 text-sm text-gray-200 hover:bg-gray-800"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-sm font-semibold shadow-md disabled:opacity-60"
            >
              {saving
                ? "Saving…"
                : editingId
                ? "Save Changes"
                : "Create Plan"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
