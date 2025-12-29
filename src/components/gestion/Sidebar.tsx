// src/components/gestion/Sidebar.tsx
'use client'
import { Shield, Home, AlertTriangle, Users, Search, Settings, LogOut, X, ChevronDown, ChevronRight, FileText, ClipboardCheck, Activity, Receipt, TrendingUp, TriangleDashed, Bell, MessageSquareWarning, Book, PackageSearch, PackageCheck } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface SubMenuItem {
  href: string
  label: string
  shortLabel?: string
}

interface NavigationItem {
  href: string
  icon: any
  label: string
  shortLabel: string
  badge?: { text: string; className: string } | null
  subItems?: SubMenuItem[]
}

interface SidebarProps {
  isOpen?: boolean
  onToggle?: () => void
}

const GestionSidebar = ({ isOpen = true, onToggle }: SidebarProps) => {
  const pathname = usePathname()
  const { user } = useAuth()
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({})

  // Navigation organisée par groupes
  const navGroups = useMemo(() => [
    {
      title: 'Supervision',
      items: [
        { 
          href: "/gestion/dashboard", 
          icon: Home, 
          label: "Tableau de bord",
          shortLabel: "Tableau",
          badge: null 
        },
        { 
          href: "/gestion/monitoring", 
          icon: Activity, 
          label: "Monitoring Temps Réel",
          shortLabel: "Monitoring",
          badge: { text: "LIVE", className: "bg-red-500 text-white" }
        },
      ]
    },
    {
      title: 'Opérations',
      items: [
        { 
          href: "/gestion/controles", 
          icon: Search, 
          label: "Contrôles Routiers",
          shortLabel: "Contrôles",
          badge: null,
          subItems: [
            { href: "/gestion/controles", label: "Tableau de bord", shortLabel: "Tableau" },
            { href: "/gestion/controles/listes", label: "Listes", shortLabel: "Listes" },
            { href: "/gestion/controles/archives", label: "Archives", shortLabel: "Archives" },
          ]
        },
        { 
          href: "/gestion/inspections", 
          icon: ClipboardCheck, 
          label: "Inspections",
          shortLabel: "Inspections",
          badge: null,
          subItems: [
            { href: "/gestion/inspections", label: "Tableau de bord", shortLabel: "Tableau" },
            { href: "/gestion/inspections/listes", label: "Listes", shortLabel: "Listes" },
            { href: "/gestion/inspections/archives", label: "Archives", shortLabel: "Archives" },
          ]
        },
        { 
          href: "/gestion/verbalisations", 
          icon: FileText, 
          label: "Verbalisations",
          shortLabel: "Verbalisations",
          badge: null,
          subItems: [
            { href: "/gestion/verbalisations", label: "Tableau de bord", shortLabel: "Tableau" },
            { href: "/gestion/verbalisations/listes", label: "Listes", shortLabel: "Listes" },
            { href: "/gestion/verbalisations/archives", label: "Archives", shortLabel: "Archives" },
          ]
        },
        { 
          href: "/gestion/amendes", 
          icon: Receipt, 
          label: "Amendes",
          shortLabel: "Amendes",
          badge: null,
          subItems: [
            { href: "/gestion/amendes", label: "Tableau de bord", shortLabel: "Tableau" },
            { href: "/gestion/amendes/listes", label: "Listes", shortLabel: "Listes" },
            { href: "/gestion/amendes/paiements", label: "Paiements", shortLabel: "Paiements" },
            { href: "/gestion/amendes/archives", label: "Archives", shortLabel: "Archives" },
          ]
        },
      ]
    },
    {
      title: 'Référentiels',
      items: [
        { 
          href: "/gestion/infractions", 
          icon: TriangleDashed, 
          label: "Infractions",
          shortLabel: "Infractions",
          badge: null,
          subItems: [
            { href: "/gestion/infractions", label: "Tableau de bord", shortLabel: "Tableau" },
            { href: "/gestion/infractions/listes", label: "Listes", shortLabel: "Listes" },
            { href: "/gestion/infractions/archives", label: "Archives", shortLabel: "Archives" },
          ]
        },
      ]
    },
    {
      title: 'Procédures',
      items: [
        { 
          href: "/gestion/convocations", 
          icon: Bell, 
          label: "Convocations",
          shortLabel: "Convocations",
          badge: null,
          subItems: [
            { href: "/gestion/convocations", label: "Tableau de bord", shortLabel: "Tableau" },
            { href: "/gestion/convocations/listes", label: "Listes", shortLabel: "Listes" },
          ]
        },
        { 
          href: "/gestion/plaintes", 
          icon: MessageSquareWarning, 
          label: "Plaintes",
          shortLabel: "Plaintes",
          badge: null,
          subItems: [
            { href: "/gestion/plaintes", label: "Tableau de bord", shortLabel: "Tableau" },
            { href: "/gestion/plaintes/listes", label: "Listes", shortLabel: "Listes" },
          ]
        },
        { 
          href: "/gestion/objets-perdus", 
          icon: PackageSearch, 
          label: "Objets Perdus",
          shortLabel: "Perdus",
          badge: null,
          subItems: [
            { href: "/gestion/objets-perdus", label: "Tableau de bord", shortLabel: "Tableau" },
            { href: "/gestion/objets-perdus/listes", label: "Déclarations", shortLabel: "Listes" },
          ]
        },
        { 
          href: "/gestion/objets-retrouves", 
          icon: PackageCheck, 
          label: "Objets Retrouvés",
          shortLabel: "Trouvés",
          badge: null,
          subItems: [
            { href: "/gestion/objets-retrouves", label: "Tableau de bord", shortLabel: "Tableau" },
            { href: "/gestion/objets-retrouves/listes", label: "Dépôts", shortLabel: "Listes" },
          ]
        },
      ]
    },
    {
      title: 'Sécurité',
      items: [
        { 
          href: "/gestion/alertes", 
          icon: AlertTriangle, 
          label: "Alertes Sécuritaires",
          shortLabel: "Alertes",
          badge: null,
          subItems: [
            { href: "/gestion/alertes", label: "Tableau de bord", shortLabel: "Tableau" },
            { href: "/gestion/alertes/listes", label: "Listes", shortLabel: "Listes" },
           /// { href: "/gestion/alertes/archives", label: "Archives", shortLabel: "Archives" },
          ]
        },
      ]
    },
    {
      title: 'Ressources',
      items: [
        { 
          href: "/gestion/agents", 
          icon: Users, 
          label: "Agents",
          shortLabel: "Agents",
          badge: null,
          subItems: [
            { href: "/gestion/agents/listes", label: "Liste des agents", shortLabel: "Liste" },
          ]
        },
      ]
    },
  ], [])

  // Flatten navigation items for backward compatibility
  const navigationItems: NavigationItem[] = useMemo(() => navGroups.flatMap(group => group.items), [navGroups])

  // Calculer les sous-menus qui doivent être ouverts basé sur le pathname
  const initialOpenSubMenus = useMemo(() => {
    const result: Record<string, boolean> = {}
    navigationItems.forEach(item => {
      if (item.subItems) {
        const isSubItemActive = item.subItems.some(subItem => pathname.startsWith(subItem.href))
        if (isSubItemActive) {
          result[item.href] = true
        }
      }
    })
    return result
  }, [pathname, navigationItems])

  // Marquer comme client uniquement après le premier rendu
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Détection responsive
  useEffect(() => {
    if (!isClient) return
    
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [isClient])

  // Initialiser les sous-menus ouverts
  useEffect(() => {
    if (!isClient) return
    setOpenSubMenus(prev => ({ ...prev, ...initialOpenSubMenus }))
  }, [isClient, initialOpenSubMenus])

  const isActive = (href: string, hasSubItems?: boolean, subItems?: SubMenuItem[]) => {
    if (href === "/gestion") {
      return pathname === "/gestion"
    }
    
    // Pour les items avec sous-menus, vérifier si on est sur le parent ou un de ses enfants
    if (hasSubItems && subItems) {
      // Actif si on est exactement sur le parent
      if (pathname === href) return true
      
      // OU si on est sur un des sous-menus
      return subItems.some(subItem => pathname.startsWith(subItem.href))
    }
    
    // Pour les items sans sous-menus, on garde le startsWith
    return pathname.startsWith(href)
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar - Simple fond blanc */}
      <div 
        className={`sidebar bg-white text-gray-800 overflow-y-auto border-r border-gray-200
          ${isMobile 
            ? `fixed left-0 top-0 h-screen z-50 transition-transform duration-200 ease-out shadow-xl w-72 ${isOpen ? 'translate-x-0' : '-translate-x-full'}` 
            : 'w-70 fixed h-screen z-10'
          }
        `}
      >
        
        {/* Mobile Close Button */}
        {isMobile && (
          <button 
            onClick={onToggle}
            className="absolute top-4 right-4 p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Logo Section - Bande orange */}
        <div className="logo-section  bg-controle-blue  p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="logo-icon bg-white p-3 rounded-xl shadow-md">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-[50px] h-[50px] object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg text-white">Police Nationale CI</h2>
              <p className="text-orange-100 text-sm">Contrôle Routier</p>
            </div>
          </div>
          
          {/* Commissariat Info - Simple */}
          <div className="bg-white/95 p-3 rounded-lg">
            <h3 className="font-semibold text-sm text-gray-800">{user?.commissariat?.nom || 'Commissariat'}</h3>
            <p className="text-gray-600 text-xs">Police Nationale CI</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-600 text-xs font-medium">EN LIGNE</span>
            </div>
          </div>
        </div>
        
        {/* Navigation Menu - Simple */}
        <nav className="nav-menu px-4 space-y-6">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                {group.title}
              </div>
              <div className="space-y-1">
                {group.items.map((item, index) => {
            const Icon = item.icon
            const subItems = 'subItems' in item ? item.subItems : undefined
            const hasSubItems = subItems && subItems.length > 0
            const active = isActive(item.href, hasSubItems, subItems)
            const isSubMenuOpen = getIsSubMenuOpen(item.href)
            
            return (
              <div key={index}>
                {/* Menu principal */}
                {hasSubItems ? (
                  <button
                    onClick={() => toggleSubMenu(item.href)}
                    className={`nav-link flex items-center gap-3 p-3 rounded-lg transition-colors duration-150 cursor-pointer text-sm w-full
                      ${active 
                        ? 'bg-controle-blue text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    
                    <span className="flex-1 truncate text-left">
                      {isMobile ? item.shortLabel : item.label}
                    </span>
                    
                    {item.badge && (
                      <span className={`px-2 py-1 rounded-full font-semibold text-xs flex-shrink-0 ${item.badge.className} text-white`}>
                        {item.badge.text}
                      </span>
                    )}
                    
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
                    className={`nav-link flex items-center gap-3 p-3 rounded-lg transition-colors duration-150 cursor-pointer text-sm
                      ${active 
                        ? 'bg-controle-blue text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    
                    <span className="flex-1 truncate">
                      {isMobile ? item.shortLabel : item.label}
                    </span>
                    
                    {item.badge && (
                      <span className={`px-2 py-1 rounded-full font-semibold text-xs flex-shrink-0 ${item.badge.className} text-white`}>
                        {item.badge.text}
                      </span>
                    )}
                  </Link>
                )}

                {/* Sous-menu */}
                {hasSubItems && isSubMenuOpen && subItems && (
                  <div className="ml-8 mt-1 space-y-1 submenu-enter">
                    {subItems.map((subItem, subIndex) => {
                      const isSubActive = pathname === subItem.href || 
                        (subItem.href !== item.href && pathname.startsWith(subItem.href))
                      
                      return (
                        <Link
                          key={subIndex}
                          href={subItem.href}
                          prefetch={true}
                          onClick={closeMobileSidebar}
                          className={`block p-2 pl-3 rounded-lg text-sm transition-colors duration-150
                            ${isSubActive 
                              ? 'text-controle-blue-100 text-controle-blue-600 font-medium' 
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
          
          {/* Documentation */}
          <div className="pt-4 mt-4 border-t border-gray-200">
            <Link
              href="/documentation"
              prefetch={true}
              className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-150 cursor-pointer w-full text-sm"
            >
              <Book className="w-5 h-5" />
              Documentation
            </Link>
          </div>
          
          {/* Déconnexion */}
          <div className="pt-2">
            <Link
              href="/auth/logout"
              prefetch={false}
              className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-150 cursor-pointer w-full text-sm"
            >
              <LogOut className="w-5 h-5" />
              Déconnexion 
            </Link>
          </div>
        </nav>
      </div>

      {/* Styles pour la classe w-70 et animations */}
      <style jsx global>{`
        .w-70 {
          width: 17.5rem;
        }
        
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

export default GestionSidebar