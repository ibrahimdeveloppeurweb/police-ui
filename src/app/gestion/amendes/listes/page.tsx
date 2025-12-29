'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Search, Calendar, Download, CheckCircle, Phone, Mail, AlertTriangle,
  TrendingUp, Clock, DollarSign, Eye, ChevronLeft, ChevronRight,
  Printer, FileDown, MapPin, Loader2, CreditCard
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'
import { infractionsService, type APIInfraction } from '@/lib/api/services'

// Modal d'enregistrement de paiement
function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  amendeNumero,
  montant,
  loading
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: { mode_paiement: string; montant: number; reference?: string; notes?: string }) => void
  amendeNumero: string
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
              <p className="text-slate-600">{amendeNumero}</p>
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
                <span>Une fois le paiement enregistré, le statut de l'amende passera automatiquement à "Payé".</span>
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

type AmendeStatus = 'En attente' | 'Payé' | 'En retard'
type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'

interface Amende {
  id: string
  numero: string
  pv: string
  contrevenant: string
  telephone: string
  montant: number
  penalites?: number
  dateEmission: string
  dateLimite: string
  datePaiement?: string
  statut: AmendeStatus
  modePaiement?: string
  statutOriginal: string
  typeInfraction?: string
}

interface Stats {
  montantTotal: number
  collecte: number
  pourcentageCollecte: number
  enAttente: number
  pourcentageAttente: number
  enRetard: number
  pourcentageRetard: number
  evolutionTotal: string
  evolutionCollecte: string
  totalAmendes: number
}

