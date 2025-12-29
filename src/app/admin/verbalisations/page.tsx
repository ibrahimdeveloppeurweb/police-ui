'use client'

import React, { useState, useEffect } from 'react'
import {
  FileText, Calendar, Search, Printer, FileDown, CheckCircle,
  AlertTriangle, Clock, DollarSign, TrendingUp, Users, MapPin,
  CreditCard, Phone, MessageSquare, XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function VerbalisationsDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('jour')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Données dynamiques par période
  const dataByPeriod = {
    jour: {
      activityData: [
        { period: '00h-04h', pv: 2, payes: 1, nonPayes: 1, enRetard: 0 },
        { period: '04h-08h', pv: 5, payes: 2, nonPayes: 2, enRetard: 1 },
        { period: '08h-12h', pv: 18, payes: 12, nonPayes: 4, enRetard: 2 },
        { period: '12h-16h', pv: 22, payes: 15, nonPayes: 5, enRetard: 2 },
        { period: '16h-20h', pv: 8, payes: 5, nonPayes: 2, enRetard: 1 },
        { period: '20h-24h', pv: 3, payes: 2, nonPayes: 1, enRetard: 0 }
      ],
      pieData: [
        { name: 'Payés', value: 37, color: '#10b981' },
        { name: 'Non Payés', value: 15, color: '#f59e0b' },
        { name: 'En Retard', value: 6, color: '#ef4444' }
      ],
      infractions: [
        { type: 'Défaut d\'assurance', nombre: 18 },
        { type: 'Excès de vitesse', nombre: 15 },
        { type: 'Défaut d\'éclairage', nombre: 12 },
        { type: 'Téléphone au volant', nombre: 8 },
        { type: 'Ceinture non attachée', nombre: 5 }
      ],
      stats: {
        totalPV: 58,
        pvEvolution: '+12.5%',
        pvComparison: 'vs hier',
        payes: 37,
        payesEvolution: '+8.3%',
        payesComparison: 'vs hier',
        nonPayes: 15,
        nonPayesEvolution: '+18.2%',
        nonPayesComparison: 'vs hier',
        enRetard: 6,
        enRetardEvolution: '+25.0%',
        enRetardComparison: 'vs hier',
        montantTotal: '2.5M',
        montantEvolution: '+10.5%',
        montantComparison: 'vs hier',
        tauxPaiement: '63.8%',
        tauxEvolution: '+5.2%',
        tauxComparison: 'vs hier',
        agentsActifs: '42/50',
        agentsEvolution: '84% opérationnel',
        montantMoyen: '43,103',
        montantMoyenEvolution: '+2,450 vs hier'
      }
    },
    semaine: {
      activityData: [
        { period: 'Lun', pv: 52, payes: 33, nonPayes: 13, enRetard: 6 },
        { period: 'Mar', pv: 58, payes: 37, nonPayes: 15, enRetard: 6 },
        { period: 'Mer', pv: 61, payes: 39, nonPayes: 16, enRetard: 6 },
        { period: 'Jeu', pv: 67, payes: 43, nonPayes: 17, enRetard: 7 },
        { period: 'Ven', pv: 72, payes: 46, nonPayes: 19, enRetard: 7 },
        { period: 'Sam', pv: 55, payes: 35, nonPayes: 14, enRetard: 6 },
        { period: 'Dim', pv: 58, payes: 37, nonPayes: 15, enRetard: 6 }
      ],
      pieData: [
        { name: 'Payés', value: 270, color: '#10b981' },
        { name: 'Non Payés', value: 109, color: '#f59e0b' },
        { name: 'En Retard', value: 44, color: '#ef4444' }
      ],
      infractions: [
        { type: 'Défaut d\'assurance', nombre: 126 },
        { type: 'Excès de vitesse', nombre: 105 },
        { type: 'Défaut d\'éclairage', nombre: 84 },
        { type: 'Téléphone au volant', nombre: 56 },
        { type: 'Ceinture non attachée', nombre: 35 }
      ],
      stats: {
        totalPV: 423,
        pvEvolution: '+9.8%',
        pvComparison: 'vs semaine dernière',
        payes: 270,
        payesEvolution: '+7.5%',
        payesComparison: 'vs semaine dernière',
        nonPayes: 109,
        nonPayesEvolution: '+14.3%',
        nonPayesComparison: 'vs semaine dernière',
        enRetard: 44,
        enRetardEvolution: '+20.5%',
        enRetardComparison: 'vs semaine dernière',
        montantTotal: '18.9M',
        montantEvolution: '+11.3%',
        montantComparison: 'vs semaine dernière',
        tauxPaiement: '63.8%',
        tauxEvolution: '+4.8%',
        tauxComparison: 'vs semaine dernière',
        agentsActifs: '42/50',
        agentsEvolution: '84% opérationnel',
        montantMoyen: '44,680',
        montantMoyenEvolution: '+1,890 vs semaine dernière'
      }
    },
    mois: {
      activityData: [
        { period: 'Sem 1', pv: 387, payes: 247, nonPayes: 100, enRetard: 40 },
        { period: 'Sem 2', pv: 412, payes: 263, nonPayes: 106, enRetard: 43 },
        { period: 'Sem 3', pv: 398, payes: 254, nonPayes: 102, enRetard: 42 },
        { period: 'Sem 4', pv: 423, payes: 270, nonPayes: 109, enRetard: 44 }
      ],
      pieData: [
        { name: 'Payés', value: 1207, color: '#10b981' },
        { name: 'Non Payés', value: 516, color: '#f59e0b' },
        { name: 'En Retard', value: 169, color: '#ef4444' }
      ],
      infractions: [
        { type: 'Défaut d\'assurance', nombre: 567 },
        { type: 'Excès de vitesse', nombre: 472 },
        { type: 'Défaut d\'éclairage', nombre: 378 },
        { type: 'Téléphone au volant', nombre: 252 },
        { type: 'Ceinture non attachée', nombre: 157 }
      ],
      stats: {
        totalPV: 1892,
        pvEvolution: '+7.2%',
        pvComparison: 'vs mois dernier',
        payes: 1207,
        payesEvolution: '+6.8%',
        payesComparison: 'vs mois dernier',
        nonPayes: 516,
        nonPayesEvolution: '+8.9%',
        nonPayesComparison: 'vs mois dernier',
        enRetard: 169,
        enRetardEvolution: '+12.3%',
        enRetardComparison: 'vs mois dernier',
        montantTotal: '67.3M',
        montantEvolution: '+9.8%',
        montantComparison: 'vs mois dernier',
        tauxPaiement: '63.8%',
        tauxEvolution: '+3.5%',
        tauxComparison: 'vs mois dernier',
        agentsActifs: '42/50',
        agentsEvolution: '84% opérationnel',
        montantMoyen: '35,568',
        montantMoyenEvolution: '+1,230 vs mois dernier'
      }
    },
    annee: {
      activityData: [
        { period: 'Jan', pv: 1678, payes: 1070, nonPayes: 458, enRetard: 150 },
        { period: 'Fév', pv: 1523, payes: 972, nonPayes: 416, enRetard: 135 },
        { period: 'Mar', pv: 1789, payes: 1142, nonPayes: 488, enRetard: 159 },
        { period: 'Avr', pv: 1834, payes: 1171, nonPayes: 501, enRetard: 162 },
        { period: 'Mai', pv: 1956, payes: 1248, nonPayes: 534, enRetard: 174 },
        { period: 'Juin', pv: 1867, payes: 1191, nonPayes: 510, enRetard: 166 },
        { period: 'Juil', pv: 2012, payes: 1284, nonPayes: 549, enRetard: 179 },
        { period: 'Août', pv: 1989, payes: 1269, nonPayes: 543, enRetard: 177 },
        { period: 'Sep', pv: 1845, payes: 1177, nonPayes: 504, enRetard: 164 },
        { period: 'Oct', pv: 1892, payes: 1207, nonPayes: 516, enRetard: 169 }
      ],
      pieData: [
        { name: 'Payés', value: 12089, color: '#10b981' },
        { name: 'Non Payés', value: 5168, color: '#f59e0b' },
        { name: 'En Retard', value: 1688, color: '#ef4444' }
      ],
      infractions: [
        { type: 'Défaut d\'assurance', nombre: 5678 },
        { type: 'Excès de vitesse', nombre: 4723 },
        { type: 'Défaut d\'éclairage', nombre: 3789 },
        { type: 'Téléphone au volant', nombre: 2523 },
        { type: 'Ceinture non attachée', nombre: 1572 }
      ],
      stats: {
        totalPV: 18945,
        pvEvolution: '+14.3%',
        pvComparison: 'vs année dernière',
        payes: 12089,
        payesEvolution: '+12.8%',
        payesComparison: 'vs année dernière',
        nonPayes: 5168,
        nonPayesEvolution: '+18.7%',
        nonPayesComparison: 'vs année dernière',
        enRetard: 1688,
        enRetardEvolution: '+22.5%',
        enRetardComparison: 'vs année dernière',
        montantTotal: '678.5M',
        montantEvolution: '+16.2%',
        montantComparison: 'vs année dernière',
        tauxPaiement: '63.8%',
        tauxEvolution: '+8.3%',
        tauxComparison: 'vs année dernière',
        agentsActifs: '42/50',
        agentsEvolution: '84% opérationnel',
        montantMoyen: '35,808',
        montantMoyenEvolution: '+2,340 vs année dernière'
      }
    },
    tout: {
      activityData: [
        { period: '2020', pv: 14234, payes: 9072, nonPayes: 3883, enRetard: 1279 },
        { period: '2021', pv: 15678, payes: 10004, nonPayes: 4278, enRetard: 1396 },
        { period: '2022', pv: 16567, payes: 10571, nonPayes: 4521, enRetard: 1475 },
        { period: '2023', pv: 16574, payes: 10576, nonPayes: 4524, enRetard: 1474 },
        { period: '2024', pv: 18945, payes: 12089, nonPayes: 5168, enRetard: 1688 }
      ],
      pieData: [
        { name: 'Payés', value: 55723, color: '#10b981' },
        { name: 'Non Payés', value: 23829, color: '#f59e0b' },
        { name: 'En Retard', value: 7446, color: '#ef4444' }
      ],
      infractions: [
        { type: 'Défaut d\'assurance', nombre: 26234 },
        { type: 'Excès de vitesse', nombre: 21823 },
        { type: 'Défaut d\'éclairage', nombre: 17489 },
        { type: 'Téléphone au volant', nombre: 11657 },
        { type: 'Ceinture non attachée', nombre: 7265 }
      ],
      stats: {
        totalPV: 87456,
        pvEvolution: '+33.1%',
        pvComparison: 'depuis 2020',
        payes: 55723,
        payesEvolution: '+33.2%',
        payesComparison: 'depuis 2020',
        nonPayes: 23829,
        nonPayesEvolution: '+33.1%',
        nonPayesComparison: 'depuis 2020',
        enRetard: 7446,
        enRetardEvolution: '+31.9%',
        enRetardComparison: 'depuis 2020',
        montantTotal: '3.1Mrd',
        montantEvolution: '+38.5%',
        montantComparison: 'depuis 2020',
        tauxPaiement: '63.7%',
        tauxEvolution: '+12.8%',
        tauxComparison: 'depuis 2020',
        agentsActifs: '42/50',
        agentsEvolution: '84% opérationnel',
        montantMoyen: '35,684',
        montantMoyenEvolution: '+3,890 depuis 2020'
      }
    },
    personnalise: {
      activityData: [
        { period: '10/10', pv: 52, payes: 33, nonPayes: 13, enRetard: 6 },
        { period: '11/10', pv: 58, payes: 37, nonPayes: 15, enRetard: 6 },
        { period: '12/10', pv: 54, payes: 34, nonPayes: 14, enRetard: 6 },
        { period: '13/10', pv: 63, payes: 40, nonPayes: 16, enRetard: 7 },
        { period: '14/10', pv: 59, payes: 38, nonPayes: 15, enRetard: 6 }
      ],
      pieData: [
        { name: 'Payés', value: 182, color: '#10b981' },
        { name: 'Non Payés', value: 73, color: '#f59e0b' },
        { name: 'En Retard', value: 31, color: '#ef4444' }
      ],
      infractions: [
        { type: 'Défaut d\'assurance', nombre: 85 },
        { type: 'Excès de vitesse', nombre: 71 },
        { type: 'Défaut d\'éclairage', nombre: 57 },
        { type: 'Téléphone au volant', nombre: 38 },
        { type: 'Ceinture non attachée', nombre: 24 }
      ],
      stats: {
        totalPV: 286,
        pvEvolution: '+11.2%',
        pvComparison: 'période personnalisée',
        payes: 182,
        payesEvolution: '+9.5%',
        payesComparison: 'période personnalisée',
        nonPayes: 73,
        nonPayesEvolution: '+15.8%',
        nonPayesComparison: 'période personnalisée',
        enRetard: 31,
        enRetardEvolution: '+19.2%',
        enRetardComparison: 'période personnalisée',
        montantTotal: '12.8M',
        montantEvolution: '+13.5%',
        montantComparison: 'période personnalisée',
        tauxPaiement: '63.6%',
        tauxEvolution: '+4.2%',
        tauxComparison: 'période personnalisée',
        agentsActifs: '42/50',
        agentsEvolution: '84% opérationnel',
        montantMoyen: '44,755',
        montantMoyenEvolution: 'période personnalisée'
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
                  <p className="text-gray-600 text-xs md:text-sm hidden sm:block">Sélectionnez la période pour filtrer toutes les données</p>
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
              <h3 className="text-gray-600 text-sm font-medium">TOTAL PV</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{formatNumber(currentData.stats.totalPV)}</div>
            <div className="text-green-600 text-sm font-bold">{currentData.stats.pvEvolution} {currentData.stats.pvComparison}</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-green-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">PAYÉS</h3>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{formatNumber(currentData.stats.payes)}</div>
            <div className="text-green-600 text-sm font-bold">{currentData.stats.payesEvolution} {currentData.stats.payesComparison}</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-yellow-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">NON PAYÉS</h3>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{formatNumber(currentData.stats.nonPayes)}</div>
            <div className="text-yellow-600 text-sm font-bold">{currentData.stats.nonPayesEvolution} {currentData.stats.nonPayesComparison}</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-red-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">EN RETARD</h3>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{formatNumber(currentData.stats.enRetard)}</div>
            <div className="text-red-600 text-sm font-bold">{currentData.stats.enRetardEvolution} {currentData.stats.enRetardComparison}</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-purple-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">MONTANT TOTAL</h3>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats.montantTotal}</div>
            <div className="text-green-600 text-sm font-bold">{currentData.stats.montantEvolution} FCFA collectés</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-indigo-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">TAUX DE PAIEMENT</h3>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats.tauxPaiement}</div>
            <div className="text-green-600 text-sm font-bold">{currentData.stats.tauxEvolution} {currentData.stats.tauxComparison}</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-orange-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">AGENTS ACTIFS</h3>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats.agentsActifs}</div>
            <div className="text-green-600 text-sm font-bold">{currentData.stats.agentsEvolution}</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-cyan-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">MONTANT MOYEN/PV</h3>
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-3">{currentData.stats.montantMoyen}</div>
            <div className="text-green-600 text-sm font-bold">{currentData.stats.montantMoyenEvolution}</div>
          </CardBody>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardBody className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Activité des verbalisations</h3>
            
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
                    />
                    <Bar 
                      dataKey="pv" 
                      fill="#6B9FED" 
                      radius={[8, 8, 0, 0]}
                      maxBarSize={50}
                      name="PV émis"
                      isAnimationActive={false}
                    />
                    <Bar 
                      dataKey="nonPayes" 
                      fill="#F59E0B" 
                      radius={[8, 8, 0, 0]}
                      maxBarSize={50}
                      name="Non payés"
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
              Répartition Statuts - {
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

   
    </div>
  )
}