'use client'

import { AlertTriangle, Search, UserPlus, Database, Radio, Users, Settings, FileText } from 'lucide-react'

interface Activity {
  id: string
  type: 'alert' | 'control' | 'agent' | 'system'
  title: string
  subtitle: string
  time: string
  icon: React.ElementType
}

const activities: Activity[] = [
  {
    id: '1',
    type: 'alert',
    title: 'Véhicule volé intercepté',
    subtitle: 'AB-789-EF • 3ème Arrondissement • Agent KOUASSI',
    time: '2min',
    icon: AlertTriangle
  },
  {
    id: '2',
    type: 'control',
    title: 'Pic d\'activité détecté',
    subtitle: '+23% contrôles • Zone Centre Abidjan',
    time: '5min',
    icon: Search
  },
  {
    id: '3',
    type: 'agent',
    title: 'Renfort déployé',
    subtitle: '5 agents • 10ème Arrondissement • ETA 15min',
    time: '8min',
    icon: UserPlus
  },
  {
    id: '4',
    type: 'system',
    title: 'Sync base nationale',
    subtitle: '1,247 contrôles • 23 commissariats • 100% réussi',
    time: '12min',
    icon: Database
  }
]

const quickActions = [
  { title: 'Diffusion Nationale', subtitle: 'Message à tous les commissariats', icon: Radio, color: 'red' },
  { title: 'Déployer Renforts', subtitle: 'Mobilisation rapide', icon: Users, color: 'amber' },
  { title: 'Rapport Exécutif', subtitle: 'Synthèse pour la hiérarchie', icon: FileText, color: 'blue' },
  { title: 'Maintenance', subtitle: 'Système national', icon: Settings, color: 'purple' },
]

export function ActivityFeed() {
  const getActivityStyle = (type: string) => {
    switch (type) {
      case 'alert':
        return 'bg-gradient-to-br from-red-100 to-red-50 text-red-600 border-red-200'
      case 'control':
        return 'bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 border-blue-200'
      case 'agent':
        return 'bg-gradient-to-br from-green-100 to-green-50 text-green-600 border-green-200'
      case 'system':
        return 'bg-gradient-to-br from-gray-100 to-gray-50 text-gray-600 border-gray-200'
      default:
        return 'bg-gradient-to-br from-gray-100 to-gray-50 text-gray-600 border-gray-200'
    }
  }

  const getActionColor = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-gradient-to-br from-red-100 to-red-50 text-red-600'
      case 'amber':
        return 'bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600'
      case 'blue':
        return 'bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600'
      case 'purple':
        return 'bg-gradient-to-br from-purple-100 to-purple-50 text-purple-600'
      default:
        return 'bg-gradient-to-br from-gray-100 to-gray-50 text-gray-600'
    }
  }

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-xl border border-white/80 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
        <h3 className="text-xl font-bold text-slate-800">Actions Rapides</h3>
      </div>
      
      <div className="p-6">
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-slate-50 p-4 rounded-xl border border-slate-200 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1"
              >
                <div className={`p-3 rounded-xl mb-3 inline-block ${getActionColor(action.color)}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-semibold text-slate-800 text-sm mb-1">
                  {action.title}
                </div>
                <div className="text-xs text-slate-600">
                  {action.subtitle}
                </div>
              </div>
            )
          })}
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h4 className="text-sm font-semibold text-slate-800 mb-4">Activités Critiques Récentes</h4>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {activities.map((activity) => {
              const Icon = activity.icon
              return (
                <div key={activity.id} className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl border ${getActivityStyle(activity.type)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate">
                      {activity.title}
                    </div>
                    <div className="text-xs text-slate-600 truncate">
                      {activity.subtitle}
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-400 flex-shrink-0">
                    {activity.time}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}