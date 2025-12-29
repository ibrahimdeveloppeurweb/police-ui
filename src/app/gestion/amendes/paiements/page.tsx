'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Search, Filter, Download, Eye, Printer, Calendar,
  AlertTriangle, CheckCircle, Clock, CreditCard,
  DollarSign, TrendingUp, MapPin, Loader2, ChevronLeft, ChevronRight
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

type AmendeStatus = 'En attente' | 'En retard'

type AmendePaiement = {
  id: string
  numero: string
  pv: string
  contrevenant: string
  telephone: string
  montant: number
  penalites?: number
  dateEmission: string
  dateLimite: string
  statut: AmendeStatus
  lieu: string
  typeInfraction: string
  joursRestants: number
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

// Calculate days remaining until deadline
const getJoursRestants = (dateEmission: string): number => {
  const deadline = new Date(dateEmission)
  deadline.setDate(deadline.getDate() + 30)
  const now = new Date()
  const diff = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

// Calculate date limite (30 days after emission)
const getDateLimite = (dateEmission: string): string => {
  const date = new Date(dateEmission)
  date.setDate(date.getDate() + 30)
  return formatDate(date.toISOString())
}

// Map API status to display status
const mapStatutToAmendeStatus = (statut: string, dateInfraction: string): AmendeStatus => {
  const joursRestants = getJoursRestants(dateInfraction)
  if (joursRestants < 0) return 'En retard'
  return 'En attente'
}

// Convert API infraction to AmendePaiement
const infractionToPaiement = (infraction: APIInfraction): AmendePaiement => {
  const contrevenant = infraction.conducteur
    ? `${infraction.conducteur.nom} ${infraction.conducteur.prenom}`
    : 'Inconnu'

  const joursRestants = getJoursRestants(infraction.date_infraction)

  return {
    id: infraction.id,
    numero: `#AMN-${infraction.numero_pv}`,
    pv: infraction.numero_pv,
    contrevenant,
    telephone: infraction.conducteur?.numero_permis ? `Permis: ${infraction.conducteur.numero_permis}` : 'N/A',
    montant: infraction.montant_amende,
    penalites: joursRestants < 0 ? Math.round(infraction.montant_amende * 0.1) : undefined,
    dateEmission: formatDate(infraction.date_infraction),
    dateLimite: getDateLimite(infraction.date_infraction),
    statut: mapStatutToAmendeStatus(infraction.statut, infraction.date_infraction),
    lieu: infraction.lieu_infraction || 'Non spécifié',
    typeInfraction: infraction.type_infraction?.libelle || 'Non spécifié',
    joursRestants
  }
}

export default function PaiementsAmendesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tous les statuts')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // API data states
  const [amendes, setAmendes] = useState<AmendePaiement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [amendeToPayId, setAmendeToPayId] = useState<AmendePaiement | null>(null)
  const [processingPayment, setProcessingPayment] = useState(false)

  const [stats, setStats] = useState({
    totalEnAttente: 0,
    montantTotal: 0,
    enRetard: 0,
    montantEnRetard: 0
  })

  const commissariatName = "Commissariat 3ème Arrondissement"
  const commissariatZone = "Cocody - 2 Plateaux"

  // Fetch amendes en attente de paiement
  const fetchAmendes = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch infractions with status VALIDEE (awaiting payment)
      const valideeResponse = await infractionsService.getAll({ statut: 'VALIDEE' }, 1, 100)
      // Also fetch CONSTATEE which might need payment
      const constateeResponse = await infractionsService.getAll({ statut: 'CONSTATEE' }, 1, 100)

      const validees = valideeResponse.success && valideeResponse.data?.infractions ? valideeResponse.data.infractions : []
      const constatees = constateeResponse.success && constateeResponse.data?.infractions ? constateeResponse.data.infractions : []

      // Combine and convert
      const allAmendes = [...validees, ...constatees].map(infractionToPaiement)

      // Apply filters
      let filtered = allAmendes

      // Status filter
      if (statusFilter !== 'Tous les statuts') {
        filtered = filtered.filter(a => a.statut === statusFilter)
      }

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        filtered = filtered.filter(a =>
          a.numero.toLowerCase().includes(search) ||
          a.pv.toLowerCase().includes(search) ||
          a.contrevenant.toLowerCase().includes(search)
        )
      }

      // Date filters
      if (dateDebut) {
        const start = new Date(dateDebut)
        filtered = filtered.filter(a => {
          const date = new Date(a.dateEmission.split('/').reverse().join('-'))
          return date >= start
        })
      }

      if (dateFin) {
        const end = new Date(dateFin)
        filtered = filtered.filter(a => {
          const date = new Date(a.dateEmission.split('/').reverse().join('-'))
          return date <= end
        })
      }

      // Sort by urgency (en retard first, then by days remaining)
      filtered.sort((a, b) => {
        if (a.statut === 'En retard' && b.statut !== 'En retard') return -1
        if (a.statut !== 'En retard' && b.statut === 'En retard') return 1
        return a.joursRestants - b.joursRestants
      })

      setAmendes(filtered)

      // Calculate stats
      const enRetard = allAmendes.filter(a => a.statut === 'En retard')
      const montantTotal = allAmendes.reduce((sum, a) => sum + a.montant + (a.penalites || 0), 0)
      const montantEnRetard = enRetard.reduce((sum, a) => sum + a.montant + (a.penalites || 0), 0)

      setStats({
        totalEnAttente: allAmendes.length,
        montantTotal,
        enRetard: enRetard.length,
        montantEnRetard
      })
    } catch (err) {
      console.error('Error fetching amendes:', err)
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchTerm, dateDebut, dateFin])

  useEffect(() => {
    fetchAmendes()
  }, [fetchAmendes])

  const totalPages = Math.ceil(amendes.length / itemsPerPage)
  const paginatedAmendes = amendes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const formatMontant = (montant: number) => {
    if (montant >= 1000000) {
      return `${(montant / 1000000).toFixed(1)}M`
    } else if (montant >= 1000) {
      return `${(montant / 1000).toFixed(0)}K`
    }
    return `${formatNumber(montant)}`
  }

  const getStatutColor = (statut: AmendeStatus) => {
    switch (statut) {
      case 'En attente':
        return 'bg-yellow-500 text-white'
      case 'En retard':
        return 'bg-red-500 text-white'
    }
  }

  const getStatutIcon = (statut: AmendeStatus) => {
    switch (statut) {
      case 'En attente':
        return <Clock className="w-4 h-4" />
      case 'En retard':
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const handleControlClick = (amendeId: string) => {
    router.push(`/gestion/amendes/${amendeId}`)
  }

  // Open payment modal
  const handlePaymentClick = (amende: AmendePaiement) => {
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
        // Remove from list (now paid)
        setAmendes(prev => prev.filter(a => a.id !== amendeToPayId.id))
        setStats(prev => ({
          ...prev,
          totalEnAttente: prev.totalEnAttente - 1,
          montantTotal: prev.montantTotal - (amendeToPayId.montant + (amendeToPayId.penalites || 0))
        }))
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
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Paiements des Amendes</h1>
            <p className="text-slate-600">{commissariatName} - {commissariatZone}</p>
          </div>
        </div>
        <p className="text-slate-600">Amendes en attente de paiement</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border border-gray-200 border-t-4 border-t-yellow-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">En Attente</h3>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(stats.totalEnAttente)}</div>
            <div className="text-sm text-slate-500">
              Amendes à collecter
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-purple-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Montant Total</h3>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{formatMontant(stats.montantTotal)} FCFA</div>
            <div className="text-sm text-slate-500">
              À collecter
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-red-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">En Retard</h3>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(stats.enRetard)}</div>
            <div className="text-sm text-slate-500">
              {stats.totalEnAttente > 0 ? ((stats.enRetard / stats.totalEnAttente) * 100).toFixed(1) : 0}% du total
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-orange-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Montant En Retard</h3>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{formatMontant(stats.montantEnRetard)} FCFA</div>
            <div className="text-sm text-slate-500">
              Avec pénalités
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="mb-8">
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher amende, contrevenant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            >
              <option>Tous les statuts</option>
              <option>En attente</option>
              <option>En retard</option>
            </select>

            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="date"
                placeholder="Date début"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="date"
                placeholder="Date fin"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={fetchAmendes} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Filter className="w-5 h-5" />
              Appliquer les filtres
            </Button>
            <Button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('Tous les statuts')
                setDateDebut('')
                setDateFin('')
              }}
              className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-300"
            >
              Réinitialiser
            </Button>
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
            <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune amende en attente</h3>
            <p className="text-gray-500">Toutes les amendes ont été réglées.</p>
          </CardBody>
        </Card>
      )}

      {/* Liste des amendes à payer */}
      {!loading && !error && amendes.length > 0 && (
        <div className="space-y-4">
          {paginatedAmendes.map((amende) => (
            <Card
              key={amende.id}
              className={`hover:shadow-lg transition-shadow cursor-pointer ${amende.statut === 'En retard' ? 'border-2 border-red-300 bg-red-50' : ''}`}
              onClick={() => handleControlClick(amende.id)}
            >
              <CardBody className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Infos principales */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-slate-900 text-lg">{amende.numero}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full ${getStatutColor(amende.statut)}`}>
                        {getStatutIcon(amende.statut)}
                        {amende.statut}
                      </span>
                      {amende.joursRestants > 0 && amende.joursRestants <= 7 && (
                        <span className="text-xs text-orange-600 font-medium">
                          {amende.joursRestants} jour{amende.joursRestants > 1 ? 's' : ''} restant{amende.joursRestants > 1 ? 's' : ''}
                        </span>
                      )}
                      {amende.joursRestants < 0 && (
                        <span className="text-xs text-red-600 font-bold">
                          {Math.abs(amende.joursRestants)} jour{Math.abs(amende.joursRestants) > 1 ? 's' : ''} de retard
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-slate-500 uppercase">Contrevenant</div>
                        <div className="font-medium text-slate-900">{amende.contrevenant}</div>
                        <div className="text-xs text-slate-500">{amende.telephone}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 uppercase">Type d'infraction</div>
                        <div className="font-medium text-slate-900">{amende.typeInfraction}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {amende.lieu}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 uppercase">Date limite</div>
                        <div className={`font-medium ${amende.statut === 'En retard' ? 'text-red-600' : 'text-slate-900'}`}>
                          {amende.dateLimite}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Montant et actions */}
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">{formatNumber(amende.montant)} FCFA</div>
                      {amende.penalites && (
                        <div className="text-sm text-red-600">+ {formatNumber(amende.penalites)} FCFA pénalités</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={(e) => { e.stopPropagation(); handleControlClick(amende.id); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Eye className="w-4 h-4" />
                        Détails
                      </Button>
                      <Button
                        onClick={(e) => { e.stopPropagation(); handlePaymentClick(amende); }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CreditCard className="w-4 h-4" />
                        Encaisser
                      </Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <Card>
              <CardBody className="p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-slate-600">
                    Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, amendes.length)} sur {formatNumber(amendes.length)} amendes
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4 text-slate-600" />
                    </button>
                    <span className="px-4 py-2 text-sm font-medium">
                      Page {currentPage} sur {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {/* Modal de paiement */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false)
          setAmendeToPayId(null)
        }}
        onConfirm={handlePaymentConfirm}
        amendeNumero={amendeToPayId?.numero || ''}
        montant={(amendeToPayId?.montant || 0) + (amendeToPayId?.penalites || 0)}
        loading={processingPayment}
      />
    </div>
  )
}
