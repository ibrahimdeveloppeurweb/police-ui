import { useState, useEffect, useCallback, useMemo } from 'react'
import { usePlaintes } from './usePlaintes'

export interface PlaintesStatistics {
  total: number
  enCours: number
  resolues: number
  slaDepasse: number
  totalEvolution: string
  enCoursEvolution: string
  resoluesEvolution: string
}

export const usePlaintesStatistics = (filters?: any) => {
  const { plaintes, total, loading } = usePlaintes(filters)
  
  const statistics = useMemo<PlaintesStatistics>(() => {
    // Calculer les statistiques à partir des plaintes chargées
    const enCours = plaintes.filter(p => p.statut === 'EN_COURS').length
    const resolues = plaintes.filter(p => p.statut === 'RESOLU').length
    const slaDepasse = plaintes.filter(p => p.sla_depasse).length
    
    return {
      total,
      enCours,
      resolues,
      slaDepasse,
      totalEvolution: '+0 aujourd\'hui',
      enCoursEvolution: '+0 aujourd\'hui',
      resoluesEvolution: '+0 aujourd\'hui'
    }
  }, [plaintes, total])
  
  return {
    statistics,
    loading
  }
}
