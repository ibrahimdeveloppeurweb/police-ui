'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface AdminLayoutContextType {
  title: string
  subtitle: string
  setTitle: (title: string) => void
  setSubtitle: (subtitle: string) => void
}

const AdminLayoutContext = createContext<AdminLayoutContextType | undefined>(undefined)

export function AdminLayoutProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("Tableau de Bord")
  const [subtitle, setSubtitle] = useState("Administration Centrale - Vue d'ensemble des opérations")

  return (
    <AdminLayoutContext.Provider value={{ title, subtitle, setTitle, setSubtitle }}>
      {children}
    </AdminLayoutContext.Provider>
  )
}

export function useAdminLayout() {
  const context = useContext(AdminLayoutContext)
  if (context === undefined) {
    throw new Error('useAdminLayout must be used within an AdminLayoutProvider')
  }
  return context
}

