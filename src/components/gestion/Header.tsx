// src/components/gestion/Header.tsx
'use client'
import { Bell, Menu, User, LogOut } from 'lucide-react'
import { useState } from 'react'
import HelpButton from '@/components/ui/HelpButton'
import { logout } from '@/lib/logout'
import { useAuth } from '@/hooks/useAuth'

interface HeaderProps {
  title?: string
  subtitle?: string
  onMenuToggle?: () => void
}

const GestionHeader = ({
  title = "Tableau de Bord",
  subtitle,
  onMenuToggle
}: HeaderProps) => {
  const { user } = useAuth()
  const [notificationCount] = useState(4)
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Générer les initiales à partir du nom
  const getInitials = () => {
    if (!user?.name) return 'U'
    const parts = user.name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return user.name.substring(0, 2).toUpperCase()
  }

  // Formater le rôle pour l'affichage
  const formatRole = (role?: string) => {
    if (!role) return ''
    const roleMap: Record<string, string> = {
      'COMMISSAIRE': 'Commissaire',
      'AGENT': 'Agent',
      'ADMIN': 'Administrateur',
      'ADMIN_PRINCIPAL': 'Admin Principal',
    }
    return roleMap[role] || role
  }

  // Subtitle par défaut avec le nom du commissariat
  const defaultSubtitle = user?.commissariat?.nom
    ? `${user.commissariat.nom} - Vue d'ensemble des opérations`
    : "Vue d'ensemble des opérations"

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="header bg-white p-3 sm:p-4 lg:p-5 shadow-md mb-4 lg:mb-6">
      <div className="flex justify-between items-center">
        
        {/* Left Section - Menu Button + Title */}
        <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
          {/* Mobile Menu Button */}
          <button 
            onClick={onMenuToggle}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          
          {/* Title Section */}
          <div className="min-w-0 flex-1">
            <h1 className="header-title text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 truncate">
              {title}
            </h1>
            {/* Desktop subtitle */}
            <p className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base truncate hidden sm:block">
              {subtitle || defaultSubtitle}
            </p>
            {/* Mobile subtitle - shortened */}
            <p className="text-gray-600 mt-1 text-xs truncate sm:hidden">
              {user?.commissariat?.nom || 'Commissariat'}
            </p>
          </div>
        </div>
        
        {/* Right Section - Actions */}
        <div className="header-actions flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
          
          {/* Help Button */}
          <HelpButton />
          
          {/* Notification Button */}
          <button className="notification-btn relative bg-gray-100 p-2 sm:p-3 rounded-lg hover:bg-gray-200 transition-colors">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            {notificationCount > 0 && (
              <span className="notification-badge absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-semibold min-w-[18px] sm:min-w-[20px] text-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
          
          {/* User Profile - Desktop */}
          <div className="relative hidden sm:block">
            <div 
              className="user-profile flex items-center gap-2 lg:gap-3 p-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="w-7 h-7 lg:w-8 lg:h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-xs lg:text-sm">
                {getInitials()}
              </div>
              <div className="hidden md:block">
                <p className="font-semibold text-gray-900 text-sm">{user?.name || 'Utilisateur'}</p>
                <p className="text-xs text-gray-600">{formatRole(user?.user_type)}</p>
              </div>
            </div>
            
            {/* Menu déroulant */}
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        // router.push('/gestion/parametres/profil')
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Mon profil
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* User Profile - Mobile (Icon only) */}
          <div className="relative sm:hidden">
            <button
              className="bg-gray-100 p-2 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                {getInitials()}
              </div>
            </button>
            
            {/* Menu déroulant mobile */}
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GestionHeader