'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  TrendingUp, Target, Shield, AlertTriangle, Activity, DollarSign, Car, MapPin,
  CheckCircle, Clock, Users, BarChart3, Eye, Download,
  Award, Bell, TrendingDown, AlertCircle, Star, Trophy,
  Calendar, Search, Printer, FileDown, Building2, Phone, Mail, Loader2
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { controlesService, adminService, ControleStatistics, AgentDetailedResponse } from '@/lib/api/services'
import { useAuth } from '@/hooks/useAuth'

export default function ControlesCommissariatDashboard() {
  const { user } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('jour')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // États pour les données dynamiques
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState<ControleStatistics | null>(null)
  const [topAgents, setTopAgents] = useState<AgentDetailedResponse[]>([])

  // Fonction pour calculer les dates selon la période
  const getDateRangeForPeriod = useCallback((period: PeriodKey, customDateDebut?: string, customDateFin?: string): { dateDebut: string; dateFin: string } | null => {
    const today = new Date()
    const formatDate = (date: Date) => date.toISOString().split('T')[0]

    switch (period) {
      case 'jour':
        return { dateDebut: formatDate(today), dateFin: formatDate(today) }
      case 'semaine': {
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay() + 1) // Lundi
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
        return null // Pas de filtrage de date
      case 'personnalise':
        if (customDateDebut && customDateFin) {
          return { dateDebut: customDateDebut, dateFin: customDateFin }
        }
        return null
      default:
        return null
    }
  }, [])

  // Fonction pour charger les statistiques depuis l'API
  const fetchStatistics = useCallback(async (period: PeriodKey = globalFilter, customDateDebut?: string, customDateFin?: string) => {
    try {
      setLoading(true)
      const dateRange = getDateRangeForPeriod(period, customDateDebut, customDateFin)
      const response = await controlesService.getStatistics(dateRange ? dateRange : undefined)
      if (response.data) {
        setStatistics(response.data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setLoading(false)
    }
  }, [globalFilter, getDateRangeForPeriod])

  // Fonction pour charger les agents depuis l'API
  const fetchAgents = useCallback(async () => {
    try {
      const response = await adminService.getAgentsDashboard()
      if (response.data?.agents) {
        // Trier par tauxInfractions (performance réelle) décroissant et prendre les 3 premiers
        const sortedAgents = response.data.agents
          .sort((a, b) => {
            // Trier par taux d'infractions décroissant (plus haut = meilleur performance)
            return (b.tauxInfractions || 0) - (a.tauxInfractions || 0)
          })
          .slice(0, 3)
        setTopAgents(sortedAgents)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des agents:', error)
    }
  }, [])

  // Charger les statistiques et les agents au montage
  useEffect(() => {
    fetchStatistics()
    fetchAgents()
  }, [fetchStatistics, fetchAgents])

  // Transformer les données de l'API pour les graphiques
  const transformActivityData = useCallback(() => {
    if (!statistics?.par_jour) return []
    return Object.entries(statistics.par_jour)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7) // Derniers 7 jours
      .map(([date, count]) => ({
        period: new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
        controles: count,
        infractions: Math.floor(count * (statistics.infractions_avec / statistics.total || 0))
      }))
  }, [statistics])

  const transformPieData = useCallback(() => {
    if (!statistics) return []
    return [
      { name: 'Terminés', value: statistics.termine, color: '#10b981' },
      { name: 'En cours', value: statistics.en_cours, color: '#f59e0b' },
      { name: 'Avec infractions', value: statistics.infractions_avec, color: '#ef4444' }
    ]
  }, [statistics])

  const transformTypeData = useCallback(() => {
    if (!statistics?.par_type) return []
    const typeLabels: Record<string, string> = {
      'DOCUMENT': 'Documents',
      'SECURITE': 'Sécurité',
      'GENERAL': 'Général',
      'MIXTE': 'Mixte'
    }
    return Object.entries(statistics.par_type).map(([type, count]) => ({
      type: typeLabels[type] || type,
      nombre: count,
      pourcentage: Math.round((count / statistics.total) * 100)
    }))
  }, [statistics])

  // Informations du commissariat (depuis l'utilisateur connecté ou valeurs par défaut)
  const commissariatInfo = {
    nom: user?.commissariat?.nom || 'Commissariat Central de Cocody',
    code: user?.commissariat?.code || 'CC-001',
    adresse: user?.commissariat?.adresse || 'Boulevard Latrille, Cocody, Abidjan',
    telephone: user?.commissariat?.telephone || '+225 27 22 44 55 66',
    email: user?.commissariat?.email || 'cocody.central@police.ci',
    commandant: 'Commissaire KOUASSI Jean-Baptiste',
    agentsActifs: 19,
    agentsTotal: 23,
    zonesCouvertes: ['Cocody', '2 Plateaux', 'Riviera', 'Angré']
  }

  // Fonction pour formater les revenus
  const formatRevenue = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `${Math.round(amount / 1000)}K`
    }
    return amount.toString()
  }

  // Fonction pour obtenir la description de la période
  const getPeriodDescription = useCallback((): string => {
    switch (globalFilter) {
      case 'jour': return "aujourd'hui"
      case 'semaine': return 'cette semaine'
      case 'mois': return 'ce mois'
      case 'annee': return 'cette année'
      case 'tout': return 'toute la période'
      case 'personnalise': return 'période personnalisée'
      default: return 'données en temps réel'
    }
  }, [globalFilter])

  // Données dynamiques basées sur l'API (utilisées pour TOUTES les périodes)
  const dynamicStats = statistics ? {
    totalControles: statistics.total,
    controlesEvolution: '+0%',
    controlesComparison: getPeriodDescription(),
    conformes: statistics.termine,
    conformesEvolution: '+0%',
    conformesComparison: getPeriodDescription(),
    infractions: statistics.infractions_avec,
    infractionsEvolution: '+0%',
    infractionsComparison: getPeriodDescription(),
    avertissements: statistics.en_cours,
    avertissementsEvolution: '+0%',
    avertissementsComparison: getPeriodDescription(),
    revenus: formatRevenue(statistics.montant_total_amendes),
    revenusEvolution: '+0%',
    revenusComparison: getPeriodDescription(),
    tauxConformite: `${statistics.total > 0 ? ((statistics.termine / statistics.total) * 100).toFixed(1) : 0}%`,
    tauxConformiteEvolution: '+0%',
    tauxConformiteComparison: getPeriodDescription(),
    agentsActifs: '19/23',
    agentsEvolution: '82.6% opérationnel',
    moyenneParAgent: (statistics.total / 19).toFixed(1),
    moyenneEvolution: getPeriodDescription()
  } : null

  // Données par défaut (chargement)
  const defaultStats = {
    totalControles: 0,
    controlesEvolution: '+0%',
    controlesComparison: 'Chargement...',
    conformes: 0,
    conformesEvolution: '+0%',
    conformesComparison: 'Chargement...',
    infractions: 0,
    infractionsEvolution: '+0%',
    infractionsComparison: 'Chargement...',
    avertissements: 0,
    avertissementsEvolution: '+0%',
    avertissementsComparison: 'Chargement...',
    revenus: '0K',
    revenusEvolution: '+0%',
    revenusComparison: 'Chargement...',
    tauxConformite: '0%',
    tauxConformiteEvolution: '+0%',
    tauxConformiteComparison: 'Chargement...',
    agentsActifs: '0/0',
    agentsEvolution: 'Chargement...',
    moyenneParAgent: '0',
    moyenneEvolution: 'Chargement...'
  }

  // Données dynamiques pour TOUTES les périodes (provenant de l'API)
  const currentData = {
    activityData: transformActivityData(),
    pieData: transformPieData(),
    stats: dynamicStats || defaultStats,
    topAgents: topAgents.map((agent, index) => {
      // Convertir la performance textuelle en numérique et statut
      // Backend renvoie: "Excellente" (tauxInfraction > 40), "Correcte" (20-40), "Critique" (<20)
      const performanceText = agent.performance?.toLowerCase() || 'correcte'
      const isExcellent = performanceText.includes('excellent')
      const performanceNum = isExcellent ? 85 : performanceText.includes('critique') ? 45 : 65

      return {
        id: agent.id,
        nom: agent.nom,
        grade: agent.grade,
        matricule: `MAT-${agent.id}`,
        commissariat: agent.commissariat,
        controles: agent.controles,
        conformes: Math.round(agent.controles * 0.8),
        infractions: agent.infractions,
        avertissements: Math.round(agent.controles * 0.1),
        performance: performanceNum,
        revenus: agent.revenus,
        revenusEvolution: '+0%',
        statut: isExcellent ? 'excellent' as const : 'attention' as const,
        topPerformer: index === 0,
        zone: agent.localisation || 'Zone assignée',
        tempsService: agent.tempsService || 'N/A',
        probleme: isExcellent ? null : (performanceText.includes('critique') ? 'Performance critique - assistance requise' : 'Performance à améliorer')
      }
    }),
    topInfractions: transformTypeData().length > 0 ? transformTypeData().map((item) => ({
      type: item.type,
      nombre: item.nombre,
      pourcentage: item.pourcentage,
      evolution: '+0%'
    })) : [
      { type: 'Documents', nombre: 0, pourcentage: 0, evolution: '+0%' },
      { type: 'Sécurité', nombre: 0, pourcentage: 0, evolution: '+0%' },
      { type: 'Général', nombre: 0, pourcentage: 0, evolution: '+0%' },
      { type: 'Mixte', nombre: 0, pourcentage: 0, evolution: '+0%' }
    ]
  }

  const handleFilterChange = (filter: PeriodKey) => {
    setGlobalFilter(filter)
    setIsCustomDateRange(false)
    setDateDebut('')
    setDateFin('')
    // Recharger les statistiques avec la nouvelle période
    fetchStatistics(filter)
  }

  const handleCustomDateSearch = () => {
    if (dateDebut && dateFin) {
      setIsCustomDateRange(true)
      setGlobalFilter('personnalise')
      // Recharger les statistiques avec les dates personnalisées
      fetchStatistics('personnalise', dateDebut, dateFin)
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

  const COLORS = ['#10b981', '#ef4444', '#f59e0b']

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
          <span className="text-sm">Chargement des statistiques...</span>
        </div>
      )}
    

      {/* Filtre Global en haut */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
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
                  <p className="text-gray-600 text-xs md:text-sm hidden sm:block">Contrôles routiers - {commissariatInfo.nom}</p>
                </div>
              </div>
              
              {/* Boutons de période - responsive */}
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
                  Tout
                </Button>
              </div>
            </div>

            {/* Sélection de dates personnalisées - responsive */}
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

              {/* Séparateur visuel */}
              <div className="hidden sm:block w-px h-8 bg-blue-300"></div>

              {/* Boutons Imprimer et Exporter */}
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  onClick={handlePrint}
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2"
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
                <span className="text-xs md:text-sm font-medium">Période personnalisée active</span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Statistiques principales - 8 cartes */}
         {/* Statistiques principales - 8 cartes avec STYLE MODERNE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total contrôles */}
        <div className="bg-white rounded-xl border-t-4 border-blue-500 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-600 text-sm font-medium uppercase">TOTAL CONTRÔLES</h3>
                <h4 className="text-gray-500 text-xs mt-1">
                  ({isCustomDateRange ? 'PERSONNALISÉ' : globalFilter === 'jour' ? '24H' : globalFilter.toUpperCase()})
                </h4>
              </div>
              <div className="p-2 rounded-lg bg-blue-100">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{formatNumber(currentData.stats.totalControles)}</div>
            <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
              {currentData.stats.controlesEvolution} {currentData.stats.controlesComparison}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Activity className="w-3 h-3 text-blue-600" />
                <span>Contrôles effectués</span>
              </div>
            </div>
          </div>
        </div>

        {/* Conformes */}
        <div className="bg-white rounded-xl border-t-4 border-green-500 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-600 text-sm font-medium uppercase">CONFORMES</h3>
              </div>
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{formatNumber(currentData.stats.conformes)}</div>
            <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
              {currentData.stats.conformesEvolution} {currentData.stats.conformesComparison}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{((currentData.stats.conformes/currentData.stats.totalControles)*100).toFixed(1)}% du total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Infractions */}
        <div className="bg-white rounded-xl border-t-4 border-red-500 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-600 text-sm font-medium uppercase">INFRACTIONS</h3>
              </div>
              <div className="p-2 rounded-lg bg-red-100">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{formatNumber(currentData.stats.infractions)}</div>
            <div className="flex items-center gap-1 text-sm text-red-600 font-medium">
              {currentData.stats.infractionsEvolution} {currentData.stats.infractionsComparison}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>{((currentData.stats.infractions/currentData.stats.totalControles)*100).toFixed(1)}% du total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Avertissements */}
        <div className="bg-white rounded-xl border-t-4 border-yellow-500 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-600 text-sm font-medium uppercase">AVERTISSEMENTS</h3>
              </div>
              <div className="p-2 rounded-lg bg-yellow-100">
                <Bell className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{formatNumber(currentData.stats.avertissements)}</div>
            <div className="flex items-center gap-1 text-sm text-yellow-600 font-medium">
              {currentData.stats.avertissementsEvolution} {currentData.stats.avertissementsComparison}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>{((currentData.stats.avertissements/currentData.stats.totalControles)*100).toFixed(1)}% du total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenus */}
        <div className="bg-white rounded-xl border-t-4 border-purple-500 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-600 text-sm font-medium uppercase">REVENUS GÉNÉRÉS</h3>
              </div>
              <div className="p-2 rounded-lg bg-purple-100">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{currentData.stats.revenus}</div>
            <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
              {currentData.stats.revenusEvolution} {currentData.stats.revenusComparison}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <DollarSign className="w-3 h-3 text-purple-600" />
                <span>FCFA collectés</span>
              </div>
            </div>
          </div>
        </div>

        {/* Taux de conformité */}
        <div className="bg-white rounded-xl border-t-4 border-indigo-500 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-600 text-sm font-medium uppercase">TAUX DE CONFORMITÉ</h3>
              </div>
              <div className="p-2 rounded-lg bg-indigo-100">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{currentData.stats.tauxConformite}</div>
            <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
              {currentData.stats.tauxConformiteEvolution} {currentData.stats.tauxConformiteComparison}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Shield className="w-3 h-3 text-indigo-600" />
                <span>Véhicules conformes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Agents actifs */}
        <div className="bg-white rounded-xl border-t-4 border-orange-500 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-600 text-sm font-medium uppercase">AGENTS ACTIFS</h3>
              </div>
              <div className="p-2 rounded-lg bg-orange-100">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{currentData.stats.agentsActifs}</div>
            <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
              {currentData.stats.agentsEvolution}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Activity className="w-3 h-3 text-orange-600" />
                <span>Sur le terrain</span>
              </div>
            </div>
          </div>
        </div>

        {/* Moyenne par agent */}
        <div className="bg-white rounded-xl border-t-4 border-cyan-500 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-600 text-sm font-medium uppercase">MOYENNE PAR AGENT</h3>
              </div>
              <div className="p-2 rounded-lg bg-cyan-100">
                <Car className="w-5 h-5 text-cyan-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{currentData.stats.moyenneParAgent}</div>
            <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
              {currentData.stats.moyenneEvolution}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Target className="w-3 h-3 text-cyan-600" />
                <span>Contrôles/agent</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section principale avec graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique activité */}
        <Card className="lg:col-span-2">
          <CardBody className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Activité - {commissariatInfo.nom}
            </h3>
         
            
            <div className="h-80 w-full">
              {currentData.activityData && currentData.activityData.length > 0 ? (
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
                      formatter={(value) => {
                        if (value === 'controles') return 'Contrôles effectués';
                        if (value === 'infractions') return 'Infractions détectées';
                        return value;
                      }}
                    />
                    <Bar 
                      dataKey="controles" 
                      fill="#6B9FED" 
                      radius={[8, 8, 0, 0]}
                      maxBarSize={50}
                      name="Contrôles effectués"
                      isAnimationActive={false}
                    />
                    <Bar 
                      dataKey="infractions" 
                      fill="#F48686" 
                      radius={[8, 8, 0, 0]}
                      maxBarSize={50}
                      name="Infractions détectées"
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Chargement des données...</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Graphique camembert */}
        <Card>
          <CardBody className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Répartition des Statuts
            </h3>
            
            <div className="h-64 w-full">
              {currentData.pieData && currentData.pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentData.pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${(entry.percent * 100).toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
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
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Chargement des données...</p>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              {currentData.pieData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">{formatNumber(item.value)}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Top infractions */}
      <Card>
        <CardBody className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Top 5 Infractions - {commissariatInfo.nom}</h3>

          <div className="space-y-4">
            {currentData.topInfractions.map((infraction, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="font-bold text-gray-700">{index + 1}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{infraction.type}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">{formatNumber(infraction.nombre)} cas</span>
                      <span className="text-sm font-medium text-green-600">{infraction.evolution}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${infraction.pourcentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Performance des agents - Top 3 */}
      <Card>
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Performance des Agents - Top 3</h3>
            <Link href="/gestion/agents/listes">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Voir tous les agents
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentData.topAgents.length === 0 ? (
              <div className="col-span-3 text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Chargement des agents...</p>
              </div>
            ) : currentData.topAgents.map((agent, index) => (
              <Card
                key={agent.id || agent.matricule}
                className={`border-2 ${
                  agent.statut === 'excellent' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
                } relative`}
              >
                <CardBody className="p-6">
                  {agent.topPerformer && (
                    <div className="absolute -top-3 left-6">
                      <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        TOP PERFORMER
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4 mt-2">
                    <div>
                      <h4 className="font-bold text-lg flex items-center gap-2">
                        {agent.topPerformer ? (
                          <Trophy className="w-5 h-5 text-yellow-600" />
                        ) : agent.statut === 'excellent' ? (
                          <Star className="w-5 h-5 text-blue-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        )}
                        {agent.grade ? `${agent.grade} ` : ''}{agent.nom}
                      </h4>
                      <p className="text-sm text-gray-600">{agent.matricule}</p>
                      <p className="text-xs text-gray-500">Zone: {agent.zone}</p>
                    </div>
                    <span className={`${
                      agent.statut === 'excellent' ? 'bg-green-500' : 'bg-yellow-500'
                    } text-white px-3 py-1 rounded-full text-xs font-bold`}>
                      {agent.statut === 'excellent' ? 'EXCELLENT' : 'ATTENTION'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center mb-4">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">{agent.controles}</div>
                      <div className="text-xs text-gray-600">CONTRÔLES</div>
                    </div>
                    <div>
                      <div className={`text-3xl font-bold ${
                        agent.statut === 'excellent' ? 'text-green-600' : 'text-yellow-600'
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
                      <div className="font-bold text-red-600">{agent.infractions}</div>
                      <div className="text-gray-600">Infractions</div>
                    </div>
                    <div>
                      <div className="font-bold text-yellow-600">{agent.avertissements}</div>
                      <div className="text-gray-600">Avertissements</div>
                    </div>
                  </div>

                  <div className={`${
                    agent.statut === 'excellent' ? 'bg-green-100' : 'bg-yellow-100'
                  } rounded-lg p-3 mb-4`}>
                    <div className="text-sm">
                      <div className={`font-bold ${
                        agent.statut === 'excellent' ? 'text-green-800' : 'text-yellow-800'
                      }`}>
                        Revenus: {formatNumber(agent.revenus)} FCFA ({agent.revenusEvolution})
                      </div>
                      <div className={agent.statut === 'excellent' ? 'text-green-700' : 'text-yellow-700'}>
                        {agent.probleme ? agent.probleme : `Performance optimale`}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link href={`/gestion/agents/${agent.id}`} className="flex-1">
                      <Button className={`w-full ${
                        agent.statut === 'excellent'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-yellow-600 hover:bg-yellow-700'
                      } text-white`}>
                        {agent.statut === 'excellent' ? 'Détails' : 'Assister'}
                      </Button>
                    </Link>
                    <Link href={`/gestion/agents/${agent.id}`}>
                      <Button className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-300">
                        Contacter
                      </Button>
                    </Link>
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