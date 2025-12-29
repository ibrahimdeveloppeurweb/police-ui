'use client'

import { useState } from 'react'
import { 
  Search, 
  DollarSign, 
  Users, 
  ShieldAlert, 
  Target, 
  CheckCircle,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  RefreshCw,
  Calendar,
  Activity
} from 'lucide-react'

interface StatCard {
  title: string
  value: string
  change: {
    value: string
    type: 'positive' | 'negative' | 'neutral'
    percentage: number
  }
  details: string[]
  icon: React.ElementType
  color: 'orange' | 'green' | 'blue' | 'red' | 'purple' | 'amber'
  trend: number[] // Données pour mini sparkline
  lastUpdate: string
  target?: number
}

const stats: StatCard[] = [
  {
    title: 'Contrôles Nationaux (24h)',
    value: '1,247',
    change: {
      value: '+12.5% vs hier (1,108)',
      type: 'positive',
      percentage: 12.5
    },
    details: [
      '23 commissariats actifs • 342 agents déployés',
      'Objectif quotidien: 1,200 (103.9% atteint)'
    ],
    icon: Search,
    color: 'orange',
    trend: [1050, 1080, 1120, 1200, 1180, 1220, 1247],
    lastUpdate: 'Il y a 2 min',
    target: 1200
  },
  {
    title: 'Revenus Nationaux',
    value: '8.7M',
    change: {
      value: '+8.2% vs hier (8.04M)',
      type: 'positive',
      percentage: 8.2
    },
    details: [
      'FCFA collectés aujourd\'hui',
      '189 infractions • Moyenne: 46K FCFA'
    ],
    icon: DollarSign,
    color: 'green',
    trend: [7.8, 7.9, 8.1, 8.3, 8.0, 8.5, 8.7],
    lastUpdate: 'Il y a 5 min'
  },
  {
    title: 'Agents Opérationnels',
    value: '289/342',
    change: {
      value: '84.5% opérationnel (+3 vs hier)',
      type: 'positive',
      percentage: 84.5
    },
    details: [
      'En service: 289 • Pause: 32 • Indisponible: 21',
      'Répartition géographique optimisée'
    ],
    icon: Users,
    color: 'blue',
    trend: [280, 285, 282, 290, 286, 288, 289],
    lastUpdate: 'Il y a 1 min'
  },
  {
    title: 'Alertes Sécuritaires',
    value: '31',
    change: {
      value: '+5 nouvelles alertes (48h)',
      type: 'negative',
      percentage: -19.2
    },
    details: [
      'Critiques: 7 • Importantes: 15 • Standard: 9',
      '23 véhicules volés • 8 avis de recherche'
    ],
    icon: ShieldAlert,
    color: 'red',
    trend: [25, 28, 26, 30, 32, 29, 31],
    lastUpdate: 'Il y a 3 min'
  },
  {
    title: 'Performance Globale',
    value: '92.3%',
    change: {
      value: '+1.8% vs semaine dernière',
      type: 'positive',
      percentage: 1.8
    },
    details: [
      'Efficacité opérationnelle exceptionnelle',
      'Top 3 commissariats: 3ème (97%), 5ème (94%), 7ème (93%)'
    ],
    icon: Target,
    color: 'purple',
    trend: [89, 90, 91, 90.5, 91.5, 92, 92.3],
    lastUpdate: 'Il y a 10 min',
    target: 90
  },
  {
    title: 'Taux de Conformité',
    value: '84.8%',
    change: {
      value: '+2.3% amélioration mensuelle',
      type: 'positive',
      percentage: 2.3
    },
    details: [
      '1,058 véhicules conformes sur 1,247 contrôlés',
      'Principales non-conformités: Éclairage (34%), Assurance (28%)'
    ],
    icon: CheckCircle,
    color: 'amber',
    trend: [82, 83, 82.5, 84, 83.8, 84.2, 84.8],
    lastUpdate: 'Il y a 7 min',
    target: 85
  }
]

const colorStyles = {
  orange: {
    border: 'border-orange-500',
    icon: 'bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600',
    accent: 'from-orange-500 to-orange-600',
    glow: 'shadow-orange-500/20'
  },
  green: {
    border: 'border-green-500',
    icon: 'bg-gradient-to-br from-green-100 to-green-50 text-green-600',
    accent: 'from-green-500 to-green-600',
    glow: 'shadow-green-500/20'
  },
  blue: {
    border: 'border-blue-500',
    icon: 'bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600',
    accent: 'from-blue-500 to-blue-600',
    glow: 'shadow-blue-500/20'
  },
  red: {
    border: 'border-red-500',
    icon: 'bg-gradient-to-br from-red-100 to-red-50 text-red-600',
    accent: 'from-red-500 to-red-600',
    glow: 'shadow-red-500/20'
  },
  purple: {
    border: 'border-purple-500',
    icon: 'bg-gradient-to-br from-purple-100 to-purple-50 text-purple-600',
    accent: 'from-purple-500 to-purple-600',
    glow: 'shadow-purple-500/20'
  },
  amber: {
    border: 'border-amber-500',
    icon: 'bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600',
    accent: 'from-amber-500 to-amber-600',
    glow: 'shadow-amber-500/20'
  }
}

