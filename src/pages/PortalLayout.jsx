import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, Navigate } from "react-router-dom";

const PORTAL_API_BASE =
  import.meta.env.VITE_PORTAL_API_BASE || "http://localhost:5001/api/portal";

/**
 * PortalLayout
 * Master layout for the customer/artist portal
 * All portal routes nest under this
 */
export default function PortalLayout() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();

  useEffect(() => {
    async function loadMe() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("dmf_token") || "";

        const res = await fetch(`${PORTAL_API_BASE}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          setError("unauthorized");
          setMe(null);
          return;
        }

        if (!res.ok) throw new Error("Failed to load portal user");

        const json = await res.json();
        setMe(json.data || null);
      } catch (err) {
        console.error("[DMF Portal] /me error:", err);
        setError("Failed to load portal session");
      } finally {
        setLoading(false);
      }
    }

    loadMe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white flex items-center justify-center">
        <div className="text-center animate-pulse space-y-3">
          <div className="text-2xl font-bold text-blue-400">??</div>
          <div className="text-lg font-semibold">DMF Portal</div>
          <div className="text-sm text-zinc-400">Checking access...</div>
          <div className="h-2 w-48 bg-zinc-800 rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  if (error === "unauthorized" || !me) {
    return (
      <Navigate to="/login" state={{ from: location }} replace />
    );
  }

  const roleLabel = me.role || "Portal User";
  const planLabel = me.plan_key || "Unassigned";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-blue-900/30 bg-gradient-to-r from-blue-950/30 to-transparent px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-blue-400 mb-1">
              ?? DMF Portal
            </h1>
            <p className="text-sm text-zinc-400">
              Role: <span className="font-semibold">{roleLabel}</span> • Plan:{" "}
              <span className="font-semibold">{planLabel}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => localStorage.removeItem("dmf_token")}
              className="text-xs px-3 py-1 rounded-full border border-zinc-700 text-zinc-300 hover:border-red-500 hover:text-red-300 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex gap-2 text-xs">
          <PortalNavLink to="/portal" label="Dashboard" />
          <PortalNavLink to="/portal/analytics" label="Analytics" />
          <PortalNavLink to="/portal/distribution" label="Distribution" />
          <PortalNavLink to="/portal/support" label="Support" />
        </nav>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        <Outlet context={{ me }} />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-4 text-center text-xs text-zinc-500">
        <p>DMF Portal © 2025 • StreamGod OS Powered</p>
      </footer>
    </div>
  );
}

function PortalNavLink({ to, label }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      className={[
        "px-3 py-1 rounded-full border transition",
        active
          ? "border-blue-500 bg-blue-500/10 text-blue-300"
          : "border-zinc-700 text-zinc-300 hover:border-blue-500 hover:text-blue-300",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}
