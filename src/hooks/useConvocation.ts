import { useState, useEffect } from 'react'
import convocationsService, { ConvocationDetail } from '@/services/convocations.service'
import { toast } from 'sonner'

export const useConvocation = (id: string) => {
  const [convocation, setConvocation] = useState<ConvocationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConvocation = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await convocationsService.getById(id)
      setConvocation(data)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors du chargement de la convocation'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchConvocation()
    }
  }, [id])

  const confirmerPresence = async () => {
    try {
      const updated = await convocationsService.confirmerPresence(id)
      setConvocation(updated)
      toast.success('Présence confirmée avec succès')
      return updated
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de la confirmation'
      toast.error(message)
      throw err
    }
  }

  const marquerHonore = async () => {
    try {
      const updated = await convocationsService.marquerHonore(id)
      setConvocation(updated)
      toast.success('Convocation marquée comme honorée')
      return updated
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de la mise à jour'
      toast.error(message)
      throw err
    }
  }

  const marquerNonHonore = async (motif: string, commentaire?: string) => {
    try {
      const updated = await convocationsService.marquerNonHonore(id, { statut: 'NON_HONORÉ', motif, commentaire })
      setConvocation(updated)
      toast.success('Convocation marquée comme non honorée')
      return updated
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de la mise à jour'
      toast.error(message)
      throw err
    }
  }

  const annuler = async (motif: string) => {
    try {
      const updated = await convocationsService.annuler(id, motif)
      setConvocation(updated)
      toast.success('Convocation annulée avec succès')
      return updated
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de l\'annulation'
      toast.error(message)
      throw err
    }
  }

  const reporter = async (nouvelleDate: string, nouvelleHeure: string, motif: string) => {
    try {
      const updated = await convocationsService.reporter(id, { nouvelleDate, nouvelleHeure, motif })
      setConvocation(updated)
      toast.success('Rendez-vous reporté avec succès')
      return updated
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors du report'
      toast.error(message)
      throw err
    }
  }

  const notifier = async (moyens: string[], message?: string) => {
    try {
      const updated = await convocationsService.notifier(id, { moyens, message })
      setConvocation(updated)
      toast.success('Notification envoyée avec succès')
      return updated
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de l\'envoi de la notification'
      toast.error(message)
      throw err
    }
  }

  const ajouterNote = async (note: string) => {
    try {
      const updated = await convocationsService.ajouterNote(id, { note })
      setConvocation(updated)
      toast.success('Note ajoutée avec succès')
      return updated
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de l\'ajout de la note'
      toast.error(message)
      throw err
    }
  }

  const downloadPDF = async () => {
    try {
      const blob = await convocationsService.downloadPDF(id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `convocation_${convocation?.numero || id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('PDF téléchargé avec succès')
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors du téléchargement du PDF'
      toast.error(message)
      throw err
    }
  }

  const print = async () => {
    try {
      await convocationsService.print(id)
      toast.success('Impression lancée')
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de l\'impression'
      toast.error(message)
      throw err
    }
  }

  const refresh = () => {
    fetchConvocation()
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
    refresh,
  }
}
