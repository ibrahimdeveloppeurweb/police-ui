// src/components/gestion/Layout.tsx
'use client'
import { useState, useEffect } from 'react'
import GestionSidebar from '@/components/gestion/Sidebar'
import GestionHeader from '@/components/gestion/Header'
import { GestionLayoutProvider, useGestionLayout } from '@/contexts/GestionLayoutContext'

interface LayoutProps {
  children: React.ReactNode
}

const GestionLayoutContent = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { title, subtitle } = useGestionLayout()

  // Close sidebar when screen becomes large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <GestionSidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-70">
        {/* Header */}
        <GestionHeader 
          title={title}
          subtitle={subtitle}
          onMenuToggle={toggleSidebar}
        />
        
        {/* Page Content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

const GestionLayout = ({ children }: LayoutProps) => {
  return (
    <GestionLayoutProvider>
      <GestionLayoutContent>
        {children}
      </GestionLayoutContent>
    </GestionLayoutProvider>
  )
}

export default GestionLayout

// Hook pour gérer l'état responsive
export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
      setIsDesktop(width >= 1024)
    }

    // Check initial size
    checkScreenSize()

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return { isMobile, isTablet, isDesktop }
}