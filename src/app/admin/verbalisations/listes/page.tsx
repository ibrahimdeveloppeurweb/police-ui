'use client'

import React, { useState } from 'react'
import {
  FileText, Search, Calendar, Download, Eye, Printer, CreditCard,
  Phone, MessageSquare, AlertTriangle, CheckCircle, Clock, DollarSign,
  TrendingUp, Filter, Flag, FileDown
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'

type PaymentStatus = 'Non payé' | 'Payé' | 'En retard'
type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'

interface PV {
  id: string
  numero: string
  vehicule: string
  conducteur: string
  agent: string
  commissariat: string
  lieu: string
  montant: number
  penalites?: number
  infractions: number
  dateEmission: string
  datePaiement?: string
  statutPaiement: PaymentStatus
  modePaiement?: string
  telephone?: string
  rappels?: number
  joursRetard?: number
}

interface PVWithRetard extends PV {
  joursRetard: number
  rappels: number
  telephone: string
}

interface Stats {
  totalPV: number
  pvJour: number
  montantTotal: number
  nonPayes: number
  pourcentageNonPayes: number
  evolutionPV: string
  evolutionMontant: string
}

export default function VerbalisationsAdminPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Statut de paiement')
  const [dateFilter, setDateFilter] = useState('')
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('jour')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Données selon la période sélectionnée
  const dataByPeriod = {
    jour: {
      pvs: [
        {
          id: '1',
          numero: 'PV #2025-PV-0892',
          vehicule: 'EF-789-GH',
          conducteur: 'TRAORE Moussa',
          agent: 'DIALLO Mamadou',
          commissariat: '5ème Arrondissement',
          lieu: 'Boulevard de Marseille',
          montant: 45000,
          infractions: 2,
          dateEmission: '10/10/2025',
          statutPaiement: 'Non payé' as PaymentStatus,
          penalites: undefined,
          datePaiement: undefined,
          modePaiement: undefined,
          telephone: undefined,
          rappels: undefined,
          joursRetard: undefined
        },
        {
          id: '2',
          numero: 'PV #2025-PV-0891',
          vehicule: 'IJ-456-KL',
          conducteur: 'BAMBA Issa',
          agent: 'KONE Ibrahim',
          commissariat: '7ème Arrondissement',
          lieu: 'Rue des Jardins',
          montant: 5000,
          infractions: 1,
          dateEmission: '10/10/2025',
          datePaiement: '10/10/2025',
          statutPaiement: 'Payé' as PaymentStatus,
          modePaiement: 'Mobile Money',
          penalites: undefined,
          telephone: undefined,
          rappels: undefined,
          joursRetard: undefined
        },
        {
          id: '3',
          numero: 'PV #2025-PV-0890',
          vehicule: 'QR-234-ST',
          conducteur: 'YAO Kouadio',
          agent: 'KOUASSI Jean',
          commissariat: '3ème Arrondissement',
          lieu: 'Adjamé Marché',
          montant: 35000,
          penalites: undefined,
          infractions: 2,
          dateEmission: '10/10/2025',
          statutPaiement: 'Non payé' as PaymentStatus,
          datePaiement: undefined,
          modePaiement: undefined,
          telephone: undefined,
          rappels: undefined,
          joursRetard: undefined
        }
      ],
      stats: {
        totalPV: 58,
        pvJour: 58,
        montantTotal: 2.5,
        nonPayes: 19,
        pourcentageNonPayes: 32.8,
        evolutionPV: '+12.5%',
        evolutionMontant: '+8.3%'
      }
    },
    semaine: {
      pvs: [
        {
          id: '1',
          numero: 'PV #2025-PV-0765',
          vehicule: 'UV-778-WX',
          conducteur: 'BAMBA Sylvain',
          agent: 'DIALLO Mamadou',
          commissariat: '5ème Arrondissement',
          lieu: 'Avenue de la République',
          montant: 40000,
          penalites: undefined,
          infractions: 2,
          dateEmission: '24/09/2025',
          statutPaiement: 'Payé' as PaymentStatus,
          datePaiement: '26/09/2025',
          modePaiement: 'Carte Bancaire',
          telephone: undefined,
          rappels: undefined,
          joursRetard: undefined
        },
        {
          id: '2',
          numero: 'PV #2025-PV-0766',
          vehicule: 'YZ-223-AB',
          conducteur: 'TRAORE Fatou',
          agent: 'KONE Ibrahim',
          commissariat: '7ème Arrondissement',
          lieu: 'Rue du Commerce',
          montant: 8000,
          penalites: undefined,
          infractions: 1,
          dateEmission: '25/09/2025',
          statutPaiement: 'Non payé' as PaymentStatus,
          datePaiement: undefined,
          modePaiement: undefined,
          telephone: undefined,
          rappels: undefined,
          joursRetard: undefined
        },
        {
          id: '3',
          numero: 'PV #2025-PV-0767',
          vehicule: 'GH-889-IJ',
          conducteur: 'KOFFI Marie',
          agent: 'KOUASSI Jean',
          commissariat: '3ème Arrondissement',
          lieu: 'Adjamé Gare',
          montant: 55000,
          penalites: 5500,
          infractions: 3,
          dateEmission: '22/09/2025',
          statutPaiement: 'En retard' as PaymentStatus,
          telephone: '+225 0701234567',
          rappels: 2,
          joursRetard: 7
        }
      ],
      stats: {
        totalPV: 423,
        pvJour: 60,
        montantTotal: 18.9,
        nonPayes: 139,
        pourcentageNonPayes: 32.9,
        evolutionPV: '+9.8%',
        evolutionMontant: '+11.2%'
      }
    },
    mois: {
      pvs: [
        {
          id: '1',
          numero: 'PV #2025-PV-0456',
          vehicule: 'AB-667-CD',
          conducteur: 'TOURE Mariam',
          agent: 'DIALLO Mamadou',
          commissariat: '5ème Arrondissement',
          lieu: 'Zone 4C',
          montant: 42000,
          penalites: undefined,
          infractions: 2,
          dateEmission: '05/09/2025',
          statutPaiement: 'Payé' as PaymentStatus,
          datePaiement: '08/09/2025',
          modePaiement: 'Espèces',
          telephone: undefined,
          rappels: undefined,
          joursRetard: undefined
        },
        {
          id: '2',
          numero: 'PV #2025-PV-0457',
          vehicule: 'EF-889-GH',
          conducteur: 'KOUADIO Patrick',
          agent: 'KONE Ibrahim',
          commissariat: '7ème Arrondissement',
          lieu: 'Vridi Canal',
          montant: 7000,
          penalites: undefined,
          infractions: 1,
          dateEmission: '10/09/2025',
          statutPaiement: 'Non payé' as PaymentStatus,
          datePaiement: undefined,
          modePaiement: undefined,
          telephone: undefined,
          rappels: undefined,
          joursRetard: undefined
        },
        {
          id: '3',
          numero: 'PV #2025-PV-0458',
          vehicule: 'MN-556-OP',
          conducteur: 'BEUGRE Aya',
          agent: 'KOUASSI Jean',
          commissariat: '3ème Arrondissement',
          lieu: 'Carrefour Life',
          montant: 50000,
          penalites: 10000,
          infractions: 3,
          dateEmission: '01/09/2025',
          statutPaiement: 'En retard' as PaymentStatus,
          telephone: '+225 0709876543',
          rappels: 4,
          joursRetard: 38
        }
      ],
      stats: {
        totalPV: 1892,
        pvJour: 63,
        montantTotal: 67.3,
        nonPayes: 623,
        pourcentageNonPayes: 32.9,
        evolutionPV: '+7.2%',
        evolutionMontant: '+9.8%'
      }
    },
    annee: {
      pvs: [
        {
          id: '1',
          numero: 'PV #2025-PV-0123',
          vehicule: 'GH-778-IJ',
          conducteur: 'KOFFI Armand',
          agent: 'DIALLO Mamadou',
          commissariat: '5ème Arrondissement',
          lieu: 'Marcory Résidentiel',
          montant: 60000,
          penalites: undefined,
          infractions: 3,
          dateEmission: '12/02/2025',
          statutPaiement: 'Payé' as PaymentStatus,
          datePaiement: '15/02/2025',
          modePaiement: 'Virement Bancaire',
          telephone: undefined,
          rappels: undefined,
          joursRetard: undefined
        },
        {
          id: '2',
          numero: 'PV #2025-PV-0124',
          vehicule: 'KL-990-MN',
          conducteur: 'TRAORE Salimata',
          agent: 'KONE Ibrahim',
          commissariat: '7ème Arrondissement',
          lieu: 'Avenue 13',
          montant: 10000,
          penalites: undefined,
          infractions: 1,
          dateEmission: '20/03/2025',
          statutPaiement: 'Non payé' as PaymentStatus,
          datePaiement: undefined,
          modePaiement: undefined,
          telephone: undefined,
          rappels: undefined,
          joursRetard: undefined
        },
        {
          id: '3',
          numero: 'PV #2025-PV-0125',
          vehicule: 'ST-556-UV',
          conducteur: 'COULIBALY Seydou',
          agent: 'KOUASSI Jean',
          commissariat: '3ème Arrondissement',
          lieu: 'Plateau Cité',
          montant: 45000,
          penalites: 13500,
          infractions: 2,
          dateEmission: '15/01/2025',
          statutPaiement: 'En retard' as PaymentStatus,
          telephone: '+225 0705554433',
          rappels: 8,
          joursRetard: 268
        }
      ],
      stats: {
        totalPV: 18945,
        pvJour: 52,
        montantTotal: 678.5,
        nonPayes: 6234,
        pourcentageNonPayes: 32.9,
        evolutionPV: '+14.3%',
        evolutionMontant: '+18.7%'
      }
    },
    tout: {
      pvs: [
        {
          id: '1',
          numero: 'PV #2020-PV-0034',
          vehicule: 'MN-889-OP',
          conducteur: 'DIALLO Fatoumata',
          agent: 'DIALLO Mamadou',
          commissariat: '5ème Arrondissement',
          lieu: 'Marcory Zone 4',
          montant: 35000,
          penalites: undefined,
          infractions: 2,
          dateEmission: '18/03/2021',
          statutPaiement: 'Payé' as PaymentStatus,
          datePaiement: '20/03/2021',
          modePaiement: 'Mobile Money',
          telephone: undefined,
          rappels: undefined,
          joursRetard: undefined
        },
        {
          id: '2',
          numero: 'PV #2022-PV-0089',
          vehicule: 'QR-223-ST',
          conducteur: 'BAMBA Ibrahim',
          agent: 'KONE Ibrahim',
          commissariat: '7ème Arrondissement',
          lieu: 'Treichville Centre',
          montant: 5000,
          penalites: undefined,
          infractions: 1,
          dateEmission: '22/07/2022',
          statutPaiement: 'Non payé' as PaymentStatus,
          datePaiement: undefined,
          modePaiement: undefined,
          telephone: undefined,
          rappels: undefined,
          joursRetard: undefined
        },
        {
          id: '3',
          numero: 'PV #2024-PV-0234',
          vehicule: 'YZ-778-AB',
          conducteur: 'KOFFI Laurent',
          agent: 'KOUASSI Jean',
          commissariat: '3ème Arrondissement',
          lieu: 'Cocody Deux Plateaux',
          montant: 47000,
          penalites: 23500,
          infractions: 3,
          dateEmission: '10/01/2024',
          statutPaiement: 'En retard' as PaymentStatus,
          telephone: '+225 0702223344',
          rappels: 12,
          joursRetard: 638
        }
      ],
      stats: {
        totalPV: 87456,
        pvJour: 48,
        montantTotal: 3124.8,
        nonPayes: 28789,
        pourcentageNonPayes: 32.9,
        evolutionPV: '+28.5%',
        evolutionMontant: '+34.2%'
      }
    },
    personnalise: {
      pvs: [
        {
          id: '1',
          numero: 'PV #2025-PV-0923',
          vehicule: 'ST-778-UV',
          conducteur: 'CAMARA Adama',
          agent: 'DIALLO Mamadou',
          commissariat: '5ème Arrondissement',
          lieu: 'Marcory Biafra',
          montant: 43000,
          penalites: undefined,
          infractions: 2,
          dateEmission: '11/10/2025',
          statutPaiement: 'Payé' as PaymentStatus,
          datePaiement: '12/10/2025',
          modePaiement: 'Mobile Money',
          telephone: undefined,
          rappels: undefined,
          joursRetard: undefined
        },
        {
          id: '2',
          numero: 'PV #2025-PV-0924',
          vehicule: 'WX-223-YZ',
          conducteur: 'BEUGRE Paul',
          agent: 'KONE Ibrahim',
          commissariat: '7ème Arrondissement',
          lieu: 'Koumassi Remblais',
          montant: 9000,
          penalites: undefined,
          infractions: 1,
          dateEmission: '12/10/2025',
          statutPaiement: 'Non payé' as PaymentStatus,
          datePaiement: undefined,
          modePaiement: undefined,
          telephone: undefined,
          rappels: undefined,
          joursRetard: undefined
        },
        {
          id: '3',
          numero: 'PV #2025-PV-0925',
          vehicule: 'EF-889-GH',
          conducteur: 'COULIBALY Issa',
          agent: 'KOUASSI Jean',
          commissariat: '3ème Arrondissement',
          lieu: 'Cocody Angré',
          montant: 51000,
          penalites: 5100,
          infractions: 3,
          dateEmission: '10/10/2025',
          statutPaiement: 'En retard' as PaymentStatus,
          telephone: '+225 0708889990',
          rappels: 1,
          joursRetard: 4
        }
      ],
      stats: {
        totalPV: 234,
        pvJour: 58,
        montantTotal: 10.2,
        nonPayes: 77,
        pourcentageNonPayes: 32.9,
        evolutionPV: '+11.2%',
        evolutionMontant: '+13.5%'
      }
    }
  }

  const currentData = isCustomDateRange ? dataByPeriod.personnalise : dataByPeriod[globalFilter]
  const itemsPerPage = 3
  const totalPages = Math.ceil(currentData.stats.totalPV / itemsPerPage)

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
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

  const getStatutColor = (statut: PaymentStatus) => {
    switch (statut) {
      case 'Payé':
        return 'bg-green-500 text-white'
      case 'Non payé':
        return 'bg-yellow-500 text-white'
      case 'En retard':
        return 'bg-red-500 text-white'
    }
  }

  const getStatutIcon = (statut: PaymentStatus) => {
    switch (statut) {
      case 'Payé':
        return <CheckCircle className="w-4 h-4" />
      case 'Non payé':
        return <Clock className="w-4 h-4" />
      case 'En retard':
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  return (
     <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Gestion des Verbalisations</h1>
        <p className="text-slate-600 mt-2">Suivi centralisé de tous les PV émis par les commissariats</p>
      </div>

      {/* Filtre Global de Période */}
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
                        placeholder="Rechercher par ID, Immatriculation..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    />
                </div>
        
           
        
                {/* Select 1 : Type d'opération */}
              <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option>Statut de paiement</option>
                  <option>Payé</option>
                  <option>Non payé</option>
                  <option>En retard</option>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-t-[3px] border-blue-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Total PV</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(currentData.stats.totalPV)}</div>
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              {currentData.stats.evolutionPV} vs période précédente
            </div>
          </CardBody>
        </Card>

        <Card className="border-t-[3px] border-orange-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">PV du Jour</h3>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{currentData.stats.pvJour}</div>
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              +12% vs hier
            </div>
          </CardBody>
        </Card>

        <Card className="border-t-[3px] border-green-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Montant Total</h3>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">
              {globalFilter === 'tout' || globalFilter === 'annee' 
                ? `${(currentData.stats.montantTotal/1000).toFixed(1)}Mrd`
                : `${currentData.stats.montantTotal.toFixed(1)}M`}
            </div>
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              {currentData.stats.evolutionMontant} FCFA
            </div>
          </CardBody>
        </Card>

        <Card className="border-t-[3px] border-red-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-sm font-medium uppercase">Non Payés</h3>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(currentData.stats.nonPayes)}</div>
            <div className="text-slate-600 text-sm">{currentData.stats.pourcentageNonPayes}% du total</div>
          </CardBody>
        </Card>
      </div>


      {/* Liste des PV */}
      <div className="space-y-6 mb-8">
        {currentData.pvs.map((pv) => (
          <Card key={pv.id} className={pv.statutPaiement === 'En retard' ? 'border-2 border-red-400' : ''}>
            <CardBody className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{pv.numero}</h3>
                  <div className="flex items-center gap-3">
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">
                      {pv.infractions} infraction{pv.infractions > 1 ? 's' : ''}
                    </span>
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${getStatutColor(pv.statutPaiement)}`}>
                      {getStatutIcon(pv.statutPaiement)}
                      {pv.statutPaiement}
                    </span>
                    {pv.statutPaiement === 'En retard' && pv.joursRetard && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        En retard ({pv.joursRetard} jours)
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-red-600">{formatNumber(pv.montant)} FCFA</div>
                  <div className="text-sm text-slate-500">Émis le {pv.dateEmission}</div>
                  {pv.penalites && (
                    <div className="text-sm text-red-600 font-medium mt-1">+ {formatNumber(pv.penalites)} FCFA de pénalités</div>
                  )}
                  {pv.datePaiement && (
                    <div className="text-sm text-green-600 font-medium mt-1">Payé le {pv.datePaiement}</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Véhicule</p>
                  <p className="font-bold text-slate-900">{pv.vehicule}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Conducteur</p>
                  <p className="font-bold text-slate-900">{pv.conducteur}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Agent</p>
                  <p className="font-bold text-slate-900">{pv.agent}</p>
                  <p className="text-sm text-slate-600">{pv.commissariat}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Lieu</p>
                  <p className="font-bold text-slate-900">{pv.lieu}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => router.push(`/admin/verbalisations/${pv.numero.replace('PV #', '')}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Eye className="w-4 h-4" />
                  Voir détails
                </Button>
                {pv.statutPaiement === 'Non payé' && (
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <CreditCard className="w-4 h-4" />
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

      {/* Pagination */}
      <Card className="mb-8">
        <CardBody className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, currentData.stats.totalPV)} sur {formatNumber(currentData.stats.totalPV)} PV
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`px-3 py-2 border rounded-lg transition-colors ${
                  currentPage === 1 
                    ? 'border-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-sm">←</span>
              </button>
              
              <button 
                onClick={() => handlePageChange(1)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 1 
                    ? 'bg-blue-600 text-white' 
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                1
              </button>
              
              {currentPage > 3 && (
                <span className="px-2 text-slate-400">...</span>
              )}
              
              {currentPage > 2 && currentPage < totalPages && (
                <button 
                  onClick={() => handlePageChange(currentPage)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
                >
                  {currentPage}
                </button>
              )}
              
              {currentPage < totalPages - 2 && (
                <span className="px-2 text-slate-400">...</span>
              )}
              
              {totalPages > 1 && (
                <button 
                  onClick={() => handlePageChange(totalPages)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === totalPages 
                      ? 'bg-blue-600 text-white' 
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {totalPages}
                </button>
              )}
              
              <button 
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 border rounded-lg transition-colors ${
                  currentPage === totalPages 
                    ? 'border-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-sm">→</span>
              </button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}