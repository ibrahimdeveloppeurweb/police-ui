'use client'

import React, { useState } from 'react'
import {
  Search, Calendar, Download, CheckCircle, Phone, Mail, AlertTriangle,
  TrendingUp, Clock, DollarSign, Filter, Eye, ChevronLeft, ChevronRight,
  Printer, FileDown
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'
import { Select } from '@/components/ui/Select'


type AmendeStatus = 'En attente' | 'Payé' | 'En retard'
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

interface Stats {
  montantTotal: number
  collecte: number
  pourcentageCollecte: number
  enAttente: number
  pourcentageAttente: number
  enRetard: number
  pourcentageRetard: number
  evolutionTotal: string
  evolutionCollecte: string
}

export default function AmendesAdminPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tous les statuts')
  const [montantFilter, setMontantFilter] = useState('Tous les montants')
  const [dateFilter, setDateFilter] = useState('')
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('mois')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)

  // Données selon la période sélectionnée
  const dataByPeriod = {
    jour: {
      amendes: [
        {
          id: '1',
          numero: '#AMN-2025-0892',
          pv: 'PV-2025-0892',
          contrevenant: 'TRAORE Moussa',
          telephone: '+225 0708765432',
          montant: 45000,
          dateEmission: '10/10/2025',
          dateLimite: '10/11/2025',
          statut: 'En attente' as AmendeStatus,
          modePaiement: undefined,
          penalites: undefined,
          datePaiement: undefined
        },
        {
          id: '2',
          numero: '#AMN-2025-0891',
          pv: 'PV-2025-0891',
          contrevenant: 'BAMBA Issa',
          telephone: '+225 0701234567',
          montant: 5000,
          dateEmission: '10/10/2025',
          dateLimite: '10/11/2025',
          datePaiement: '10/10/2025',
          statut: 'Payé' as AmendeStatus,
          modePaiement: 'Mobile Money',
          penalites: undefined
        },
        {
          id: '3',
          numero: '#AMN-2025-0890',
          pv: 'PV-2025-0890',
          contrevenant: 'DIABATE Aminata',
          telephone: '+225 0709876543',
          montant: 35000,
          dateEmission: '10/10/2025',
          dateLimite: '10/11/2025',
          statut: 'En attente' as AmendeStatus,
          modePaiement: undefined,
          penalites: undefined,
          datePaiement: undefined
        }
      ],
      stats: {
        montantTotal: 2.5,
        collecte: 1.7,
        pourcentageCollecte: 68,
        enAttente: 0.5,
        pourcentageAttente: 20,
        enRetard: 0.3,
        pourcentageRetard: 12,
        evolutionTotal: '+12.5%',
        evolutionCollecte: '+8.3%'
      }
    },
    semaine: {
      amendes: [
        {
          id: '1',
          numero: '#AMN-2025-0765',
          pv: 'PV-2025-0765',
          contrevenant: 'BAMBA Sylvain',
          telephone: '+225 0702345678',
          montant: 40000,
          dateEmission: '24/09/2025',
          dateLimite: '24/10/2025',
          datePaiement: '26/09/2025',
          statut: 'Payé' as AmendeStatus,
          modePaiement: 'Carte Bancaire',
          penalites: undefined
        },
        {
          id: '2',
          numero: '#AMN-2025-0766',
          pv: 'PV-2025-0766',
          contrevenant: 'TRAORE Fatou',
          telephone: '+225 0703456789',
          montant: 8000,
          dateEmission: '25/09/2025',
          dateLimite: '25/10/2025',
          statut: 'En attente' as AmendeStatus,
          modePaiement: undefined,
          penalites: undefined,
          datePaiement: undefined
        },
        {
          id: '3',
          numero: '#AMN-2025-0767',
          pv: 'PV-2025-0767',
          contrevenant: 'KOFFI Marie',
          telephone: '+225 0704567890',
          montant: 55000,
          penalites: 5500,
          dateEmission: '22/09/2025',
          dateLimite: '22/09/2025',
          statut: 'En retard' as AmendeStatus,
          modePaiement: undefined,
          datePaiement: undefined
        }
      ],
      stats: {
        montantTotal: 18.9,
        collecte: 12.8,
        pourcentageCollecte: 67.7,
        enAttente: 3.9,
        pourcentageAttente: 20.6,
        enRetard: 2.2,
        pourcentageRetard: 11.7,
        evolutionTotal: '+9.8%',
        evolutionCollecte: '+11.2%'
      }
    },
    mois: {
      amendes: [
        {
          id: '1',
          numero: '#AMN-2025-0892',
          pv: 'PV-2025-0892',
          contrevenant: 'TRAORE Moussa',
          telephone: '+225 0708765432',
          montant: 45000,
          dateEmission: '25/09/2025',
          dateLimite: '25/10/2025',
          statut: 'En attente' as AmendeStatus,
          modePaiement: undefined,
          penalites: undefined,
          datePaiement: undefined
        },
        {
          id: '2',
          numero: '#AMN-2025-0891',
          pv: 'PV-2025-0891',
          contrevenant: 'BAMBA Issa',
          telephone: '+225 0701234567',
          montant: 5000,
          dateEmission: '25/09/2025',
          dateLimite: '25/10/2025',
          datePaiement: '25/09/2025',
          statut: 'Payé' as AmendeStatus,
          modePaiement: 'Mobile Money',
          penalites: undefined
        },
        {
          id: '3',
          numero: '#AMN-2025-0850',
          pv: 'PV-2025-0850',
          contrevenant: 'YAO Kouadio',
          telephone: '+225 0701234567',
          montant: 75000,
          penalites: 7500,
          dateEmission: '20/08/2025',
          dateLimite: '20/09/2025',
          statut: 'En retard' as AmendeStatus,
          modePaiement: undefined,
          datePaiement: undefined
        },
        {
          id: '4',
          numero: '#AMN-2025-0890',
          pv: 'PV-2025-0890',
          contrevenant: 'DIABATE Aminata',
          telephone: '+225 0709876543',
          montant: 35000,
          dateEmission: '25/09/2025',
          dateLimite: '25/10/2025',
          statut: 'En attente' as AmendeStatus,
          modePaiement: undefined,
          penalites: undefined,
          datePaiement: undefined
        },
        {
          id: '5',
          numero: '#AMN-2025-0889',
          pv: 'PV-2025-0889',
          contrevenant: 'KONE Aya',
          telephone: '+225 0702345678',
          montant: 10000,
          dateEmission: '25/09/2025',
          dateLimite: '25/10/2025',
          datePaiement: '25/09/2025',
          statut: 'Payé' as AmendeStatus,
          modePaiement: 'Espèces',
          penalites: undefined
        }
      ],
      stats: {
        montantTotal: 67.3,
        collecte: 45.7,
        pourcentageCollecte: 68,
        enAttente: 13.8,
        pourcentageAttente: 20.5,
        enRetard: 7.8,
        pourcentageRetard: 11.5,
        evolutionTotal: '+7.2%',
        evolutionCollecte: '+9.8%'
      }
    },
    annee: {
      amendes: [
        {
          id: '1',
          numero: '#AMN-2025-0123',
          pv: 'PV-2025-0123',
          contrevenant: 'KOFFI Armand',
          telephone: '+225 0705556789',
          montant: 60000,
          dateEmission: '12/02/2025',
          dateLimite: '12/03/2025',
          datePaiement: '15/02/2025',
          statut: 'Payé' as AmendeStatus,
          modePaiement: 'Virement Bancaire',
          penalites: undefined
        },
        {
          id: '2',
          numero: '#AMN-2025-0124',
          pv: 'PV-2025-0124',
          contrevenant: 'TRAORE Salimata',
          telephone: '+225 0706667890',
          montant: 10000,
          dateEmission: '20/03/2025',
          dateLimite: '20/04/2025',
          statut: 'En attente' as AmendeStatus,
          modePaiement: undefined,
          penalites: undefined,
          datePaiement: undefined
        },
        {
          id: '3',
          numero: '#AMN-2025-0125',
          pv: 'PV-2025-0125',
          contrevenant: 'COULIBALY Seydou',
          telephone: '+225 0707778901',
          montant: 45000,
          penalites: 13500,
          dateEmission: '15/01/2025',
          dateLimite: '15/02/2025',
          statut: 'En retard' as AmendeStatus,
          modePaiement: undefined,
          datePaiement: undefined
        }
      ],
      stats: {
        montantTotal: 678.5,
        collecte: 461.4,
        pourcentageCollecte: 68,
        enAttente: 139.1,
        pourcentageAttente: 20.5,
        enRetard: 77.9,
        pourcentageRetard: 11.5,
        evolutionTotal: '+14.3%',
        evolutionCollecte: '+18.7%'
      }
    },
    tout: {
      amendes: [
        {
          id: '1',
          numero: '#AMN-2021-0034',
          pv: 'PV-2021-0034',
          contrevenant: 'DIALLO Fatoumata',
          telephone: '+225 0708889012',
          montant: 35000,
          dateEmission: '18/03/2021',
          dateLimite: '18/04/2021',
          datePaiement: '20/03/2021',
          statut: 'Payé' as AmendeStatus,
          modePaiement: 'Mobile Money',
          penalites: undefined
        },
        {
          id: '2',
          numero: '#AMN-2022-0089',
          pv: 'PV-2022-0089',
          contrevenant: 'BAMBA Ibrahim',
          telephone: '+225 0709990123',
          montant: 5000,
          dateEmission: '22/07/2022',
          dateLimite: '22/08/2022',
          statut: 'En attente' as AmendeStatus,
          modePaiement: undefined,
          penalites: undefined,
          datePaiement: undefined
        },
        {
          id: '3',
          numero: '#AMN-2024-0234',
          pv: 'PV-2024-0234',
          contrevenant: 'KOFFI Laurent',
          telephone: '+225 0701112345',
          montant: 47000,
          penalites: 23500,
          dateEmission: '10/01/2024',
          dateLimite: '10/02/2024',
          statut: 'En retard' as AmendeStatus,
          modePaiement: undefined,
          datePaiement: undefined
        }
      ],
      stats: {
        montantTotal: 3124.8,
        collecte: 2124.9,
        pourcentageCollecte: 68,
        enAttente: 640.6,
        pourcentageAttente: 20.5,
        enRetard: 359.4,
        pourcentageRetard: 11.5,
        evolutionTotal: '+28.5%',
        evolutionCollecte: '+34.2%'
      }
    },
    personnalise: {
      amendes: [
        {
          id: '1',
          numero: '#AMN-2025-0923',
          pv: 'PV-2025-0923',
          contrevenant: 'CAMARA Adama',
          telephone: '+225 0702223456',
          montant: 43000,
          dateEmission: '11/10/2025',
          dateLimite: '11/11/2025',
          datePaiement: '12/10/2025',
          statut: 'Payé' as AmendeStatus,
          modePaiement: 'Mobile Money',
          penalites: undefined
        },
        {
          id: '2',
          numero: '#AMN-2025-0924',
          pv: 'PV-2025-0924',
          contrevenant: 'BEUGRE Paul',
          telephone: '+225 0703334567',
          montant: 9000,
          dateEmission: '12/10/2025',
          dateLimite: '12/11/2025',
          statut: 'En attente' as AmendeStatus,
          modePaiement: undefined,
          penalites: undefined,
          datePaiement: undefined
        },
        {
          id: '3',
          numero: '#AMN-2025-0925',
          pv: 'PV-2025-0925',
          contrevenant: 'COULIBALY Issa',
          telephone: '+225 0704445678',
          montant: 51000,
          penalites: 5100,
          dateEmission: '10/10/2025',
          dateLimite: '10/10/2025',
          statut: 'En retard' as AmendeStatus,
          modePaiement: undefined,
          datePaiement: undefined
        }
      ],
      stats: {
        montantTotal: 10.2,
        collecte: 6.9,
        pourcentageCollecte: 67.6,
        enAttente: 2.1,
        pourcentageAttente: 20.6,
        enRetard: 1.2,
        pourcentageRetard: 11.8,
        evolutionTotal: '+11.2%',
        evolutionCollecte: '+13.5%'
      }
    }
  }

  const currentData = isCustomDateRange ? dataByPeriod.personnalise : dataByPeriod[globalFilter]

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
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

  const getStatutColor = (statut: AmendeStatus) => {
    switch (statut) {
      case 'Payé':
        return 'bg-green-500 text-white'
      case 'En attente':
        return 'bg-yellow-500 text-white'
      case 'En retard':
        return 'bg-red-500 text-white'
    }
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Gestion des Amendes</h1>
        <p className="text-slate-600 mt-2 text-sm sm:text-base">Suivi centralisé de toutes les amendes des commissariats nationaux</p>
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
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Période d'analyse</h2>
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
      
              {/* NOUVEAUX CHAMPS : Input de recherche + 2 Selects */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-4 border-t border-blue-200">
              {/* Champ Input de recherche */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-[200px]">
                  <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Rechercher:
                  </label>
                  <input 
                      type="text"
                      placeholder="Rechercher amende, Contrevenant..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
              </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
              <option>Tous les statuts</option>
              <option>Payé</option>
              <option>En attente</option>
              <option>En retard</option>
              </select>

              <select 
              value={montantFilter}
              onChange={(e) => setMontantFilter(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
              <option>Tous les montants</option>
              <option>Moins de 10,000 FCFA</option>
              <option>10,000 - 50,000 FCFA</option>
              <option>Plus de 50,000 FCFA</option>
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

      {/* État des Amendes */}
      <Card className="mb-6 sm:mb-8">
        <CardBody className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              État des Amendes - {
                isCustomDateRange ? 'Personnalisé' :
                globalFilter === 'jour' ? "Aujourd'hui" :
                globalFilter === 'semaine' ? 'Cette Semaine' :
                globalFilter === 'mois' ? 'Ce Mois' :
                globalFilter === 'annee' ? 'Cette Année' :
                'Historique'
              }
            </h2>
            <div className="flex items-center gap-2 text-green-600 text-xs sm:text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              {currentData.stats.evolutionTotal}
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="text-center p-3 sm:p-4 bg-slate-50 rounded-lg">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-1 sm:mb-2">
                {globalFilter === 'tout' || globalFilter === 'annee'
                  ? `${(currentData.stats.montantTotal/1000).toFixed(1)}Mrd`
                  : `${currentData.stats.montantTotal}M`}
              </div>
              <div className="text-slate-600 text-xs sm:text-sm">Montant total</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mb-1 sm:mb-2">
                {globalFilter === 'tout' || globalFilter === 'annee'
                  ? `${(currentData.stats.collecte/1000).toFixed(1)}Mrd`
                  : `${currentData.stats.collecte}M`}
              </div>
              <div className="text-slate-600 text-xs sm:text-sm">Collecté ({currentData.stats.pourcentageCollecte}%)</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-yellow-50 rounded-lg">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600 mb-1 sm:mb-2">
                {globalFilter === 'tout' || globalFilter === 'annee'
                  ? `${(currentData.stats.enAttente/1000).toFixed(1)}Mrd`
                  : `${currentData.stats.enAttente}M`}
              </div>
              <div className="text-slate-600 text-xs sm:text-sm">Attente ({currentData.stats.pourcentageAttente}%)</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-red-50 rounded-lg">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 mb-1 sm:mb-2">
                {globalFilter === 'tout' || globalFilter === 'annee'
                  ? `${(currentData.stats.enRetard/1000).toFixed(1)}Mrd`
                  : `${currentData.stats.enRetard}M`}
              </div>
              <div className="text-slate-600 text-xs sm:text-sm">Retard ({currentData.stats.pourcentageRetard}%)</div>
            </div>
          </div>
        </CardBody>
      </Card>


      {/* Vue Mobile - Cards */}
      <div className="lg:hidden space-y-4 mb-6">
        {currentData.amendes.map((amende) => (
          <Card key={amende.id}>
            <CardBody className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 text-sm mb-1 truncate">{amende.numero}</div>
                  <a href="#" className="text-blue-600 hover:text-blue-800 underline text-xs">
                    {amende.pv}
                  </a>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ml-2 ${getStatutColor(amende.statut)}`}>
                  {amende.statut}
                </span>
              </div>

              <div className="space-y-2 mb-3">
                <div>
                  <div className="text-xs text-slate-500">Contrevenant</div>
                  <div className="font-medium text-slate-900 text-sm">{amende.contrevenant}</div>
                  <div className="text-xs text-slate-500">{amende.telephone}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-slate-500">Montant</div>
                    <div className="font-bold text-slate-900 text-sm">{formatNumber(amende.montant)} FCFA</div>
                    {amende.penalites && (
                      <div className="text-xs text-red-600">+{formatNumber(amende.penalites)} FCFA</div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Date limite</div>
                    <div className={`text-sm ${amende.statut === 'En retard' ? 'text-red-600 font-bold' : 'text-slate-900'}`}>
                      {amende.dateLimite}
                    </div>
                  </div>
                </div>

                {amende.modePaiement && (
                  <div>
                    <div className="text-xs text-slate-500">Mode de paiement</div>
                    <div className="text-sm text-slate-900">{amende.modePaiement}</div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <Button 
                  onClick={() => router.push(`/admin/amendes/${amende.id}`)}
                  className="flex-1 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-xs">Voir</span>
                </Button>
                {amende.statut === 'En attente' ? (
                  <>
                    <Button className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                      <Mail className="w-4 h-4" />
                    </Button>
                  </>
                ) : amende.statut === 'Payé' ? (
                  <Button className="p-2 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
                    <Download className="w-4 h-4 text-slate-600" />
                  </Button>
                ) : (
                  <>
                    <Button className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                      <AlertTriangle className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Vue Desktop - Tableau */}
      <Card className="hidden lg:block">
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">N° Amende</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">PV Associé</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Contrevenant</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Montant</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Émission</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Limite</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Statut</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Paiement</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentData.amendes.map((amende) => (
                  <tr key={amende.id} className="hover:bg-slate-50">
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <span className="font-bold text-slate-900 text-xs xl:text-sm">{amende.numero}</span>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <a href="#" className="text-blue-600 hover:text-blue-800 underline font-medium text-xs xl:text-sm">
                        {amende.pv}
                      </a>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <div>
                        <div className="font-medium text-slate-900 text-xs xl:text-sm">{amende.contrevenant}</div>
                        <div className="text-xs text-slate-500">{amende.telephone}</div>
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <div>
                        <div className="font-bold text-slate-900 text-xs xl:text-sm">{formatNumber(amende.montant)} FCFA</div>
                        {amende.penalites && (
                          <div className="text-xs text-red-600">+{formatNumber(amende.penalites)} FCFA</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <span className="text-slate-900 text-xs xl:text-sm">{amende.dateEmission}</span>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <span className={`text-xs xl:text-sm ${amende.statut === 'En retard' ? 'text-red-600 font-bold' : 'text-slate-900'}`}>
                        {amende.dateLimite}
                      </span>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <span className={`inline-flex px-2 xl:px-3 py-1 text-xs font-bold rounded-full ${getStatutColor(amende.statut)}`}>
                        {amende.statut}
                      </span>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      {amende.modePaiement ? (
                        <span className="text-slate-900 text-xs xl:text-sm">{amende.modePaiement}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => router.push(`/admin/amendes/${amende.id}`)} 
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {amende.statut === 'En attente' ? (
                          <>
                            <Button className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                              <Mail className="w-4 h-4" />
                            </Button>
                          </>
                        ) : amende.statut === 'Payé' ? (
                          <Button className="p-2 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
                            <Download className="w-4 h-4 text-slate-600" />
                          </Button>
                        ) : (
                          <>
                            <Button className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                              <Phone className="w-4 h-4" />
                            </Button>
                            <Button className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                              <AlertTriangle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Desktop */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 xl:px-6 py-4 border-t border-slate-200">
            <p className="text-xs sm:text-sm text-slate-600">
              Affichage de 1 à {currentData.amendes.length} sur 1 892 amendes
            </p>
            <div className="flex items-center gap-2">
              <Button className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </Button>
              <Button className="px-3 xl:px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-xs xl:text-sm">
                1
              </Button>
              <Button className="px-3 xl:px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-xs xl:text-sm text-slate-600">2</span>
              </Button>
              <Button className="px-3 xl:px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-xs xl:text-sm text-slate-600">3</span>
              </Button>
              <span className="px-2 text-slate-400 hidden sm:inline">...</span>
              <Button className="px-3 xl:px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors hidden sm:block">
                <span className="text-xs xl:text-sm text-slate-600">379</span>
              </Button>
              <Button className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Pagination Mobile */}
      <div className="lg:hidden flex flex-col items-center gap-4 mt-4">
        <p className="text-xs text-slate-600">
          Page 1 sur 379 (1 892 amendes)
        </p>
        <div className="flex items-center gap-2">
          <Button className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </Button>
          <Button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm">
            1
          </Button>
          <Button className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <span className="text-sm text-slate-600">2</span>
          </Button>
          <Button className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <span className="text-sm text-slate-600">3</span>
          </Button>
          <Button className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </Button>
        </div>
      </div>

    </div>
  )
}