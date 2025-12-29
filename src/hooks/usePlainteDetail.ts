import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/axios'
import { Plainte } from './usePlaintes'

export const usePlainteDetail = (plainteId: string | null) => {
  const [plainte, setPlainte] = useState<Plainte | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fonction pour charger les détails d'une plainte
  const fetchPlainte = useCallback(async () => {
    if (!plainteId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try { 
      console.log('🔍 Chargement détails plainte:', plainteId)

      const response = await api.get(`/plaintes/${plainteId}`)
      const data = response.data

      setPlainte(data)

      console.log('✅ Détails plainte chargés:', data)
    } catch (err: any) {
      console.error('❌ Erreur chargement détails plainte:', err)
      setError(err.response?.data?.error || 'Erreur lors du chargement des détails')
      setPlainte(null)
    } finally {
      setLoading(false)
    }
  }, [plainteId])

  // Charger les détails au montage et quand l'ID change
  useEffect(() => {
    fetchPlainte()
  }, [fetchPlainte])

  // Fonction pour mettre à jour une plainte
  const updatePlainte = useCallback(async (data: any) => {
    if (!plainteId) return

    try {
      console.log('✏️ Mise à jour plainte:', plainteId, data)

      const response = await api.put(`/plaintes/${plainteId}`, data)
      setPlainte(response.data)

      console.log('✅ Plainte mise à jour')
      return response.data
    } catch (err: any) {
      console.error('❌ Erreur mise à jour plainte:', err)
      throw err
    }
  }, [plainteId])

  // Fonction pour changer l'étape
  const changerEtape = useCallback(async (etape: string, observations?: string) => {
    if (!plainteId) return

    try {
      console.log('🔄 Changement étape plainte:', plainteId, etape)

      const response = await api.patch(`/plaintes/${plainteId}/etape`, {
        etape,
        observations
      })
      setPlainte(response.data)

      console.log('✅ Étape changée')
      return response.data
    } catch (err: any) {
      console.error('❌ Erreur changement étape:', err)
      throw err
    }
  }, [plainteId])

  // Fonction pour changer le statut
  const changerStatut = useCallback(async (statut: string, decisionFinale?: string) => {
    if (!plainteId) return

    try {
      console.log('🔄 Changement statut plainte:', plainteId, statut)

      const response = await api.patch(`/plaintes/${plainteId}/statut`, {
        statut,
        decision_finale: decisionFinale
      })
      setPlainte(response.data)

      console.log('✅ Statut changé')
      return response.data
    } catch (err: any) {
      console.error('❌ Erreur changement statut:', err)
      throw err
    }
  }, [plainteId])

  // Fonction pour assigner un agent
  const assignerAgent = useCallback(async (agentId: string) => {
    if (!plainteId) return

    try {
      console.log('👮 Assignation agent:', plainteId, agentId)

      const response = await api.patch(`/plaintes/${plainteId}/assigner`, {
        agent_id: agentId
      })
      setPlainte(response.data)

      console.log('✅ Agent assigné')
      return response.data
    } catch (err: any) {
      console.error('❌ Erreur assignation agent:', err)
      throw err
    }
  }, [plainteId])

  // Fonction pour supprimer une plainte
  const deletePlainte = useCallback(async () => {
    if (!plainteId) return

    try {
      console.log('🗑️ Suppression plainte:', plainteId)

      await api.delete(`/plaintes/${plainteId}`)

      console.log('✅ Plainte supprimée')
    } catch (err: any) {
      console.error('❌ Erreur suppression plainte:', err)
      throw err
    }
  }, [plainteId])

  // Fonction pour rafraîchir
  const refetch = useCallback(() => {
    fetchPlainte()
  }, [fetchPlainte])

  return {
    plainte,
    loading,
    error,
    updatePlainte,
    changerEtape,
    changerStatut,
    assignerAgent,
    deletePlainte,
    refetch
  }
}
