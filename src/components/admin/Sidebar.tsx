// src/components/admin/Sidebar.tsx
'use client'
import { Shield, Home, Activity, Building, Users, ShieldAlert, BarChart3, FileText, LogOut, X, ClipboardCheck, FileWarning, Receipt, AlertTriangle, ChevronDown, ChevronRight, Book, Target, Award } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useMemo, memo, useCallback } from 'react'

interface SubMenuItem {
  href: string
  label: string
  shortLabel?: string
}

type NavigationItem = {
  type: 'link'
  href: string
  icon: any
  label: string
  shortLabel: string
  badge: { text: string; className: string } | null
} | {
  type: 'dropdown'
  baseHref: string
  icon: any
  label: string
  shortLabel: string
  badge: { text: string; className: string } | null
  subItems: SubMenuItem[]
}

interface SidebarProps {
  isOpen?: boolean
  onToggle?: () => void
}

// Composant Badge mémorisé
const Badge = memo(({ text, className }: { text: string; className: string }) => (
  <span className={`px-2 py-1 rounded-full font-semibold text-xs flex-shrink-0 ${className}`}>
    {text}
  </span>
))
Badge.displayName = 'Badge'

const AdminSidebar = ({ isOpen = true, onToggle }: SidebarProps) => {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({})

  // Configuration de navigation mémorisée
  const navGroups = useMemo(() => [
    {
      title: 'Supervision',
      items: [
        { 
          type: 'link' as const,
          href: "/admin/dashboard", 
          icon: Home, 
          label: "Tableau de Bord National",
          shortLabel: "Tableau",
          badge: null
        },
        { 
          type: 'link' as const,
          href: "/admin/monitoring", 
          icon: Activity, 
          label: "Monitoring Temps Réel",
          shortLabel: "Monitoring",
          badge: { text: "LIVE", className: "bg-red-500 text-white" }
        },
      ] satisfies NavigationItem[]
    },
    {
      title: 'Opérations',
      items: [
        { 
          type: 'dropdown' as const,
          baseHref: "/admin/controles",
          icon: ClipboardCheck, 
          label: "Contrôles Routiers",
          shortLabel: "Contrôles",
          badge: null,
          subItems: [
            { href: "/admin/controles", label: "Tableau de bord", shortLabel: "Tableau" },
            { href: "/admin/controles/listes", label: "Listes", shortLabel: "Listes" },
          ]
        },
        { 
          type: 'dropdown' as const,
          baseHref: "/admin/inspections",
          icon: FileText, 
          label: "Inspections",
          shortLabel: "Inspections",
          badge: null,
          subItems: [
            { href: "/admin/inspections", label: "Tableau de bord", shortLabel: "Tableau" },
            { href: "/admin/inspections/listes", label: "Listes", shortLabel: "Listes" },
          ]
        },
        { 
          type: 'dropdown' as const,
          baseHref: "/admin/verbalisations",
          icon: FileWarning, 
          label: "Verbalisations",
          shortLabel: "Verbalisations",
          badge: null,
          subItems: [
            { href: "/admin/verbalisations", label: "Tableau de bord", shortLabel: "Tableau" },
            { href: "/admin/verbalisations/listes", label: "Listes", shortLabel: "Listes" },
          ]
        },
        { 
          type: 'dropdown' as const,
          baseHref: "/admin/amendes",
          icon: Receipt, 
          label: "Amendes",
          shortLabel: "Amendes",
          badge: null,
          subItems: [
            { href: "/admin/amendes", label: "Tableau de bord", shortLabel: "Tableau" },
            { href: "/admin/amendes/listes", label: "Listes", shortLabel: "Listes" },
          ]
        },
      ] satisfies NavigationItem[]
    },
    {
      title: 'Organisation',
      items: [
        {
          type: 'dropdown' as const,
          baseHref: "/admin/commissariats",
          icon: Building,
          label: "Commissariats",
          shortLabel: "Commissariats",
          badge: null,
          subItems: [
            { href: "/admin/commissariats", label: "Tableau de bord", shortLabel: "Tableau" },
            { href: "/admin/commissariats/listes", label: "Listes", shortLabel: "Listes" },
            { href: "/admin/commissariats/form", label: "Nouveau", shortLabel: "Nouveau" },
          ]
        },
        {
          type: 'dropdown' as const,
          baseHref: "/admin/agents",
          icon: Users,
          label: "Agents Nationaux",
          shortLabel: "Agents",
          badge: null,
          subItems: [
            { href: "/admin/agents", label: "Tableau de bord", shortLabel: "Tableau" },
            { href: "/admin/agents/listes", label: "Listes", shortLabel: "Listes" },
            { href: "/admin/agents/competences", label: "Compétences", shortLabel: "Compétences" },
          ]
        },
        {
          type: 'dropdown' as const,
          baseHref: "/admin/missions",
          icon: Target,
          label: "Missions",
          shortLabel: "Missions",
          badge: null,
          subItems: [
            { href: "/admin/missions", label: "Tableau de bord", shortLabel: "Tableau" },
            { href: "/admin/missions/listes", label: "Listes", shortLabel: "Listes" },
          ]
        },
      ] satisfies NavigationItem[]
    },
    {
      title: 'Sécurité',
      items: [
        { 
          type: 'dropdown' as const,
          baseHref: "/admin/securite",
          icon: ShieldAlert, 
          label: "Sécurité & Alertes",
          shortLabel: "Sécurité",
          badge: null,
          subItems: [
            { href: "/admin/securite", label: "Tableau de bord", shortLabel: "Tableau" },
            { href: "/admin/securite/listes", label: "Listes", shortLabel: "Listes" },
          ]
        },
      ] satisfies NavigationItem[]
    },
    {
      title: 'Configuration',
      items: [
        { 
          type: 'dropdown' as const,
          baseHref: "/admin/infractions",
          icon: AlertTriangle, 
          label: "Infractions",
          shortLabel: "Infractions",
          badge: null,
          subItems: [
            { href: "/admin/infractions", label: "Tableau de bord", shortLabel: "Tableau" },
            { href: "/admin/infractions/listes", label: "Listes", shortLabel: "Listes" },
            { href: "/admin/infractions/form", label: "Nouvelle", shortLabel: "Nouvelle" },
          ]
        }
      ] satisfies NavigationItem[]
    },
    {
      title: 'Aide & Support',
      items: [
        { 
          type: 'link' as const,
          href: "/documentation", 
          icon: Book, 
          label: "Documentation",
          shortLabel: "Docs",
          badge: null
        }
      ] satisfies NavigationItem[]
    },
  ], [])

  // Calculer les sous-menus qui doivent être ouverts basé sur le pathname
  const initialOpenSubMenus = useMemo(() => {
    const result: Record<string, boolean> = {}
    navGroups.forEach(group => {
      group.items.forEach(item => {
        if (item.type === 'dropdown' && item.subItems) {
          const isSubItemActive = item.subItems.some(subItem => pathname.startsWith(subItem.href))
          if (isSubItemActive) {
            result[item.baseHref] = true
          }
        }
      })
    })
    return result
  }, [pathname, navGroups])

  // Marquer comme client uniquement après le premier rendu
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Détection responsive optimisée avec debounce
  useEffect(() => {
    if (!isClient) return
    
    let timeoutId: NodeJS.Timeout
    
    const checkScreenSize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < 1024)
      }, 150)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [isClient])

  // Initialiser les sous-menus ouverts
  useEffect(() => {
    if (!isClient) return
    setOpenSubMenus(prev => ({ ...prev, ...initialOpenSubMenus }))
  }, [isClient, initialOpenSubMenus])

  const isActive = (item: NavigationItem) => {
    if (item.type === 'link') {
      if (item.href === "/admin/dashboard") {
        return pathname === "/admin/dashboard" || pathname === "/admin"
      }
      return pathname.startsWith(item.href)
    }
    
    if (item.type === 'dropdown' && item.subItems) {
      // Actif si on est exactement sur le parent
      if (pathname === item.baseHref) return true
      
      // OU si on est sur un des sous-menus
      return item.subItems.some(subItem => pathname.startsWith(subItem.href))
    }
    
    return false
  }

  const toggleSubMenu = useCallback((href: string) => {
    setOpenSubMenus(prev => ({
      ...prev,
      [href]: !prev[href]
    }))
  }, [])

  const closeMobileSidebar = useCallback(() => {
    if (isMobile && onToggle) {
      onToggle()
    }
  }, [isMobile, onToggle])

  // Utiliser les valeurs calculées pour l'état initial des sous-menus
  const getIsSubMenuOpen = (href: string) => {
    // Si pas encore côté client, utiliser l'état initial calculé
    if (!isClient) {
      return initialOpenSubMenus[href] || false
    }
    // Sinon utiliser l'état géré
    return openSubMenus[href] || false
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar - Simple fond blanc */}
      <aside 
        className={`bg-white text-gray-800 overflow-y-auto border-r border-gray-200
          ${isMobile 
            ? `fixed left-0 top-0 h-screen z-50 transition-transform duration-200 ease-out shadow-xl w-80 ${isOpen ? 'translate-x-0' : '-translate-x-full'}` 
            : 'w-80 fixed h-screen z-10'
          }
        `}
      >
        
        {/* Mobile Close Button */}
        {isMobile && (
          <button 
            onClick={onToggle}
            className="absolute top-4 right-4 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Logo Section - Bande orange */}
        <div className="bg-controle-blue p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white p-3 rounded-xl shadow-md">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-[50px] h-[50px] object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg text-white">Police Nationale CI</h2>
              <p className="text-orange-100 text-sm">Administration Centrale</p>
            </div>
          </div>
          
          {/* Admin Info - Simple */}
          <div className="bg-white/95 p-3 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-sm">
                DG
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-gray-800">Directeur Général</h3>
                <p className="text-gray-600 text-xs">Supervision Nationale</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-green-600 text-xs font-medium">EN LIGNE</span>
            </div>
          </div>
        </div>
        
        {/* Navigation Menu - Simple */}
        <nav className="px-4 space-y-6">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                {group.title}
              </div>
              <div className="space-y-1">
                {group.items.map((item, itemIndex) => {
                  const Icon = item.icon
                  const hasSubItems = item.type === 'dropdown'
                  const active = isActive(item)
                  const isSubMenuOpen = hasSubItems ? getIsSubMenuOpen(item.baseHref) : false
                  const badge = item.badge
                  
                  return (
                    <div key={itemIndex}>
                      {/* Menu principal */}
                      {hasSubItems ? (
                        <button
                          onClick={() => toggleSubMenu(item.baseHref)}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer text-sm transition-colors duration-150 w-full
                            ${active 
                              ? 'bg-controle-blue text-white' 
                              : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          
                          <span className="flex-1 truncate text-left">
                            {isMobile ? item.shortLabel : item.label}
                          </span>
                          
                          {badge && <Badge text={badge.text} className={badge.className} />}
                          
                          {isSubMenuOpen ? (
                            <ChevronDown className="w-4 h-4 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 flex-shrink-0" />
                          )}
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          prefetch={true}
                          onClick={closeMobileSidebar}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer text-sm transition-colors duration-150
                            ${active 
                              ? 'bg-controle-blue text-white' 
                              : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          
                          <span className="flex-1 truncate">
                            {isMobile ? item.shortLabel : item.label}
                          </span>
                          
                          {badge && <Badge text={badge.text} className={badge.className} />}
                        </Link>
                      )}

                      {/* Sous-menu */}
                      {hasSubItems && isSubMenuOpen && (
                        <div className="ml-8 mt-1 space-y-1 submenu-enter">
                          {item.subItems.map((subItem, subIndex) => {
                            const isSubActive = pathname === subItem.href || 
                              (subItem.href !== item.baseHref && pathname.startsWith(subItem.href))
                            
                            return (
                              <Link
                                key={subIndex}
                                href={subItem.href}
                                prefetch={true}
                                onClick={closeMobileSidebar}
                                className={`block p-2 pl-3 rounded-lg text-sm transition-colors duration-150
                                  ${isSubActive 
                                    ? 'bg-controle-blue-100 text-controle-blue-600 font-medium' 
                                    : 'text-gray-600 hover:bg-gray-50'
                                  }`}
                              >
                                {isMobile && subItem.shortLabel ? subItem.shortLabel : subItem.label}
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          
          {/* Déconnexion */}
          <div className="pt-4 mt-4 border-t border-gray-200">
            <Link
              href="/auth/logout"
              prefetch={false}
              className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-150 cursor-pointer w-full text-sm"
            >
              <LogOut className="w-5 h-5" />
              Déconnexion Sécurisée
            </Link>
          </div>
        </nav>
      </aside>
      
      {/* Styles pour animations optimisées */}
      <style jsx>{`
        .submenu-enter {
          animation: slideDown 0.15s ease-out;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .nav-link {
          will-change: background-color;
        }
      `}</style>
    </>
  )
}

export default memo(AdminSidebar)