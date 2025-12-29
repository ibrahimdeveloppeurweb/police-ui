'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface GestionLayoutContextType {
  title: string
  subtitle: string
  setTitle: (title: string) => void
  setSubtitle: (subtitle: string) => void
}

const GestionLayoutContext = createContext<GestionLayoutContextType | undefined>(undefined)

export function GestionLayoutProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("Tableau de Bord")
  const [subtitle, setSubtitle] = useState("3ème Arrondissement - Vue d'ensemble des opérations")

  return (
    <GestionLayoutContext.Provider value={{ title, subtitle, setTitle, setSubtitle }}>
      {children}
    </GestionLayoutContext.Provider>
  )
}

export function useGestionLayout() {
  const context = useContext(GestionLayoutContext)
  if (context === undefined) {
    throw new Error('useGestionLayout must be used within a GestionLayoutProvider')
  }
  return context
}

