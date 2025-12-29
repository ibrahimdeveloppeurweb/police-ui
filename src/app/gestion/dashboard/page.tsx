'use client'

import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, Users, Shield, AlertTriangle, Activity, DollarSign, Car, Building,
  CheckCircle, Clock, Zap, BarChart3, MapPin, Phone, Eye, RefreshCw, Download,
  ChevronDown, Award, Bell, Target, TrendingDown, AlertCircle, Star, Trophy,
  Wrench, CarFront, Calendar, Search, Printer, FileDown, User, Navigation
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function CommissariatDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'personnalise'
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('jour')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Informations du commissariat
  const commissariatInfo = {
    nom: '3ème Arrondissement',
    lieu: 'Adjamé, Abidjan',
    code: 'COM-ABJ-003',
    responsable: 'Commissaire KOUADIO Jean-Paul',
    telephone: '+225 27 20 12 34 56',
    adresse: 'Boulevard Nangui Abrogoua, Adjamé'
  }

  // Données selon la période sélectionnée
  const dataByPeriod = {
    jour: {
      activityData: [
        { period: '00h-04h', controles: 8, infractions: 1, amendes: 45000 },
        { period: '04h-08h', controles: 12, infractions: 2, amendes: 89000 },
        { period: '08h-12h', controles: 18, infractions: 3, amendes: 142000 },
        { period: '12h-16h', controles: 15, infractions: 2, amendes: 98000 },
        { period: '16h-20h', controles: 11, infractions: 2, amendes: 87000 },
        { period: '20h-24h', controles: 6, infractions: 1, amendes: 38000 }
      ],
      agentPerformance: [
        { nom: 'KOUASSI', controles: 12, infractions: 3, statut: 'actif' },
        { nom: 'TRAORE', controles: 11, infractions: 2, statut: 'actif' },
        { nom: 'YAO', controles: 9, infractions: 2, statut: 'actif' },
        { nom: 'KONE', controles: 8, infractions: 1, statut: 'actif' },
        { nom: 'DIABATE', controles: 7, infractions: 1, statut: 'pause' }
      ],
      stats: {
        controles: 70,
        controlesEvolution: '+15.2%',
        controlesComparison: 'vs hier (61)',
        revenus: '499K',
        revenusEvolution: '+12.8%',
        revenusComparison: 'vs hier (442K)',
        agents: '19/23',
        agentsEvolution: '82.6% opérationnel',
        alertes: 3,
        alertesEvolution: '+1 depuis hier',
        performance: '97%',
        performanceEvolution: '+2% vs hier',
        infractions: 11,
        infractionsRate: '15.7%'
      }
    },
    semaine: {
      activityData: [
        { period: 'Lun', controles: 61, infractions: 9, amendes: 442000 },
        { period: 'Mar', controles: 68, infractions: 11, amendes: 478000 },
        { period: 'Mer', controles: 59, infractions: 8, amendes: 405000 },
        { period: 'Jeu', controles: 72, infractions: 12, amendes: 523000 },
        { period: 'Ven', controles: 76, infractions: 13, amendes: 567000 },
        { period: 'Sam', controles: 65, infractions: 10, amendes: 489000 },
        { period: 'Dim', controles: 70, infractions: 11, amendes: 499000 }
      ],
      agentPerformance: [
        { nom: 'KOUASSI', controles: 87, infractions: 18, statut: 'actif' },
        { nom: 'TRAORE', controles: 79, infractions: 15, statut: 'actif' },
        { nom: 'YAO', controles: 71, infractions: 12, statut: 'actif' },
        { nom: 'KONE', controles: 68, infractions: 11, statut: 'actif' },
        { nom: 'DIABATE', controles: 66, infractions: 10, statut: 'actif' }
      ],
      stats: {
        controles: 471,
        controlesEvolution: '+18.5%',
        controlesComparison: 'vs semaine dernière (397)',
        revenus: '3.4M',
        revenusEvolution: '+16.2%',
        revenusComparison: 'vs semaine dernière (2.9M)',
        agents: '19/23',
        agentsEvolution: '82.6% opérationnel',
        alertes: 18,
        alertesEvolution: '+5 cette semaine',
        performance: '96%',
        performanceEvolution: '+3% vs semaine',
        infractions: 74,
        infractionsRate: '15.7%'
      }
    },
    mois: {
      activityData: [
        { period: 'Sem 1', controles: 389, infractions: 58, amendes: 2800000 },
        { period: 'Sem 2', controles: 412, infractions: 64, amendes: 3100000 },
        { period: 'Sem 3', controles: 438, infractions: 69, amendes: 3350000 },
        { period: 'Sem 4', controles: 471, infractions: 74, amendes: 3403000 }
      ],
      agentPerformance: [
        { nom: 'KOUASSI', controles: 348, infractions: 72, statut: 'actif' },
        { nom: 'TRAORE', controles: 329, infractions: 65, statut: 'actif' },
        { nom: 'YAO', controles: 298, infractions: 56, statut: 'actif' },
        { nom: 'KONE', controles: 287, infractions: 51, statut: 'actif' },
        { nom: 'DIABATE', controles: 268, infractions: 48, statut: 'actif' }
      ],
      stats: {
        controles: 1710,
        controlesEvolution: '+16.7%',
        controlesComparison: 'vs mois dernier (1465)',
        revenus: '12.7M',
        revenusEvolution: '+18.9%',
        revenusComparison: 'vs mois dernier (10.7M)',
        agents: '19/23',
        agentsEvolution: '82.6% opérationnel',
        alertes: 67,
        alertesEvolution: '+12 ce mois',
        performance: '95%',
        performanceEvolution: '+4% vs mois',
        infractions: 265,
        infractionsRate: '15.5%'
      }
    },
    annee: {
      activityData: [
        { period: 'Jan', controles: 1523, infractions: 234, amendes: 11200000 },
        { period: 'Fév', controles: 1398, infractions: 215, amendes: 10300000 },
        { period: 'Mar', controles: 1654, infractions: 258, amendes: 12400000 },
        { period: 'Avr', controles: 1587, infractions: 245, amendes: 11900000 },
        { period: 'Mai', controles: 1689, infractions: 267, amendes: 12800000 },
        { period: 'Juin', controles: 1645, infractions: 261, amendes: 12500000 },
        { period: 'Juil', controles: 1734, infractions: 276, amendes: 13200000 },
        { period: 'Août', controles: 1698, infractions: 271, amendes: 12900000 },
        { period: 'Sep', controles: 1621, infractions: 259, amendes: 12400000 },
        { period: 'Oct', controles: 1710, infractions: 265, amendes: 12653000 }
      ],
      agentPerformance: [
        { nom: 'KOUASSI', controles: 3287, infractions: 678, statut: 'actif' },
        { nom: 'TRAORE', controles: 3104, infractions: 621, statut: 'actif' },
        { nom: 'YAO', controles: 2891, infractions: 567, statut: 'actif' },
        { nom: 'KONE', controles: 2756, infractions: 534, statut: 'actif' },
        { nom: 'DIABATE', controles: 2621, infractions: 501, statut: 'actif' }
      ],
      stats: {
        controles: 16259,
        controlesEvolution: '+19.8%',
        controlesComparison: 'vs année dernière (13575)',
        revenus: '122.5M',
        revenusEvolution: '+21.3%',
        revenusComparison: 'vs année dernière (101.0M)',
        agents: '19/23',
        agentsEvolution: '82.6% opérationnel',
        alertes: 723,
        alertesEvolution: '+89 cette année',
        performance: '94%',
        performanceEvolution: '+6% vs année',
        infractions: 2551,
        infractionsRate: '15.7%'
      }
    },
    personnalise: {
      activityData: [
        { period: '10/10', controles: 64, infractions: 10, amendes: 456000 },
        { period: '11/10', controles: 69, infractions: 11, amendes: 489000 },
        { period: '12/10', controles: 58, infractions: 8, amendes: 412000 },
        { period: '13/10', controles: 73, infractions: 12, amendes: 534000 },
        { period: '14/10', controles: 77, infractions: 13, amendes: 567000 }
      ],
      agentPerformance: [
        { nom: 'KOUASSI', controles: 63, infractions: 13, statut: 'actif' },
        { nom: 'TRAORE', controles: 58, infractions: 11, statut: 'actif' },
        { nom: 'YAO', controles: 52, infractions: 9, statut: 'actif' },
        { nom: 'KONE', controles: 49, infractions: 8, statut: 'actif' },
        { nom: 'DIABATE', controles: 47, infractions: 7, statut: 'actif' }
      ],
      stats: {
        controles: 341,
        controlesEvolution: '+17.2%',
        controlesComparison: 'période personnalisée',
        revenus: '2.5M',
        revenusEvolution: '+15.8%',
        revenusComparison: 'période personnalisée',
        agents: '19/23',
        agentsEvolution: '82.6% opérationnel',
        alertes: 13,
        alertesEvolution: 'période personnalisée',
        performance: '96%',
        performanceEvolution: 'période personnalisée',
        infractions: 54,
        infractionsRate: '15.8%'
      }
    }
  }

  const currentData = isCustomDateRange ? dataByPeriod.personnalise : dataByPeriod[globalFilter]

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
                  <p className="text-gray-600 text-xs md:text-sm hidden sm:block">Sélectionnez la période pour filtrer toutes les données du dashboard</p>
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
    
      {/* Statistiques principales - 6 cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Contrôles effectués */}
        <Card className="bg-white  border-t-4 border-t-orange-500    hover:shadow-lg transition-all duration-300">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">CONTRÔLES EFFECTUÉS</h3>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Car className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">{currentData.stats.controles}</div>
            <div className="text-green-600 text-sm font-bold mb-3">{currentData.stats.controlesEvolution} {currentData.stats.controlesComparison}</div>
            <div className="text-xs text-gray-600">
              {currentData.stats.agents} agents déployés
            </div>
          </CardBody>
        </Card>

        {/* Infractions détectées */}
        <Card className="bg-white rounded-xl border-t-4 border-t-red-500  hover:shadow-lg transition-all duration-300">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">INFRACTIONS DÉTECTÉES</h3>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">{currentData.stats.infractions}</div>
            <div className="text-blue-600 text-sm font-bold mb-3">Taux: {currentData.stats.infractionsRate}</div>
            <div className="text-xs text-gray-600">
              {currentData.stats.infractionsRate} des contrôles
            </div>
          </CardBody>
        </Card>

        {/* Revenus collectés */}
        <Card className="bg-white rounded-xl border-t-4 border-t-green-500  hover:shadow-lg transition-all duration-300">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">REVENUS COLLECTÉS</h3>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">{currentData.stats.revenus}</div>
            <div className="text-green-600 text-sm font-bold mb-3">{currentData.stats.revenusEvolution} {currentData.stats.revenusComparison}</div>
            <div className="text-xs text-gray-600">
              FCFA en amendes
            </div>
          </CardBody>
        </Card>

        {/* Agents opérationnels */}
        <Card className="bg-white rounded-xl border-t-4 border-t-blue-500  hover:shadow-lg transition-all duration-300">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">AGENTS OPÉRATIONNELS</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">{currentData.stats.agents}</div>
            <div className="text-blue-600 text-sm font-bold mb-3">{currentData.stats.agentsEvolution}</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Actifs: 19</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Pause: 2</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Indisponibles: 2</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Performance */}
        <Card className="bg-white rounded-xl border-t-4 border-t-purple-500  hover:shadow-lg transition-all duration-300">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">PERFORMANCE</h3>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">{currentData.stats.performance}</div>
            <div className="text-green-600 text-sm font-bold mb-3">{currentData.stats.performanceEvolution}</div>
            <div className="text-xs text-gray-600">
              Efficacité opérationnelle
            </div>
          </CardBody>
        </Card>

        {/* Alertes actives */}
        <Card className="bg-white rounded-xl border-t-4 border-t-yellow-500  hover:shadow-lg transition-all duration-300">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">ALERTES ACTIVES</h3>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">{currentData.stats.alertes}</div>
            <div className="text-yellow-600 text-sm font-bold mb-3">{currentData.stats.alertesEvolution}</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Critiques: 1</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Importantes: 2</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique activité */}
        <Card>
          <CardBody className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Activité - {
                isCustomDateRange ? `${dateDebut} au ${dateFin}` :
                globalFilter === 'jour' ? 'Aujourd\'hui' : 
                globalFilter === 'semaine' ? '7 Derniers Jours' : 
                globalFilter === 'mois' ? 'Ce Mois' : 
                'Cette Année'
              }
            </h3>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentData.activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="period" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="controles" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="Contrôles"
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="infractions" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    name="Infractions"
                    dot={{ fill: '#ef4444', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Performance des agents */}
        <Card>
          <CardBody className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Performance des Agents</h3>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentData.agentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="nom" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="controles" fill="#3b82f6" name="Contrôles" />
                  <Bar dataKey="infractions" fill="#ef4444" name="Infractions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Liste détaillée des agents */}
      <Card>
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Équipe du Commissariat</h3>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Voir Planning
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Agent</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Contrôles</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Infractions</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Taux</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Statut</th>
                </tr>
              </thead>
              <tbody>
                {currentData.agentPerformance.map((agent, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Agent {agent.nom}</div>
                          <div className="text-xs text-gray-500">Matricule: ABJ-{index + 1}23</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-2xl font-bold text-blue-600">{agent.controles}</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-2xl font-bold text-red-600">{agent.infractions}</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-lg font-semibold text-gray-700">
                        {((agent.infractions / agent.controles) * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        agent.statut === 'actif' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {agent.statut === 'actif' ? 'EN SERVICE' : 'PAUSE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Alertes récentes */}
       <Card>
        <CardBody className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Alertes Récentes</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="w-3 h-3 bg-red-500 rounded-full mt-2 animate-pulse"></div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-600" />
                  <span className="font-bold text-red-700">ALERTE CRITIQUE</span>
                </div>
                <p className="text-sm text-gray-800 mt-1">Véhicule volé correspondant à AB-789-EF détecté</p>
                <p className="text-xs text-gray-600 mt-2">Agent KOUASSI • Il y a 15 minutes</p>
              </div>
              <Button className="bg-red-600 hover:bg-red-700 text-white text-sm">
                Intervenir
              </Button>
            </div>

            <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="font-bold text-yellow-700">Infraction grave</span>
                </div>
                <p className="text-sm text-gray-800 mt-1">Conduite en état d'ivresse - Taux 1.2g/L</p>
                <p className="text-xs text-gray-600 mt-2">Agent TRAORE • Il y a 1 heure</p>
              </div>
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm">
                Suivre
              </Button>
            </div>

          </div>
        </CardBody>
      </Card>
    </div>
  )
}