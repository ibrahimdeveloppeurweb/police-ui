'use client'

import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, Users, Shield, AlertTriangle, Activity, DollarSign, Car, Building,
  CheckCircle, Clock, Zap, BarChart3, MapPin, Phone, Eye, RefreshCw, Download,
  ChevronDown, Award, Bell, Target, TrendingDown, AlertCircle, Star, Trophy,
  Wrench, CarFront, Calendar, Search, Printer, FileDown
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useAdminLayout } from '@/contexts/AdminLayoutContext'

export default function AdminDashboard() {
  const { setTitle, setSubtitle } = useAdminLayout()
  const [currentTime, setCurrentTime] = useState(new Date())
  type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('jour')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Données selon la période sélectionnée
  const dataByPeriod = {
    jour: {
      activityData: [
        { period: '00h-04h', controles: 145, infractions: 18, amendes: 95 },
        { period: '04h-08h', controles: 198, infractions: 27, amendes: 34 },
        { period: '08h-12h', controles: 312, infractions: 48, amendes: 15 },
        { period: '12h-16h', controles: 289, infractions: 45, amendes: 8 },
        { period: '16h-20h', controles: 234, infractions: 38, amendes: 89 },
        { period: '20h-24h', controles: 69, infractions: 13, amendes: 29 }
      ],
      stats: {
        controles: 1247,
        controlesEvolution: '+12.5%',
        controlesComparison: 'vs hier (1,108)',
        revenus: '8.7M',
        revenusEvolution: '+8.2%',
        revenusComparison: 'vs hier (8.04M)',
        agents: '289/342',
        agentsEvolution: '84.5% opérationnel (+3 vs hier)',
        alertes: 31,
        alertesEvolution: '+5 nouvelles alertes (48h)',
        performance: '92.3%',
        performanceEvolution: '+1.8% vs hier',
        conformite: '84.8%',
        conformiteEvolution: '+2.3% vs hier'
      },
      commissariats: [
        {
          nom: '3ème Arrondissement',
          lieu: 'Adjamé, Abidjan',
          code: 'COM-ABJ-003',
          controles: 47,
          agents: 23,
          performance: 97,
          revenus: '340,000',
          revenusEvolution: '+15.2%',
          efficacite: '2.04',
          statut: 'excellent',
          topPerformer: true
        },
        {
          nom: '5ème Arrondissement',
          lieu: 'Marcory, Abidjan',
          code: 'COM-ABJ-005',
          controles: 38,
          agents: 19,
          performance: 94,
          revenus: '285,000',
          revenusEvolution: '+8.7%',
          efficacite: '2.00',
          statut: 'excellent',
          topPerformer: false
        },
        {
          nom: '10ème Arrondissement',
          lieu: 'Abobo, Abidjan',
          code: 'COM-ABJ-010',
          controles: 12,
          agents: 8,
          performance: 67,
          revenus: '95,000',
          revenusEvolution: '-23.1%',
          efficacite: '1.50',
          statut: 'attention',
          topPerformer: false,
          probleme: '3 agents indisponibles'
        }
      ]
    },
    semaine: {
      activityData: [
        { period: 'Lun 23', controles: 1108, infractions: 167, amendes: 8.04 },
        { period: 'Mar 24', controles: 1186, infractions: 178, amendes: 8.23 },
        { period: 'Mer 25', controles: 1095, infractions: 142, amendes: 7.85 },
        { period: 'Jeu 26', controles: 1267, infractions: 201, amendes: 9.12 },
        { period: 'Ven 27', controles: 1334, infractions: 223, amendes: 9.45 },
        { period: 'Sam 28', controles: 1156, infractions: 174, amendes: 8.67 },
        { period: 'Dim 29', controles: 1247, infractions: 189, amendes: 8.7 }
      ],
      stats: {
        controles: 8393,
        controlesEvolution: '+8.7%',
        controlesComparison: 'vs semaine dernière (7,721)',
        revenus: '60.1M',
        revenusEvolution: '+11.3%',
        revenusComparison: 'vs semaine dernière (54.0M)',
        agents: '289/342',
        agentsEvolution: '84.5% opérationnel (+3 vs semaine)',
        alertes: 187,
        alertesEvolution: '+23 nouvelles alertes (7 jours)',
        performance: '92.3%',
        performanceEvolution: '+1.8% vs semaine dernière',
        conformite: '84.8%',
        conformiteEvolution: '+2.3% vs semaine dernière'
      },
      commissariats: [
        {
          nom: '3ème Arrondissement',
          lieu: 'Adjamé, Abidjan',
          code: 'COM-ABJ-003',
          controles: 328,
          agents: 23,
          performance: 96,
          revenus: '2.38M',
          revenusEvolution: '+18.5%',
          efficacite: '2.03',
          statut: 'excellent',
          topPerformer: true
        },
        {
          nom: '7ème Arrondissement',
          lieu: 'Treichville, Abidjan',
          code: 'COM-ABJ-007',
          controles: 312,
          agents: 21,
          performance: 93,
          revenus: '2.19M',
          revenusEvolution: '+12.3%',
          efficacite: '1.98',
          statut: 'excellent',
          topPerformer: false
        },
        {
          nom: '10ème Arrondissement',
          lieu: 'Abobo, Abidjan',
          code: 'COM-ABJ-010',
          controles: 84,
          agents: 8,
          performance: 69,
          revenus: '665,000',
          revenusEvolution: '-19.8%',
          efficacite: '1.50',
          statut: 'attention',
          topPerformer: false,
          probleme: 'Manque de personnel'
        }
      ]
    },
    mois: {
      activityData: [
        { period: 'Sem 1', controles: 7234, infractions: 1089, amendes: 52.3 },
        { period: 'Sem 2', controles: 7891, infractions: 1156, amendes: 56.8 },
        { period: 'Sem 3', controles: 8156, infractions: 1234, amendes: 59.4 },
        { period: 'Sem 4', controles: 8393, infractions: 1274, amendes: 60.1 }
      ],
      stats: {
        controles: 31674,
        controlesEvolution: '+5.2%',
        controlesComparison: 'vs mois dernier (30,104)',
        revenus: '228.6M',
        revenusEvolution: '+7.8%',
        revenusComparison: 'vs mois dernier (212.1M)',
        agents: '289/342',
        agentsEvolution: '84.5% opérationnel (+12 vs mois)',
        alertes: 743,
        alertesEvolution: '+89 nouvelles alertes (30 jours)',
        performance: '92.3%',
        performanceEvolution: '+3.1% vs mois dernier',
        conformite: '84.8%',
        conformiteEvolution: '+4.2% vs mois dernier'
      },
      commissariats: [
        {
          nom: '3ème Arrondissement',
          lieu: 'Adjamé, Abidjan',
          code: 'COM-ABJ-003',
          controles: 1410,
          agents: 23,
          performance: 95,
          revenus: '10.2M',
          revenusEvolution: '+16.7%',
          efficacite: '2.05',
          statut: 'excellent',
          topPerformer: true
        },
        {
          nom: '5ème Arrondissement',
          lieu: 'Marcory, Abidjan',
          code: 'COM-ABJ-005',
          controles: 1298,
          agents: 19,
          performance: 92,
          revenus: '9.1M',
          revenusEvolution: '+13.2%',
          efficacite: '1.99',
          statut: 'excellent',
          topPerformer: false
        },
        {
          nom: '12ème Arrondissement',
          lieu: 'Attécoubé, Abidjan',
          code: 'COM-ABJ-012',
          controles: 445,
          agents: 12,
          performance: 71,
          revenus: '2.8M',
          revenusEvolution: '-15.4%',
          efficacite: '1.55',
          statut: 'attention',
          topPerformer: false,
          probleme: 'Équipement insuffisant'
        }
      ]
    },
    annee: {
      activityData: [
        { period: 'Jan', controles: 28450, infractions: 4267, amendes: 205.4 },
        { period: 'Fév', controles: 26890, infractions: 4012, amendes: 193.2 },
        { period: 'Mar', controles: 30234, infractions: 4589, amendes: 220.8 },
        { period: 'Avr', controles: 29567, infractions: 4421, amendes: 212.9 },
        { period: 'Mai', controles: 31245, infractions: 4734, amendes: 227.8 },
        { period: 'Juin', controles: 30891, infractions: 4678, amendes: 225.1 },
        { period: 'Juil', controles: 32156, infractions: 4867, amendes: 234.2 },
        { period: 'Août', controles: 31789, infractions: 4812, amendes: 231.5 },
        { period: 'Sep', controles: 30456, infractions: 4601, amendes: 221.4 },
        { period: 'Oct', controles: 31674, infractions: 4789, amendes: 230.5 }
      ],
      stats: {
        controles: 303352,
        controlesEvolution: '+6.8%',
        controlesComparison: 'vs année dernière (284,031)',
        revenus: '2.2Mrd',
        revenusEvolution: '+9.2%',
        revenusComparison: 'vs année dernière (2.0Mrd)',
        agents: '289/342',
        agentsEvolution: '84.5% opérationnel (+45 vs année)',
        alertes: 8234,
        alertesEvolution: '+987 nouvelles alertes (12 mois)',
        performance: '92.3%',
        performanceEvolution: '+5.7% vs année dernière',
        conformite: '84.8%',
        conformiteEvolution: '+8.3% vs année dernière'
      },
      commissariats: [
        {
          nom: '3ème Arrondissement',
          lieu: 'Adjamé, Abidjan',
          code: 'COM-ABJ-003',
          controles: 14320,
          agents: 23,
          performance: 94,
          revenus: '122.5M',
          revenusEvolution: '+19.8%',
          efficacite: '2.08',
          statut: 'excellent',
          topPerformer: true
        },
        {
          nom: '7ème Arrondissement',
          lieu: 'Treichville, Abidjan',
          code: 'COM-ABJ-007',
          controles: 13890,
          agents: 21,
          performance: 91,
          revenus: '115.7M',
          revenusEvolution: '+15.3%',
          efficacite: '2.01',
          statut: 'excellent',
          topPerformer: false
        },
        {
          nom: '15ème Arrondissement',
          lieu: 'Port-Bouët, Abidjan',
          code: 'COM-ABJ-015',
          controles: 7234,
          agents: 14,
          performance: 73,
          revenus: '48.9M',
          revenusEvolution: '-8.7%',
          efficacite: '1.68',
          statut: 'attention',
          topPerformer: false,
          probleme: 'Zone difficile d\'accès'
        }
      ]
    },
    tout: {
      activityData: [
        { period: '2020', controles: 245678, infractions: 36851, amendes: 1.77 },
        { period: '2021', controles: 268934, infractions: 40340, amendes: 1.94 },
        { period: '2022', controles: 284031, infractions: 42604, amendes: 2.05 },
        { period: '2023', controles: 296845, infractions: 44526, amendes: 2.14 },
        { period: '2024', controles: 303352, infractions: 45502, amendes: 2.19 }
      ],
      stats: {
        controles: 1398840,
        controlesEvolution: '+23.5%',
        controlesComparison: 'depuis 2020',
        revenus: '10.1Mrd',
        revenusEvolution: '+23.7%',
        revenusComparison: 'depuis 2020',
        agents: '289/342',
        agentsEvolution: '84.5% opérationnel (+97 depuis 2020)',
        alertes: 42156,
        alertesEvolution: '+12,345 alertes (historique)',
        performance: '92.3%',
        performanceEvolution: '+18.2% depuis 2020',
        conformite: '84.8%',
        conformiteEvolution: '+15.6% depuis 2020'
      },
      commissariats: [
        {
          nom: '3ème Arrondissement',
          lieu: 'Adjamé, Abidjan',
          code: 'COM-ABJ-003',
          controles: 68945,
          agents: 23,
          performance: 93,
          revenus: '567.8M',
          revenusEvolution: '+28.4%',
          efficacite: '2.12',
          statut: 'excellent',
          topPerformer: true
        },
        {
          nom: '5ème Arrondissement',
          lieu: 'Marcory, Abidjan',
          code: 'COM-ABJ-005',
          controles: 64128,
          agents: 19,
          performance: 90,
          revenus: '523.6M',
          revenusEvolution: '+24.9%',
          efficacite: '2.05',
          statut: 'excellent',
          topPerformer: false
        },
        {
          nom: '18ème Arrondissement',
          lieu: 'Yopougon, Abidjan',
          code: 'COM-ABJ-018',
          controles: 42567,
          agents: 16,
          performance: 76,
          revenus: '312.4M',
          revenusEvolution: '+12.1%',
          efficacite: '1.78',
          statut: 'attention',
          topPerformer: false,
          probleme: 'Zone étendue'
        }
      ]
    },
    personnalise: {
      activityData: [
        { period: '10/10', controles: 1123, infractions: 169, amendes: 8.12 },
        { period: '11/10', controles: 1201, infractions: 182, amendes: 8.76 },
        { period: '12/10', controles: 1089, infractions: 145, amendes: 7.92 },
        { period: '13/10', controles: 1278, infractions: 203, amendes: 9.21 },
        { period: '14/10', controles: 1345, infractions: 228, amendes: 9.58 }
      ],
      stats: {
        controles: 6036,
        controlesEvolution: '+9.8%',
        controlesComparison: 'période personnalisée',
        revenus: '43.6M',
        revenusEvolution: '+10.2%',
        revenusComparison: 'période personnalisée',
        agents: '289/342',
        agentsEvolution: '84.5% opérationnel',
        alertes: 127,
        alertesEvolution: 'période personnalisée',
        performance: '92.3%',
        performanceEvolution: 'période personnalisée',
        conformite: '84.8%',
        conformiteEvolution: 'période personnalisée'
      },
      commissariats: [
        {
          nom: '3ème Arrondissement',
          lieu: 'Adjamé, Abidjan',
          code: 'COM-ABJ-003',
          controles: 226,
          agents: 23,
          performance: 96,
          revenus: '1.64M',
          revenusEvolution: '+17.2%',
          efficacite: '2.04',
          statut: 'excellent',
          topPerformer: true
        },
        {
          nom: '5ème Arrondissement',
          lieu: 'Marcory, Abidjan',
          code: 'COM-ABJ-005',
          controles: 198,
          agents: 19,
          performance: 93,
          revenus: '1.42M',
          revenusEvolution: '+11.8%',
          efficacite: '1.99',
          statut: 'excellent',
          topPerformer: false
        },
        {
          nom: '10ème Arrondissement',
          lieu: 'Abobo, Abidjan',
          code: 'COM-ABJ-010',
          controles: 58,
          agents: 8,
          performance: 68,
          revenus: '475,000',
          revenusEvolution: '-21.5%',
          efficacite: '1.51',
          statut: 'attention',
          topPerformer: false,
          probleme: '3 agents indisponibles'
        }
      ]
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
    // Définir le titre et sous-titre pour le header
    setTitle("Tableau de Bord")
    setSubtitle("Administration Centrale - Vue d'ensemble des opérations")
    
    setIsMounted(true)
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [setTitle, setSubtitle])

  if (!isMounted) {
    return null
  }

  return (
    <div className="min-h-screen  space-y-6">
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

      {/* Centre de crise national */}
      <Card className="bg-red-50 border-2 border-red-200">
        <CardBody className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              <div>
                <h2 className="text-xl font-bold text-red-700 flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  CENTRE DE CRISE NATIONAL
                </h2>
                <p className="text-red-600 font-medium">2 situations critiques nécessitent une attention immédiate</p>
              </div>
            </div>
            <Button className="bg-red-600 hover:bg-red-700 text-white border-red-600">
              Activer Centre de Crise
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Statistiques principales - 6 cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Contrôles nationaux */}
        <Card className="border-t-4 border-orange-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-600 text-sm font-medium">CONTRÔLES NATIONAUX</h3>
                <h4 className="text-gray-600 text-sm">
                  ({isCustomDateRange ? 'PERSONNALISÉ' : globalFilter === 'jour' ? '24H' : globalFilter.toUpperCase()})
                </h4>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Car className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats.controles.toLocaleString()}</div>
            <div className="text-green-600 text-sm font-bold mb-4">{currentData.stats.controlesEvolution} {currentData.stats.controlesComparison}</div>
            
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>23 commissariats actifs • 342 agents déployés</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Performance: {currentData.stats.performance} atteint</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Revenus nationaux */}
        <Card className="border-t-4 border-green-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-600 text-sm font-medium">REVENUS NATIONAUX</h3>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats.revenus}</div>
            <div className="text-green-600 text-sm font-bold mb-4">{currentData.stats.revenusEvolution} {currentData.stats.revenusComparison}</div>
            
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <DollarSign className="w-3 h-3 text-green-600" />
                <span>FCFA collectés</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-3 h-3 text-blue-600" />
                <span>Moyenne infractions • Évolution constante</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Agents opérationnels */}
        <Card className="border-t-4 border-blue-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-600 text-sm font-medium">AGENTS OPÉRATIONNELS</h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats.agents}</div>
            <div className="text-green-600 text-sm font-bold mb-4">{currentData.stats.agentsEvolution}</div>
            
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>En service: 289 • </span>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Pause: 32 • </span>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Indisponible: 21</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-blue-600" />
                <span>Répartition géographique optimisée</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Alertes sécuritaires */}
        <Card className="border-t-4 border-red-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-600 text-sm font-medium">ALERTES SÉCURITAIRES</h3>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats.alertes.toLocaleString()}</div>
            <div className="text-red-600 text-sm font-bold mb-4">{currentData.stats.alertesEvolution}</div>
            
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Critiques: 7 • </span>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Importantes: 15 • </span>
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span>Standard: 9</span>
              </div>
              <div className="flex items-center gap-2">
                <CarFront className="w-3 h-3 text-red-600" />
                <span>Véhicules volés et avis de recherche</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Performance globale */}
        <Card className="border-t-4 border-purple-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-600 text-sm font-medium">PERFORMANCE GLOBALE</h3>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats.performance}</div>
            <div className="text-green-600 text-sm font-bold mb-4">{currentData.stats.performanceEvolution}</div>
            
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Star className="w-3 h-3 text-yellow-600" />
                <span>Efficacité opérationnelle exceptionnelle</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-3 h-3 text-yellow-600" />
                <span>Top 3 commissariats: 3ème (97%), 5ème (94%), 7ème (93%)</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Taux de conformité */}
        <Card className="border-t-4 border-yellow-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-600 text-sm font-medium">TAUX DE CONFORMITÉ</h3>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats.conformite}</div>
            <div className="text-green-600 text-sm font-bold mb-4">{currentData.stats.conformiteEvolution}</div>
            
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Véhicules conformes sur période analysée</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-yellow-600" />
                <span>Principales non-conformités: Éclairage (34%), Assurance (28%)</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Section principale avec graphique et actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique activité nationale */}
        <Card className="lg:col-span-2">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Activité Nationale - {
                  isCustomDateRange ? `${dateDebut} au ${dateFin}` :
                  globalFilter === 'jour' ? 'Aujourd\'hui' : 
                  globalFilter === 'semaine' ? '7 Derniers Jours' : 
                  globalFilter === 'mois' ? 'Ce Mois' : 
                  globalFilter === 'annee' ? 'Cette Année' : 
                  'Historique Complet'
                }
              </h3>
              <div className="flex items-center gap-4">
               
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Exporter
                </Button>
              </div>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={currentData.activityData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="period" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                  />
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
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="infractions" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    name="Infractions"
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amendes" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name={globalFilter === 'tout' ? "Amendes (Mrd FCFA)" : "Amendes (M FCFA)"}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Actions rapides et activités critiques */}
        <div className="space-y-6">

          {/* Activités critiques récentes */}
          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Activités Critiques Récentes</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-2 animate-pulse"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-600" />
                      <span className="font-bold text-red-700">Véhicule volé intercepté</span>
                    </div>
                    <p className="text-sm text-gray-600">AB-789-EF • 3ème Arrondissement • Agent KOUASSI</p>
                    <p className="text-xs text-gray-400 mt-1">2min</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-blue-700">Pic d'activité détecté</span>
                    </div>
                    <p className="text-sm text-gray-600">+23% contrôles • Zone Centre Abidjan</p>
                    <p className="text-xs text-gray-400 mt-1">5min</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="font-bold text-green-700">Renfort déployé</span>
                    </div>
                    <p className="text-sm text-gray-600">5 agents • 10ème Arrondissement • ETA 15min</p>
                    <p className="text-xs text-gray-400 mt-1">8min</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Performance des commissariats - Top 3 */}
      <Card>
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Performance des Commissariats - Top 3</h3>
            <div className="flex items-center gap-4">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Exporter Rapport
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentData.commissariats.map((commissariat, index) => (
              <Card 
                key={commissariat.code}
                className={`border-2 ${
                  commissariat.statut === 'excellent' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
                } relative`}
              >
                <CardBody className="p-6">
                  {commissariat.topPerformer && (
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
                        {commissariat.topPerformer ? (
                          <Trophy className="w-5 h-5 text-yellow-600" />
                        ) : commissariat.statut === 'excellent' ? (
                          <Users className="w-5 h-5 text-blue-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        )}
                        {commissariat.nom}
                      </h4>
                      <p className="text-sm text-gray-600">{commissariat.lieu} • {commissariat.code}</p>
                    </div>
                    <span className={`${
                      commissariat.statut === 'excellent' ? 'bg-green-500' : 'bg-yellow-500'
                    } text-white px-3 py-1 rounded-full text-xs font-bold`}>
                      {commissariat.statut === 'excellent' ? 'EXCELLENT' : 'ATTENTION'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center mb-4">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">{commissariat.controles}</div>
                      <div className="text-xs text-gray-600">CONTRÔLES</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900">{commissariat.agents}</div>
                      <div className="text-xs text-gray-600">AGENTS</div>
                    </div>
                    <div>
                      <div className={`text-3xl font-bold ${
                        commissariat.statut === 'excellent' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {commissariat.performance}%
                      </div>
                      <div className="text-xs text-gray-600">PERFORMANCE</div>
                    </div>
                  </div>

                  <div className={`${
                    commissariat.statut === 'excellent' ? 'bg-green-100' : 'bg-yellow-100'
                  } rounded-lg p-3 mb-4`}>
                    <div className="text-sm">
                      <div className={`font-bold ${
                        commissariat.statut === 'excellent' ? 'text-green-800' : 'text-yellow-800'
                      }`}>
                        Revenus: {commissariat.revenus} FCFA ({commissariat.revenusEvolution})
                      </div>
                      <div className={commissariat.statut === 'excellent' ? 'text-green-700' : 'text-yellow-700'}>
                        {commissariat.probleme ? commissariat.probleme : `Efficacité: ${commissariat.efficacite} contrôles/agent/heure`}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button className={`flex-1 ${
                      commissariat.statut === 'excellent' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-yellow-600 hover:bg-yellow-700'
                    } text-white`}>
                      {commissariat.statut === 'excellent' ? 'Superviser' : 'Assister'}
                    </Button>
                    <Button className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-300">
                      {commissariat.statut === 'excellent' ? 'Contacter' : 'Renfort'}
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

function setIsCustomDateRange(arg0: boolean) {
  throw new Error('Function not implemented.')
}
