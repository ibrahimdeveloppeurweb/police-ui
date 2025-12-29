'use client'

import { AlertTriangle, Search, UserPlus, Database, X } from 'lucide-react'

interface Notification {
  id: string
  type: 'alert' | 'control' | 'agent' | 'system'
  title: string
  message: string
  time: string
  isNew: boolean
}

const notifications: Notification[] = [
  {
    id: '1',
    type: 'alert',
    title: 'Véhicule volé intercepté',
    message: 'AB-789-EF • 3ème Arrondissement • Agent KOUASSI',
    time: '2min',
    isNew: true
  },
  {
    id: '2',
    type: 'control',
    title: 'Pic d\'activité détecté',
    message: '+23% contrôles • Zone Centre Abidjan',
    time: '5min',
    isNew: true
  },
  {
    id: '3',
    type: 'agent',
    title: 'Renfort déployé',
    message: '5 agents • 10ème Arrondissement • ETA 15min',
    time: '8min',
    isNew: false
  },
  {
    id: '4',
    type: 'system',
    title: 'Sync base nationale',
    message: '1,247 contrôles • 23 commissariats • 100% réussi',
    time: '12min',
    isNew: false
  },
  {
    id: '5',
    type: 'alert',
    title: 'Alerte sécuritaire',
    message: 'Suspect armé • Zone Yopougon • Unités mobilisées',
    time: '15min',
    isNew: false
  }
]

interface NotificationCenterProps {
  onClose: () => void
}

export function NotificationCenter({ onClose }: NotificationCenterProps) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-4 h-4" />
      case 'control':
        return <Search className="w-4 h-4" />
      case 'agent':
        return <UserPlus className="w-4 h-4" />
      case 'system':
        return <Database className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getNotificationStyle = (type: string) => {
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

  return (
    <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-800">Centre de Notifications</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer
              ${notification.isNew ? 'bg-blue-50' : ''}
            `}
          >
            <div className="flex items-start gap-3">
              <div
                className={`
                  p-2 rounded-xl border ${getNotificationStyle(notification.type)}
                `}
              >
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-gray-800 truncate">
                    {notification.title}
                  </h4>
                  {notification.isNew && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-1">{notification.message}</p>
                <p className="text-xs text-gray-400">{notification.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <button className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
          Voir toutes les notifications
        </button>
      </div>
    </div>
  )
}