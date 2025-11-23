import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ToastProvider } from "./components/Toast";
import PricingPlansPage from "./pages/PricingPlansPage";
import AdminPricingPlans from "./pages/AdminPricingPlans";

function App() {
  return (
    <ToastProvider>
      <Router>
        <nav className="bg-slate-900 border-b border-slate-700 p-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">🎵 DMF Music Platform</h1>
            <div className="space-x-4">
              <Link to="/pricing" className="text-blue-400 hover:text-blue-300">
                Pricing
              </Link>
              <Link to="/admin/pricing" className="text-blue-400 hover:text-blue-300">
                Admin
              </Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/pricing" element={<PricingPlansPage />} />
          <Route path="/admin/pricing" element={<AdminPricingPlans />} />
          <Route path="/" element={<PricingPlansPage />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
