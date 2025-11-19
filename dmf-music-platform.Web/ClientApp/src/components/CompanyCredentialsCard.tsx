import React, { useEffect, useState } from "react";
import {
  CompanyProfile,
  fetchCompanyProfile,
} from "../services/dmfCompanyService";

export const CompanyCredentialsCard: React.FC = () => {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanyProfile()
      .then(setProfile)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (error) return <div className="text-red-500 text-sm font-semibold">Error: {error}</div>;
  if (loading) return <div className="text-sm text-gray-400">Loading credentials…</div>;
  if (!profile) return <div className="text-sm text-gray-400">No profile data</div>;

  const { legal, branding } = profile;

  return (
    <div className="bg-black text-yellow-600 rounded-2xl p-8 shadow-2xl border border-yellow-700 grid md:grid-cols-2 gap-8">
      <div className="flex flex-col justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
            State of Ohio • Business Credentials
          </p>
          <h1 className="mt-3 text-2xl font-bold text-white">
            {branding.officialName}
          </h1>
          <p className="mt-2 text-sm text-gray-300">{branding.tagline}</p>

          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between border-b border-gray-700 pb-1">
              <dt className="text-gray-400">Entity #</dt>
              <dd className="font-mono text-yellow-500 font-semibold">
                {legal.entityNumber}
              </dd>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-1">
              <dt className="text-gray-400">Type</dt>
              <dd className="text-white">{legal.entityType}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-1">
              <dt className="text-gray-400">Status</dt>
              <dd className="text-green-400 font-semibold">{legal.status}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-1">
              <dt className="text-gray-400">Filed</dt>
              <dd>{legal.filingDate}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-1">
              <dt className="text-gray-400">Certified</dt>
              <dd>{legal.certifiedDate}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-400">Statutory Agent</dt>
              <dd className="text-white font-medium">{legal.statutoryAgent}</dd>
            </div>
          </dl>

          {legal.registeredAddresses.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-700">
              <p className="text-xs uppercase tracking-[0.15em] text-gray-500">
                Registered Addresses
              </p>
              <div className="mt-3 space-y-2">
                {legal.registeredAddresses.map((addr, idx) => (
                  <div key={idx} className="text-xs text-gray-300">
                    <p className="font-semibold text-white">{addr.label}</p>
                    <p>{addr.street}</p>
                    <p>
                      {addr.city}, {addr.state} {addr.postalCode}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700 text-xs text-gray-600">
          Validation #{legal.validationNumber}
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="bg-gradient-to-br from-yellow-900/20 to-black border border-yellow-700 rounded-xl p-6 text-center">
          <svg
            className="w-24 h-24 mx-auto text-yellow-600 mb-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
          </svg>
          <p className="text-xs uppercase tracking-[0.15em] text-gray-400">
            Official Certificate
          </p>
          <p className="text-sm font-semibold text-yellow-500 mt-2">
            {branding.shortName}
          </p>
        </div>
      </div>
    </div>
  );
};