// Mini composant Sparkline
function MiniSparkline({ data, color }: { data: number[], color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min
  
  return (
    <div className="flex items-end gap-0.5 h-8 w-20">
      {data.map((value, index) => {
        const height = range === 0 ? 50 : ((value - min) / range) * 100
        return (
          <div
            key={index}
            className={`bg-gradient-to-t ${colorStyles[color as keyof typeof colorStyles].accent} rounded-sm transition-all duration-300 hover:opacity-80`}
            style={{ 
              height: `${Math.max(height, 10)}%`,
              width: '3px'
            }}
          />
        )
      })}
    </div>
  )
}

export function StatsGrid() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [refreshing, setRefreshing] = useState<number | null>(null)

  const handleRefresh = (index: number) => {
    setRefreshing(index)
    setTimeout(() => setRefreshing(null), 1000)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        const isPositive = stat.change.type === 'positive'
        const isNegative = stat.change.type === 'negative'
        const isHovered = hoveredCard === index
        const isRefreshing = refreshing === index
        const styles = colorStyles[stat.color]
        
        return (
          <div
            key={index}
            className={`
              bg-gradient-to-br from-white to-slate-50 p-7 rounded-3xl shadow-xl border border-white/80 
              relative overflow-hidden transition-all duration-500 cursor-pointer group
              ${isHovered ? `transform -translate-y-2 shadow-2xl ${styles.glow}` : 'hover:transform hover:-translate-y-1 hover:shadow-2xl'}
            `}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Animated background overlay on hover */}
            <div className={`
              absolute inset-0 bg-gradient-to-r ${styles.accent} opacity-0 transition-opacity duration-500
              ${isHovered ? 'opacity-5' : ''}
            `} />
            
            {/* Top colored border with pulse animation */}
            <div className={`
              absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${styles.accent}
              ${isHovered ? 'animate-pulse' : ''}
            `} />
            
            {/* Header avec actions */}
            <div className="flex justify-between items-start mb-5 relative z-10">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                    {stat.title}
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRefresh(index)
                      }}
                      className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <RefreshCw className={`w-3 h-3 text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <button className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
                      <MoreHorizontal className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                </div>
                
                {/* Last update indicator */}
                <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                  <Activity className="w-3 h-3" />
                  <span>{stat.lastUpdate}</span>
                </div>
              </div>
              
              <div className={`p-3 rounded-2xl shadow-md ${styles.icon} transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
            
            {/* Value avec animation counter */}
            <div className="relative z-10 mb-4">
              <div className="text-4xl font-extrabold text-slate-800 mb-2 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {stat.value}
              </div>
              
              {/* Progress bar pour les pourcentages */}
              {stat.target && (
                <div className="w-full bg-slate-200 rounded-full h-1.5 mb-2">
                  <div 
                    className={`bg-gradient-to-r ${styles.accent} h-1.5 rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.min((parseFloat(stat.value) / stat.target) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
            
            {/* Change avec mini sparkline */}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={`flex items-center gap-2 text-sm font-medium ${
                isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
              }`}>
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : isNegative ? (
                  <TrendingDown className="w-4 h-4" />
                ) : null}
                <span className="font-semibold">
                  {isPositive ? '+' : ''}{stat.change.percentage}%
                </span>
              </div>
              
              <MiniSparkline data={stat.trend} color={stat.color} />
            </div>
            
            {/* Change description */}
            <div className={`text-xs font-medium mb-4 ${
              isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
            }`}>
              {stat.change.value}
            </div>
            
            {/* Details avec meilleure séparation */}
            <div className="text-xs text-slate-600 pt-4 border-t border-slate-100 space-y-2 relative z-10">
              {stat.details.map((detail, detailIndex) => (
                <div key={detailIndex} className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
            
            {/* Hover overlay effet */}
            <div className={`
              absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
              transform -translate-x-full transition-transform duration-700
              ${isHovered ? 'translate-x-full' : ''}
            `} />
          </div>
        )
      })}
    </div>
  )
}