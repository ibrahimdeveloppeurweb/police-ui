'use client'

import { AlertTriangle, Siren } from 'lucide-react'

export function EmergencyPanel() {
  const handleActivateCrisisCenter = () => {
    // Handle crisis center activation
    console.log('Activating crisis center...')
  }

  return (
    <div className="bg-gradient-to-br from-red-100 to-red-50 border-2 border-red-500 rounded-2xl p-6 mb-8 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-red-500 text-white p-3 rounded-full animate-pulse shadow-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-700 mb-1 flex items-center gap-2">
              <span>🚨</span>
              CENTRE DE CRISE NATIONAL
            </h3>
            <p className="text-red-600">
              2 situations critiques nécessitent une attention immédiate
            </p>
          </div>
        </div>
        
        <button
          onClick={handleActivateCrisisCenter}
          className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <Siren className="w-5 h-5" />
          Activer Centre de Crise
        </button>
      </div>
    </div>
  )
}