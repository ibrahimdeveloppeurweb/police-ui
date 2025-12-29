import { useState, useEffect, useCallback } from 'react'
import convocationsService, { 
  ConvocationDetail, 
  ReporterRdvPayload, 
  NotifierPayload,
  AjouterNotePayload 
} from '@/services/convocations.service'
import { toast } from '@/lib/toast'

interface UseConvocationDetailReturn {
  convocation: ConvocationDetail | null
  loading: boolean
  error: string | null
  
  // Actions
  confirmerPresence: () => Promise<void>
  marquerHonore: (commentaire?: string) => Promise<void>
  marquerNonHonore: (motif: string, commentaire?: string) => Promise<void>
  annuler: (motif: string) => Promise<void>
  reporter: (payload: ReporterRdvPayload) => Promise<void>
  notifier: (moyens: string[], message?: string) => Promise<void>
  ajouterNote: (note: string) => Promise<void>
  downloadPDF: () => Promise<void>
  print: () => Promise<void>
  
  // Refresh
  refresh: () => Promise<void>
}

export const useConvocationDetail = (id: string): UseConvocationDetailReturn => {
  const [convocation, setConvocation] = useState<ConvocationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger les données
  const loadConvocation = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await convocationsService.getById(id)
      setConvocation(data)
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erreur lors du chargement de la convocation'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadConvocation()
  }, [loadConvocation])

  // Confirmer la présence
  const confirmerPresence = async () => {
    try {
      const updated = await convocationsService.confirmerPresence(id)
      setConvocation(updated)
      toast.success('Présence confirmée avec succès')
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erreur lors de la confirmation'
      toast.error(errorMessage)
      throw err
    }
  }

  // Marquer comme honoré
  const marquerHonore = async (commentaire?: string) => {
    try {
      const updated = await convocationsService.marquerHonore(id, commentaire)
      setConvocation(updated)
      toast.success('Convocation marquée comme honorée')
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erreur lors de la mise à jour'
      toast.error(errorMessage)
      throw err
    }
  }

  // Marquer comme non honoré
  const marquerNonHonore = async (motif: string, commentaire?: string) => {
    try {
      const updated = await convocationsService.marquerNonHonore(id, {
        statut: 'NON HONORÉ',
        motif,
        commentaire
      })
      setConvocation(updated)
      toast.success('Convocation marquée comme non honorée')
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erreur lors de la mise à jour'
      toast.error(errorMessage)
      throw err
    }
  }

  // Annuler
  const annuler = async (motif: string) => {
    try {
      const updated = await convocationsService.annuler(id, motif)
      setConvocation(updated)
      toast.success('Convocation annulée avec succès')
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erreur lors de l\'annulation'
      toast.error(errorMessage)
      throw err
    }
  }

  // Reporter
  const reporter = async (payload: ReporterRdvPayload) => {
    try {
      const updated = await convocationsService.reporter(id, payload)
      setConvocation(updated)
      toast.success('Rendez-vous reporté avec succès')
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erreur lors du report'
      toast.error(errorMessage)
      throw err
    }
  }

  // Notifier
  const notifier = async (moyens: string[], message?: string) => {
    try {
      const updated = await convocationsService.notifier(id, { moyens, message })
      setConvocation(updated)
      toast.success('Notification envoyée avec succès')
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erreur lors de l\'envoi'
      toast.error(errorMessage)
      throw err
    }
  }

  // Ajouter une note
  const ajouterNote = async (note: string) => {
    try {
      const updated = await convocationsService.ajouterNote(id, { note })
      setConvocation(updated)
      toast.success('Note ajoutée avec succès')
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erreur lors de l\'ajout de la note'
      toast.error(errorMessage)
      throw err
    }
  }

  // Télécharger PDF
  const downloadPDF = async () => {
    try {
      toast.loading('Génération du PDF...', { id: 'pdf-download' })
      const blob = await convocationsService.downloadPDF(id)
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `convocation-${convocation?.numero || id}.pdf`
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
      await convocationsService.print(id)
      toast.success('Document envoyé à l\'imprimante', { id: 'print' })
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erreur lors de l\'impression'
      toast.error(errorMessage, { id: 'print' })
      throw err
    }
  }

  return {
    convocation,
    loading,
    error,
    confirmerPresence,
    marquerHonore,
    marquerNonHonore,
    annuler,
    reporter,
    notifier,
    ajouterNote,
    downloadPDF,
    print,
    refresh: loadConvocation
  }
}
