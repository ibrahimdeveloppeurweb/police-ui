'use client'

import { Eye, Phone, HelpCircle, Users, Trophy, Medal, Star, AlertTriangle } from 'lucide-react'

interface Commissariat {
  id: string
  name: string
  location: string
  code: string
  status: 'active' | 'warning' | 'critical'
  rank: number
  controls: number
  agents: number
  performance: number
  revenue: number
  efficiency: number
  change: number
  issue?: string
}

const commissariats: Commissariat[] = [
  {
    id: '3',
    name: '3ème Arrondissement',
    location: 'Adjamé, Abidjan',
    code: 'COM-ABJ-003',
    status: 'active',
    rank: 1,
    controls: 47,
    agents: 23,
    performance: 97,
    revenue: 340000,
    efficiency: 2.04,
    change: 15.2
  },
  {
    id: '5',
    name: '5ème Arrondissement',
    location: 'Marcory, Abidjan',
    code: 'COM-ABJ-005',
    status: 'active',
    rank: 2,
    controls: 38,
    agents: 19,
    performance: 94,
    revenue: 285000,
    efficiency: 2.00,
    change: 8.7
  },
  {
    id: '7',
    name: '7ème Arrondissement',
    location: 'Koumassi, Abidjan',
    code: 'COM-ABJ-007',
    status: 'active',
    rank: 3,
    controls: 35,
    agents: 17,
    performance: 93,
    revenue: 275000,
    efficiency: 2.06,
    change: 12.3
  },
  {
    id: '1',
    name: '1er Arrondissement',
    location: 'Plateau, Abidjan',
    code: 'COM-ABJ-001',
    status: 'active',
    rank: 4,
    controls: 42,
    agents: 21,
    performance: 91,
    revenue: 315000,
    efficiency: 2.00,
    change: 6.8
  },
  {
    id: '8',
    name: '8ème Arrondissement',
    location: 'Port-Bouët, Abidjan',
    code: 'COM-ABJ-008',
    status: 'active',
    rank: 5,
    controls: 29,
    agents: 15,
    performance: 89,
    revenue: 220000,
    efficiency: 1.93,
    change: 4.5
  },
  {
    id: '10',
    name: '10ème Arrondissement',
    location: 'Abobo, Abidjan',
    code: 'COM-ABJ-010',
    status: 'warning',
    rank: 18,
    controls: 12,
    agents: 8,
    performance: 67,
    revenue: 95000,
    efficiency: 1.50,
    change: -23.1,
    issue: '3 agents indisponibles'
  }
]

export function PerformanceCards() {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-600" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-500" />
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />
    if (rank <= 10) return <Star className="w-5 h-5 text-blue-500" />
    return <AlertTriangle className="w-5 h-5 text-orange-500" />
  }

  const getStatusBadge = (status: string, rank: number) => {
    if (rank === 1) {
      return (
        <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Trophy className="w-3 h-3" />
          TOP PERFORMER
        </span>
      )
    }
    
    switch (status) {
      case 'active':
        return (
          <span className="bg-gradient-to-r from-green-100 to-green-200 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
            EXCELLENT
          </span>
        )
      case 'warning':
        return (
          <span className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            ATTENTION
          </span>
        )
      case 'critical':
        return (
          <span className="bg-gradient-to-r from-red-100 to-red-200 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            CRITIQUE
          </span>
        )
      default:
        return null
    }
  }

  const getCardStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'border-green-500'
      case 'warning':
        return 'border-amber-500'
      case 'critical':
        return 'border-red-500'
      default:
        return 'border-gray-300'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {commissariats.map((commissariat) => (
        <div
          key={commissariat.id}
          className={`bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl shadow-lg border-t-4 ${getCardStyle(commissariat.status)} transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl relative overflow-hidden`}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {getRankIcon(commissariat.rank)}
                <h3 className="font-bold text-slate-800">{commissariat.name}</h3>
              </div>
              <p className="text-sm text-slate-600">{commissariat.location} • {commissariat.code}</p>
            </div>
            {getStatusBadge(commissariat.status, commissariat.rank)}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="text-center p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
              <div className="text-xl font-bold text-slate-800">{commissariat.controls}</div>
              <div className="text-xs text-slate-600 uppercase tracking-wide">Contrôles</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
              <div className="text-xl font-bold text-slate-800">{commissariat.agents}</div>
              <div className="text-xs text-slate-600 uppercase tracking-wide">Agents</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
              <div className="text-xl font-bold text-slate-800">{commissariat.performance}%</div>
              <div className="text-xs text-slate-600 uppercase tracking-wide">Performance</div>
            </div>
          </div>

          {/* Revenue Info */}
          <div className={`p-3 rounded-xl mb-4 ${
            commissariat.status === 'active' 
              ? 'bg-gradient-to-br from-green-100 to-green-50' 
              : commissariat.status === 'warning'
              ? 'bg-gradient-to-br from-amber-100 to-amber-50'
              : 'bg-gradient-to-br from-red-100 to-red-50'
          }`}>
            <div className={`text-sm mb-1 ${
              commissariat.status === 'active' ? 'text-green-700' : 
              commissariat.status === 'warning' ? 'text-amber-700' : 'text-red-700'
            }`}>
              <strong>Revenus:</strong> {commissariat.revenue} FCFA ({commissariat.change > 0 ? '+' : ''}{commissariat.change}%)
            </div>
            <div className={`text-sm ${
              commissariat.status === 'active' ? 'text-green-700' : 
              commissariat.status === 'warning' ? 'text-amber-700' : 'text-red-700'
            }`}>
              {commissariat.issue ? (
                <><strong>Problème:</strong> {commissariat.issue}</>
              ) : (
                <><strong>Efficacité:</strong> {commissariat.efficiency} contrôles/agent/heure</>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium flex-1 transition-all ${
                commissariat.status === 'active' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg' 
                  : commissariat.status === 'warning'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg'
                  : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg'
              }`}
              onClick={() => console.log(`View commissariat ${commissariat.id}`)}
            >
              {commissariat.status === 'warning' ? (
                <>
                  <HelpCircle className="w-4 h-4" />
                  Assister
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Superviser
                </>
              )}
            </button>
            
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
              onClick={() => console.log(`Contact commissariat ${commissariat.id}`)}
            >
              {commissariat.status === 'warning' ? (
                <>
                  <Users className="w-4 h-4" />
                  Renfort
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4" />
                  Contacter
                </>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}