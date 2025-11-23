import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5001/dmf-music-platform/us-central1/api";

export default function AdminPricingPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jwtToken, setJwtToken] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    features: "",
    active: true,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (jwtToken) {
      fetchPlans();
    }
  }, [jwtToken]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/pricing/admin/plans`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      setPlans(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      const features = formData.features.split(",").map((f) => f.trim());
      const response = await axios.post(
        `${API_BASE}/api/pricing/admin/plans`,
        {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          features,
          active: formData.active,
        },
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );
      setPlans([...plans, response.data]);
      setFormData({ name: "", description: "", price: "", features: "", active: true });
      setSuccess("Plan created successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleTogglePlan = async (id) => {
    try {
      const response = await axios.patch(
        `${API_BASE}/api/pricing/admin/plans/${id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );
      setPlans(plans.map((p) => (p._id === id ? response.data : p)));
      setSuccess("Plan toggled successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleDeletePlan = async (id) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      try {
        await axios.delete(`${API_BASE}/api/pricing/admin/plans/${id}`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        setPlans(plans.filter((p) => p._id !== id));
        setSuccess("Plan deleted successfully!");
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      }
    }
  };

  if (!jwtToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8 flex items-center justify-center">
        <div className="bg-slate-700 p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-3xl font-bold text-white mb-4">Admin Login</h1>
          <input
            type="password"
            placeholder="Enter your JWT token"
            value={jwtToken}
            onChange={(e) => setJwtToken(e.target.value)}
            className="w-full px-4 py-2 rounded mb-4 border border-slate-600 bg-slate-800 text-white"
          />
          <button
            onClick={() => setJwtToken(jwtToken)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition"
          >
            Authenticate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Admin: Pricing Plans</h1>

        {error && <div className="bg-red-500 text-white p-4 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-500 text-white p-4 rounded mb-4">{success}</div>}

        {/* Create Plan Form */}
        <div className="bg-slate-700 rounded-lg p-6 mb-8 border border-slate-600">
          <h2 className="text-2xl font-bold text-white mb-4">Create New Plan</h2>
          <form onSubmit={handleCreatePlan} className="space-y-4">
            <input
              type="text"
              placeholder="Plan Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded border border-slate-600 bg-slate-800 text-white"
              required
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 rounded border border-slate-600 bg-slate-800 text-white"
              rows="3"
            />
            <input
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 rounded border border-slate-600 bg-slate-800 text-white"
              required
            />
            <input
              type="text"
              placeholder="Features (comma-separated)"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              className="w-full px-4 py-2 rounded border border-slate-600 bg-slate-800 text-white"
            />
            <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition">
              Create Plan
            </button>
          </form>
        </div>

        {/* Plans List */}
        {loading ? (
          <div className="text-center text-gray-400">Loading plans...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan._id}
                className={`rounded-lg p-6 shadow-lg border ${
                  plan.active ? "bg-slate-700 border-green-500" : "bg-slate-800 border-red-500"
                }`}
              >
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-300 mb-2">{plan.description}</p>
                <p className="text-blue-400 font-bold mb-4">${plan.price}/month</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTogglePlan(plan._id)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition"
                  >
                    {plan.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan._id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
