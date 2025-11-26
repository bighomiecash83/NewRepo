'use client'

import { FileText, Plus, Check, AlertCircle } from 'lucide-react'

export default function Contracts() {
  const contracts = [
    { id: 1, artist: 'Urban Creator', type: 'Distribution', status: 'Active', signed: '2025-01-01' },
    { id: 2, artist: 'Jazz Master', type: 'Licensing', status: 'Pending', signed: null },
    { id: 3, artist: 'Indie Artist', type: 'Promotion', status: 'Active', signed: '2024-12-15' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
            <FileText className="w-10 h-10 text-dmf-primary" />
            Contracts
          </h1>
          <p className="text-slate-400 mt-2">Manage artist agreements and legal documents with The Gavel Syndicate</p>
        </div>
        <button className="flex items-center gap-2 bg-dmf-primary hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition">
          <Plus className="w-5 h-5" />
          New Contract
        </button>
      </div>

      {/* Contracts Table */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50">
              <th className="text-left p-4 font-semibold text-slate-300">Artist</th>
              <th className="text-left p-4 font-semibold text-slate-300">Contract Type</th>
              <th className="text-left p-4 font-semibold text-slate-300">Status</th>
              <th className="text-left p-4 font-semibold text-slate-300">Signed Date</th>
              <th className="text-left p-4 font-semibold text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract) => (
              <tr key={contract.id} className="border-b border-slate-700 hover:bg-slate-700/30 transition">
                <td className="p-4 text-white font-semibold">{contract.artist}</td>
                <td className="p-4 text-slate-300">{contract.type}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold flex w-fit items-center gap-1 ${
                    contract.status === 'Active'
                      ? 'bg-dmf-success/20 text-dmf-success'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {contract.status === 'Active' ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {contract.status}
                  </span>
                </td>
                <td className="p-4 text-slate-300">{contract.signed || 'Pending'}</td>
                <td className="p-4">
                  <button className="text-dmf-primary hover:text-blue-400 font-semibold text-sm">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Integration Info */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-dmf-primary/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <span>⚖️</span>
          The Gavel Syndicate Integration
        </h3>
        <p className="text-slate-400 mb-4">Automatically generate, manage, and enforce artist contracts with blockchain-verified signatures and IP ownership tracking.</p>
        <button className="bg-dmf-primary hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition">
          Connect Gavel Syndicate
        </button>
      </div>
    </div>
  )
}
