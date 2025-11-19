import React, { useEffect, useState } from "react";
import {
  ServiceDivision,
  fetchServiceDivisions,
} from "../services/dmfCompanyService";

export const ServiceDivisionsGrid: React.FC = () => {
  const [divisions, setDivisions] = useState<ServiceDivision[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServiceDivisions()
      .then(setDivisions)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (error) return <div className="text-red-500 text-sm font-semibold">Error: {error}</div>;
  if (loading) return <div className="text-sm text-gray-400">Loading services…</div>;
  if (!divisions.length) return <div className="text-sm text-gray-400">No services available</div>;

  return (
    <div className="space-y-6">
      {divisions.map((division) => (
        <div
          key={division.id}
          className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="flex justify-between items-start gap-4 mb-5">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-400 font-semibold">
                {division.category}
              </p>
              <h2 className="text-xl font-bold text-white mt-2">
                {division.name}
              </h2>
              <p className="text-sm text-gray-300 mt-2 leading-relaxed">
                {division.description}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {division.services.map((svc) => (
              <div
                key={svc.code}
                className="bg-black/80 border border-gray-700 rounded-xl p-4 hover:border-blue-600 hover:bg-blue-900/10 transition-all"
              >
                <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500 font-mono font-semibold">
                  {svc.code}
                </p>
                <p className="mt-2 font-semibold text-white text-sm">
                  {svc.name}
                </p>
                <p className="mt-2 text-xs text-gray-300 leading-relaxed">
                  {svc.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
