'use client'

import React, { useState } from 'react'
import {
  Search, Filter, Download, Eye, Printer, Calendar, MapPin,
  AlertTriangle, CheckCircle, XCircle, TrendingUp,
  DollarSign, FileDown, Wrench, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'

type InspectionStatus = 'Conforme' | 'Non-Conforme' | 'Défaut Mineur'
type InfractionType = 'Éclairage' | 'Freinage' | 'Pneumatiques' | 'Échappement' | 'Direction' | 'Assurance' | 'Contrôle Technique' | 'Carrosserie'
type PeriodKey = 'jour' | 'semaine' | 'mois' | 'annee' | 'tout' | 'personnalise'

interface Inspection {
  id: string
  date: string
  heure: string
  immatriculation: string
  proprietaire: string
  inspecteur: string
  centre: string
  lieu: string
  statut: InspectionStatus
  infractions: InfractionType[]
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

export default function InspectionInfractionsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tous les statuts')
  const [dateFilter, setDateFilter] = useState('')
  const [centreFilter, setCentreFilter] = useState('Tous les centres')
  const [infractionFilter, setInfractionFilter] = useState('Toutes les infractions')
  const [globalFilter, setGlobalFilter] = useState<PeriodKey>('jour')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)

  // Données selon la période sélectionnée
  const dataByPeriod = {
    jour: {
      inspections: [
        {
          id: '#INS-2025-0847',
          date: '10/10/2025',
          heure: '15:30',
          immatriculation: 'CI-2589-AB',
          proprietaire: 'KONE Mamadou',
          inspecteur: 'KOUAME Jean-Baptiste',
          centre: 'Centre Technique Yopougon',
          lieu: 'Yopougon Sideci',
          statut: 'Non-Conforme' as InspectionStatus,
          infractions: ['Éclairage', 'Freinage', 'Assurance'] as InfractionType[],
          pv: 'PV-INS-1247',
          montant: 85000,
          validiteAssurance: '15/08/2025',
          validiteVisite: '10/07/2025'
        },
        {
          id: '#INS-2025-0846',
          date: '10/10/2025',
          heure: '15:15',
          immatriculation: 'CI-7845-CD',
          proprietaire: 'DIABATE Aminata',
          inspecteur: 'TRAORE Sekou',
          centre: 'Centre Technique Adjamé',
          lieu: 'Adjamé Commerce',
          statut: 'Conforme' as InspectionStatus,
          infractions: [] as InfractionType[],
          pv: null,
          montant: null,
          validiteAssurance: '20/12/2025',
          validiteVisite: '18/11/2025'
        },
        {
          id: '#INS-2025-0845',
          date: '10/10/2025',
          heure: '14:45',
          immatriculation: 'CI-4521-EF',
          proprietaire: 'OUATTARA Fatoumata',
          inspecteur: 'BAMBA Issiaka',
          centre: 'Centre Technique Cocody',
          lieu: 'Cocody Angré',
          statut: 'Défaut Mineur' as InspectionStatus,
          infractions: ['Pneumatiques'] as InfractionType[],
          pv: 'PV-INS-1246',
          montant: 25000,
          validiteAssurance: '30/11/2025',
          validiteVisite: '05/09/2025'
        },
        {
          id: '#INS-2025-0844',
          date: '10/10/2025',
          heure: '14:30',
          immatriculation: 'CI-9876-GH',
          proprietaire: 'TOURE Ibrahim',
          inspecteur: 'KOUAME Jean-Baptiste',
          centre: 'Centre Technique Yopougon',
          lieu: 'Yopougon Gesco',
          statut: 'Non-Conforme' as InspectionStatus,
          infractions: ['Échappement', 'Direction', 'Contrôle Technique'] as InfractionType[],
          pv: 'PV-INS-1245',
          montant: 95000,
          validiteAssurance: '12/10/2025',
          validiteVisite: '22/06/2025'
        }
      ],
      stats: {
        totalInspections: 432,
        conformes: 218,
        nonConformes: 156,
        defautsMineurs: 58,
        revenusJour: 3750000,
        tauxConformite: 50.5,
        evolutionInspections: '+8.3%',
        evolutionRevenus: '+12.1%',
        evolutionConformite: '+3.2%',
        infractionsPrincipales: {
          'Éclairage': 45,
          'Freinage': 38,
          'Pneumatiques': 23,
          'Assurance': 29
        }
      }
    },
    semaine: {
      inspections: [
        {
          id: '#INS-2025-2456',
          date: '06/10/2025',
          heure: '09:20',
          immatriculation: 'CI-5678-IJ',
          proprietaire: 'SANGARE Adama',
          inspecteur: 'KOUAME Jean-Baptiste',
          centre: 'Centre Technique Marcory',
          lieu: 'Marcory Zone 4',
          statut: 'Non-Conforme' as InspectionStatus,
          infractions: ['Freinage', 'Assurance'] as InfractionType[],
          pv: 'PV-INS-2134',
          montant: 75000,
          validiteAssurance: '10/09/2025',
          validiteVisite: '15/08/2025'
        },
        {
          id: '#INS-2025-2455',
          date: '07/10/2025',
          heure: '11:45',
          immatriculation: 'CI-8901-KL',
          proprietaire: 'BAMBA Salimata',
          inspecteur: 'TRAORE Sekou',
          centre: 'Centre Technique Adjamé',
          lieu: 'Adjamé Liberté',
          statut: 'Conforme' as InspectionStatus,
          infractions: [] as InfractionType[],
          pv: null,
          montant: null,
          validiteAssurance: '25/12/2025',
          validiteVisite: '20/11/2025'
        },
        {
          id: '#INS-2025-2454',
          date: '08/10/2025',
          heure: '14:10',
          immatriculation: 'CI-2345-MN',
          proprietaire: 'COULIBALY Moussa',
          inspecteur: 'BAMBA Issiaka',
          centre: 'Centre Technique Cocody',
          lieu: 'Cocody Riviera',
          statut: 'Défaut Mineur' as InspectionStatus,
          infractions: ['Éclairage'] as InfractionType[],
          pv: 'PV-INS-2135',
          montant: 20000,
          validiteAssurance: '18/11/2025',
          validiteVisite: '22/10/2025'
        },
        {
          id: '#INS-2025-2453',
          date: '09/10/2025',
          heure: '16:35',
          immatriculation: 'CI-6789-OP',
          proprietaire: 'KOFFI Christine',
          inspecteur: 'KOUAME Jean-Baptiste',
          centre: 'Centre Technique Yopougon',
          lieu: 'Yopougon Wassakara',
          statut: 'Non-Conforme' as InspectionStatus,
          infractions: ['Direction', 'Pneumatiques', 'Contrôle Technique'] as InfractionType[],
          pv: 'PV-INS-2136',
          montant: 90000,
          validiteAssurance: '05/10/2025',
          validiteVisite: '28/07/2025'
        }
      ],
      stats: {
        totalInspections: 2845,
        conformes: 1423,
        nonConformes: 1024,
        defautsMineurs: 398,
        revenusJour: 24800000,
        tauxConformite: 50.0,
        evolutionInspections: '+11.5%',
        evolutionRevenus: '+15.3%',
        evolutionConformite: '+2.8%',
        infractionsPrincipales: {
          'Éclairage': 312,
          'Freinage': 289,
          'Pneumatiques': 178,
          'Assurance': 234
        }
      }
    },
    mois: {
      inspections: [
        {
          id: '#INS-2025-8901',
          date: '15/09/2025',
          heure: '10:15',
          immatriculation: 'CI-3456-QR',
          proprietaire: 'YAO Armand',
          inspecteur: 'KOUAME Jean-Baptiste',
          centre: 'Centre Technique Port-Bouët',
          lieu: 'Port-Bouët Aéroport',
          statut: 'Non-Conforme' as InspectionStatus,
          infractions: ['Éclairage', 'Échappement'] as InfractionType[],
          pv: 'PV-INS-5678',
          montant: 70000,
          validiteAssurance: '20/08/2025',
          validiteVisite: '12/07/2025'
        },
        {
          id: '#INS-2025-8900',
          date: '18/09/2025',
          heure: '13:40',
          immatriculation: 'CI-7890-ST',
          proprietaire: 'DIARRA Fatoumata',
          inspecteur: 'TRAORE Sekou',
          centre: 'Centre Technique Adjamé',
          lieu: 'Adjamé Marché',
          statut: 'Conforme' as InspectionStatus,
          infractions: [] as InfractionType[],
          pv: null,
          montant: null,
          validiteAssurance: '30/12/2025',
          validiteVisite: '25/11/2025'
        },
        {
          id: '#INS-2025-8899',
          date: '22/09/2025',
          heure: '15:20',
          immatriculation: 'CI-1234-UV',
          proprietaire: 'BEUGRE Simon',
          inspecteur: 'BAMBA Issiaka',
          centre: 'Centre Technique Cocody',
          lieu: 'Cocody Angré',
          statut: 'Défaut Mineur' as InspectionStatus,
          infractions: ['Carrosserie'] as InfractionType[],
          pv: 'PV-INS-5679',
          montant: 15000,
          validiteAssurance: '15/11/2025',
          validiteVisite: '10/10/2025'
        },
        {
          id: '#INS-2025-8898',
          date: '28/09/2025',
          heure: '09:50',
          immatriculation: 'CI-5678-WX',
          proprietaire: 'SORO N\'Golo',
          inspecteur: 'KOUAME Jean-Baptiste',
          centre: 'Centre Technique Yopougon',
          lieu: 'Yopougon Niangon',
          statut: 'Non-Conforme' as InspectionStatus,
          infractions: ['Freinage', 'Direction', 'Assurance'] as InfractionType[],
          pv: 'PV-INS-5680',
          montant: 100000,
          validiteAssurance: '01/09/2025',
          validiteVisite: '18/06/2025'
        }
      ],
      stats: {
        totalInspections: 11234,
        conformes: 5617,
        nonConformes: 4045,
        defautsMineurs: 1572,
        revenusJour: 94500000,
        tauxConformite: 50.0,
        evolutionInspections: '+9.7%',
        evolutionRevenus: '+13.8%',
        evolutionConformite: '+4.1%',
        infractionsPrincipales: {
          'Éclairage': 1234,
          'Freinage': 1089,
          'Pneumatiques': 678,
          'Assurance': 923
        }
      }
    },
    annee: {
      inspections: [
        {
          id: '#INS-2025-34567',
          date: '15/03/2025',
          heure: '11:25',
          immatriculation: 'CI-9012-YZ',
          proprietaire: 'OUEDRAOGO Paul',
          inspecteur: 'KOUAME Jean-Baptiste',
          centre: 'Centre Technique Abobo',
          lieu: 'Abobo Gare',
          statut: 'Non-Conforme' as InspectionStatus,
          infractions: ['Freinage', 'Pneumatiques'] as InfractionType[],
          pv: 'PV-INS-12345',
          montant: 80000,
          validiteAssurance: '28/02/2025',
          validiteVisite: '15/01/2025'
        },
        {
          id: '#INS-2025-34566',
          date: '22/05/2025',
          heure: '14:50',
          immatriculation: 'CI-3456-AB',
          proprietaire: 'CAMARA Issa',
          inspecteur: 'TRAORE Sekou',
          centre: 'Centre Technique Adjamé',
          lieu: 'Adjamé Commerce',
          statut: 'Conforme' as InspectionStatus,
          infractions: [] as InfractionType[],
          pv: null,
          montant: null,
          validiteAssurance: '10/08/2025',
          validiteVisite: '05/07/2025'
        },
        {
          id: '#INS-2025-34565',
          date: '18/07/2025',
          heure: '10:30',
          immatriculation: 'CI-7890-CD',
          proprietaire: 'DIABATE Marie',
          inspecteur: 'BAMBA Issiaka',
          centre: 'Centre Technique Cocody',
          lieu: 'Cocody Deux Plateaux',
          statut: 'Défaut Mineur' as InspectionStatus,
          infractions: ['Éclairage'] as InfractionType[],
          pv: 'PV-INS-12346',
          montant: 22000,
          validiteAssurance: '20/10/2025',
          validiteVisite: '15/09/2025'
        },
        {
          id: '#INS-2025-34564',
          date: '05/09/2025',
          heure: '16:15',
          immatriculation: 'CI-1234-EF',
          proprietaire: 'TOURE Aminata',
          inspecteur: 'KOUAME Jean-Baptiste',
          centre: 'Centre Technique Yopougon',
          lieu: 'Yopougon Sicogi',
          statut: 'Non-Conforme' as InspectionStatus,
          infractions: ['Direction', 'Contrôle Technique', 'Assurance'] as InfractionType[],
          pv: 'PV-INS-12347',
          montant: 105000,
          validiteAssurance: '12/08/2025',
          validiteVisite: '30/05/2025'
        }
      ],
      stats: {
        totalInspections: 98567,
        conformes: 49284,
        nonConformes: 35481,
        defautsMineurs: 13802,
        revenusJour: 845000000,
        tauxConformite: 50.0,
        evolutionInspections: '+14.2%',
        evolutionRevenus: '+18.5%',
        evolutionConformite: '+6.7%',
        infractionsPrincipales: {
          'Éclairage': 10234,
          'Freinage': 9567,
          'Pneumatiques': 5678,
          'Assurance': 8123
        }
      }
    },
    tout: {
      inspections: [
        {
          id: '#INS-2020-00123',
          date: '12/02/2020',
          heure: '09:40',
          immatriculation: 'CI-5678-GH',
          proprietaire: 'KONE Ibrahim',
          inspecteur: 'KOUAME Jean-Baptiste',
          centre: 'Centre Technique Treichville',
          lieu: 'Treichville Centre',
          statut: 'Non-Conforme' as InspectionStatus,
          infractions: ['Éclairage', 'Freinage'] as InfractionType[],
          pv: 'PV-INS-00456',
          montant: 65000,
          validiteAssurance: '15/01/2020',
          validiteVisite: '10/12/2019'
        },
        {
          id: '#INS-2021-05678',
          date: '25/06/2021',
          heure: '13:20',
          immatriculation: 'CI-9012-IJ',
          proprietaire: 'BAMBA Sekou',
          inspecteur: 'TRAORE Sekou',
          centre: 'Centre Technique Adjamé',
          lieu: 'Adjamé Gare',
          statut: 'Conforme' as InspectionStatus,
          infractions: [] as InfractionType[],
          pv: null,
          montant: null,
          validiteAssurance: '18/09/2021',
          validiteVisite: '12/08/2021'
        },
        {
          id: '#INS-2022-12345',
          date: '10/11/2022',
          heure: '15:45',
          immatriculation: 'CI-3456-KL',
          proprietaire: 'SANGARE Fatou',
          inspecteur: 'BAMBA Issiaka',
          centre: 'Centre Technique Cocody',
          lieu: 'Cocody Vallon',
          statut: 'Défaut Mineur' as InspectionStatus,
          infractions: ['Pneumatiques'] as InfractionType[],
          pv: 'PV-INS-03456',
          montant: 18000,
          validiteAssurance: '22/12/2022',
          validiteVisite: '15/11/2022'
        },
        {
          id: '#INS-2024-23456',
          date: '08/08/2024',
          heure: '11:10',
          immatriculation: 'CI-7890-MN',
          proprietaire: 'COULIBALY Adama',
          inspecteur: 'KOUAME Jean-Baptiste',
          centre: 'Centre Technique Yopougon',
          lieu: 'Yopougon Banco',
          statut: 'Non-Conforme' as InspectionStatus,
          infractions: ['Direction', 'Assurance', 'Contrôle Technique'] as InfractionType[],
          pv: 'PV-INS-08901',
          montant: 110000,
          validiteAssurance: '20/07/2024',
          validiteVisite: '15/05/2024'
        }
      ],
      stats: {
        totalInspections: 456789,
        conformes: 228395,
        nonConformes: 164408,
        defautsMineurs: 63986,
        revenusJour: 3890000000,
        tauxConformite: 50.0,
        evolutionInspections: '+32.8%',
        evolutionRevenus: '+41.2%',
        evolutionConformite: '+12.5%',
        infractionsPrincipales: {
          'Éclairage': 45678,
          'Freinage': 42345,
          'Pneumatiques': 25678,
          'Assurance': 36789
        }
      }
    },
    personnalise: {
      inspections: [
        {
          id: '#INS-2025-0950',
          date: '11/10/2025',
          heure: '10:45',
          immatriculation: 'CI-4567-OP',
          proprietaire: 'KOFFI Laurent',
          inspecteur: 'KOUAME Jean-Baptiste',
          centre: 'Centre Technique Marcory',
          lieu: 'Marcory Remblais',
          statut: 'Non-Conforme' as InspectionStatus,
          infractions: ['Freinage', 'Assurance'] as InfractionType[],
          pv: 'PV-INS-1350',
          montant: 78000,
          validiteAssurance: '18/09/2025',
          validiteVisite: '22/08/2025'
        },
        {
          id: '#INS-2025-0949',
          date: '12/10/2025',
          heure: '14:25',
          immatriculation: 'CI-8901-QR',
          proprietaire: 'TRAORE Awa',
          inspecteur: 'TRAORE Sekou',
          centre: 'Centre Technique Adjamé',
          lieu: 'Adjamé Bracodi',
          statut: 'Conforme' as InspectionStatus,
          infractions: [] as InfractionType[],
          pv: null,
          montant: null,
          validiteAssurance: '28/12/2025',
          validiteVisite: '22/11/2025'
        },
        {
          id: '#INS-2025-0948',
          date: '13/10/2025',
          heure: '11:50',
          immatriculation: 'CI-2345-ST',
          proprietaire: 'OUATTARA Seydou',
          inspecteur: 'BAMBA Issiaka',
          centre: 'Centre Technique Cocody',
          lieu: 'Cocody Angré',
          statut: 'Défaut Mineur' as InspectionStatus,
          infractions: ['Éclairage'] as InfractionType[],
          pv: 'PV-INS-1351',
          montant: 21000,
          validiteAssurance: '12/11/2025',
          validiteVisite: '08/10/2025'
        },
        {
          id: '#INS-2025-0947',
          date: '14/10/2025',
          heure: '16:30',
          immatriculation: 'CI-6789-UV',
          proprietaire: 'DIABATE Salif',
          inspecteur: 'KOUAME Jean-Baptiste',
          centre: 'Centre Technique Yopougon',
          lieu: 'Yopougon Niangon',
          statut: 'Non-Conforme' as InspectionStatus,
          infractions: ['Direction', 'Pneumatiques', 'Contrôle Technique'] as InfractionType[],
          pv: 'PV-INS-1352',
          montant: 92000,
          validiteAssurance: '10/09/2025',
          validiteVisite: '25/07/2025'
        }
      ],
      stats: {
        totalInspections: 1789,
        conformes: 895,
        nonConformes: 643,
        defautsMineurs: 251,
        revenusJour: 15600000,
        tauxConformite: 50.0,
        evolutionInspections: '+10.5%',
        evolutionRevenus: '+14.2%',
        evolutionConformite: '+3.8%',
        infractionsPrincipales: {
          'Éclairage': 189,
          'Freinage': 156,
          'Pneumatiques': 98,
          'Assurance': 134
        }
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

  const getInfractionColor = (infraction: InfractionType) => {
    const colors: Record<InfractionType, string> = {
      'Éclairage': 'bg-red-100 text-red-800',
      'Freinage': 'bg-red-100 text-red-800',
      'Pneumatiques': 'bg-orange-100 text-orange-800',
      'Échappement': 'bg-purple-100 text-purple-800',
      'Direction': 'bg-red-100 text-red-800',
      'Assurance': 'bg-blue-100 text-blue-800',
      'Contrôle Technique': 'bg-indigo-100 text-indigo-800',
      'Carrosserie': 'bg-gray-100 text-gray-800'
    }
    return colors[infraction]
  }

  return (
     <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Inspections Techniques Nationales</h1>
        <p className="text-slate-600 mt-2">Suivi centralisé des inspections et infractions détectées</p>
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
        <Card className="border-t-[3px] border-blue-500">
          <CardBody className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-xs lg:text-sm font-medium uppercase">Total Inspections</h3>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl lg:text-4xl font-bold text-slate-900 mb-2">{formatNumber(currentData.stats.totalInspections)}</div>
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium mb-3">
              <TrendingUp className="w-4 h-4" />
              {currentData.stats.evolutionInspections} vs période précédente
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Conformes: {formatNumber(currentData.stats.conformes)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Non-Conformes: {formatNumber(currentData.stats.nonConformes)}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-t-[3px] border-green-500">
          <CardBody className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-xs lg:text-sm font-medium uppercase">Revenus Amendes</h3>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
              </div>
            </div>
            <div className="text-2xl lg:text-4xl font-bold text-slate-900 mb-2">
              {globalFilter === 'tout' || globalFilter === 'annee' 
                ? `${(currentData.stats.revenusJour/1000000000).toFixed(1)}Mrd`
                : `${(currentData.stats.revenusJour/1000000).toFixed(1)}M`}
            </div>
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              {currentData.stats.evolutionRevenus} FCFA collectés
            </div>
          </CardBody>
        </Card>

        <Card className="border-t-[3px] border-red-500">
          <CardBody className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600 text-xs lg:text-sm font-medium uppercase">Taux de Conformité</h3>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
              </div>
            </div>
            <div className="text-2xl lg:text-4xl font-bold text-slate-900 mb-2">{currentData.stats.tauxConformite}%</div>
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              {currentData.stats.evolutionConformite} vs période précédente
            </div>
          </CardBody>
        </Card>

        <Card className="border-t-[3px] border-purple-500">
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
                <span className="text-sm font-bold">{currentData.stats.infractionsPrincipales['Éclairage']}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600">Freinage</span>
                <span className="text-sm font-bold">{currentData.stats.infractionsPrincipales['Freinage']}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tableau Amélioré */}
      <Card className="mb-8 ">
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">ID Inspection</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Date & Heure</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Véhicule</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Propriétaire</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Centre</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Infractions</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Montant</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {currentData.inspections.map((inspection, index) => (
                  <tr  key={inspection.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors duration-150`}>
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
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{inspection.immatriculation}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700">{inspection.proprietaire}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-slate-700">{inspection.centre.replace('Centre Technique ', '')}</span>
                          <span className="text-xs text-slate-500">{inspection.lieu}</span>
                        </div>
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
                          onClick={() => router.push(`/admin/inspections/${inspection.id.replace('#INS-', '')}`)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors group" 
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4 text-slate-600 group-hover:text-blue-600" />
                        </button>
                        <button className="p-2 hover:bg-purple-100 rounded-lg transition-colors group" title="Imprimer">
                          <Printer className="w-4 h-4 text-slate-600 group-hover:text-purple-600" />
                        </button>
                        <button className="p-2 hover:bg-green-100 rounded-lg transition-colors group" title="Télécharger">
                          <Download className="w-4 h-4 text-slate-600 group-hover:text-green-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-200 gap-4 bg-slate-50">
            <p className="text-sm text-slate-600 font-medium">
              Affichage de <span className="font-bold text-slate-900">1</span> à <span className="font-bold text-slate-900">{currentData.inspections.length}</span> sur <span className="font-bold text-slate-900">{formatNumber(currentData.stats.totalInspections)}</span> inspections
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-white hover:shadow-sm transition-all">
                <span className="text-sm text-slate-600 font-medium">← Précédent</span>
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors">
                1
              </button>
              <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white hover:shadow-sm transition-all">
                <span className="text-sm text-slate-600 font-medium">2</span>
              </button>
              <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white hover:shadow-sm transition-all">
                <span className="text-sm text-slate-600 font-medium">3</span>
              </button>
              <span className="px-2 text-slate-400">...</span>
              <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white hover:shadow-sm transition-all">
                <span className="text-sm text-slate-600 font-medium">{Math.ceil(currentData.stats.totalInspections/currentData.inspections.length)}</span>
              </button>
              <button className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-white hover:shadow-sm transition-all">
                <span className="text-sm text-slate-600 font-medium">Suivant →</span>
              </button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}