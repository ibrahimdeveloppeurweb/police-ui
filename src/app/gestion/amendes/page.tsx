'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Eye, Search,
  MapPin, TrendingUp, AlertTriangle,
  CheckCircle, Calendar, Clock, DollarSign, Printer, FileDown,
  Activity, Target, Shield, CreditCard
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useRouter } from 'next/navigation'
import { infractionsService, APIInfraction } from '@/lib/api/services'
import { createPortal } from 'react-dom'

type AmendeStatus = 'En attente' | 'Payé' | 'En retard' | 'Archivé'
type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'

type Amende = {
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
}

interface DashboardStats {
  totalAmendes: number
  montantTotal: number
  collecte: number
  pourcentageCollecte: number
  enAttente: number
  pourcentageAttente: number
  enRetard: number
  pourcentageRetard: number
  tauxPaiement: number
  penalitesTotales: number
}

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amende: Amende | null
  onPaymentSuccess: () => void
}

function PaymentModal({ isOpen, onClose, amende, onPaymentSuccess }: PaymentModalProps) {
  const [modePaiement, setModePaiement] = useState('ESPECES')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amende) return

    setIsSubmitting(true)
    setError(null)

    try {
      await infractionsService.recordPayment(amende.id, {
        montant: amende.montant + (amende.penalites || 0),
        mode_paiement: modePaiement,
        reference: reference || undefined,
        notes: notes || undefined
      })

      onPaymentSuccess()
      onClose()
      setModePaiement('ESPECES')
      setReference('')
      setNotes('')
    } catch (err) {
      setError('Erreur lors de l\'enregistrement du paiement')
      console.error('Payment error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !amende) return null

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Enregistrer un paiement</h2>
          <p className="text-sm text-gray-600 mt-1">Amende {amende.numero}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Montant de base</span>
              <span className="font-semibold">{amende.montant.toLocaleString()} FCFA</span>
            </div>
            {amende.penalites && amende.penalites > 0 && (
              <div className="flex justify-between items-center mt-2 text-red-600">
                <span>Pénalités</span>
                <span className="font-semibold">+{amende.penalites.toLocaleString()} FCFA</span>
              </div>
            )}
            <div className="flex justify-between items-center mt-2 pt-2 border-t font-bold">
              <span>Total à payer</span>
              <span className="text-lg">{(amende.montant + (amende.penalites || 0)).toLocaleString()} FCFA</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode de paiement *
            </label>
            <select
              value={modePaiement}
              onChange={(e) => setModePaiement(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="ESPECES">Espèces</option>
              <option value="MOBILE_MONEY">Mobile Money</option>
              <option value="CARTE_BANCAIRE">Carte Bancaire</option>
              <option value="VIREMENT">Virement Bancaire</option>
              <option value="CHEQUE">Chèque</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Référence de paiement
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="N° de transaction, reçu..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informations complémentaires..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? 'Enregistrement...' : 'Confirmer le paiement'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )

  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body)
  }
  return null
}

export default function AmendesDashboardPage() {
  const router = useRouter()
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('mois')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data state
  const [amendes, setAmendes] = useState<Amende[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalAmendes: 0,
    montantTotal: 0,
    collecte: 0,
    pourcentageCollecte: 0,
    enAttente: 0,
    pourcentageAttente: 0,
    enRetard: 0,
    pourcentageRetard: 0,
    tauxPaiement: 0,
    penalitesTotales: 0
  })
  const [pieData, setPieData] = useState<Array<{ name: string; value: number; color: string }>>([])
  const [chartData, setChartData] = useState<Array<{ period: string; amendes: number; collecte: number }>>([])

  // Payment modal state
  const [selectedAmende, setSelectedAmende] = useState<Amende | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const itemsPerPage = 5
  const totalPages = Math.ceil(amendes.length / itemsPerPage)

  const getDateRange = useCallback((period: PeriodKey): { debut: Date; fin: Date } => {
    const now = new Date()
    const fin = new Date(now)
    let debut = new Date(now)

    switch (period) {
      case 'jour':
        debut.setHours(0, 0, 0, 0)
        break
      case 'semaine':
        debut.setDate(now.getDate() - 7)
        break
      case 'mois':
        debut.setMonth(now.getMonth() - 1)
        break
      case 'annee':
        debut.setFullYear(now.getFullYear() - 1)
        break
      case 'tout':
        debut.setFullYear(2020)
        break
      case 'personnalise':
        if (dateDebut && dateFin) {
          return { debut: new Date(dateDebut), fin: new Date(dateFin) }
        }
        break
    }

    return { debut, fin }
  }, [dateDebut, dateFin])

  const mapStatutToAmendeStatus = (statut: string, dateInfraction: string): AmendeStatus => {
    if (statut === 'PAYEE') return 'Payé'
    if (statut === 'ARCHIVEE') return 'Archivé'

    // Check if overdue (more than 30 days)
    const date = new Date(dateInfraction)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays > 30) return 'En retard'
    return 'En attente'
  }

  const infractionToAmende = (infraction: APIInfraction): Amende => {
    const contrevenant = infraction.conducteur
      ? `${infraction.conducteur.nom} ${infraction.conducteur.prenom}`
      : 'Inconnu'

    const dateInfraction = new Date(infraction.date_infraction)
    const dateLimite = new Date(dateInfraction)
    dateLimite.setDate(dateLimite.getDate() + 30)

    const statut = mapStatutToAmendeStatus(infraction.statut, infraction.date_infraction)

    // Calculate penalties if overdue
    let penalites = 0
    if (statut === 'En retard') {
      penalites = Math.round(infraction.montant_amende * 0.1) // 10% penalty
    }

    return {
      id: infraction.id,
      numero: `#AMN-${infraction.numero_pv}`,
      pv: infraction.numero_pv,
      contrevenant,
      telephone: '+225 XX XX XX XX',
      montant: infraction.montant_amende,
      penalites: penalites > 0 ? penalites : undefined,
      dateEmission: dateInfraction.toLocaleDateString('fr-FR'),
      dateLimite: dateLimite.toLocaleDateString('fr-FR'),
      datePaiement: statut === 'Payé' || statut === 'Archivé'
        ? new Date().toLocaleDateString('fr-FR')
        : undefined,
      statut,
      modePaiement: statut === 'Payé' || statut === 'Archivé' ? 'N/A' : undefined
    }
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { debut, fin } = getDateRange(globalFilter)

      // Fetch all infractions
      const response = await infractionsService.getAll({
        date_debut: debut.toISOString().split('T')[0],
        date_fin: fin.toISOString().split('T')[0]
      }, 1, 500)

      const infractions: APIInfraction[] = response.data?.infractions || []

      // Convert to amendes
      const allAmendes: Amende[] = infractions.map(infractionToAmende)

      // Calculate stats
      const totalAmount = allAmendes.reduce((sum: number, a: Amende) => sum + a.montant, 0)
      const paidAmendes = allAmendes.filter((a: Amende) => a.statut === 'Payé' || a.statut === 'Archivé')
      const collecte = paidAmendes.reduce((sum: number, a: Amende) => sum + a.montant, 0)
      const pendingAmendes = allAmendes.filter((a: Amende) => a.statut === 'En attente')
      const enAttente = pendingAmendes.reduce((sum: number, a: Amende) => sum + a.montant, 0)
      const overdueAmendes = allAmendes.filter((a: Amende) => a.statut === 'En retard')
      const enRetard = overdueAmendes.reduce((sum: number, a: Amende) => sum + a.montant + (a.penalites || 0), 0)
      const totalPenalites = overdueAmendes.reduce((sum: number, a: Amende) => sum + (a.penalites || 0), 0)

      const newStats: DashboardStats = {
        totalAmendes: allAmendes.length,
        montantTotal: totalAmount / 1000000, // Convert to millions
        collecte: collecte / 1000000,
        pourcentageCollecte: totalAmount > 0 ? Math.round((collecte / totalAmount) * 100) : 0,
        enAttente: enAttente / 1000000,
        pourcentageAttente: totalAmount > 0 ? Math.round((enAttente / totalAmount) * 100) : 0,
        enRetard: enRetard / 1000000,
        pourcentageRetard: totalAmount > 0 ? Math.round((enRetard / totalAmount) * 100) : 0,
        tauxPaiement: allAmendes.length > 0 ? Math.round((paidAmendes.length / allAmendes.length) * 100) : 0,
        penalitesTotales: totalPenalites / 1000000
      }

      // Pie chart data
      const newPieData = [
        { name: 'Payé', value: newStats.pourcentageCollecte || 0, color: '#10b981' },
        { name: 'En attente', value: newStats.pourcentageAttente || 0, color: '#f59e0b' },
        { name: 'En retard', value: newStats.pourcentageRetard || 0, color: '#ef4444' }
      ].filter(item => item.value > 0)

      // Generate chart data based on period
      const newChartData = generateChartData(allAmendes, globalFilter, debut, fin)

      setAmendes(allAmendes)
      setStats(newStats)
      setPieData(newPieData)
      setChartData(newChartData)

    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }, [globalFilter, getDateRange])

  const generateChartData = (
    amendes: Amende[],
    period: PeriodKey,
    debut: Date,
    fin: Date
  ): Array<{ period: string; amendes: number; collecte: number }> => {
    const data: Array<{ period: string; amendes: number; collecte: number }> = []

    if (period === 'jour') {
      // Hourly breakdown
      for (let hour = 0; hour < 24; hour += 4) {
        const label = `${hour.toString().padStart(2, '0')}h-${(hour + 4).toString().padStart(2, '0')}h`
        const filtered = amendes.filter(a => {
          const [day, month, year] = a.dateEmission.split('/')
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
          return date.getHours() >= hour && date.getHours() < hour + 4
        })
        data.push({
          period: label,
          amendes: filtered.length,
          collecte: filtered.filter(a => a.statut === 'Payé').reduce((s, a) => s + a.montant, 0) / 1000000
        })
      }
    } else if (period === 'semaine') {
      // Daily breakdown
      const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
      for (let i = 0; i < 7; i++) {
        const date = new Date(debut)
        date.setDate(debut.getDate() + i)
        const dayStr = date.toLocaleDateString('fr-FR')
        const filtered = amendes.filter(a => a.dateEmission === dayStr)
        data.push({
          period: days[date.getDay()],
          amendes: filtered.length,
          collecte: filtered.filter(a => a.statut === 'Payé').reduce((s, a) => s + a.montant, 0) / 1000000
        })
      }
    } else if (period === 'mois') {
      // Weekly breakdown
      for (let week = 1; week <= 4; week++) {
        const weekStart = new Date(debut)
        weekStart.setDate(debut.getDate() + (week - 1) * 7)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 7)

        const filtered = amendes.filter(a => {
          const [day, month, year] = a.dateEmission.split('/')
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
          return date >= weekStart && date < weekEnd
        })
        data.push({
          period: `Sem ${week}`,
          amendes: filtered.length,
          collecte: filtered.filter(a => a.statut === 'Payé').reduce((s, a) => s + a.montant, 0) / 1000000
        })
      }
    } else {
      // Monthly breakdown
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
      for (let i = 0; i < 12; i++) {
        const month = (debut.getMonth() + i) % 12
        const year = debut.getFullYear() + Math.floor((debut.getMonth() + i) / 12)

        const filtered = amendes.filter(a => {
          const [day, monthStr, yearStr] = a.dateEmission.split('/')
          return parseInt(monthStr) === month + 1 && parseInt(yearStr) === year
        })
        data.push({
          period: months[month],
          amendes: filtered.length,
          collecte: filtered.filter(a => a.statut === 'Payé').reduce((s, a) => s + a.montant, 0) / 1000000
        })
      }
    }

    return data
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted) {
      fetchData()
    }
  }, [isMounted, fetchData])

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null || isNaN(num)) {
      return '0'
    }
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const formatMontant = (montant: number) => {
    if (montant >= 1000) {
      return `${(montant / 1000).toFixed(1)}Mrd`
    } else if (montant >= 1) {
      return `${montant.toFixed(2)}M`
    }
    return `${(montant * 1000).toFixed(0)}K`
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

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    // Generate CSV
    const headers = ['Numéro', 'PV', 'Contrevenant', 'Montant', 'Statut', 'Date Émission', 'Date Limite']
    const rows = amendes.map(a => [
      a.numero,
      a.pv,
      a.contrevenant,
      a.montant.toString(),
      a.statut,
      a.dateEmission,
      a.dateLimite
    ])

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `amendes_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const handlePaymentClick = (amende: Amende) => {
    setSelectedAmende(amende)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    fetchData()
  }

  const paginatedAmendes = amendes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (!isMounted) {
    return null
  }

  const getStatutColor = (statut: AmendeStatus) => {
    switch (statut) {
      case 'Payé':
        return 'bg-green-500 text-white'
      case 'En attente':
        return 'bg-yellow-500 text-white'
      case 'En retard':
        return 'bg-red-500 text-white'
      case 'Archivé':
        return 'bg-gray-500 text-white'
    }
  }

  const getStatutIcon = (statut: AmendeStatus) => {
    switch (statut) {
      case 'Payé':
        return <CheckCircle className="w-4 h-4" />
      case 'En attente':
        return <Clock className="w-4 h-4" />
      case 'En retard':
        return <AlertTriangle className="w-4 h-4" />
      case 'Archivé':
        return <CheckCircle className="w-4 h-4" />
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
            <h1 className="text-3xl font-bold text-slate-900">Tableau de bord - Amendes</h1>
            <p className="text-slate-600">Gestion et suivi des amendes</p>
          </div>
        </div>
      </div>

      {/* Filtre Global de Période */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardBody className="p-4 md:p-6">
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Période d'analyse</h2>
                  <p className="text-gray-600 text-xs md:text-sm hidden sm:block">Sélectionnez la période pour filtrer les données</p>
                </div>
              </div>

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

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-4 border-t border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">Date début:</label>
                <input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">Date fin:</label>
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
                <span className="text-xs md:text-sm font-medium">Période personnalisée: {dateDebut} au {dateFin}</span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Loading and Error States */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardBody className="p-6 text-center text-red-600">
            {error}
            <Button onClick={fetchData} className="mt-4 bg-red-600 text-white">
              Réessayer
            </Button>
          </CardBody>
        </Card>
      )}

      {!loading && !error && (
        <>
          {/* Statistiques - 8 cartes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white border border-gray-200 border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-600 text-sm font-medium uppercase">Amendes Totales</h3>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(stats.totalAmendes)}</div>
                <div className="text-sm text-slate-600">Période sélectionnée</div>
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
                <div className="flex items-center gap-2 text-purple-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  Période actuelle
                </div>
              </CardBody>
            </Card>

            <Card className="bg-white border border-gray-200 border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-600 text-sm font-medium uppercase">Montant Collecté</h3>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-slate-900 mb-2">{formatMontant(stats.collecte)} FCFA</div>
                <div className="text-slate-600 text-sm">{stats.pourcentageCollecte}% collecté</div>
              </CardBody>
            </Card>

            <Card className="bg-white border border-gray-200 border-t-4 border-t-yellow-500 hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-600 text-sm font-medium uppercase">En Attente</h3>
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-slate-900 mb-2">{formatMontant(stats.enAttente)} FCFA</div>
                <div className="text-slate-600 text-sm">{stats.pourcentageAttente}% en attente</div>
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
                <div className="text-4xl font-bold text-slate-900 mb-2">{formatMontant(stats.enRetard)} FCFA</div>
                <div className="text-slate-600 text-sm">{stats.pourcentageRetard}% en retard</div>
              </CardBody>
            </Card>

            <Card className="bg-white border border-gray-200 border-t-4 border-t-teal-500 hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-600 text-sm font-medium uppercase">Taux de Paiement</h3>
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-teal-600" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-slate-900 mb-2">{stats.tauxPaiement}%</div>
                <div className="text-sm text-slate-600">Amendes payées</div>
              </CardBody>
            </Card>

            <Card className="bg-white border border-gray-200 border-t-4 border-t-orange-500 hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-600 text-sm font-medium uppercase">Pénalités</h3>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-slate-900 mb-2">{formatMontant(stats.penalitesTotales)} FCFA</div>
                <div className="text-sm text-slate-600">Pénalités totales</div>
              </CardBody>
            </Card>

            <Card className="bg-white border border-gray-200 border-t-4 border-t-indigo-500 hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-600 text-sm font-medium uppercase">Actions rapides</h3>
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => router.push('/gestion/amendes/paiements')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-sm"
                  >
                    Encaissements
                  </Button>
                  <Button
                    onClick={() => router.push('/gestion/amendes/archives')}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white text-sm"
                  >
                    Archives
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardBody className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Évolution des amendes et collecte</h3>

                <div className="h-80 w-full">
                  {chartData && chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        barGap={8}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis
                          dataKey="period"
                          stroke="#6b7280"
                          fontSize={12}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#6b7280"
                          fontSize={12}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                        />
                        <Legend
                          verticalAlign="top"
                          align="center"
                          height={50}
                          iconType="circle"
                          wrapperStyle={{ paddingBottom: '20px' }}
                        />
                        <Bar
                          dataKey="amendes"
                          fill="#6B9FED"
                          radius={[8, 8, 0, 0]}
                          maxBarSize={50}
                          name="Amendes émises"
                          isAnimationActive={false}
                        />
                        <Bar
                          dataKey="collecte"
                          fill="#10B981"
                          radius={[8, 8, 0, 0]}
                          maxBarSize={50}
                          name="Collecte (M FCFA)"
                          isAnimationActive={false}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">Aucune donnée disponible</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Répartition des Statuts
                </h3>

                <div className="h-64 w-full">
                  {pieData && pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={((props: { value?: number }) => props.value ? `${props.value.toFixed(1)}%` : '') as unknown as boolean}
                          outerRadius={80}
                          dataKey="value"
                          isAnimationActive={false}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">Aucune donnée disponible</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  {pieData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm text-gray-700">{item.name}</span>
                      </div>
                      <span className="font-bold text-gray-900">{item.value.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Liste des amendes */}
          {paginatedAmendes.length > 0 ? (
            <div className="space-y-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900">Dernières amendes</h3>
              {paginatedAmendes.map((amende) => (
                <Card key={amende.id} className={amende.statut === 'En retard' ? 'border-2 border-red-400' : ''}>
                  <CardBody className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{amende.numero}</h3>
                        <div className="flex items-center gap-3">
                          <span
                            className="text-blue-600 hover:text-blue-800 underline text-sm cursor-pointer"
                            onClick={() => router.push(`/gestion/verbalisations/${amende.id}`)}
                          >
                            {amende.pv}
                          </span>
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${getStatutColor(amende.statut)}`}>
                            {getStatutIcon(amende.statut)}
                            {amende.statut}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-red-600">{formatNumber(amende.montant)} FCFA</div>
                        <div className="text-sm text-slate-500">Émis le {amende.dateEmission}</div>
                        {amende.penalites && (
                          <div className="text-sm text-red-600 font-medium mt-1">+ {formatNumber(amende.penalites)} FCFA de pénalités</div>
                        )}
                        {amende.datePaiement && (
                          <div className="text-sm text-green-600 font-medium mt-1">Payé le {amende.datePaiement}</div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Contrevenant</p>
                        <p className="font-bold text-slate-900">{amende.contrevenant}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Téléphone</p>
                        <p className="font-bold text-slate-900">{amende.telephone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Date Limite</p>
                        <p className={`font-bold ${amende.statut === 'En retard' ? 'text-red-600' : 'text-slate-900'}`}>
                          {amende.dateLimite}
                        </p>
                      </div>
                    </div>

                    {amende.modePaiement && (
                      <div className="mb-6">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                          <DollarSign className="w-3 h-3" />
                          {amende.modePaiement}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-3 flex-wrap">
                      <Button
                        onClick={() => router.push(`/gestion/amendes/${amende.id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Eye className="w-4 h-4" />
                        Voir détails
                      </Button>
                      {(amende.statut === 'En attente' || amende.statut === 'En retard') && (
                        <Button
                          onClick={() => handlePaymentClick(amende)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Enregistrer paiement
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
          ) : (
            <Card>
              <CardBody className="p-12 text-center">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune amende</h3>
                <p className="text-gray-500">Aucune amende trouvée pour cette période</p>
              </CardBody>
            </Card>
          )}

          {/* Pagination */}
          {amendes.length > itemsPerPage && (
            <Card className="mb-8">
              <CardBody className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-slate-600">
                    Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, amendes.length)} sur {formatNumber(amendes.length)} amendes
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
        </>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amende={selectedAmende}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
