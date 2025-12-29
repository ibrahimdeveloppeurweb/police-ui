'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  FileText, Search, Calendar, Eye, Printer, CreditCard,
  AlertTriangle, CheckCircle, Clock, DollarSign,
  TrendingUp, FileDown, MapPin, Loader2, Archive, FolderOpen
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'
import { infractionsService, type APIInfraction } from '@/lib/api/services'

// Modal de confirmation d'archivage
function ArchiveConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  pvNumero,
  loading
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  pvNumero: string
  loading: boolean
}) {
  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Archive className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Archiver le PV</h2>
              <p className="text-slate-600">{pvNumero}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-amber-800 block">Attention</span>
                <p className="text-amber-700 text-sm mt-1">
                  Cette action déplacera le PV vers les archives. Il ne sera plus visible dans la liste des verbalisations actives.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-medium text-slate-900 mb-2">Ce qui va se passer :</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-blue-500" />
                Le PV sera archivé et marqué comme traité
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Vous pourrez le retrouver dans la section Archives
              </li>
              <li className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-amber-500" />
                Le désarchivage sera possible depuis les archives
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Archivage...
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
                Confirmer l'archivage
              </>
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// Modal d'enregistrement de paiement
function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  pvNumero,
  montant,
  loading
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: { mode_paiement: string; montant: number; reference?: string; notes?: string }) => void
  pvNumero: string
  montant: number
  loading: boolean
}) {
  const [modePaiement, setModePaiement] = useState('ESPECES')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm({
      mode_paiement: modePaiement,
      montant: montant,
      reference: reference || undefined,
      notes: notes || undefined
    })
  }

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Enregistrer le paiement</h2>
              <p className="text-slate-600">{pvNumero}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Montant à payer */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-green-800">Montant à payer</span>
                <span className="text-2xl font-bold text-green-700">{formatNumber(montant)} FCFA</span>
              </div>
            </div>

            {/* Mode de paiement */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mode de paiement <span className="text-red-500">*</span>
              </label>
              <select
                value={modePaiement}
                onChange={(e) => setModePaiement(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="ESPECES">Espèces</option>
                <option value="CARTE_BANCAIRE">Carte bancaire</option>
                <option value="VIREMENT">Virement bancaire</option>
                <option value="CHEQUE">Chèque</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
              </select>
            </div>

            {/* Référence de paiement */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Référence de paiement
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ex: Numéro de transaction, reçu..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Informations complémentaires..."
                rows={2}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              />
            </div>

            {/* Info */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2 text-sm text-blue-700">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Une fois le paiement enregistré, le statut du PV passera automatiquement à "Payé".</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50 rounded-b-xl">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Confirmer le paiement
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

type PaymentStatus = 'Non payé' | 'Payé' | 'En retard'
type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'

interface PV {
  id: string
  numero: string
  vehicule: string
  conducteur: string
  agent: string
  lieu: string
  montant: number
  penalites?: number | null
  infractions: number
  dateEmission: string
  datePaiement?: string | null
  statutPaiement: PaymentStatus
  modePaiement?: string | null
  telephone?: string | null
  rappels?: number | null
  joursRetard?: number | null
  typeInfraction?: string
  statutOriginal: string // Pour savoir si on peut archiver
}

interface Stats {
  totalPV: number
  pvJour: number
  montantTotal: number
  nonPayes: number
  pourcentageNonPayes: number
  evolutionPV: string
  evolutionMontant: string
}

// Helper function to map API status to display status
const mapStatutToPaymentStatus = (statut: string): PaymentStatus => {
  switch (statut) {
    case 'PAYEE':
      return 'Payé'
    case 'VALIDEE':
    case 'CONSTATEE':
      return 'Non payé'
    case 'ANNULEE':
    case 'CONTESTEE':
      return 'En retard'
    default:
      return 'Non payé'
  }
}

// Helper to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Helper to convert API infraction to PV display format
const infractionToPV = (infraction: APIInfraction): PV => {
  const conducteur = infraction.conducteur
    ? `${infraction.conducteur.nom} ${infraction.conducteur.prenom}`
    : 'Inconnu'

  const agent = infraction.controle?.agent_nom || 'Non assigné'
  const vehicule = infraction.vehicule?.immatriculation || 'N/A'
  const lieu = infraction.lieu_infraction || infraction.controle?.lieu_controle || 'Non spécifié'

  return {
    id: infraction.id,
    numero: infraction.numero_pv,
    vehicule,
    conducteur,
    agent,
    lieu,
    montant: infraction.montant_amende,
    infractions: 1,
    dateEmission: formatDate(infraction.date_infraction),
    statutPaiement: mapStatutToPaymentStatus(infraction.statut),
    typeInfraction: infraction.type_infraction?.libelle || 'Non spécifié',
    penalites: null,
    datePaiement: infraction.statut === 'PAYEE' ? formatDate(infraction.updated_at) : null,
    modePaiement: null,
    telephone: null,
    rappels: null,
    joursRetard: null,
    statutOriginal: infraction.statut,
  }
}

export default function VerbalisationsCommissariatPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Statut de paiement')
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('tout')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // API data states
  const [pvs, setPvs] = useState<PV[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [archivingId, setArchivingId] = useState<string | null>(null)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [pvToArchive, setPvToArchive] = useState<PV | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [pvToPay, setPvToPay] = useState<PV | null>(null)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [stats, setStats] = useState<Stats>({
    totalPV: 0,
    pvJour: 0,
    montantTotal: 0,
    nonPayes: 0,
    pourcentageNonPayes: 0,
    evolutionPV: '+0%',
    evolutionMontant: '+0%'
  })

  const commissariatName = "Commissariat Central de Cocody"
  const commissariatZone = "Cocody - 2 Plateaux"
  const itemsPerPage = 10

  // Fetch infractions data
  const fetchInfractions = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Build filters based on period
      const filters: Record<string, string> = {}

      if (isCustomDateRange && dateDebut && dateFin) {
        filters.date_debut = dateDebut
        filters.date_fin = dateFin
      } else {
        const now = new Date()
        let startDate: Date | null = null

        switch (globalFilter) {
          case 'jour':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            break
          case 'semaine':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'mois':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          case 'annee':
            startDate = new Date(now.getFullYear(), 0, 1)
            break
          case 'tout':
          default:
            // No date filter
            break
        }

        if (startDate) {
          filters.date_debut = startDate.toISOString().split('T')[0]
        }
      }

      // Add status filter
      if (statusFilter !== 'Statut de paiement') {
        switch (statusFilter) {
          case 'Payé':
            filters.statut = 'PAYEE'
            break
          case 'Non payé':
            filters.statut = 'CONSTATEE'
            break
          case 'En retard':
            filters.statut = 'VALIDEE'
            break
        }
      }

      // Add search filter
      if (searchTerm) {
        filters.search = searchTerm
      }

      const response = await infractionsService.getAll(filters, currentPage, itemsPerPage)

      if (response.success && response.data) {
        const infractions = response.data.infractions || []
        const convertedPVs = infractions.map(infractionToPV)
        setPvs(convertedPVs)

        // Calculate stats
        const total = response.data.total || infractions.length
        const montantTotal = infractions.reduce((sum, inf) => sum + inf.montant_amende, 0)
        const nonPayes = infractions.filter(inf => inf.statut !== 'PAYEE').length

        setStats({
          totalPV: total,
          pvJour: Math.ceil(total / 30), // Rough estimate
          montantTotal,
          nonPayes,
          pourcentageNonPayes: total > 0 ? (nonPayes / total) * 100 : 0,
          evolutionPV: '+8.3%',
          evolutionMontant: '+5.2%'
        })
      }
    } catch (err) {
      console.error('Error fetching infractions:', err)
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }, [globalFilter, isCustomDateRange, dateDebut, dateFin, statusFilter, searchTerm, currentPage])

  useEffect(() => {
    fetchInfractions()
  }, [fetchInfractions])

  const totalPages = Math.ceil(stats.totalPV / itemsPerPage)

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const formatMontant = (montant: number) => {
    if (montant >= 1000000) {
      return `${(montant / 1000000).toFixed(1)}M`
    }
    return `${formatNumber(montant)}`
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    alert('Export des données en cours...\nFormat: CSV/Excel/PDF')
  }

  const handleFilterChange = (filter: PeriodKey) => {
    setGlobalFilter(filter)
    setIsCustomDateRange(false)
    setDateDebut('')
    setDateFin('')
    setCurrentPage(1)
  }

  const handleCustomDateSearch = () => {
    if (dateDebut && dateFin) {
      setIsCustomDateRange(true)
      setGlobalFilter('personnalise')
      setCurrentPage(1)
    }
  }

  const getStatutColor = (statut: PaymentStatus) => {
    switch (statut) {
      case 'Payé':
        return 'bg-green-500 text-white'
      case 'Non payé':
        return 'bg-yellow-500 text-white'
      case 'En retard':
        return 'bg-red-500 text-white'
    }
  }

  const getStatutIcon = (statut: PaymentStatus) => {
    switch (statut) {
      case 'Payé':
        return <CheckCircle className="w-4 h-4" />
      case 'Non payé':
        return <Clock className="w-4 h-4" />
      case 'En retard':
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const handleControlClick = (pvId: string) => {
    router.push(`/gestion/verbalisations/${pvId}`)
  }

  // Open archive modal
  const handleArchiveClick = (e: React.MouseEvent, pv: PV) => {
    e.stopPropagation()
    setPvToArchive(pv)
    setShowArchiveModal(true)
  }

  // Archive an infraction (called from modal)
  const handleArchiveConfirm = async () => {
    if (!pvToArchive) return

    setArchivingId(pvToArchive.id)
    try {
      const response = await infractionsService.archive(pvToArchive.id)
      if (response.success && response.data?.success) {
        // Remove from list (it's now archived)
        setPvs(prev => prev.filter(p => p.id !== pvToArchive.id))
        setShowArchiveModal(false)
        setPvToArchive(null)
      } else {
        alert(response.data?.message || 'Erreur lors de l\'archivage')
      }
    } catch (err) {
      console.error('Error archiving:', err)
      alert('Erreur lors de l\'archivage du PV')
    } finally {
      setArchivingId(null)
    }
  }

  // Open payment modal for a PV
  const handlePaymentClick = (pv: PV) => {
    setPvToPay(pv)
    setShowPaymentModal(true)
  }

  // Record payment (called from modal)
  const handlePaymentConfirm = async (data: { mode_paiement: string; montant: number; reference?: string; notes?: string }) => {
    if (!pvToPay) return

    setProcessingPayment(true)
    try {
      const response = await infractionsService.recordPayment(pvToPay.id, data)
      if (response.success && response.data?.success) {
        // Update the PV status in the list
        setPvs(prev => prev.map(p =>
          p.id === pvToPay.id
            ? { ...p, statutPaiement: 'Payé' as const, statutOriginal: 'PAYEE' }
            : p
        ))
        setShowPaymentModal(false)
        setPvToPay(null)
      } else {
        alert(response.data?.message || 'Erreur lors de l\'enregistrement du paiement')
      }
    } catch (err) {
      console.error('Error recording payment:', err)
      alert('Erreur lors de l\'enregistrement du paiement')
    } finally {
      setProcessingPayment(false)
    }
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <MapPin className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{commissariatName}</h1>
            <p className="text-slate-600">{commissariatZone}</p>
          </div>
        </div>
        <p className="text-slate-600">Gestion des verbalisations du commissariat</p>
      </div>

      {/* Filtre Global de Période */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 mb-8">
        <CardBody className="p-4 md:p-6">
          <div className="space-y-4">
            {/* Header et boutons de période */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Période d'analyse</h2>
                  <p className="text-gray-600 text-xs md:text-sm hidden sm:block">
                    Sélectionnez la période pour filtrer toutes les données
                  </p>
                </div>
              </div>

              {/* Boutons de période */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => handleFilterChange('jour')}
                  className={`${globalFilter === 'jour' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Aujourd'hui
                </Button>
                <Button
                  onClick={() => handleFilterChange('semaine')}
                  className={`${globalFilter === 'semaine' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Semaine
                </Button>
                <Button
                  onClick={() => handleFilterChange('mois')}
                  className={`${globalFilter === 'mois' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Mois
                </Button>
                <Button
                  onClick={() => handleFilterChange('annee')}
                  className={`${globalFilter === 'annee' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Année
                </Button>
                <Button
                  onClick={() => handleFilterChange('tout')}
                  className={`${globalFilter === 'tout' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Historique
                </Button>
              </div>
            </div>

            {/* Champs de filtre */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-4 border-t border-blue-200">
              {/* Champ Input de recherche */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-[200px]">
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Rechercher:
                </label>
                <input
                  type="text"
                  placeholder="Rechercher par ID, Immatriculation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>

              {/* Select Statut */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option>Statut de paiement</option>
                <option>Payé</option>
                <option>Non payé</option>
                <option>En retard</option>
              </select>
            </div>

            {/* Sélection de dates personnalisées */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-4 border-t border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Date début:
                </label>
                <input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Date fin:
                </label>
                <input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                />
              </div>

              <Button
                onClick={handleCustomDateSearch}
                disabled={!dateDebut || !dateFin}
                className={`${!dateDebut || !dateFin ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'} flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2 w-full sm:w-auto`}
              >
                <Search className="w-4 h-4" />
                Rechercher
              </Button>

              <div className="hidden sm:block w-px h-8 bg-blue-300"></div>

              {/* Boutons Imprimer et Exporter */}
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  onClick={handlePrint}
                  className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2"
                >
                  <Printer className="w-4 h-4" />
                  Imprimer
                </Button>

                <Button
                  onClick={handleExport}
                  className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2"
                >
                  <FileDown className="w-4 h-4" />
                  Exporter
                </Button>
              </div>
            </div>

            {isCustomDateRange && (
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg w-full sm:w-auto">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs md:text-sm font-medium">
                  Période personnalisée active: {dateDebut} au {dateFin}
                </span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border border-gray-200 border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Total PV</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(stats.totalPV)}</div>
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              {stats.evolutionPV} vs période précédente
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-orange-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">PV Journalier</h3>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{stats.pvJour}</div>
            <div className="text-sm text-slate-600">PV par jour en moyenne</div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Montant Total</h3>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">
              {formatMontant(stats.montantTotal)} FCFA
            </div>
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              {stats.evolutionMontant}
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-red-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Non Payés</h3>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(stats.nonPayes)}</div>
            <div className="text-slate-600 text-sm">{stats.pourcentageNonPayes.toFixed(1)}% du total</div>
          </CardBody>
        </Card>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Chargement des verbalisations...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertTriangle className="w-6 h-6" />
              <span>{error}</span>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && pvs.length === 0 && (
        <Card className="bg-gray-50">
          <CardBody className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune verbalisation trouvée</h3>
            <p className="text-gray-500">Aucun PV ne correspond aux critères de recherche.</p>
          </CardBody>
        </Card>
      )}

      {/* Liste des PV */}
      {!loading && !error && pvs.length > 0 && (
        <div className="space-y-6 mb-8">
          {pvs.map((pv) => (
            <Card
              onClick={() => handleControlClick(pv.id)}
              key={pv.id}
              className={`cursor-pointer hover:shadow-lg transition-shadow ${pv.statutPaiement === 'En retard' ? 'border-2 border-red-400' : ''}`}
            >
              <CardBody className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{pv.numero}</h3>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
                        {pv.typeInfraction}
                      </span>
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${getStatutColor(pv.statutPaiement)}`}>
                        {getStatutIcon(pv.statutPaiement)}
                        {pv.statutPaiement}
                      </span>
                      {pv.statutPaiement === 'En retard' && pv.joursRetard && (
                        <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {pv.joursRetard} jours de retard
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-red-600">{formatNumber(pv.montant)} FCFA</div>
                    <div className="text-sm text-slate-500">Émis le {pv.dateEmission}</div>
                    {pv.penalites && (
                      <div className="text-sm text-red-600 font-medium mt-1">+ {formatNumber(pv.penalites)} FCFA de pénalités</div>
                    )}
                    {pv.datePaiement && (
                      <div className="text-sm text-green-600 font-medium mt-1">Payé le {pv.datePaiement}</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Véhicule</p>
                    <p className="font-bold text-slate-900">{pv.vehicule}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Conducteur</p>
                    <p className="font-bold text-slate-900">{pv.conducteur}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Agent</p>
                    <p className="font-bold text-slate-900">{pv.agent}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Lieu</p>
                    <p className="font-bold text-slate-900">{pv.lieu}</p>
                  </div>
                </div>

                <div className="flex gap-3 flex-wrap">
                  <Button
                    onClick={(e) => { e.stopPropagation(); handleControlClick(pv.id); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Eye className="w-4 h-4" />
                    Voir détails
                  </Button>
                  {pv.statutPaiement === 'Non payé' && (
                    <Button
                      onClick={(e) => { e.stopPropagation(); handlePaymentClick(pv); }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CreditCard className="w-4 h-4" />
                      Enregistrer paiement
                    </Button>
                  )}
                  {/* Bouton Archiver - visible uniquement pour PAYEE ou ANNULEE */}
                  {(pv.statutOriginal === 'PAYEE' || pv.statutOriginal === 'ANNULEE') && (
                    <Button
                      onClick={(e) => handleArchiveClick(e, pv)}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <Archive className="w-4 h-4" />
                      Archiver
                    </Button>
                  )}
                  <Button className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-300">
                    <Printer className="w-4 h-4" />
                    Imprimer
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pvs.length > 0 && totalPages > 1 && (
        <Card className="mb-8">
          <CardBody className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-600">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, stats.totalPV)} sur {formatNumber(stats.totalPV)} PV
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 border rounded-lg transition-colors ${
                    currentPage === 1
                      ? 'border-slate-200 text-slate-400 cursor-not-allowed'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm">Précédent</span>
                </button>

                <span className="px-4 py-2 text-sm font-medium">
                  Page {currentPage} sur {totalPages}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 border rounded-lg transition-colors ${
                    currentPage === totalPages
                      ? 'border-slate-200 text-slate-400 cursor-not-allowed'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm">Suivant</span>
                </button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Modal de confirmation d'archivage */}
      <ArchiveConfirmModal
        isOpen={showArchiveModal}
        onClose={() => {
          setShowArchiveModal(false)
          setPvToArchive(null)
        }}
        onConfirm={handleArchiveConfirm}
        pvNumero={pvToArchive?.numero || ''}
        loading={archivingId === pvToArchive?.id}
      />

      {/* Modal d'enregistrement de paiement */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false)
          setPvToPay(null)
        }}
        onConfirm={handlePaymentConfirm}
        pvNumero={pvToPay?.numero || ''}
        montant={pvToPay?.montant || 0}
        loading={processingPayment}
      />
    </div>
  )
}
