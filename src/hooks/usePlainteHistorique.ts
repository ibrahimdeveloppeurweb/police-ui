import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/axios'

export interface HistoriqueAction {
  id: string
  plainte_id: string
  type_action: 'CHANGEMENT_ETAPE' | 'CHANGEMENT_STATUT' | 'ASSIGNATION_AGENT' | 'CONVOCATION'
  ancienne_valeur?: string
  nouvelle_valeur: string
  observations?: string
  effectue_par?: string
  effectue_par_nom?: string
  created_at: string
}

export const usePlainteHistorique = (plainteId: string | null) => {
  const [historique, setHistorique] = useState<HistoriqueAction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHistorique = useCallback(async () => {
    if (!plainteId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('📜 Chargement historique plainte:', plainteId)
      const response = await api.get(`/plaintes/${plainteId}/historique`)
      
      // Gérer le cas où l'API retourne null
      const data = response.data
      if (data === null || data === undefined) {
        console.warn('⚠️  API retourne null, utilisation d\'un tableau vide')
        setHistorique([])
      } else if (Array.isArray(data)) {
        setHistorique(data)
      } else {
        console.warn('⚠️  Format de réponse inattendu:', typeof data)
        setHistorique([])
      }
      
      console.log('✅ Historique chargé:', response.data)
    } catch (err: any) {
      console.error('❌ Erreur chargement historique:', err)
      setError(err.response?.data?.error || 'Erreur lors du chargement de l\'historique')
      setHistorique([]) // Tableau vide en cas d'erreur
    } finally {
      setLoading(false)
    }
  }, [plainteId])

  useEffect(() => {
    fetchHistorique()
  }, [fetchHistorique])

  const refetch = useCallback(() => {
    fetchHistorique()
  }, [fetchHistorique])

  return {
    historique,
    loading,
    error,
    refetch
  }
}
