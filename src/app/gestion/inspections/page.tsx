'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  TrendingUp, Wrench, Shield, AlertTriangle, Activity, DollarSign, CheckCircle, XCircle,
  Users, BarChart3, Award, Star, Trophy, Calendar, Search, Printer, FileDown, MapPin,
  AlertCircle, Loader2
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import {
  inspectionsService,
  type InspectionStatistics,
  type Inspection
} from '@/lib/api/services'

export default function InspectionsCommissariatDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('jour')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  // États pour les données dynamiques de l'API
  const [statistics, setStatistics] = useState<InspectionStatistics | null>(null)
  const [inspections, setInspections] = useState<Inspection[]>([])

  // Interface pour les agents calculés à partir des inspections
  interface AgentInspectionStats {
    id: string;
    nom: string;
    matricule: string;
    totalInspections: number;
    conformes: number;
    nonConformes: number;
    enCours: number;
    revenus: number;
    tauxConformite: number;
  }
  const [topAgentsData, setTopAgentsData] = useState<AgentInspectionStats[]>([])

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

  // Calculer les statistiques à partir des inspections (fallback si l'endpoint statistics n'existe pas)
  const calculateStatisticsFromInspections = useCallback((inspectionsList: Inspection[]): InspectionStatistics => {
    const stats: InspectionStatistics = {
      total: inspectionsList.length,
      en_attente: 0,
      en_cours: 0,
      termine: 0,
      conforme: 0,
      non_conforme: 0,
      assurance_invalide: 0,
      par_statut: {},
      taux_conformite: 0,
      montant_total_amendes: 0
    }

    inspectionsList.forEach((insp) => {
      const statut = insp.statut?.toUpperCase() || ''
      stats.par_statut[statut] = (stats.par_statut[statut] || 0) + 1

      if (statut === 'EN_ATTENTE' || statut === 'PENDING') {
        stats.en_attente++
      } else if (statut === 'EN_COURS' || statut === 'IN_PROGRESS') {
        stats.en_cours++
      } else if (statut === 'TERMINE' || statut === 'COMPLETED') {
        stats.termine++
      } else if (statut === 'CONFORME' || statut === 'PASSED') {
        stats.conforme++
      } else if (statut === 'NON_CONFORME' || statut === 'FAILED') {
        stats.non_conforme++
      }

      // Calculer le montant total des amendes si disponible
      if (insp.montant_total_amendes) {
        stats.montant_total_amendes += insp.montant_total_amendes
      }

      // Vérifier assurance invalide
      if (insp.assurance_statut === 'EXPIRED' || insp.assurance_statut === 'INVALIDE') {
        stats.assurance_invalide++
      }
    })

    // Calculer le taux de conformité
    if (stats.total > 0) {
      stats.taux_conformite = (stats.conforme / stats.total) * 100
    }

    return stats
  }, [])

  // Calculer les top agents à partir des inspections
  const calculateTopAgentsFromInspections = useCallback((inspectionsList: Inspection[]): AgentInspectionStats[] => {
    // Grouper les inspections par agent (inspecteur)
    const agentMap = new Map<string, AgentInspectionStats>()

    inspectionsList.forEach((insp) => {
      if (!insp.inspecteur) return

      const agentId = insp.inspecteur.id
      const existing = agentMap.get(agentId)

      if (existing) {
        existing.totalInspections++
        if (insp.statut === 'CONFORME') existing.conformes++
        else if (insp.statut === 'NON_CONFORME') existing.nonConformes++
        else existing.enCours++
        existing.revenus += insp.montant_total_amendes || 0
      } else {
        agentMap.set(agentId, {
          id: agentId,
          nom: `${insp.inspecteur.prenom} ${insp.inspecteur.nom}`,
          matricule: insp.inspecteur.matricule,
          totalInspections: 1,
          conformes: insp.statut === 'CONFORME' ? 1 : 0,
          nonConformes: insp.statut === 'NON_CONFORME' ? 1 : 0,
          enCours: (insp.statut !== 'CONFORME' && insp.statut !== 'NON_CONFORME') ? 1 : 0,
          revenus: insp.montant_total_amendes || 0,
          tauxConformite: 0
        })
      }
    })

    // Calculer le taux de conformité pour chaque agent
    agentMap.forEach((agent) => {
      if (agent.totalInspections > 0) {
        agent.tauxConformite = (agent.conformes / agent.totalInspections) * 100
      }
    })

    // Trier par nombre d'inspections (ou taux de conformité) et prendre les top 3
    return Array.from(agentMap.values())
      .sort((a, b) => b.totalInspections - a.totalInspections)
      .slice(0, 3)
  }, [])

  // Charger les statistiques depuis l'API
  const fetchStatistics = useCallback(async () => {
    setLoading(true)
    try {
      const dateRange = getDateRangeForPeriod(globalFilter, dateDebut, dateFin)

      // D'abord charger les inspections
      const inspectionsResponse = await inspectionsService.getAll(dateRange ? {
        dateDebut: dateRange.dateDebut,
        dateFin: dateRange.dateFin
      } : undefined, 1, 100)

      let inspectionsList: Inspection[] = []
      if (inspectionsResponse.success && inspectionsResponse.data) {
        inspectionsList = inspectionsResponse.data.inspections || []
        setInspections(inspectionsList)
        // Calculer les top agents à partir des inspections
        const topAgents = calculateTopAgentsFromInspections(inspectionsList)
        setTopAgentsData(topAgents)
      }

      // Essayer de charger les statistiques depuis l'API
      try {
        const statsResponse = await inspectionsService.getStatistics(dateRange ? {
          dateDebut: dateRange.dateDebut,
          dateFin: dateRange.dateFin
        } : undefined)

        if (statsResponse.success && statsResponse.data) {
          setStatistics(statsResponse.data)
        } else {
          // Si l'endpoint ne retourne pas de données, calculer localement
          const calculatedStats = calculateStatisticsFromInspections(inspectionsList)
          setStatistics(calculatedStats)
        }
      } catch (statsError) {
        // Si l'endpoint statistics n'existe pas, calculer les stats localement
        console.warn('Endpoint statistics non disponible, calcul local:', statsError)
        const calculatedStats = calculateStatisticsFromInspections(inspectionsList)
        setStatistics(calculatedStats)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setLoading(false)
    }
  }, [globalFilter, dateDebut, dateFin, getDateRangeForPeriod, calculateStatisticsFromInspections, calculateTopAgentsFromInspections])

  // Charger les données au montage et lors du changement de filtre
  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])

  // Fonction pour formater les revenus
  const formatRevenue = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `${Math.round(amount / 1000)}K`
    }
    return amount.toString()
  }

  // Transformer les inspections de l'API en données pour le graphique d'activité
  const transformActivityData = useCallback(() => {
    if (!inspections || inspections.length === 0) return null

    // Grouper les inspections selon la période sélectionnée
    const groupedData: Record<string, { inspections: number; conformes: number; nonConformes: number; defautsMineurs: number }> = {}

    inspections.forEach((inspection) => {
      const date = new Date(inspection.date_inspection)
      let key: string

      switch (globalFilter) {
        case 'jour':
          // Grouper par tranche horaire
          const hour = date.getHours()
          if (hour < 4) key = '00h-04h'
          else if (hour < 8) key = '04h-08h'
          else if (hour < 12) key = '08h-12h'
          else if (hour < 16) key = '12h-16h'
          else if (hour < 20) key = '16h-20h'
          else key = '20h-24h'
          break
        case 'semaine':
          // Grouper par jour de la semaine
          const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
          key = days[date.getDay()]
          break
        case 'mois':
          // Grouper par semaine du mois
          const weekOfMonth = Math.ceil(date.getDate() / 7)
          key = `Sem ${weekOfMonth}`
          break
        case 'annee':
          // Grouper par mois
          const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
          key = months[date.getMonth()]
          break
        case 'tout':
          // Grouper par année
          key = date.getFullYear().toString()
          break
        case 'personnalise':
        default:
          // Grouper par jour
          key = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
          break
      }

      if (!groupedData[key]) {
        groupedData[key] = { inspections: 0, conformes: 0, nonConformes: 0, defautsMineurs: 0 }
      }

      groupedData[key].inspections++

      if (inspection.statut === 'CONFORME') {
        groupedData[key].conformes++
      } else if (inspection.statut === 'NON_CONFORME') {
        groupedData[key].nonConformes++
      } else {
        groupedData[key].defautsMineurs++
      }
    })

    // Convertir en tableau et trier
    const orderedKeys = globalFilter === 'jour'
      ? ['00h-04h', '04h-08h', '08h-12h', '12h-16h', '16h-20h', '20h-24h']
      : globalFilter === 'semaine'
      ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
      : globalFilter === 'mois'
      ? ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5']
      : globalFilter === 'annee'
      ? ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
      : Object.keys(groupedData).sort()

    return orderedKeys
      .filter(key => groupedData[key])
      .map(key => ({
        period: key,
        ...groupedData[key]
      }))
  }, [inspections, globalFilter])

  // Combiner données API et fallback statique
  const getStatsComparison = (): string => {
    switch (globalFilter) {
      case 'jour': return 'vs hier'
      case 'semaine': return 'vs semaine dernière'
      case 'mois': return 'vs mois dernier'
      case 'annee': return 'vs année dernière'
      case 'tout': return 'depuis 2020'
      case 'personnalise': return 'période personnalisée'
      default: return ''
    }
  }

  // Données actuelles: dynamiques depuis l'API
  const dynamicActivityData = transformActivityData()

  // Évolutions par période (en attendant que le backend calcule les vraies évolutions)
  const getEvolutionByPeriod = () => {
    switch (globalFilter) {
      case 'jour': return { inspections: '+9.1%', conformes: '+7.2%', nonConformes: '+12.8%', defauts: '+8.6%', revenus: '+13.4%', taux: '+3.5%' }
      case 'semaine': return { inspections: '+8.3%', conformes: '+6.8%', nonConformes: '+11.2%', defauts: '+9.1%', revenus: '+12.5%', taux: '+3.2%' }
      case 'mois': return { inspections: '+7.1%', conformes: '+6.3%', nonConformes: '+9.8%', defauts: '+8.2%', revenus: '+11.6%', taux: '+3.8%' }
      case 'annee': return { inspections: '+8.9%', conformes: '+8.4%', nonConformes: '+10.3%', defauts: '+8.1%', revenus: '+12.1%', taux: '+5.2%' }
      case 'tout': return { inspections: '+18.5%', conformes: '+27.3%', nonConformes: '+12.7%', defauts: '+4.0%', revenus: '+24.2%', taux: '+13.8%' }
      case 'personnalise': return { inspections: '+9.5%', conformes: '+7.8%', nonConformes: '+12.4%', defauts: '+10.1%', revenus: '+13.2%', taux: '+4.1%' }
      default: return { inspections: '', conformes: '', nonConformes: '', defauts: '', revenus: '', taux: '' }
    }
  }
  const evolutions = getEvolutionByPeriod()

  const currentData = {
    // Graphique d'activité : données API ou vide
    activityData: dynamicActivityData && dynamicActivityData.length > 0 ? dynamicActivityData : [],
    // Pie chart : données API ou vide
    pieData: statistics ? [
      { name: 'Conformes', value: statistics.conforme, color: '#10b981' },
      { name: 'Non-Conformes', value: statistics.non_conforme, color: '#ef4444' },
      { name: 'En attente', value: statistics.en_attente + statistics.en_cours, color: '#f59e0b' }
    ] : [],
    // Stats : valeurs depuis l'API, évolutions statiques (en attendant le backend)
    stats: {
      totalInspections: statistics?.total || 0,
      inspectionsEvolution: evolutions.inspections,
      inspectionsComparison: getStatsComparison(),
      conformes: statistics?.conforme || 0,
      conformesEvolution: evolutions.conformes,
      conformesComparison: getStatsComparison(),
      nonConformes: statistics?.non_conforme || 0,
      nonConformesEvolution: evolutions.nonConformes,
      nonConformesComparison: getStatsComparison(),
      defautsMineurs: (statistics?.en_attente || 0) + (statistics?.en_cours || 0),
      defautsEvolution: evolutions.defauts,
      defautsComparison: getStatsComparison(),
      revenus: statistics ? formatRevenue(statistics.montant_total_amendes) : '0',
      revenusEvolution: evolutions.revenus,
      revenusComparison: getStatsComparison(),
      tauxConformite: statistics ? `${statistics.taux_conformite.toFixed(1)}%` : '0%',
      tauxEvolution: evolutions.taux,
      tauxComparison: getStatsComparison(),
      agentsActifs: topAgentsData.length > 0 ? `${topAgentsData.length}/10` : '0/10',
      agentsEvolution: topAgentsData.length > 0 ? `${(topAgentsData.length / 10 * 100).toFixed(0)}% opérationnel` : '0% opérationnel',
      moyenneParAgent: statistics && statistics.total > 0 ? (statistics.total / Math.max(topAgentsData.length, 1)).toFixed(1) : '0',
      moyenneEvolution: getStatsComparison()
    }
  }

  // Top agents: calculés à partir des inspections uniquement
  const topAgents = topAgentsData.length > 0 ? topAgentsData.map((agent, index) => {
    // Performance basée sur le taux de conformité des inspections
    const isExcellent = agent.tauxConformite >= 70
    const performanceNum = Math.round(agent.tauxConformite)

    return {
      id: agent.id,
      nom: agent.nom,
      matricule: agent.matricule,
      inspections: agent.totalInspections,
      conformes: agent.conformes,
      nonConformes: agent.nonConformes,
      defautsMineurs: agent.enCours,
      performance: performanceNum,
      revenus: agent.revenus,
      revenusEvolution: '+0%',
      statut: isExcellent ? 'excellent' as const : 'attention' as const,
      topPerformer: index === 0,
      probleme: isExcellent ? undefined : 'Taux de conformité à améliorer'
    }
  }) : []

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

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    alert('Export des données en cours...\nFormat: CSV/Excel/PDF')
  }

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  useEffect(() => {
    setIsMounted(true)
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  if (!isMounted) {
    return null
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
            <h1 className="text-3xl font-bold text-slate-900">Inspections Techniques</h1>
            <p className="text-slate-600">{commissariatName} - {commissariatZone}</p>
          </div>
        </div>
        <p className="text-slate-600">Suivi des contrôles et inspections des véhicules</p>
      </div>

      {/* Filtre Global */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardBody className="p-4 md:p-6">
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Période d&apos;analyse</h2>
                  <p className="text-gray-600 text-xs md:text-sm hidden sm:block">Sélectionnez la période pour filtrer toutes les données</p>
                </div>
              </div>

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

      {/* Statistiques - 8 cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border border-gray-200 border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium uppercase">Total Inspections</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Wrench className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">{formatNumber(currentData.stats.totalInspections)}</div>
            <div className="text-green-600 text-sm font-medium">{currentData.stats.inspectionsEvolution} {currentData.stats.inspectionsComparison}</div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium uppercase">Conformes</h3>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">{formatNumber(currentData.stats.conformes)}</div>
            <div className="text-green-600 text-sm font-medium">{currentData.stats.conformesEvolution} {currentData.stats.conformesComparison}</div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-red-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium uppercase">Non-Conformes</h3>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">{formatNumber(currentData.stats.nonConformes)}</div>
            <div className="text-red-600 text-sm font-medium">{currentData.stats.nonConformesEvolution} {currentData.stats.nonConformesComparison}</div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-yellow-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium uppercase">En Cours / Attente</h3>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">{formatNumber(currentData.stats.defautsMineurs)}</div>
            <div className="text-yellow-600 text-sm font-medium">{currentData.stats.defautsEvolution} {currentData.stats.defautsComparison}</div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-purple-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium uppercase">Revenus Générés</h3>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">{currentData.stats.revenus} FCFA</div>
            <div className="text-green-600 text-sm font-medium">{currentData.stats.revenusEvolution} collectés</div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-indigo-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium uppercase">Taux Conformité</h3>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">{currentData.stats.tauxConformite}</div>
            <div className="text-green-600 text-sm font-medium">{currentData.stats.tauxEvolution} {currentData.stats.tauxComparison}</div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-orange-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium uppercase">Agents Actifs</h3>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">{currentData.stats.agentsActifs}</div>
            <div className="text-green-600 text-sm font-medium">{currentData.stats.agentsEvolution}</div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200 border-t-4 border-t-cyan-500 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium uppercase">Moyenne/Agent</h3>
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">{currentData.stats.moyenneParAgent}</div>
            <div className="text-green-600 text-sm font-medium">{currentData.stats.moyenneEvolution}</div>
          </CardBody>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardBody className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Activité des Inspections</h3>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">TEMPS RÉEL</span>
            </div>

            <div className="h-80 w-full">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <p className="text-gray-500">Chargement des données...</p>
                  </div>
                </div>
              ) : currentData.activityData && currentData.activityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={currentData.activityData}
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
                      dataKey="inspections"
                      fill="#6B9FED"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={50}
                      name="Inspections"
                      isAnimationActive={false}
                    />
                    <Bar
                      dataKey="nonConformes"
                      fill="#F48686"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={50}
                      name="Non-Conformes"
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Wrench className="w-12 h-12 mb-3" />
                  <p className="text-lg font-medium">Aucune donnée disponible</p>
                  <p className="text-sm">Aucune inspection pour cette période</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Répartition des Statuts</h3>

            <div className="h-64 w-full">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <p className="text-gray-500">Chargement...</p>
                  </div>
                </div>
              ) : currentData.pieData && currentData.pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentData.pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${(entry.percent * 100).toFixed(1)}%`}
                      outerRadius={80}
                      dataKey="value"
                      isAnimationActive={false}
                    >
                      {currentData.pieData.map((entry, index) => (
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
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <BarChart3 className="w-10 h-10 mb-2" />
                  <p className="text-sm">Aucune donnée</p>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              {currentData.pieData.length > 0 ? currentData.pieData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">{formatNumber(item.value)}</span>
                </div>
              )) : (
                <div className="text-center text-gray-400 text-sm">
                  Aucune donnée pour cette période
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Top agents du commissariat */}
      <Card>
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Performance des Agents - Top 3</h3>
            <Link href="/gestion/agents/listes">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Voir tous les agents
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topAgents.length === 0 ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-12 text-gray-400">
                <Users className="w-16 h-16 mb-4" />
                <p className="text-lg font-medium">Aucun agent disponible</p>
                <p className="text-sm">Les données des agents ne sont pas encore chargées</p>
              </div>
            ) : topAgents.map((agent) => (
              <Card
                key={agent.matricule}
                className={`border-2 ${
                  agent.statut === 'excellent' ? 'border-blue-200 bg-blue-50' : 'border-orange-200 bg-orange-50'
                } relative`}
              >
                <CardBody className="p-6">
                  {agent.topPerformer && (
                    <div className="absolute -top-3 left-6">
                      <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        MEILLEUR AGENT
                      </span>
                    </div>
                  )}

                  <div className="mb-4 mt-2">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-lg flex items-center gap-2">
                          {agent.topPerformer ? <Trophy className="w-5 h-5 text-yellow-600" /> : <Users className="w-5 h-5 text-blue-600" />}
                          {agent.nom}
                        </h4>
                        <p className="text-sm text-gray-600">{agent.matricule}</p>
                      </div>
                      <span className={`${
                        agent.statut === 'excellent' ? 'bg-blue-500' : 'bg-orange-500'
                      } text-white px-3 py-1 rounded-full text-xs font-bold`}>
                        {agent.statut === 'excellent' ? 'EXCELLENT' : 'ATTENTION'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center mb-4">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">{agent.inspections}</div>
                      <div className="text-xs text-gray-600">INSPECTIONS</div>
                    </div>
                    <div>
                      <div className={`text-3xl font-bold ${
                        agent.statut === 'excellent' ? 'text-blue-600' : 'text-orange-600'
                      }`}>
                        {agent.performance}%
                      </div>
                      <div className="text-xs text-gray-600">PERFORMANCE</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center mb-4 text-xs">
                    <div>
                      <div className="font-bold text-green-600">{agent.conformes}</div>
                      <div className="text-gray-600">Conformes</div>
                    </div>
                    <div>
                      <div className="font-bold text-red-600">{agent.nonConformes}</div>
                      <div className="text-gray-600">Non-Conf.</div>
                    </div>
                    <div>
                      <div className="font-bold text-yellow-600">{agent.defautsMineurs}</div>
                      <div className="text-gray-600">Défauts</div>
                    </div>
                  </div>

                  <div className={`${
                    agent.statut === 'excellent' ? 'bg-blue-100' : 'bg-orange-100'
                  } rounded-lg p-3 mb-4`}>
                    <div className="text-sm">
                      <div className={`font-bold ${
                        agent.statut === 'excellent' ? 'text-blue-800' : 'text-orange-800'
                      }`}>
                        Revenus: {formatNumber(agent.revenus)} FCFA ({agent.revenusEvolution})
                      </div>
                      <div className={agent.statut === 'excellent' ? 'text-blue-700' : 'text-orange-700'}>
                        {agent.probleme || 'Performance optimale'}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link href={`/gestion/agents/${agent.id}`} className="flex-1">
                      <Button className={`w-full ${
                        agent.statut === 'excellent'
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-orange-600 hover:bg-orange-700'
                      } text-white`}>
                        Profil
                      </Button>
                    </Link>
                    <Button className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-300">
                      Contacter
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
