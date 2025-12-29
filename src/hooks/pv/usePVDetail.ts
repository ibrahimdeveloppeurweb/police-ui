import { useState, useEffect, useCallback } from 'react'
import pvService from '@/services/pv.service'
import {
  ProcessVerbal,
  CreatePVRequest,
  ChangerStatutPVRequest,
  TransmettrePVRequest
} from '@/types/pv'
import { toast } from '@/lib/toast'

interface UsePVDetailReturn {
  pv: ProcessVerbal | null
  loading: boolean
  error: string | null
  
  // Actions
  update: (data: Partial<CreatePVRequest>) => Promise<void>
  changerStatut: (data: ChangerStatutPVRequest) => Promise<void>
  valider: (commentaire?: string) => Promise<void>
  cloturer: () => Promise<void>
  transmettre: (data: TransmettrePVRequest) => Promise<void>
  archiver: () => Promise<void>
  downloadPDF: () => Promise<void>
  print: () => Promise<void>
  
  // Refresh
  refresh: () => Promise<void>
}

export const usePVDetail = (id: string): UsePVDetailReturn => {
  const [pv, setPV] = useState<ProcessVerbal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger le PV
  const loadPV = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await pvService.getById(id)
      setPV(data)
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erreur lors du chargement du PV'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadPV()
  }, [loadPV])

  // Mettre à jour le PV
  const update = async (data: Partial<CreatePVRequest>) => {
    try {
      const updated = await pvService.update(id, data)
      setPV(updated)
      toast.success('PV mis à jour avec succès')
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erreur lors de la mise à jour'
      toast.error(errorMessage)
      throw err
    }
  }

  // Changer le statut
  const changerStatut = async (data: ChangerStatutPVRequest) => {
    try {
      const updated = await pvService.changerStatut(id, data)
      setPV(updated)
      toast.success('Statut modifié avec succès')
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erreur lors du changement de statut'
      toast.error(errorMessage)
      throw err
    }
  }

  // Valider
  const valider = async (commentaire?: string) => {
    try {
      const updated = await pvService.valider(id, commentaire)
      setPV(updated)
      toast.success('PV validé avec succès')
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erreur lors de la validation'
      toast.error(errorMessage)
      throw err
    }
  }

  // Clôturer
  const cloturer = async () => {
    try {
      const updated = await pvService.cloturer(id)
      setPV(updated)
      toast.success('PV clôturé avec succès')
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erreur lors de la clôture'
      toast.error(errorMessage)
      throw err
    }
  }

  // Transmettre
  const transmettre = async (data: TransmettrePVRequest) => {
    try {
      const updated = await pvService.transmettre(id, data)
      setPV(updated)
      toast.success('PV transmis avec succès')
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erreur lors de la transmission'
      toast.error(errorMessage)
      throw err
    }
  }

  // Archiver
  const archiver = async () => {
    try {
      const updated = await pvService.archiver(id)
      setPV(updated)
      toast.success('PV archivé avec succès')
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erreur lors de l\'archivage'
      toast.error(errorMessage)
      throw err
    }
  }

  // Télécharger PDF
  const downloadPDF = async () => {
    try {
      toast.loading('Génération du PDF...', { id: 'pdf-download' })
      const blob = await pvService.downloadPDF(id)
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `PV-${pv?.numero || id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('PDF téléchargé avec succès', { id: 'pdf-download' })
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erreur lors du téléchargement'
      toast.error(errorMessage, { id: 'pdf-download' })
      throw err
    }
  }

  // Imprimer
  const print = async () => {
    try {
      toast.loading('Préparation de l\'impression...', { id: 'print' })
      await pvService.print(id)
      toast.success('Document envoyé à l\'imprimante', { id: 'print' })
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erreur lors de l\'impression'
      toast.error(errorMessage, { id: 'print' })
      throw err
    }
  }

  return {
    pv,
    loading,
    error,
    update,
    changerStatut,
    valider,
    cloturer,
    transmettre,
    archiver,
    downloadPDF,
    print,
    refresh: loadPV
  }
}