// Helper function to map API status to display status
const mapStatutToAmendeStatus = (statut: string, dateInfraction: string): AmendeStatus => {
  if (statut === 'PAYEE') return 'Payé'

  // Check if the fine is overdue (more than 30 days since infraction)
  const dateEmission = new Date(dateInfraction)
  const now = new Date()
  const daysDiff = Math.floor((now.getTime() - dateEmission.getTime()) / (1000 * 60 * 60 * 24))

  if (daysDiff > 30 && statut !== 'PAYEE') return 'En retard'

  return 'En attente'
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

// Calculate date limite (30 days after emission)
const getDateLimite = (dateEmission: string): string => {
  const date = new Date(dateEmission)
  date.setDate(date.getDate() + 30)
  return formatDate(date.toISOString())
}

// Helper to convert API infraction to Amende display format
const infractionToAmende = (infraction: APIInfraction): Amende => {
  const contrevenant = infraction.conducteur
    ? `${infraction.conducteur.nom} ${infraction.conducteur.prenom}`
    : 'Inconnu'

  return {
    id: infraction.id,
    numero: `#AMN-${infraction.numero_pv}`,
    pv: infraction.numero_pv,
    contrevenant,
    telephone: infraction.conducteur?.numero_permis ? `Permis: ${infraction.conducteur.numero_permis}` : 'N/A',
    montant: infraction.montant_amende,
    dateEmission: formatDate(infraction.date_infraction),
    dateLimite: getDateLimite(infraction.date_infraction),
    statut: mapStatutToAmendeStatus(infraction.statut, infraction.date_infraction),
    statutOriginal: infraction.statut,
    typeInfraction: infraction.type_infraction?.libelle || 'Non spécifié',
    datePaiement: infraction.statut === 'PAYEE' ? formatDate(infraction.updated_at) : undefined,
    modePaiement: undefined,
    penalites: undefined,
  }
}

export default function AmendesListPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tous les statuts')
  const [montantFilter, setMontantFilter] = useState('Tous les montants')
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('tout')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // API data states
  const [amendes, setAmendes] = useState<Amende[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [amendeToPayId, setAmendeToPayId] = useState<Amende | null>(null)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [stats, setStats] = useState<Stats>({
    montantTotal: 0,
    collecte: 0,
    pourcentageCollecte: 0,
    enAttente: 0,
    pourcentageAttente: 0,
    enRetard: 0,
    pourcentageRetard: 0,
    evolutionTotal: '+0%',
    evolutionCollecte: '+0%',
    totalAmendes: 0
  })

  const commissariatName = "Commissariat 3ème Arrondissement"
  const commissariatZone = "Cocody - 2 Plateaux"
  const itemsPerPage = 10

  // Fetch infractions data
  const fetchAmendes = useCallback(async () => {
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
      if (statusFilter !== 'Tous les statuts') {
        switch (statusFilter) {
          case 'Payé':
            filters.statut = 'PAYEE'
            break
          case 'En attente':
            filters.statut = 'VALIDEE'
            break
          case 'En retard':
            filters.statut = 'CONSTATEE'
            break
        }
      }

      const response = await infractionsService.getAll(filters, currentPage, itemsPerPage)

      if (response.success && response.data) {
        const infractions = response.data.infractions || []
        let convertedAmendes = infractions.map(infractionToAmende)

        // Filter by montant if needed
        if (montantFilter !== 'Tous les montants') {
          convertedAmendes = convertedAmendes.filter(a => {
            if (montantFilter === 'Moins de 10,000 FCFA') return a.montant < 10000
            if (montantFilter === '10,000 - 50,000 FCFA') return a.montant >= 10000 && a.montant <= 50000
            if (montantFilter === 'Plus de 50,000 FCFA') return a.montant > 50000
            return true
          })
        }

        // Filter by search term
        if (searchTerm) {
          const search = searchTerm.toLowerCase()
          convertedAmendes = convertedAmendes.filter(a =>
            a.numero.toLowerCase().includes(search) ||
            a.pv.toLowerCase().includes(search) ||
            a.contrevenant.toLowerCase().includes(search)
          )
        }

        setAmendes(convertedAmendes)

        // Calculate stats
        const total = response.data.total || infractions.length
        const montantTotal = infractions.reduce((sum, inf) => sum + inf.montant_amende, 0)
        const payees = infractions.filter(inf => inf.statut === 'PAYEE')
        const montantCollecte = payees.reduce((sum, inf) => sum + inf.montant_amende, 0)
        const enAttente = infractions.filter(inf => inf.statut === 'VALIDEE' || inf.statut === 'CONSTATEE')
        const montantEnAttente = enAttente.reduce((sum, inf) => sum + inf.montant_amende, 0)

        setStats({
          totalAmendes: total,
          montantTotal: montantTotal / 1000000, // Convert to millions
          collecte: montantCollecte / 1000000,
          pourcentageCollecte: montantTotal > 0 ? (montantCollecte / montantTotal) * 100 : 0,
          enAttente: montantEnAttente / 1000000,
          pourcentageAttente: montantTotal > 0 ? (montantEnAttente / montantTotal) * 100 : 0,
          enRetard: 0,
          pourcentageRetard: 0,
          evolutionTotal: '+8.3%',
          evolutionCollecte: '+5.2%'
        })
      }
    } catch (err) {
      console.error('Error fetching amendes:', err)
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }, [globalFilter, isCustomDateRange, dateDebut, dateFin, statusFilter, montantFilter, searchTerm, currentPage])

  useEffect(() => {
    fetchAmendes()
  }, [fetchAmendes])

  const totalPages = Math.ceil(stats.totalAmendes / itemsPerPage)

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const formatMontant = (montant: number) => {
    if (montant >= 1000) {
      return `${(montant / 1000).toFixed(1)}Mrd`
    } else if (montant >= 1) {
      return `${montant.toFixed(1)}M`
    }
    return `${(montant * 1000).toFixed(0)}K`
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

  const getStatutColor = (statut: AmendeStatus) => {
    switch (statut) {
      case 'Payé':
        return 'bg-green-500 text-white'
      case 'En attente':
        return 'bg-yellow-500 text-white'
      case 'En retard':
        return 'bg-red-500 text-white'
    }
  }

  const handleControlClick = (amendeId: string) => {
    router.push(`/gestion/amendes/${amendeId}`)
  }

  // Open payment modal
  const handlePaymentClick = (amende: Amende) => {
    setAmendeToPayId(amende)
    setShowPaymentModal(true)
  }

  // Record payment
  const handlePaymentConfirm = async (data: { mode_paiement: string; montant: number; reference?: string; notes?: string }) => {
    if (!amendeToPayId) return

    setProcessingPayment(true)
    try {
      const response = await infractionsService.recordPayment(amendeToPayId.id, data)
      if (response.success && response.data?.success) {
        // Update the amende status in the list
        setAmendes(prev => prev.map(a =>
          a.id === amendeToPayId.id
            ? { ...a, statut: 'Payé' as const, statutOriginal: 'PAYEE', datePaiement: formatDate(new Date().toISOString()) }
            : a
        ))
        setShowPaymentModal(false)
        setAmendeToPayId(null)
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
        <p className="text-slate-600">Gestion des amendes</p>
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
                  placeholder="Rechercher amende, Contrevenant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                <option>Tous les statuts</option>
                <option>Payé</option>
                <option>En attente</option>
                <option>En retard</option>
              </select>

              <select
                value={montantFilter}
                onChange={(e) => setMontantFilter(e.target.value)}
                className="px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                <option>Tous les montants</option>
                <option>Moins de 10,000 FCFA</option>
                <option>10,000 - 50,000 FCFA</option>
                <option>Plus de 50,000 FCFA</option>
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

      {/* État des Amendes */}
      <Card className="mb-6 sm:mb-8">
        <CardBody className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              État des Amendes - {
                isCustomDateRange ? 'Personnalisé' :
                  globalFilter === 'jour' ? "Aujourd'hui" :
                    globalFilter === 'semaine' ? 'Cette Semaine' :
                      globalFilter === 'mois' ? 'Ce Mois' :
                        globalFilter === 'annee' ? 'Cette Année' :
                          'Historique'
              }
            </h2>
            <div className="flex items-center gap-2 text-green-600 text-xs sm:text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              {stats.evolutionTotal}
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="text-center p-3 sm:p-4 bg-slate-50 rounded-lg">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-1 sm:mb-2">
                {formatMontant(stats.montantTotal)}
              </div>
              <div className="text-slate-600 text-xs sm:text-sm">Montant total FCFA</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mb-1 sm:mb-2">
                {formatMontant(stats.collecte)}
              </div>
              <div className="text-slate-600 text-xs sm:text-sm">Collecté ({stats.pourcentageCollecte.toFixed(0)}%)</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-yellow-50 rounded-lg">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600 mb-1 sm:mb-2">
                {formatMontant(stats.enAttente)}
              </div>
              <div className="text-slate-600 text-xs sm:text-sm">Attente ({stats.pourcentageAttente.toFixed(0)}%)</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">
                {stats.totalAmendes}
              </div>
              <div className="text-slate-600 text-xs sm:text-sm">Total amendes</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Chargement des amendes...</span>
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
      {!loading && !error && amendes.length === 0 && (
        <Card className="bg-gray-50">
          <CardBody className="p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune amende trouvée</h3>
            <p className="text-gray-500">Aucune amende ne correspond aux critères de recherche.</p>
          </CardBody>
        </Card>
      )}

      {/* Vue Mobile - Cards */}
      {!loading && !error && amendes.length > 0 && (
        <div className="lg:hidden space-y-4 mb-6">
          {amendes.map((amende) => (
            <Card key={amende.id}>
              <CardBody className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 text-sm mb-1 truncate">{amende.numero}</div>
                    <a href="#" className="text-blue-600 hover:text-blue-800 underline text-xs">
                      {amende.pv}
                    </a>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ml-2 ${getStatutColor(amende.statut)}`}>
                    {amende.statut}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div>
                    <div className="text-xs text-slate-500">Contrevenant</div>
                    <div className="font-medium text-slate-900 text-sm">{amende.contrevenant}</div>
                    <div className="text-xs text-slate-500">{amende.telephone}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-slate-500">Montant</div>
                      <div className="font-bold text-slate-900 text-sm">{formatNumber(amende.montant)} FCFA</div>
                      {amende.penalites && (
                        <div className="text-xs text-red-600">+{formatNumber(amende.penalites)} FCFA</div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Date limite</div>
                      <div className={`text-sm ${amende.statut === 'En retard' ? 'text-red-600 font-bold' : 'text-slate-900'}`}>
                        {amende.dateLimite}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <Button
                    onClick={() => handleControlClick(amende.id)}
                    className="flex-1 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-xs">Voir</span>
                  </Button>
                  {amende.statut === 'En attente' && (
                    <Button
                      onClick={() => handlePaymentClick(amende)}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                  {amende.statut === 'Payé' && (
                    <Button className="p-2 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
                      <Download className="w-4 h-4 text-slate-600" />
                    </Button>
                  )}
                  {amende.statut === 'En retard' && (
                    <>
                      <Button
                        onClick={() => handlePaymentClick(amende)}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CreditCard className="w-4 h-4" />
                      </Button>
                      <Button className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                        <Phone className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Vue Desktop - Tableau */}
      {!loading && !error && amendes.length > 0 && (
        <Card className="hidden lg:block">
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">N° Amende</th>
                    <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">PV Associé</th>
                    <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Contrevenant</th>
                    <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Montant</th>
                    <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Émission</th>
                    <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Limite</th>
                    <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Statut</th>
                    <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Paiement</th>
                    <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {amendes.map((amende) => (
                    <tr
                      onClick={() => handleControlClick(amende.id)}
                      key={amende.id}
                      className="hover:bg-slate-50 cursor-pointer"
                    >
                      <td className="px-4 xl:px-6 py-3 xl:py-4">
                        <span className="font-bold text-slate-900 text-xs xl:text-sm">{amende.numero}</span>
                      </td>
                      <td className="px-4 xl:px-6 py-3 xl:py-4">
                        <a href="#" className="text-blue-600 hover:text-blue-800 underline font-medium text-xs xl:text-sm">
                          {amende.pv}
                        </a>
                      </td>
                      <td className="px-4 xl:px-6 py-3 xl:py-4">
                        <div>
                          <div className="font-medium text-slate-900 text-xs xl:text-sm">{amende.contrevenant}</div>
                          <div className="text-xs text-slate-500">{amende.telephone}</div>
                        </div>
                      </td>
                      <td className="px-4 xl:px-6 py-3 xl:py-4">
                        <div>
                          <div className="font-bold text-slate-900 text-xs xl:text-sm">{formatNumber(amende.montant)} FCFA</div>
                          {amende.penalites && (
                            <div className="text-xs text-red-600">+{formatNumber(amende.penalites)} FCFA</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 xl:px-6 py-3 xl:py-4">
                        <span className="text-slate-900 text-xs xl:text-sm">{amende.dateEmission}</span>
                      </td>
                      <td className="px-4 xl:px-6 py-3 xl:py-4">
                        <span className={`text-xs xl:text-sm ${amende.statut === 'En retard' ? 'text-red-600 font-bold' : 'text-slate-900'}`}>
                          {amende.dateLimite}
                        </span>
                      </td>
                      <td className="px-4 xl:px-6 py-3 xl:py-4">
                        <span className={`inline-flex px-2 xl:px-3 py-1 text-xs font-bold rounded-full ${getStatutColor(amende.statut)}`}>
                          {amende.statut}
                        </span>
                      </td>
                      <td className="px-4 xl:px-6 py-3 xl:py-4">
                        {amende.datePaiement ? (
                          <span className="text-green-600 text-xs xl:text-sm">{amende.datePaiement}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 xl:px-6 py-3 xl:py-4">
                        <div className="flex gap-2">
                          <Button
                            onClick={(e) => { e.stopPropagation(); handleControlClick(amende.id); }}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {amende.statut !== 'Payé' && (
                            <Button
                              onClick={(e) => { e.stopPropagation(); handlePaymentClick(amende); }}
                              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <CreditCard className="w-4 h-4" />
                            </Button>
                          )}
                          {amende.statut === 'Payé' && (
                            <Button className="p-2 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
                              <Download className="w-4 h-4 text-slate-600" />
                            </Button>
                          )}
                          {amende.statut === 'En retard' && (
                            <Button className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                              <Phone className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Desktop */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 xl:px-6 py-4 border-t border-slate-200">
                <p className="text-xs sm:text-sm text-slate-600">
                  Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, stats.totalAmendes)} sur {stats.totalAmendes} amendes
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </Button>
                  <span className="px-4 py-2 text-sm font-medium">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Pagination Mobile */}
      {!loading && !error && amendes.length > 0 && totalPages > 1 && (
        <div className="lg:hidden flex flex-col items-center gap-4 mt-4">
          <p className="text-xs text-slate-600">
            Page {currentPage} sur {totalPages} ({stats.totalAmendes} amendes)
          </p>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </Button>
            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm">
              {currentPage}
            </span>
            <Button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal d'enregistrement de paiement */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false)
          setAmendeToPayId(null)
        }}
        onConfirm={handlePaymentConfirm}
        amendeNumero={amendeToPayId?.numero || ''}
        montant={amendeToPayId?.montant || 0}
        loading={processingPayment}
      />
    </div>
  )
}
