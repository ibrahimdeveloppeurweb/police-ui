import { useState, useEffect, useCallback } from 'react'
import Cookies from 'js-cookie'
import api from '@/lib/axios'

export interface Plainte {
  id: string
  numero: string
  type_plainte: string
  description?: string
  plaignant_nom: string
  plaignant_prenom: string
  plaignant_telephone?: string
  plaignant_adresse?: string
  plaignant_email?: string
  date_depot: string
  date_resolution?: string
  etape_actuelle: string
  priorite: string
  statut: string
  delai_sla?: string
  sla_depasse: boolean
  lieu_faits?: string
  date_faits?: string
  observations?: string
  decision_finale?: string
  commissariat?: {
    id: string
    nom: string
    code: string
  }
  agent_assigne?: {
    id: string
    matricule: string
    nom: string
    prenom: string
  }
  suspects?: Array<{
    id: string
    nom: string
    prenom: string
    description?: string
    adresse?: string
  }>
  temoins?: Array<{
    id: string
    nom: string
    prenom: string
    telephone?: string
    adresse?: string
  }>
  nombre_convocations: number
  created_at: string
  updated_at: string
}

export interface UsePlaintesFilters {
  type_plainte?: string
  statut?: string
  priorite?: string
  etape_actuelle?: string
  search?: string
  date_debut?: string
  date_fin?: string
  limit?: number
  offset?: number
}

export const usePlaintes = (initialFilters?: UsePlaintesFilters) => {
  const [plaintes, setPlaintes] = useState<Plainte[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commissariatId, setCommissariatId] = useState<string | null>(null)
  const [filters, setFilters] = useState<UsePlaintesFilters>(initialFilters || {})

  // Récupérer le commissariatId au chargement
  useEffect(() => {
    // Récupérer directement depuis le cookie commissariat_id
    const commissariatIdFromCookie = Cookies.get('commissariat_id')
    console.log('🔍 usePlaintes - commissariat_id cookie:', commissariatIdFromCookie)
    
    if (commissariatIdFromCookie) {
      console.log('✅ usePlaintes - commissariatId trouvé:', commissariatIdFromCookie)
      setCommissariatId(commissariatIdFromCookie)
    } else {
      console.warn('⚠️ usePlaintes - Aucun commissariat_id trouvé dans les cookies')
    }
  }, [])

  // Fonction pour charger les plaintes
  const fetchPlaintes = useCallback(async () => {
    console.log('🚀 fetchPlaintes appelé - commissariatId:', commissariatId)
    if (!commissariatId) {
      console.warn('⚠️ fetchPlaintes - Aucun commissariatId, arrêt')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params: any = {
        commissariat_id: commissariatId,
        ...filters
      }

      console.log('📋 Chargement plaintes avec params:', params)
      console.log('📋 URL complète:', api.defaults.baseURL + '/plaintes')

      const response = await api.get('/plaintes', { params })
      console.log('✅ Réponse API reçue:', response.data)
      const data = response.data

      setPlaintes(data.plaintes || [])
      setTotal(data.total || 0)

      console.log('✅ Plaintes chargées:', data.plaintes?.length || 0, 'sur', data.total)
    } catch (err: any) {
      console.error('❌ Erreur chargement plaintes:', err)
      setError(err.response?.data?.error || 'Erreur lors du chargement des plaintes')
      setPlaintes([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [commissariatId, filters])

  // Charger les plaintes au montage et quand les filtres changent
  useEffect(() => {
    if (commissariatId) {
      fetchPlaintes()
    }
  }, [commissariatId, fetchPlaintes])

  // Fonction pour mettre à jour les filtres
  const updateFilters = useCallback((newFilters: Partial<UsePlaintesFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Fonction pour réinitialiser les filtres
  const resetFilters = useCallback(() => {
    setFilters({})
  }, [])

  // Fonction pour rafraîchir
  const refetch = useCallback(() => {
    fetchPlaintes()
  }, [fetchPlaintes])

  return {
    plaintes,
    total,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch
  }
}
