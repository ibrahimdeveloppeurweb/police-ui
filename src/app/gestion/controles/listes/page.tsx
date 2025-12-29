'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, Download, Eye, Printer, Calendar, MapPin,
  Car, AlertTriangle, CheckCircle, XCircle, FileText, TrendingUp,
  Clock, DollarSign, Shield, Target, FileDown, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { useGestionLayout } from '@/contexts/GestionLayoutContext'
import { useAuth } from '@/hooks/useAuth'
import {
  controlesService,
  type Controle,
  type FilterControles,
  StatutControle,
  TypeControle,
  StatutPV
} from '@/lib/api/services'

type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'

export default function ControlesGestionPage() {
  const router = useRouter()
  const { setTitle, setSubtitle } = useGestionLayout()
  const { user: currentUser, loading: authLoading } = useAuth()

  // Loading and error state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Controls data
  const [controles, setControles] = useState<Controle[]>([])
  const [totalControles, setTotalControles] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('tout')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)

  // Stats
  const [stats, setStats] = useState({
    totalControles: 0,
    conformes: 0,
    nonConformes: 0,
    enCours: 0,
    termines: 0,
    infractions: 0,
    avertissements: 0,
    revenus: 0,
    tauxConformite: 0
  })

  // Set title with commissariat name when user is loaded
  useEffect(() => {
    if (currentUser) {
      setTitle("Liste des Controles")
      if (currentUser.commissariat?.nom) {
        setSubtitle(`${currentUser.commissariat.nom} - Gestion des controles routiers`)
      } else {
        setSubtitle("Gestion des controles routiers")
      }
    }
  }, [currentUser, setTitle, setSubtitle])

  // Calculate date range based on period filter
  const getDateRange = useCallback(() => {
    const now = new Date()
    let startDate: Date | null = null
    let endDate: Date = now

    switch (globalFilter) {
      case 'jour':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'semaine':
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'mois':
        startDate = new Date(now)
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case 'annee':
        startDate = new Date(now)
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      case 'personnalise':
        if (dateDebut) startDate = new Date(dateDebut)
        if (dateFin) endDate = new Date(dateFin)
        break
      case 'tout':
      default:
        startDate = null
        break
    }

    return {
      dateDebut: startDate ? startDate.toISOString().split('T')[0] : undefined,
      dateFin: endDate.toISOString().split('T')[0]
    }
  }, [globalFilter, dateDebut, dateFin])

  // Map API response to frontend Controle type
  const mapApiControle = (apiControle: any): Controle => {
    return {
      id: apiControle.id,
      numero: apiControle.reference || '',
      type: apiControle.type_controle as TypeControle,
      statut: apiControle.statut as StatutControle,
      dateControle: apiControle.date_controle,
      lieuControle: apiControle.lieu_controle || '',
      agentId: apiControle.agent?.id || '',
      agent: apiControle.agent ? {
        id: apiControle.agent.id,
        nom: apiControle.agent.nom,
        prenom: apiControle.agent.prenom,
        email: apiControle.agent.email || '',
        matricule: apiControle.agent.matricule,
        role: apiControle.agent.role,
        grade: apiControle.agent.grade,
        actif: true,
        createdAt: '',
        updatedAt: ''
      } : undefined,
      commissariatId: apiControle.commissariat?.id || '',
      commissariat: apiControle.commissariat ? {
        id: apiControle.commissariat.id,
        nom: apiControle.commissariat.nom,
        code: apiControle.commissariat.code,
        adresse: '',
        telephone: '',
        actif: true,
        createdAt: '',
        updatedAt: ''
      } : undefined,
      personneControllee: {
        nom: apiControle.conducteur_nom || '',
        prenom: apiControle.conducteur_prenom || ''
      },
      vehicule: {
        immatriculation: apiControle.vehicule_immatriculation || '',
        marque: apiControle.vehicule_marque,
        modele: apiControle.vehicule_modele
      },
      observations: apiControle.observations,
      infractionsConstatees: apiControle.infractions?.map((i: any) => i.type_infraction) || [],
      pvGenere: apiControle.infractions && apiControle.infractions.length > 0,
      pv: apiControle.infractions && apiControle.infractions.length > 0 ? {
        id: apiControle.infractions[0]?.id || '',
        numero: apiControle.infractions[0]?.numero_pv || '',
        controleId: apiControle.id,
        dateEmission: apiControle.infractions[0]?.date_infraction || '',
        infractions: apiControle.infractions?.map((i: any) => ({
          code: i.id,
          libelle: i.type_infraction || 'Infraction',
          montant: i.montant_amende || 0
        })) || [],
        montantTotal: apiControle.infractions?.reduce((sum: number, i: any) => sum + (i.montant_amende || 0), 0) || 0,
        montant: apiControle.infractions?.reduce((sum: number, i: any) => sum + (i.montant_amende || 0), 0) || 0,
        statutPaiement: StatutPV.EN_ATTENTE,
        createdAt: '',
        updatedAt: ''
      } : undefined,
      createdAt: apiControle.created_at || '',
      updatedAt: apiControle.updated_at || ''
    }
  }

  // Fetch controles
  const fetchControles = useCallback(async () => {
    if (!currentUser?.commissariatId) return

    setLoading(true)
    setError(null)

    try {
      const dateRange = getDateRange()
      const filters: FilterControles = {
        commissariat_id: currentUser.commissariatId,
        date_debut: dateRange.dateDebut,
        date_fin: dateRange.dateFin,
        search: searchTerm || undefined,
        statut: statusFilter as StatutControle || undefined,
        type: typeFilter as TypeControle || undefined,
      }

      const response = await controlesService.getAll(filters, page, limit)

      if (response.success && response.data) {
        // L'API retourne { controles: [...] } au lieu de { data: [...], total: n }
        const apiData = response.data as any
        const rawControles = apiData.controles || apiData.data || []
        const mappedControles = rawControles.map(mapApiControle)

        setControles(mappedControles)
        setTotalControles(apiData.total || mappedControles.length)

        // Calculate stats from fetched data
        const allControles = mappedControles
        const conformes = allControles.filter(c => c.statut === StatutControle.CONFORME).length
        const nonConformes = allControles.filter(c => c.statut === StatutControle.NON_CONFORME).length
        const enCours = allControles.filter(c => c.statut === StatutControle.EN_COURS).length
        const termines = allControles.filter(c => c.statut === StatutControle.TERMINE).length
        // Infractions = controles avec des infractions constatées ou PV généré
        const infractions = allControles.filter(c => c.pvGenere || (c.infractionsConstatees && c.infractionsConstatees.length > 0)).length
        // Avertissements = controles non conformes sans PV (avertissement verbal)
        const avertissements = allControles.filter(c => c.statut === StatutControle.NON_CONFORME && !c.pvGenere).length
        const revenus = allControles.reduce((sum, c) => sum + (c.pv?.montant || 0), 0)

        setStats({
          totalControles: apiData.total || allControles.length,
          conformes,
          nonConformes,
          enCours,
          termines,
          infractions,
          avertissements,
          revenus,
          tauxConformite: allControles.length > 0 ? (conformes / allControles.length) * 100 : 0
        })
      }
    } catch (err) {
      console.error('Error fetching controles:', err)
      setError("Erreur lors du chargement des controles")
    } finally {
      setLoading(false)
    }
  }, [currentUser?.commissariatId, page, limit, searchTerm, statusFilter, typeFilter, getDateRange])

  // Fetch controles when user or filters change
  useEffect(() => {
    if (currentUser?.commissariatId) {
      fetchControles()
    }
  }, [currentUser?.commissariatId, fetchControles])

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    alert('Export des donnees en cours...\nFormat: CSV/Excel/PDF')
  }

  const handleFilterChange = (filter: PeriodKey) => {
    setGlobalFilter(filter)
    setIsCustomDateRange(false)
    setDateDebut('')
    setDateFin('')
    setPage(1)
  }

  const handleCustomDateSearch = () => {
    if (dateDebut && dateFin) {
      setIsCustomDateRange(true)
      setGlobalFilter('personnalise')
      setPage(1)
    }
  }

  const handleControlClick = (controleId: string) => {
    router.push(`/gestion/controles/${controleId}`)
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case StatutControle.CONFORME:
        return 'bg-green-500 text-white'
      case StatutControle.NON_CONFORME:
        return 'bg-red-500 text-white'
      case StatutControle.EN_COURS:
        return 'bg-yellow-500 text-white'
      case StatutControle.TERMINE:
        return 'bg-blue-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case StatutControle.CONFORME:
        return 'Conforme'
      case StatutControle.NON_CONFORME:
        return 'Non conforme'
      case StatutControle.EN_COURS:
        return 'En cours'
      case StatutControle.TERMINE:
        return 'Termine'
      default:
        return statut
    }
  }

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-slate-600">Chargement...</span>
        </div>
      </div>
    )
  }

  // Show error if no commissariat assigned
  if (!currentUser?.commissariatId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-slate-700 mb-2 font-medium">Aucun commissariat assigne</p>
          <p className="text-slate-500 mb-4">Veuillez vous reconnecter pour acceder aux controles de votre commissariat.</p>
          <Button onClick={() => router.push('/auth/login')}>Se reconnecter</Button>
        </div>
      </div>
    )
  }

  // Show loading state while fetching controls
  if (loading && !controles.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-slate-600">Chargement des controles...</span>
        </div>
      </div>
    )
  }

  // Show error state
  if (error && !controles.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchControles}>Reessayer</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Filtre Global de Periode */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 mb-8">
        <CardBody className="p-4 md:p-6">
          <div className="space-y-4">
            {/* Header et boutons de periode */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Periode d'analyse</h2>
                  <p className="text-gray-600 text-xs md:text-sm hidden sm:block">
                    {currentUser?.commissariat?.nom || 'Votre commissariat'} - Selectionnez la periode pour filtrer
                  </p>
                </div>
              </div>

              {/* Boutons de periode */}
              <div className="flex flex-wrap items-center gap-2">
                {(['jour', 'semaine', 'mois', 'annee', 'tout'] as PeriodKey[]).map((period) => (
                  <Button
                    key={period}
                    onClick={() => handleFilterChange(period)}
                    className={`${globalFilter === period && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                  >
                    {period === 'jour' ? "Aujourd'hui" :
                     period === 'semaine' ? 'Semaine' :
                     period === 'mois' ? 'Mois' :
                     period === 'annee' ? 'Annee' : 'Historique'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Champs de recherche et filtres */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-4 border-t border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-[200px]">
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Rechercher:
                </label>
                <input
                  type="text"
                  placeholder="Rechercher par immatriculation, nom..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                <option value="">Tous les statuts</option>
                <option value={StatutControle.EN_COURS}>En cours</option>
                <option value={StatutControle.TERMINE}>Termine</option>
                <option value={StatutControle.CONFORME}>Conforme</option>
                <option value={StatutControle.NON_CONFORME}>Non conforme</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                <option value="">Tous les types</option>
                <option value={TypeControle.DOCUMENT}>Document</option>
                <option value={TypeControle.SECURITE}>Securite</option>
                <option value={TypeControle.GENERAL}>General</option>
                <option value={TypeControle.MIXTE}>Mixte</option>
              </select>
            </div>

            {/* Selection de dates personnalisees */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-4 border-t border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Date debut:
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
                  Periode personnalisee active: {dateDebut} au {dateFin}
                </span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>


      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white border border-gray-200 border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Total Controles</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(stats.totalControles)}</div>
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Conformes: {formatNumber(stats.conformes)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Infractions: {formatNumber(stats.infractions)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Avertissements: {formatNumber(stats.avertissements)}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Revenus Periode</h3>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">
              {formatNumber(stats.revenus)} <span className="text-lg">FCFA</span>
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="w-3 h-3 text-blue-600" />
                <span>PV emis: {formatNumber(stats.infractions)}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-purple-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Taux de Conformite</h3>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{stats.tauxConformite.toFixed(1)}%</div>
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-purple-600" />
                <span>Objectif commissariat: 85%</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-slate-600">Chargement...</span>
        </div>
      )}

      {/* Tableau des controles */}
      <Card className="mb-8">
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date/Heure</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Immatriculation</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Conducteur</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Agent</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Lieu</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">PV</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Montant</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {controles.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                      Aucun controle trouve pour cette periode
                    </td>
                  </tr>
                ) : (
                  controles.map((controle) => (
                    <tr
                      key={controle.id}
                      onClick={() => handleControlClick(controle.id)}
                      className="hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-slate-900">{formatDate(controle.dateControle)}</div>
                          <div className="text-sm text-slate-500">{formatTime(controle.dateControle)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">
                          {controle.vehicule?.immatriculation || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-900">
                          {controle.personneControllee?.nom} {controle.personneControllee?.prenom}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {controle.agent?.prenom} {controle.agent?.nom}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-slate-700">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{controle.lieuControle}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatutColor(controle.statut)}`}>
                          {getStatutLabel(controle.statut)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {controle.pv ? (
                          <span className="bg-yellow-500 text-white px-3 py-1 rounded-lg text-xs font-bold">
                            {controle.pv.numero}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {controle.pv?.montant ? (
                          <div>
                            <div className="font-bold text-slate-900">{formatNumber(controle.pv.montant)}</div>
                            <div className="text-xs text-slate-500">FCFA</div>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleControlClick(controle.id)
                            }}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Voir les details"
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              window.print()
                            }}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Imprimer"
                          >
                            <Printer className="w-4 h-4 text-slate-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-200 gap-4">
            <p className="text-sm text-slate-600">
              Affichage de {((page - 1) * limit) + 1} a {Math.min(page * limit, totalControles)} sur {formatNumber(totalControles)} controles
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <span className="text-sm text-slate-600">Precedent</span>
              </button>
              <span className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
                {page}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * limit >= totalControles}
                className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <span className="text-sm text-slate-600">Suivant</span>
              </button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
