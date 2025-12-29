'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Search, Filter, Download, Eye, Printer, Calendar, MapPin,
  AlertTriangle, CheckCircle, XCircle, TrendingUp,
  DollarSign, FileDown, Wrench, AlertCircle, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'
import {
  inspectionsService,
  type Inspection as ApiInspection,
  type InspectionStatistics
} from '@/lib/api/services'

type InspectionStatus = 'Conforme' | 'Non-Conforme' | 'Défaut Mineur'
type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'

interface DisplayInspection {
  id: string
  originalId: string
  date: string
  heure: string
  immatriculation: string
  proprietaire: string
  inspecteur: string
  lieu: string
  statut: InspectionStatus
  infractions: string[]
  pv: string | null
  montant: number | null
  validiteAssurance: string
  validiteVisite: string
}

interface Stats {
  totalInspections: number
  conformes: number
  nonConformes: number
  defautsMineurs: number
  revenusJour: number
  tauxConformite: number
  evolutionInspections: string
  evolutionRevenus: string
  evolutionConformite: string
  infractionsPrincipales: {
    [key: string]: number
  }
}

export default function InspectionInfractionsCommissariatPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tous les statuts')
  const [dateFilter, setDateFilter] = useState('')
  const [infractionFilter, setInfractionFilter] = useState('Toutes les infractions')
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('jour')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)
  const [loading, setLoading] = useState(true)

  // États pour les données dynamiques
  const [inspections, setInspections] = useState<DisplayInspection[]>([])
  const [stats, setStats] = useState<Stats>({
    totalInspections: 0,
    conformes: 0,
    nonConformes: 0,
    defautsMineurs: 0,
    revenusJour: 0,
    tauxConformite: 0,
    evolutionInspections: '+0%',
    evolutionRevenus: '+0%',
    evolutionConformite: '+0%',
    infractionsPrincipales: {}
  })

  const commissariatName = "Commissariat Central de Cocody"
  const commissariatZone = "Cocody - 2 Plateaux"

  // Fonction pour calculer les dates selon la période
  const getDateRangeForPeriod = useCallback((period: PeriodKey, customDateDebut?: string, customDateFin?: string): { dateDebut: string; dateFin: string } | null => {
    const today = new Date()
    const formatDate = (date: Date) => date.toISOString().split('T')[0]

    switch (period) {
      case 'jour':
        return { dateDebut: formatDate(today), dateFin: formatDate(today) }
      case 'semaine': {
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay() + 1)
        return { dateDebut: formatDate(startOfWeek), dateFin: formatDate(today) }
      }
      case 'mois': {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        return { dateDebut: formatDate(startOfMonth), dateFin: formatDate(today) }
      }
      case 'annee': {
        const startOfYear = new Date(today.getFullYear(), 0, 1)
        return { dateDebut: formatDate(startOfYear), dateFin: formatDate(today) }
      }
      case 'tout':
        return null
      case 'personnalise':
        if (customDateDebut && customDateFin) {
          return { dateDebut: customDateDebut, dateFin: customDateFin }
        }
        return null
      default:
        return null
    }
  }, [])

  // Mapper le statut API vers le statut d'affichage
  const mapStatut = (statut: string): InspectionStatus => {
    const upperStatut = statut?.toUpperCase() || ''
    if (upperStatut === 'CONFORME' || upperStatut === 'PASSED') return 'Conforme'
    if (upperStatut === 'NON_CONFORME' || upperStatut === 'FAILED') return 'Non-Conforme'
    return 'Défaut Mineur'
  }

  // Transformer les données API en données d'affichage
  const transformInspection = (apiInsp: ApiInspection): DisplayInspection => {
    const date = new Date(apiInsp.date_inspection)
    return {
      id: `#INS-${apiInsp.id.substring(0, 8).toUpperCase()}`,
      originalId: apiInsp.id,
      date: date.toLocaleDateString('fr-FR'),
      heure: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      immatriculation: apiInsp.vehicule_immatriculation,
      proprietaire: `${apiInsp.conducteur_prenom} ${apiInsp.conducteur_nom}`,
      inspecteur: apiInsp.inspecteur ? `${apiInsp.inspecteur.prenom} ${apiInsp.inspecteur.nom}` : 'Non assigné',
      lieu: apiInsp.lieu_inspection || 'Non spécifié',
      statut: mapStatut(apiInsp.statut),
      infractions: apiInsp.verifications_echec > 0 ? ['Vérifications échouées'] : [],
      pv: apiInsp.numero ? `PV-${apiInsp.numero}` : null,
      montant: apiInsp.montant_total_amendes || null,
      validiteAssurance: apiInsp.assurance_statut || 'N/A',
      validiteVisite: 'N/A'
    }
  }

  // Calculer les statistiques à partir des inspections
  const calculateStats = useCallback((inspectionsList: ApiInspection[]): Stats => {
    const conformes = inspectionsList.filter(i => ['CONFORME', 'PASSED'].includes(i.statut?.toUpperCase())).length
    const nonConformes = inspectionsList.filter(i => ['NON_CONFORME', 'FAILED'].includes(i.statut?.toUpperCase())).length
    const defautsMineurs = inspectionsList.length - conformes - nonConformes
    const totalAmendes = inspectionsList.reduce((sum, i) => sum + (i.montant_total_amendes || 0), 0)

    return {
      totalInspections: inspectionsList.length,
      conformes,
      nonConformes,
      defautsMineurs,
      revenusJour: totalAmendes,
      tauxConformite: inspectionsList.length > 0 ? Math.round((conformes / inspectionsList.length) * 100 * 10) / 10 : 0,
      evolutionInspections: getEvolutionByPeriod().inspections,
      evolutionRevenus: getEvolutionByPeriod().revenus,
      evolutionConformite: getEvolutionByPeriod().conformite,
      infractionsPrincipales: {
        'Éclairage': Math.round(nonConformes * 0.3),
        'Freinage': Math.round(nonConformes * 0.25),
        'Pneumatiques': Math.round(nonConformes * 0.2),
        'Assurance': Math.round(nonConformes * 0.25)
      }
    }
  }, [])

  // Évolutions par période
  const getEvolutionByPeriod = () => {
    switch (globalFilter) {
      case 'jour': return { inspections: '+9.1%', revenus: '+13.4%', conformite: '+3.5%' }
      case 'semaine': return { inspections: '+8.3%', revenus: '+12.5%', conformite: '+3.2%' }
      case 'mois': return { inspections: '+7.1%', revenus: '+11.6%', conformite: '+3.8%' }
      case 'annee': return { inspections: '+8.9%', revenus: '+12.1%', conformite: '+5.2%' }
      case 'tout': return { inspections: '+18.5%', revenus: '+24.2%', conformite: '+13.8%' }
      default: return { inspections: '+9.5%', revenus: '+13.2%', conformite: '+4.1%' }
    }
  }

  // Charger les données depuis l'API
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const dateRange = getDateRangeForPeriod(globalFilter, dateDebut, dateFin)

      const response = await inspectionsService.getAll(dateRange ? {
        dateDebut: dateRange.dateDebut,
        dateFin: dateRange.dateFin,
        search: searchTerm || undefined,
        statut: statusFilter !== 'Tous les statuts' ? statusFilter.toUpperCase().replace('-', '_') : undefined
      } : {
        search: searchTerm || undefined,
        statut: statusFilter !== 'Tous les statuts' ? statusFilter.toUpperCase().replace('-', '_') : undefined
      }, 1, 100)

      if (response.success && response.data) {
        const apiInspections = response.data.inspections || []
        setInspections(apiInspections.map(transformInspection))
        setStats(calculateStats(apiInspections))
      }
    } catch (error) {
      console.error('Erreur lors du chargement des inspections:', error)
    } finally {
      setLoading(false)
    }
  }, [globalFilter, dateDebut, dateFin, searchTerm, statusFilter, getDateRangeForPeriod, calculateStats])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const formatMontant = (montant: number) => {
    if (montant >= 1000000) {
      return `${(montant / 1000000).toFixed(1)}M`
    }
    return `${formatNumber(montant)}`
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
  }

  const handleCustomDateSearch = () => {
    if (dateDebut && dateFin) {
      setIsCustomDateRange(true)
      setGlobalFilter('personnalise')
    }
  }

  const handleControlClick = (originalId: string) => {
    router.push(`/gestion/inspections/${originalId}`)
  }

  const getStatutColor = (statut: InspectionStatus) => {
    switch (statut) {
      case 'Conforme':
        return 'bg-green-500 text-white'
      case 'Non-Conforme':
        return 'bg-red-500 text-white'
      case 'Défaut Mineur':
        return 'bg-yellow-500 text-white'
    }
  }

  const getInfractionColor = (infraction: string) => {
    const colors: Record<string, string> = {
      'Éclairage': 'bg-red-100 text-red-800',
      'Freinage': 'bg-red-100 text-red-800',
      'Pneumatiques': 'bg-orange-100 text-orange-800',
      'Échappement': 'bg-purple-100 text-purple-800',
      'Direction': 'bg-red-100 text-red-800',
      'Assurance': 'bg-blue-100 text-blue-800',
      'Contrôle Technique': 'bg-indigo-100 text-indigo-800',
      'Carrosserie': 'bg-gray-100 text-gray-800',
      'Vérifications échouées': 'bg-red-100 text-red-800'
    }
    return colors[infraction] || 'bg-gray-100 text-gray-800'
  }

  return (
     <div className="min-h-screen space-y-6">
      {/* Indicateur de chargement */}
      {loading && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Chargement des données...</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Wrench className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Inspections & Infractions</h1>
            <p className="text-slate-600">{commissariatName} - {commissariatZone}</p>
          </div>
        </div>
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
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Période d&apos;analyse</h2>
                  <p className="text-gray-600 text-xs md:text-sm hidden sm:block">
                    Sélectionnez la période pour filtrer toutes les données
                  </p>
                </div>
              </div>

              {/* Boutons de période - responsive */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => handleFilterChange('jour')}
                  className={`${globalFilter === 'jour' && !isCustomDateRange ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-blue-700 hover:text-white transition-colors text-xs md:text-sm px-3 py-2`}
                >
                  Aujourd&apos;hui
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

            {/* NOUVEAUX CHAMPS : Input de recherche + 2 Selects */}
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

              {/* Select 1 : Commissariat */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option>Tous les statuts</option>
                    <option>Conforme</option>
                    <option>Non-Conforme</option>
                    <option>Défaut Mineur</option>
                  </select>
              </div>

              {/* Select 2 : Type d'opération */}
          <select
              value={infractionFilter}
              onChange={(e) => setInfractionFilter(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option>Toutes les infractions</option>
              <option>Éclairage</option>
              <option>Freinage</option>
              <option>Pneumatiques</option>
              <option>Direction</option>
              <option>Assurance</option>
            </select>

            </div>

            {/* Sélection de dates personnalisées - responsive */}
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

              {/* Séparateur visuel */}
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

            {/* Badge de confirmation - responsive */}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <Card className="bg-white border border-gray-200 border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-xs lg:text-sm font-medium uppercase">Total Inspections</h3>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl lg:text-4xl font-bold text-slate-900 mb-2">{formatNumber(stats.totalInspections)}</div>
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium mb-3">
              <TrendingUp className="w-4 h-4" />
              {stats.evolutionInspections} vs période précédente
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Conformes: {formatNumber(stats.conformes)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Non-Conformes: {formatNumber(stats.nonConformes)}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-xs lg:text-sm font-medium uppercase">Revenus Amendes</h3>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
              </div>
            </div>
            <div className="text-2xl lg:text-4xl font-bold text-slate-900 mb-2">
              {formatMontant(stats.revenusJour)} FCFA
            </div>
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              {stats.evolutionRevenus} collectés
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-red-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-xs lg:text-sm font-medium uppercase">Taux Conformité</h3>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
              </div>
            </div>
            <div className="text-2xl lg:text-4xl font-bold text-slate-900 mb-2">{stats.tauxConformite}%</div>
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              {stats.evolutionConformite} vs période précédente
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-purple-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-xs lg:text-sm font-medium uppercase">Infractions</h3>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600">Éclairage</span>
                <span className="text-sm font-bold">{stats.infractionsPrincipales['Éclairage'] || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600">Freinage</span>
                <span className="text-sm font-bold">{stats.infractionsPrincipales['Freinage'] || 0}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>


      {/* Tableau */}
      <Card className="mb-8">
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">ID Inspection</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Date & Heure</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Véhicule</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Propriétaire</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Lieu</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Infractions</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Montant</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {inspections.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center text-gray-400">
                        <Wrench className="w-12 h-12 mb-3" />
                        <p className="text-lg font-medium">Aucune inspection trouvée</p>
                        <p className="text-sm">Modifiez vos filtres ou la période sélectionnée</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  inspections.map((inspection, index) => (
                    <tr
                       key={inspection.id}
                        onClick={() => handleControlClick(inspection.originalId)}
                     className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 cursor-pointer  transition-colors duration-150`}>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-blue-600">{inspection.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900">{inspection.date}</span>
                          <span className="text-xs text-slate-500">{inspection.heure}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-900">{inspection.immatriculation}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-700">{inspection.proprietaire}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="text-xs text-slate-700">{inspection.lieu}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full shadow-sm ${getStatutColor(inspection.statut)}`}>
                          {inspection.statut === 'Conforme' && <CheckCircle className="w-3.5 h-3.5" />}
                          {inspection.statut === 'Non-Conforme' && <XCircle className="w-3.5 h-3.5" />}
                          {inspection.statut === 'Défaut Mineur' && <AlertCircle className="w-3.5 h-3.5" />}
                          {inspection.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {inspection.infractions.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {inspection.infractions.map((inf, i) => (
                              <span key={i} className={`px-2.5 py-1 text-xs font-medium rounded-lg shadow-sm ${getInfractionColor(inf)}`}>
                                {inf}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Aucune</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {inspection.montant ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-red-600">{formatNumber(inspection.montant)} FCFA</span>
                            {inspection.pv && <span className="text-xs text-slate-500">{inspection.pv}</span>}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400 font-medium">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                           onClick={() => handleControlClick(inspection.originalId)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors group cursor-pointer "
                            title="Voir détails"
                          >
                            <Eye  className="w-4 h-4 text-slate-600  group-hover:text-blue-600" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); alert(`Impression ${inspection.id}`) }}
                            className="p-2 hover:bg-purple-100 rounded-lg transition-colors group"
                            title="Imprimer"
                          >
                            <Printer className="w-4 h-4 text-slate-600 group-hover:text-purple-600" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); alert(`Téléchargement ${inspection.id}`) }}
                            className="p-2 hover:bg-green-100 rounded-lg transition-colors group"
                            title="Télécharger"
                          >
                            <Download className="w-4 h-4 text-slate-600 group-hover:text-green-600" />
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
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-200 gap-4 bg-slate-50">
            <p className="text-sm text-slate-600 font-medium">
              Affichage de <span className="font-bold text-slate-900">1</span> à <span className="font-bold text-slate-900">{inspections.length}</span> sur <span className="font-bold text-slate-900">{formatNumber(stats.totalInspections)}</span> inspections
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-white hover:shadow-sm transition-all">
                <span className="text-sm text-slate-600 font-medium">←</span>
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors">
                1
              </button>
              <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white hover:shadow-sm transition-all">
                <span className="text-sm text-slate-600 font-medium">2</span>
              </button>
              <span className="px-2 text-slate-400">...</span>
              <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white hover:shadow-sm transition-all">
                <span className="text-sm text-slate-600 font-medium">{Math.max(1, Math.ceil(stats.totalInspections / Math.max(inspections.length, 1)))}</span>
              </button>
              <button className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-white hover:shadow-sm transition-all">
                <span className="text-sm text-slate-600 font-medium">→</span>
              </button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
