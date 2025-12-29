'use client'

import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, Wrench, Shield, AlertTriangle, Activity, DollarSign, CheckCircle, XCircle,
  Users, BarChart3, Award, Star, Trophy, Calendar, Search, Printer, FileDown, MapPin, 
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'

export default function InspectionsDashboard() {
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
        { period: '00h-04h', inspections: 12, conformes: 6, nonConformes: 4, defautsMineurs: 2 },
        { period: '04h-08h', inspections: 28, conformes: 14, nonConformes: 10, defautsMineurs: 4 },
        { period: '08h-12h', inspections: 124, conformes: 62, nonConformes: 45, defautsMineurs: 17 },
        { period: '12h-16h', inspections: 156, conformes: 78, nonConformes: 56, defautsMineurs: 22 },
        { period: '16h-20h', inspections: 89, conformes: 45, nonConformes: 32, defautsMineurs: 12 },
        { period: '20h-24h', inspections: 23, conformes: 13, nonConformes: 9, defautsMineurs: 1 }
      ],
      pieData: [
        { name: 'Conformes', value: 218, color: '#10b981' },
        { name: 'Non-Conformes', value: 156, color: '#ef4444' },
        { name: 'Défauts Mineurs', value: 58, color: '#f59e0b' }
      ],
      infractions: [
        { type: 'Éclairage', nombre: 45 },
        { type: 'Freinage', nombre: 38 },
        { type: 'Assurance', nombre: 29 },
        { type: 'Pneumatiques', nombre: 23 },
        { type: 'Direction', nombre: 18 }
      ],
      stats: {
        totalInspections: 432,
        inspectionsEvolution: '+8.3%',
        inspectionsComparison: 'vs hier',
        conformes: 218,
        conformesEvolution: '+6.5%',
        conformesComparison: 'vs hier',
        nonConformes: 156,
        nonConformesEvolution: '+11.4%',
        nonConformesComparison: 'vs hier',
        defautsMineurs: 58,
        defautsEvolution: '+7.4%',
        defautsComparison: 'vs hier',
        revenus: '3.75M',
        revenusEvolution: '+12.1%',
        revenusComparison: 'vs hier',
        tauxConformite: '50.5%',
        tauxEvolution: '+3.2%',
        tauxComparison: 'vs hier',
        centresActifs: '12/15',
        centresEvolution: '80% opérationnel',
        moyenneParCentre: '36',
        moyenneEvolution: '+2.1 vs hier'
      }
    },
    semaine: {
      activityData: [
        { period: 'Lun', inspections: 399, conformes: 205, nonConformes: 140, defautsMineurs: 54 },
        { period: 'Mar', inspections: 423, conformes: 218, nonConformes: 148, defautsMineurs: 57 },
        { period: 'Mer', inspections: 387, conformes: 198, nonConformes: 136, defautsMineurs: 53 },
        { period: 'Jeu', inspections: 445, conformes: 229, nonConformes: 155, defautsMineurs: 61 },
        { period: 'Ven', inspections: 467, conformes: 240, nonConformes: 163, defautsMineurs: 64 },
        { period: 'Sam', inspections: 412, conformes: 211, nonConformes: 146, defautsMineurs: 55 },
        { period: 'Dim', inspections: 432, conformes: 218, nonConformes: 156, defautsMineurs: 58 }
      ],
      pieData: [
        { name: 'Conformes', value: 1519, color: '#10b981' },
        { name: 'Non-Conformes', value: 1044, color: '#ef4444' },
        { name: 'Défauts Mineurs', value: 402, color: '#f59e0b' }
      ],
      infractions: [
        { type: 'Éclairage', nombre: 312 },
        { type: 'Freinage', nombre: 267 },
        { type: 'Assurance', nombre: 201 },
        { type: 'Pneumatiques', nombre: 158 },
        { type: 'Direction', nombre: 106 }
      ],
      stats: {
        totalInspections: 2965,
        inspectionsEvolution: '+7.8%',
        inspectionsComparison: 'vs semaine dernière',
        conformes: 1519,
        conformesEvolution: '+6.2%',
        conformesComparison: 'vs semaine dernière',
        nonConformes: 1044,
        nonConformesEvolution: '+10.5%',
        nonConformesComparison: 'vs semaine dernière',
        defautsMineurs: 402,
        defautsEvolution: '+8.1%',
        defautsComparison: 'vs semaine dernière',
        revenus: '25.8M',
        revenusEvolution: '+11.3%',
        revenusComparison: 'vs semaine dernière',
        tauxConformite: '51.2%',
        tauxEvolution: '+2.8%',
        tauxComparison: 'vs semaine dernière',
        centresActifs: '12/15',
        centresEvolution: '80% opérationnel',
        moyenneParCentre: '247',
        moyenneEvolution: '+15 vs semaine dernière'
      }
    },
    mois: {
      activityData: [
        { period: 'Sem 1', inspections: 2567, conformes: 1311, nonConformes: 923, defautsMineurs: 333 },
        { period: 'Sem 2', inspections: 2789, conformes: 1425, nonConformes: 1001, defautsMineurs: 363 },
        { period: 'Sem 3', inspections: 2890, conformes: 1476, nonConformes: 1034, defautsMineurs: 380 },
        { period: 'Sem 4', inspections: 2965, conformes: 1519, nonConformes: 1086, defautsMineurs: 360 }
      ],
      pieData: [
        { name: 'Conformes', value: 5731, color: '#10b981' },
        { name: 'Non-Conformes', value: 4044, color: '#ef4444' },
        { name: 'Défauts Mineurs', value: 1436, color: '#f59e0b' }
      ],
      infractions: [
        { type: 'Éclairage', nombre: 1215 },
        { type: 'Freinage', nombre: 1052 },
        { type: 'Assurance', nombre: 789 },
        { type: 'Pneumatiques', nombre: 623 },
        { type: 'Direction', nombre: 365 }
      ],
      stats: {
        totalInspections: 11211,
        inspectionsEvolution: '+6.5%',
        inspectionsComparison: 'vs mois dernier',
        conformes: 5731,
        conformesEvolution: '+5.8%',
        conformesComparison: 'vs mois dernier',
        nonConformes: 4044,
        nonConformesEvolution: '+9.2%',
        nonConformesComparison: 'vs mois dernier',
        defautsMineurs: 1436,
        defautsEvolution: '+7.3%',
        defautsComparison: 'vs mois dernier',
        revenus: '97.4M',
        revenusEvolution: '+10.8%',
        revenusComparison: 'vs mois dernier',
        tauxConformite: '51.1%',
        tauxEvolution: '+3.5%',
        tauxComparison: 'vs mois dernier',
        centresActifs: '12/15',
        centresEvolution: '80% opérationnel',
        moyenneParCentre: '934',
        moyenneEvolution: '+58 vs mois dernier'
      }
    },
    annee: {
      activityData: [
        { period: 'Jan', inspections: 9876, conformes: 5040, nonConformes: 3545, defautsMineurs: 1291 },
        { period: 'Fév', inspections: 9234, conformes: 4712, nonConformes: 3312, defautsMineurs: 1210 },
        { period: 'Mar', inspections: 10567, conformes: 5390, nonConformes: 3787, defautsMineurs: 1390 },
        { period: 'Avr', inspections: 10234, conformes: 5219, nonConformes: 3665, defautsMineurs: 1350 },
        { period: 'Mai', inspections: 10890, conformes: 5554, nonConformes: 3901, defautsMineurs: 1435 },
        { period: 'Juin', inspections: 10756, conformes: 5486, nonConformes: 3854, defautsMineurs: 1416 },
        { period: 'Juil', inspections: 11234, conformes: 5730, nonConformes: 4024, defautsMineurs: 1480 },
        { period: 'Août', inspections: 11089, conformes: 5656, nonConformes: 3972, defautsMineurs: 1461 },
        { period: 'Sep', inspections: 10678, conformes: 5446, nonConformes: 3826, defautsMineurs: 1406 },
        { period: 'Oct', inspections: 11211, conformes: 5731, nonConformes: 4044, defautsMineurs: 1436 }
      ],
      pieData: [
        { name: 'Conformes', value: 53964, color: '#10b981' },
        { name: 'Non-Conformes', value: 37930, color: '#ef4444' },
        { name: 'Défauts Mineurs', value: 13875, color: '#f59e0b' }
      ],
      infractions: [
        { type: 'Éclairage', nombre: 11667 },
        { type: 'Freinage', nombre: 10107 },
        { type: 'Assurance', nombre: 7586 },
        { type: 'Pneumatiques', nombre: 5989 },
        { type: 'Direction', nombre: 2581 }
      ],
      stats: {
        totalInspections: 105769,
        inspectionsEvolution: '+8.2%',
        inspectionsComparison: 'vs année dernière',
        conformes: 53964,
        conformesEvolution: '+7.8%',
        conformesComparison: 'vs année dernière',
        nonConformes: 37930,
        nonConformesEvolution: '+9.8%',
        nonConformesComparison: 'vs année dernière',
        defautsMineurs: 13875,
        defautsEvolution: '+7.5%',
        defautsComparison: 'vs année dernière',
        revenus: '918.7M',
        revenusEvolution: '+11.2%',
        revenusComparison: 'vs année dernière',
        tauxConformite: '51.0%',
        tauxEvolution: '+4.8%',
        tauxComparison: 'vs année dernière',
        centresActifs: '12/15',
        centresEvolution: '80% opérationnel',
        moyenneParCentre: '8,814',
        moyenneEvolution: '+672 vs année dernière'
      }
    },
    tout: {
      activityData: [
        { period: '2020', inspections: 89234, conformes: 42352, nonConformes: 35421, defautsMineurs: 11461 },
        { period: '2021', inspections: 93567, conformes: 45231, nonConformes: 36778, defautsMineurs: 11558 },
        { period: '2022', inspections: 97754, conformes: 48012, nonConformes: 37629, defautsMineurs: 12113 },
        { period: '2023', inspections: 101892, conformes: 50945, nonConformes: 38545, defautsMineurs: 12402 },
        { period: '2024', inspections: 105769, conformes: 53964, nonConformes: 39930, defautsMineurs: 11875 }
      ],
      pieData: [
        { name: 'Conformes', value: 240504, color: '#10b981' },
        { name: 'Non-Conformes', value: 188303, color: '#ef4444' },
        { name: 'Défauts Mineurs', value: 59409, color: '#f59e0b' }
      ],
      infractions: [
        { type: 'Éclairage', nombre: 52890 },
        { type: 'Freinage', nombre: 45823 },
        { type: 'Assurance', nombre: 34412 },
        { type: 'Pneumatiques', nombre: 27164 },
        { type: 'Direction', nombre: 28014 }
      ],
      stats: {
        totalInspections: 488216,
        inspectionsEvolution: '+18.5%',
        inspectionsComparison: 'depuis 2020',
        conformes: 240504,
        conformesEvolution: '+27.4%',
        conformesComparison: 'depuis 2020',
        nonConformes: 188303,
        nonConformesEvolution: '+12.7%',
        nonConformesComparison: 'depuis 2020',
        defautsMineurs: 59409,
        defautsEvolution: '+3.6%',
        defautsComparison: 'depuis 2020',
        revenus: '4.2Mrd',
        revenusEvolution: '+24.8%',
        revenusComparison: 'depuis 2020',
        tauxConformite: '49.3%',
        tauxEvolution: '+14.2%',
        tauxComparison: 'depuis 2020',
        centresActifs: '12/15',
        centresEvolution: '80% opérationnel',
        moyenneParCentre: '40,685',
        moyenneEvolution: '+6,321 depuis 2020'
      }
    },
    personnalise: {
      activityData: [
        { period: '10/10', inspections: 399, conformes: 205, nonConformes: 140, defautsMineurs: 54 },
        { period: '11/10', inspections: 423, conformes: 218, nonConformes: 148, defautsMineurs: 57 },
        { period: '12/10', inspections: 387, conformes: 198, nonConformes: 136, defautsMineurs: 53 },
        { period: '13/10', inspections: 445, conformes: 229, nonConformes: 155, defautsMineurs: 61 },
        { period: '14/10', inspections: 467, conformes: 240, nonConformes: 163, defautsMineurs: 64 }
      ],
      pieData: [
        { name: 'Conformes', value: 1090, color: '#10b981' },
        { name: 'Non-Conformes', value: 742, color: '#ef4444' },
        { name: 'Défauts Mineurs', value: 289, color: '#f59e0b' }
      ],
      infractions: [
        { type: 'Éclairage', nombre: 221 },
        { type: 'Freinage', nombre: 189 },
        { type: 'Assurance', nombre: 142 },
        { type: 'Pneumatiques', nombre: 112 },
        { type: 'Direction', nombre: 78 }
      ],
      stats: {
        totalInspections: 2121,
        inspectionsEvolution: '+8.9%',
        inspectionsComparison: 'période personnalisée',
        conformes: 1090,
        conformesEvolution: '+7.2%',
        conformesComparison: 'période personnalisée',
        nonConformes: 742,
        nonConformesEvolution: '+11.8%',
        nonConformesComparison: 'période personnalisée',
        defautsMineurs: 289,
        defautsEvolution: '+9.3%',
        defautsComparison: 'période personnalisée',
        revenus: '18.4M',
        revenusEvolution: '+12.5%',
        revenusComparison: 'période personnalisée',
        tauxConformite: '51.4%',
        tauxEvolution: '+3.8%',
        tauxComparison: 'période personnalisée',
        centresActifs: '12/15',
        centresEvolution: '80% opérationnel',
        moyenneParCentre: '177',
        moyenneEvolution: 'période personnalisée'
      }
    }
  }

  const currentData = isCustomDateRange ? dataByPeriod.personnalise : dataByPeriod[globalFilter]

  const topCommissariats = [
    {
      nom: 'Commissariat Yopougon',
      code: 'COM-YOP-001',
      lieu: 'Yopougon Sideci',
      inspections: 127,
      conformes: 64,
      nonConformes: 45,
      defautsMineurs: 18,
      performance: 97,
      revenus: 985000,
      revenusEvolution: '+15.2%',
      statut: 'excellent',
      topPerformer: true
    },
    {
      nom: 'Commissariat Adjamé',
      code: 'COM-ADJ-001',
      lieu: 'Adjamé Commerce',
      inspections: 98,
      conformes: 49,
      nonConformes: 35,
      defautsMineurs: 14,
      performance: 94,
      revenus: 768000,
      revenusEvolution: '+8.7%',
      statut: 'excellent',
      topPerformer: false
    },
    {
      nom: 'Commissariat Abobo',
      code: 'COM-ABO-001',
      lieu: 'Abobo Gare',
      inspections: 34,
      conformes: 17,
      nonConformes: 12,
      defautsMineurs: 5,
      performance: 67,
      revenus: 245000,
      revenusEvolution: '-18.3%',
      statut: 'attention',
      topPerformer: false,
      probleme: 'Personnel insuffisant'
    }
  ]

  const topAgents = [
    {
      nom: 'KOUAME Jean-Baptiste',
      matricule: 'AG-2023-045',
      commissariat: 'Commissariat Yopougon',
      inspections: 47,
      conformes: 24,
      nonConformes: 17,
      defautsMineurs: 6,
      performance: 96,
      revenus: 340000,
      revenusEvolution: '+17.2%',
      statut: 'excellent',
      topPerformer: true
    },
    {
      nom: 'TRAORE Sekou',
      matricule: 'AG-2023-078',
      commissariat: 'Commissariat Adjamé',
      inspections: 38,
      conformes: 19,
      nonConformes: 14,
      defautsMineurs: 5,
      performance: 93,
      revenus: 285000,
      revenusEvolution: '+11.8%',
      statut: 'excellent',
      topPerformer: false
    },
    {
      nom: 'BAMBA Issiaka',
      matricule: 'AG-2023-112',
      commissariat: 'Commissariat Cocody',
      inspections: 12,
      conformes: 6,
      nonConformes: 4,
      defautsMineurs: 2,
      performance: 68,
      revenus: 95000,
      revenusEvolution: '-21.5%',
      statut: 'attention',
      topPerformer: false,
      probleme: 'Performance en baisse'
    }
  ]

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
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Période d'analyse</h2>
                  <p className="text-gray-600 text-xs md:text-sm hidden sm:block">Sélectionnez la période pour filtrer toutes les données du dashboard</p>
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
                  Tout
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
            
            {isCustomDateRange && (
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg w-full sm:w-auto">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs md:text-sm font-medium">Période personnalisée active</span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Statistiques - 8 cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-t-4 border-blue-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">TOTAL INSPECTIONS</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Wrench className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{formatNumber(currentData.stats.totalInspections)}</div>
            <div className="text-green-600 text-sm font-bold">{currentData.stats.inspectionsEvolution} {currentData.stats.inspectionsComparison}</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-green-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">CONFORMES</h3>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{formatNumber(currentData.stats.conformes)}</div>
            <div className="text-green-600 text-sm font-bold">{currentData.stats.conformesEvolution} {currentData.stats.conformesComparison}</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-red-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">NON-CONFORMES</h3>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{formatNumber(currentData.stats.nonConformes)}</div>
            <div className="text-red-600 text-sm font-bold">{currentData.stats.nonConformesEvolution} {currentData.stats.nonConformesComparison}</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-yellow-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">DÉFAUTS MINEURS</h3>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{formatNumber(currentData.stats.defautsMineurs)}</div>
            <div className="text-yellow-600 text-sm font-bold">{currentData.stats.defautsEvolution} {currentData.stats.defautsComparison}</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-purple-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">REVENUS GÉNÉRÉS</h3>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats.revenus}</div>
            <div className="text-green-600 text-sm font-bold">{currentData.stats.revenusEvolution} FCFA collectés</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-indigo-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">TAUX DE CONFORMITÉ</h3>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats.tauxConformite}</div>
            <div className="text-green-600 text-sm font-bold">{currentData.stats.tauxEvolution} {currentData.stats.tauxComparison}</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-orange-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">COMMISSARIATS ACTIFS</h3>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats.centresActifs}</div>
            <div className="text-green-600 text-sm font-bold">{currentData.stats.centresEvolution}</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-cyan-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">MOYENNE/COMMISSARIAT</h3>
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats.moyenneParCentre}</div>
            <div className="text-green-600 text-sm font-bold">{currentData.stats.moyenneEvolution}</div>
          </CardBody>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardBody className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Activité des 7 derniers jours</h3>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">TEMPS RÉEL</span>
            </div>
            
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
                        if (value === 'inspections') return 'Contrôles effectués';
                        if (value === 'nonConformes') return 'Infractions détectées';
                        return value;
                      }}
                    />
                    <Bar 
                      dataKey="inspections" 
                      fill="#6B9FED" 
                      radius={[8, 8, 0, 0]}
                      maxBarSize={50}
                      name="Contrôles effectués"
                      isAnimationActive={false}
                    />
                    <Bar 
                      dataKey="nonConformes" 
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

        <Card>
          <CardBody className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Répartition des Statuts - {
                isCustomDateRange ? `${dateDebut} au ${dateFin}` :
                globalFilter === 'jour' ? 'Aujourd\'hui' : 
                globalFilter === 'semaine' ? 'Cette Semaine' : 
                globalFilter === 'mois' ? 'Ce Mois' : 
                globalFilter === 'annee' ? 'Cette Année' : 
                'Historique Complet'
              }
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
                      label={(entry: any) => ` ${(entry.percent * 100).toFixed(1)}%`}
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


      {/* Top commissariats */}
      <Card>
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Performance des Commissariats - Top 3</h3>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Voir tous les commissariats
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topCommissariats.map((commissariat) => (
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
                        {commissariat.topPerformer ? <Trophy className="w-5 h-5 text-yellow-600" /> : <Star className="w-5 h-5 text-blue-600" />}
                        {commissariat.nom.replace('Commissariat ', '')}
                      </h4>
                      <p className="text-sm text-gray-600">{commissariat.code}</p>
                      <p className="text-xs text-gray-500">{commissariat.lieu}</p>
                    </div>
                    <span className={`${
                      commissariat.statut === 'excellent' ? 'bg-green-500' : 'bg-yellow-500'
                    } text-white px-3 py-1 rounded-full text-xs font-bold`}>
                      {commissariat.statut === 'excellent' ? 'EXCELLENT' : 'ATTENTION'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center mb-4">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">{formatNumber(commissariat.inspections)}</div>
                      <div className="text-xs text-gray-600">INSPECTIONS</div>
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

                  <div className="grid grid-cols-3 gap-2 text-center mb-4 text-xs">
                    <div>
                      <div className="font-bold text-green-600">{commissariat.conformes}</div>
                      <div className="text-gray-600">Conformes</div>
                    </div>
                    <div>
                      <div className="font-bold text-red-600">{commissariat.nonConformes}</div>
                      <div className="text-gray-600">Non-Conf.</div>
                    </div>
                    <div>
                      <div className="font-bold text-yellow-600">{commissariat.defautsMineurs}</div>
                      <div className="text-gray-600">Défauts</div>
                    </div>
                  </div>

                  <div className={`${
                    commissariat.statut === 'excellent' ? 'bg-green-100' : 'bg-yellow-100'
                  } rounded-lg p-3 mb-4`}>
                    <div className="text-sm">
                      <div className={`font-bold ${
                        commissariat.statut === 'excellent' ? 'text-green-800' : 'text-yellow-800'
                      }`}>
                        Revenus: {formatNumber(commissariat.revenus)} FCFA ({commissariat.revenusEvolution})
                      </div>
                      <div className={commissariat.statut === 'excellent' ? 'text-green-700' : 'text-yellow-700'}>
                        {commissariat.probleme || 'Performance optimale'}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button className={`flex-1 ${
                      commissariat.statut === 'excellent' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-yellow-600 hover:bg-yellow-700'
                    } text-white`}>
                      Détails
                    </Button>
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

      {/* Top agents */}
      <Card>
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Performance des Agents - Top 3</h3>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Voir tous les agents
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topAgents.map((agent) => (
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
                    
                    <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-blue-200">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <p className="text-xs font-semibold text-blue-700">{agent.commissariat}</p>
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
                    <Button className={`flex-1 ${
                      agent.statut === 'excellent' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-orange-600 hover:bg-orange-700'
                    } text-white`}>
                      Profil
                    </Button>
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