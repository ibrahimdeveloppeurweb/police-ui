// src/components/admin/Layout.tsx
'use client'
import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/admin/Sidebar'
import AdminHeader from '@/components/admin/Header'
import { useAuth } from '@/hooks/useAuth'
import { AdminLayoutProvider, useAdminLayout } from '@/contexts/AdminLayoutContext'

interface LayoutProps {
  children: React.ReactNode
}

const AdminLayoutContent = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const { title, subtitle } = useAdminLayout()

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
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-80">
        <div 
          style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            minHeight: '100vh'
          }}
        >
          {/* Header */}
          {/* AJOUT: user et logout passés au Header */}
          <AdminHeader 
            title={title}
            subtitle={subtitle}
            onMenuToggle={toggleSidebar}
          />
          
          {/* Page Content */}
          <main className="flex-1 p-3 sm:p-4 lg:p-6 ">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

const AdminLayout = ({ children }: LayoutProps) => {
  return (
    <AdminLayoutProvider>
      <AdminLayoutContent>
        {children}
      </AdminLayoutContent>
    </AdminLayoutProvider>
  )
}

export default AdminLayout

// VOTRE HOOK EXISTANT - NE RIEN CHANGER
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

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return { isMobile, isTablet, isDesktop }
}